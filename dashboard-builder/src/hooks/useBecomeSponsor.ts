import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { getTokenDecimals } from '@/constants/tokenAddresses';

// Hackathon contract ABI - both becomeSponsor and becomeSponsorWithToken functions
const HACKATHON_ABI = [
    {
        "inputs": [],
        "name": "becomeSponsor",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "becomeSponsorWithToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sponsor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "contribution",
                "type": "uint256"
            }
        ],
        "name": "SponsorAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sponsor",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "TokenSponsorAdded",
        "type": "event"
    }
] as const;

export interface BecomeSponsorResult {
    hash: `0x${string}`;
    sponsor?: string;
    contribution?: string;
}

export const useBecomeSponsor = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const callbackRef = useRef<((result: BecomeSponsorResult) => void) | null>(null);
    const contributionAmountRef = useRef<string>('');

    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error } = useWriteContract();

    // Wait for transaction receipt
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: contractWriteData,
    });

    // Update txHash when contractWriteData changes
    useEffect(() => {
        if (contractWriteData && contractWriteData !== txHash) {
            console.log("Sponsor contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "become-sponsor" });
        }
    }, [contractWriteData, txHash]);

    // Handle receipt when it arrives
    useEffect(() => {
        console.log("Sponsor useEffect triggered:", {
            txReceipt: !!txReceipt,
            txHash: txHash,
            hasCallback: !!callbackRef.current,
            receiptStatus: txReceipt?.status
        });

        if (txReceipt && txHash && callbackRef.current) {
            console.log("Processing sponsor transaction receipt...", txReceipt);

            if (txReceipt.status === 'success') {
                toast.success("Successfully became a sponsor!", { id: "become-sponsor" });

                // Create the result object with known data (no event parsing needed)
                const result: BecomeSponsorResult = {
                    hash: txHash,
                    sponsor: address, // We know the sponsor is the connected wallet
                    contribution: contributionAmountRef.current // Store contribution amount in ref
                };

                console.log("Calling sponsor success callback...", result);
                callbackRef.current(result);
            } else {
                console.error("Transaction failed!");
                toast.error("Sponsorship transaction failed!", { id: "become-sponsor" });
            }

            // Clean up
            callbackRef.current = null;
            setTxHash(undefined);
            setIsLoading(false);
        }
    }, [txReceipt, txHash, address]);

    const becomeSponsor = async (
        contributionAmount: string,
        onSuccess?: (result: BecomeSponsorResult) => void,
        sponsorCurrency?: string,
        tokenAddress?: string
    ): Promise<BecomeSponsorResult> => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            toast.error("Please enter a valid contribution amount");
            throw new Error("Invalid contribution amount");
        }

        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }

            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            contributionAmountRef.current = contributionAmount; // Store for later use

            toast.loading("Please confirm transaction in your wallet...", { id: "become-sponsor" });

            // Check if it's ETH sponsorship or token sponsorship
            if (sponsorCurrency === 'ETH' || !sponsorCurrency) {
                // ETH sponsorship - use the original becomeSponsor function
                const contributionInWei = parseEther(contributionAmount);
                console.log("Contribution in wei:", contributionInWei.toString());

                console.log("About to call writeContract for becomeSponsor (ETH)...");

                writeContract({
                    address: contractAddress as `0x${string}`,
                    abi: HACKATHON_ABI,
                    functionName: "becomeSponsor",
                    value: contributionInWei
                });
            } else {
                // Token sponsorship - use becomeSponsorWithToken function
                if (!tokenAddress) {
                    toast.error("Token address is required for token sponsorship");
                    throw new Error("Token address is required");
                }

                // Get token decimals for proper amount calculation
                const tokenDecimals = getTokenDecimals(sponsorCurrency || '');
                if (!tokenDecimals) {
                    toast.error(`Token decimals not found for ${sponsorCurrency}`);
                    throw new Error(`Token decimals not found for ${sponsorCurrency}`);
                }

                // Convert token amount using the correct decimals
                const tokenAmount = parseUnits(contributionAmount, tokenDecimals);
                console.log(`Token amount (${tokenDecimals} decimals):`, tokenAmount.toString());
                console.log("Sponsor currency:", sponsorCurrency);
                console.log("Token decimals:", tokenDecimals);

                console.log("About to call writeContract for becomeSponsorWithToken...");
                
                writeContract({
                    address: contractAddress as `0x${string}`,
                    abi: HACKATHON_ABI,
                    functionName: "becomeSponsorWithToken",
                    args: [tokenAddress as `0x${string}`, tokenAmount]
                });
            }

            console.log("writeContract called, waiting for user to confirm in wallet...");

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };

        } catch (err: any) {
            console.error("Error becoming sponsor:", err);
            toast.error(`Failed to become sponsor: ${err.message || "Unknown error"}`, { id: "become-sponsor" });
            setIsLoading(false);
            callbackRef.current = null;
            throw err;
        }
    };

    return {
        becomeSponsor,
        isLoading,
        error
    };
};