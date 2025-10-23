import { useQuery } from '@tanstack/react-query';

interface PythPriceData {
    price: {
        price: number;
        expo: number;
    };
}

async function fetchEthPrice(): Promise<number> {
    // Try multiple ETH price sources for better reliability
    const sources = [
        // CoinGecko API (most reliable)
        async () => {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
            const data = await res.json();
            return data.ethereum.usd;
        },
        // CoinCap API (backup)
        async () => {
            const res = await fetch('https://api.coincap.io/v2/assets/ethereum');
            if (!res.ok) throw new Error(`CoinCap API error: ${res.status}`);
            const data = await res.json();
            return parseFloat(data.data.priceUsd);
        },
        // Pyth Network (original, but with correct endpoint)
        async () => {
            const feedId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
            const res = await fetch(`https://hermes.pyth.network/v2/price_feeds/${feedId}/latest`);
            if (!res.ok) throw new Error(`Pyth API error: ${res.status}`);
            const data: PythPriceData = await res.json();
            return data.price.price * 10 ** data.price.expo;
        }
    ];

    // Try each source until one succeeds
    for (const source of sources) {
        try {
            const price = await source();
            console.log('ETH price fetched successfully:', price);
            return price;
        } catch (error) {
            console.warn('ETH price source failed:', error);
            continue;
        }
    }

    // If all sources fail, return a reasonable fallback price
    console.warn('All ETH price sources failed, using fallback price');
    return 3000; // Fallback ETH price in USD
}

export const useEthPrice = () => {
    return useQuery({
        queryKey: ['ethPrice'],
        queryFn: fetchEthPrice,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// Utility function to convert USD amount to ETH
export const useUsdToEth = (usdAmount: number) => {
    const { data: ethPrice, isLoading, error } = useEthPrice();
    
    if (!ethPrice || !usdAmount) {
        return { ethAmount: 0, isLoading, error };
    }
    
    const ethAmount = usdAmount / ethPrice;
    
    return { ethAmount, isLoading, error };
};

// Utility function to convert ETH amount to USD
export const useEthToUsd = (ethAmount: number) => {
    const { data: ethPrice, isLoading, error } = useEthPrice();
    
    if (!ethPrice || !ethAmount) {
        return { usdAmount: 0, isLoading, error };
    }
    
    const usdAmount = ethAmount * ethPrice;
    
    return { usdAmount, isLoading, error };
};

// Utility function to format ETH amount for display
export const formatEthAmount = (ethAmount: number, precision: number = 6): string => {
    if (ethAmount === 0) return '0';
    if (ethAmount < 0.000001) return ethAmount.toExponential(2);
    return ethAmount.toFixed(precision);
};

// Utility function to format USD amount for display
export const formatUsdAmount = (usdAmount: number, precision: number = 2): string => {
    if (usdAmount === 0) return '$0';
    if (usdAmount < 0.01) return `$${usdAmount.toExponential(2)}`;
    return `$${usdAmount.toFixed(precision)}`;
};
