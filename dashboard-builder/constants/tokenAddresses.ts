// Token information including address and decimals
export const TOKEN_INFO = {
    // USD-pegged stablecoins
    'USDC': { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 }, // USDC on Ethereum
    'USDT': { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 }, // USDT on Ethereum
    'PYUSD': { address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', decimals: 6 }, // PayPal USD
    'DAI': { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 }, // DAI
    'BUSD': { address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', decimals: 18 }, // BUSD
    
    // Other popular tokens
    'WETH': { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 }, // Wrapped ETH
    'WBTC': { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 }, // Wrapped Bitcoin
    'LINK': { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 }, // Chainlink
    'UNI': { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 }, // Uniswap
    'AAVE': { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 }, // Aave
} as const;

// Legacy token addresses for backward compatibility
export const TOKEN_ADDRESSES = {
    'USDC': TOKEN_INFO.USDC.address,
    'USDT': TOKEN_INFO.USDT.address,
    'PYUSD': TOKEN_INFO.PYUSD.address,
    'DAI': TOKEN_INFO.DAI.address,
    'BUSD': TOKEN_INFO.BUSD.address,
    'WETH': TOKEN_INFO.WETH.address,
    'WBTC': TOKEN_INFO.WBTC.address,
    'LINK': TOKEN_INFO.LINK.address,
    'UNI': TOKEN_INFO.UNI.address,
    'AAVE': TOKEN_INFO.AAVE.address,
} as const;

// Function to get token address by currency symbol
export const getTokenAddress = (currency: string): string | null => {
    const upperCurrency = currency.toUpperCase();
    return TOKEN_INFO[upperCurrency as keyof typeof TOKEN_INFO]?.address || null;
};

// Function to get token decimals by currency symbol
export const getTokenDecimals = (currency: string): number | null => {
    const upperCurrency = currency.toUpperCase();
    return TOKEN_INFO[upperCurrency as keyof typeof TOKEN_INFO]?.decimals || null;
};

// Function to get complete token info
export const getTokenInfo = (currency: string): { address: string; decimals: number } | null => {
    const upperCurrency = currency.toUpperCase();
    return TOKEN_INFO[upperCurrency as keyof typeof TOKEN_INFO] || null;
};

// Function to check if a currency is supported
export const isSupportedToken = (currency: string): boolean => {
    return getTokenAddress(currency) !== null;
};

// List of supported currencies
export const SUPPORTED_CURRENCIES = Object.keys(TOKEN_INFO);
