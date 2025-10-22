import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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

export const useBecomeSponsor = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    
    const { writeContract, error } = useWriteContract();
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const becomeSponsor = async (contributionAmount: string) => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            toast.error("Please enter a valid contribution amount");
            return;
        }

        try {
            setIsLoading(true);
            toast.loading("Submitting sponsorship...", { id: "become-sponsor" });

            // Convert contribution amount to wei
            const contributionInWei = parseEther(contributionAmount);

            console.log("Becoming sponsor with contribution:", contributionAmount, "ETH");
            console.log("Contribution in wei:", contributionInWei.toString());

            // Call the becomeSponsor function with ETH value
            const hash = await writeContract({
                address: contractAddress as `0x${string}`,
                abi: HACKATHON_ABI,
                functionName: "becomeSponsor",
                value: contributionInWei
            });

            setTxHash(hash);
            console.log("Become sponsor transaction hash:", hash);

            return {
                success: true,
                transactionHash: hash,
                contribution: contributionAmount
            };

        } catch (err: any) {
            console.error("Error becoming sponsor:", err);
            toast.error(`Failed to become sponsor: ${err.message || "Unknown error"}`, { id: "become-sponsor" });
            setIsLoading(false);
            throw err;
        }
    };

    // Handle transaction receipt
    if (txReceipt && isLoading) {
        setIsLoading(false);
        
        // Check for SponsorAdded event
        const sponsorAddedEventSignature = "0x"; // You'll need to add the actual event signature
        
        const sponsorAddedEvent = txReceipt.logs.find(log => {
            return log.topics && log.topics[0] === sponsorAddedEventSignature;
        });

        if (sponsorAddedEvent) {
            console.log("SponsorAdded event found:", sponsorAddedEvent);
            toast.success("Successfully became a sponsor!", { id: "become-sponsor" });
        } else {
            toast.success("Sponsorship submitted successfully!", { id: "become-sponsor" });
        }
    }

    return {
        becomeSponsor,
        isLoading,
        error,
        txHash,
        txReceipt
    };
};