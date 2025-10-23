import { useReadContract } from 'wagmi';

// Hackathon contract ABI for reading participant count
const HACKATHON_ABI = [
    {
        "inputs": [],
        "name": "participantCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export interface HackathonStats {
    participantCount: number;
    isLoading: boolean;
    error: Error | null;
}

export const useHackathonStats = (contractAddress: string) => {
    const { 
        data: participantCount, 
        isLoading, 
        error,
        refetch
    } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: HACKATHON_ABI,
        functionName: 'participantCount',
        enabled: !!contractAddress,
        // Enable live updates by watching for new blocks
        query: {
            // Refetch every 2 seconds to ensure live updates
            refetchInterval: 2000,
            // Also refetch when window regains focus
            refetchOnWindowFocus: true,
            // Refetch when network reconnects
            refetchOnReconnect: true,
        }
    });

    return {
        participantCount: participantCount ? Number(participantCount) : 0,
        isLoading,
        error,
        refetch, // Expose refetch function for manual refresh if needed
    };
};
