import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import toast from 'react-hot-toast';

// Hackathon contract ABI - only the submitProject function
const HACKATHON_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_projectName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_projectUrl",
                "type": "string"
            }
        ],
        "name": "submitProject",
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
                "name": "participant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "projectName",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "projectUrl",
                "type": "string"
            }
        ],
        "name": "ProjectSubmitted",
        "type": "event"
    }
] as const;

export interface SubmitProjectResult {
    hash: `0x${string}`;
    participant?: string;
    projectName?: string;
    projectUrl?: string;
}

export const useSubmitProject = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const callbackRef = useRef<((result: SubmitProjectResult) => void) | null>(null);
    const projectDataRef = useRef<{ name: string; url: string }>({ name: '', url: '' });
    
    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error } = useWriteContract();
    
    // Wait for transaction receipt
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: contractWriteData,
    });
    
    // Update txHash when contractWriteData changes
    useEffect(() => {
        if (contractWriteData && contractWriteData !== txHash) {
            console.log("Project submission contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "submit-project" });
        }
    }, [contractWriteData, txHash]);

    // Handle receipt when it arrives
    useEffect(() => {
        console.log("Project submission useEffect triggered:", {
            txReceipt: !!txReceipt,
            txHash: txHash,
            hasCallback: !!callbackRef.current,
            receiptStatus: txReceipt?.status
        });
        
        if (txReceipt && txHash && callbackRef.current) {
            console.log("Processing project submission transaction receipt...", txReceipt);
            
            if (txReceipt.status === 'success') {
                toast.success("Project submitted successfully!", { id: "submit-project" });
                
                // Create the result object with known data
                const result: SubmitProjectResult = {
                    hash: txHash,
                    participant: address,
                    projectName: projectDataRef.current.name,
                    projectUrl: projectDataRef.current.url
                };
                
                console.log("Calling project submission success callback...", result);
                callbackRef.current(result);
            } else {
                console.error("Project submission transaction failed!");
                toast.error("Project submission transaction failed!", { id: "submit-project" });
            }
            
            // Clean up
            callbackRef.current = null;
            setTxHash(undefined);
            setIsLoading(false);
        }
    }, [txReceipt, txHash, address]);

    const submitProject = async (
        projectName: string,
        projectUrl: string,
        onSuccess?: (result: SubmitProjectResult) => void
    ): Promise<SubmitProjectResult> => {
        if (!projectName || !projectUrl) {
            toast.error("Project name and URL are required");
            throw new Error("Missing required fields");
        }

        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }
            
            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            projectDataRef.current = { name: projectName, url: projectUrl };
            
            console.log("Wallet connected:", { address, isConnected });
            console.log("Contract address:", contractAddress);
            console.log("Project data:", { projectName, projectUrl });
            
            toast.loading("Please confirm transaction in your wallet...", { id: "submit-project" });

            console.log("About to call writeContract for submitProject...");
            
            // writeContract doesn't return the hash directly - it triggers the wallet
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: HACKATHON_ABI,
                functionName: "submitProject",
                args: [projectName, projectUrl]
            });

            console.log("writeContract called, waiting for user to confirm in wallet...");

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };

        } catch (err: any) {
            console.error("Error submitting project:", err);
            toast.error(`Failed to submit project: ${err.message || "Unknown error"}`, { id: "submit-project" });
            setIsLoading(false);
            callbackRef.current = null;
            throw err;
        }
    };

    return {
        submitProject,
        isLoading,
        error
    };
};