import { useState } from 'react';
import { useContract, useContractWrite } from '@thirdweb-dev/react';
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
];

export const useBecomeSponsor = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    
    const { contract } = useContract(contractAddress, HACKATHON_ABI);
    const { mutateAsync: becomeSponsor } = useContractWrite(contract, "becomeSponsor");

    const becomeSponsorWithToast = async (contributionAmount: string) => {
        if (!contract) {
            toast.error("Contract not found");
            return;
        }

        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            toast.error("Please enter a valid contribution amount");
            return;
        }

        try {
            setIsLoading(true);
            toast.loading("Submitting sponsorship...", { id: "become-sponsor" });

            // Convert contribution amount to wei (assuming it's in ETH)
            const contributionInWei = (BigInt(Math.floor(parseFloat(contributionAmount) * 1000000000000000000))).toString();

            console.log("Becoming sponsor with contribution:", contributionAmount, "ETH");
            console.log("Contribution in wei:", contributionInWei);

            // Call the becomeSponsor function with ETH value
            const result = await becomeSponsor({
                value: contributionInWei
            });

            console.log("Become sponsor transaction result:", result);

            // Wait for the transaction to be mined
            const receipt = await result.receipt;
            console.log("Transaction receipt:", receipt);

            // Check for SponsorAdded event
            const sponsorAddedEvent = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed?.name === "SponsorAdded";
                } catch {
                    return false;
                }
            });

            if (sponsorAddedEvent) {
                const parsedEvent = contract.interface.parseLog(sponsorAddedEvent);
                console.log("SponsorAdded event:", parsedEvent?.args);
                toast.success("Successfully became a sponsor!", { id: "become-sponsor" });
            } else {
                toast.success("Sponsorship submitted successfully!", { id: "become-sponsor" });
            }

            return {
                success: true,
                transactionHash: result.receipt.transactionHash,
                contribution: contributionAmount
            };

        } catch (err: any) {
            console.error("Error becoming sponsor:", err);
            toast.error(`Failed to become sponsor: ${err.message || "Unknown error"}`, { id: "become-sponsor" });
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        becomeSponsor: becomeSponsorWithToast,
        isLoading
    };
};
