import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { DEHACK_PLATFORM_ABI } from '../lib/wagmi';

export interface ScoreSubmissionResult {
    hash: `0x${string}`;
    participant?: string;
    score?: number;
}

export const useScoreSubmission = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const callbackRef = useRef<((result: ScoreSubmissionResult) => void) | null>(null);
    const submissionDataRef = useRef<{ participant: string; score: number } | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error } = useWriteContract();

    // Wait for transaction receipt
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: contractWriteData,
    });

    // Update txHash when contractWriteData changes
    useEffect(() => {
        if (contractWriteData && contractWriteData !== txHash) {
            console.log("Score submission contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "score-submission" });
        }
    }, [contractWriteData, txHash]);

    // Cleanup function to reset state
    const resetState = () => {
        setIsLoading(false);
        callbackRef.current = null;
        setTxHash(undefined);
        submissionDataRef.current = null;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Handle writeContract errors (including user rejection)
    useEffect(() => {
        if (error) {
            console.error("Score submission contract write error:", error);
            toast.dismiss("score-submission");
            
            if (error.message?.includes("User rejected")) {
                toast.error("Transaction rejected by user");
            } else {
                toast.error(`Failed to submit score: ${error.message || "Unknown error"}`);
            }
            
            resetState();
        }
    }, [error]);

    // Handle receipt when it arrives
    useEffect(() => {
        const handleTransactionSuccess = async () => {
            if (txReceipt && txHash && callbackRef.current && submissionDataRef.current) {
                console.log("Score submission transaction confirmed:", txReceipt);
                toast.dismiss("score-submission");
                toast.success("Score submitted successfully!");

                const result: ScoreSubmissionResult = {
                    hash: txHash,
                    participant: submissionDataRef.current.participant,
                    score: submissionDataRef.current.score
                };

                // Call the success callback
                callbackRef.current(result);
                resetState();
            }
        };

        if (txReceipt && txHash) {
            handleTransactionSuccess();
        }
    }, [txReceipt, txHash]);

    const scoreSubmission = async (
        participantAddress: string,
        score: number,
        onSuccess?: (result: ScoreSubmissionResult) => void
    ): Promise<ScoreSubmissionResult> => {
        if (!participantAddress) {
            toast.error("Participant address is required");
            throw new Error("Participant address is required");
        }

        if (score < 0 || score > 100) {
            toast.error("Score must be between 0 and 100");
            throw new Error("Score must be between 0 and 100");
        }

        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }

            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            submissionDataRef.current = { participant: participantAddress, score };

            console.log("Wallet connected:", { address, isConnected });
            console.log("Contract address:", contractAddress);
            console.log("Participant address:", participantAddress);
            console.log("Score:", score);

            toast.loading("Please confirm transaction in your wallet...", { id: "score-submission" });

            console.log("About to call writeContract for scoreSubmission...");

            // writeContract doesn't return the hash directly - it triggers the wallet
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: DEHACK_PLATFORM_ABI,
                functionName: "scoreSubmission",
                args: [participantAddress as `0x${string}`, BigInt(score)]
            });

            console.log("writeContract called, waiting for user to confirm in wallet...");

            // Set a timeout to handle cases where user doesn't respond
            timeoutRef.current = setTimeout(() => {
                console.log("Transaction timeout - user may have cancelled or not responded");
                toast.dismiss("score-submission");
                toast.error("Transaction timed out. Please try again.");
                resetState();
            }, 300000); // 5 minutes timeout

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };

        } catch (err: unknown) {
            console.error("Error submitting score:", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Failed to submit score: ${errorMessage}`, { id: "score-submission" });
            setIsLoading(false);
            callbackRef.current = null;
            submissionDataRef.current = null;
            throw err;
        }
    };

    return {
        scoreSubmission,
        isLoading,
        txHash,
        error
    };
};
