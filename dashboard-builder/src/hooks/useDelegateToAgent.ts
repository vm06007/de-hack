import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { DEHACK_PLATFORM_ABI } from '../lib/wagmi';

export interface DelegateToAgentResult {
    hash: `0x${string}`;
    delegate?: string;
}

export const useDelegateToAgent = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const callbackRef = useRef<((result: DelegateToAgentResult) => void) | null>(null);
    const delegateAddressRef = useRef<string>('');
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
            console.log("Delegate contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "delegate-to-agent" });
        }
    }, [contractWriteData, txHash]);

    // Cleanup function to reset state
    const resetState = () => {
        setIsLoading(false);
        callbackRef.current = null;
        setTxHash(undefined);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Handle writeContract errors (including user rejection)
    useEffect(() => {
        if (error) {
            console.error("Delegate contract write error:", error);
            toast.dismiss("delegate-to-agent");
            
            if (error.message?.includes("User rejected")) {
                toast.error("Transaction rejected by user");
            } else {
                toast.error(`Failed to delegate: ${error.message || "Unknown error"}`);
            }
            
            resetState();
        }
    }, [error]);

    // Handle receipt when it arrives
    useEffect(() => {
        const handleTransactionSuccess = async () => {
            if (txReceipt && txHash && callbackRef.current) {
                console.log("Delegate transaction confirmed:", txReceipt);
                toast.dismiss("delegate-to-agent");
                toast.success("Successfully delegated to AI agent!");

                const result: DelegateToAgentResult = {
                    hash: txHash,
                    delegate: delegateAddressRef.current
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

    const delegateToAgent = async (
        delegateAddress: string,
        onSuccess?: (result: DelegateToAgentResult) => void
    ): Promise<DelegateToAgentResult> => {
        if (!delegateAddress) {
            toast.error("Please enter a delegate address");
            throw new Error("Delegate address is required");
        }

        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }

            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            delegateAddressRef.current = delegateAddress;

            console.log("Wallet connected:", { address, isConnected });
            console.log("Contract address:", contractAddress);
            console.log("Delegate address:", delegateAddress);

            toast.loading("Please confirm transaction in your wallet...", { id: "delegate-to-agent" });

            console.log("About to call writeContract for delegateToAgent...");

            // writeContract doesn't return the hash directly - it triggers the wallet
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: DEHACK_PLATFORM_ABI,
                functionName: "delegateToAgent",
                args: [delegateAddress as `0x${string}`]
            });

            console.log("writeContract called, waiting for user to confirm in wallet...");

            // Set a timeout to handle cases where user doesn't respond
            timeoutRef.current = setTimeout(() => {
                console.log("Transaction timeout - user may have cancelled or not responded");
                toast.dismiss("delegate-to-agent");
                toast.error("Transaction timed out. Please try again.");
                resetState();
            }, 300000); // 5 minutes timeout

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };

        } catch (err: unknown) {
            console.error("Error delegating to agent:", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Failed to delegate: ${errorMessage}`, { id: "delegate-to-agent" });
            setIsLoading(false);
            callbackRef.current = null;
            throw err;
        }
    };

    return {
        delegateToAgent,
        isLoading,
        txHash,
        error
    };
};
