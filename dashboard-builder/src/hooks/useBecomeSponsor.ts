import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';

// Hackathon contract ABI - only the becomeSponsor function
const HACKATHON_ABI = [
    {
        "inputs": [],
        "name": "becomeSponsor",
        "outputs": [],
        "stateMutability": "payable",
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
        onSuccess?: (result: BecomeSponsorResult) => void
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
            
            console.log("Wallet connected:", { address, isConnected });
            console.log("Contract address:", contractAddress);
            console.log("Contribution amount:", contributionAmount);
            
            toast.loading("Please confirm transaction in your wallet...", { id: "become-sponsor" });

            // Convert contribution amount to wei
            const contributionInWei = parseEther(contributionAmount);
            console.log("Contribution in wei:", contributionInWei.toString());

            console.log("About to call writeContract for becomeSponsor...");
            
            // writeContract doesn't return the hash directly - it triggers the wallet
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: HACKATHON_ABI,
                functionName: "becomeSponsor",
                value: contributionInWei
            });

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