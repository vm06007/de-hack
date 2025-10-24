import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';

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
    projectId?: number;
}

export interface ProjectSubmissionData {
    hackathonId: number;
    title: string;
    description: string;
    teamMembers: Array<{
        name: string;
        role: string;
        email?: string;
        github?: string;
    }>;
    selectedTracks: number[];
    demoUrl?: string;
    githubUrl: string;
    videoUrl?: string;
    images: string[];
    technologies: string[];
    submittedBy?: number;
    submittedByName?: string;
}

export const useSubmitProject = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [showCongrats, setShowCongrats] = useState(false);
    const [projectId, setProjectId] = useState<number | null>(null);
    const callbackRef = useRef<((result: SubmitProjectResult) => void) | null>(null);
    const projectDataRef = useRef<{ name: string; url: string; fullData?: ProjectSubmissionData }>({ name: '', url: '' });

    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error } = useWriteContract();

    // Function to call backend API to store project
    const saveProjectToBackend = async (projectData: ProjectSubmissionData, txHash: string) => {
        try {
            console.log('Saving project to backend:', projectData);

            const savedProject = await apiClient.post('/projects', projectData) as { id: number };
            console.log('Project saved to backend:', savedProject);

            return savedProject.id;
        } catch (error) {
            console.error('Failed to save project to backend:', error);
            throw error;
        }
    };

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

    // Handle writeContract errors (like user cancellation)
    useEffect(() => {
        if (error) {
            console.log("Project submission writeContract error:", error);

            // Check if it's a user rejection/cancellation
            const errorMessage = error.message || error.toString();
            if (errorMessage.includes('User rejected') ||
                errorMessage.includes('User denied') ||
                errorMessage.includes('cancelled') ||
                errorMessage.includes('rejected')) {
                console.log("User cancelled the transaction");
                toast.error("Transaction cancelled by user", { id: "submit-project" });
            } else {
                // console.error("Project submission transaction error:", error);
                toast.error(`Project submission failed: ${errorMessage}`, { id: "submit-project" });
            }

            // Reset loading state and cleanup
            setIsLoading(false);
            callbackRef.current = null;
            setTxHash(undefined);
        }
    }, [error]);

    // Handle receipt when it arrives
    useEffect(() => {
        const handleTransactionSuccess = async () => {
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

                    // Save project to backend if we have full data
                    if (projectDataRef.current.fullData) {
                        try {
                            const savedProjectId = await saveProjectToBackend(projectDataRef.current.fullData, txHash);
                            setProjectId(savedProjectId);
                            console.log("Project saved to backend with ID:", savedProjectId);
                        } catch (backendError) {
                            console.error("Failed to save project to backend:", backendError);
                            toast.error("Project submitted to blockchain but failed to save to database. Please contact support.", { id: "submit-project" });
                        }
                    }

                    // Show congrats screen
                    setShowCongrats(true);

                    // Create the result object with known data
                    const result: SubmitProjectResult = {
                        hash: txHash,
                        participant: address,
                        projectName: projectDataRef.current.name,
                        projectUrl: projectDataRef.current.url,
                        projectId: projectId || undefined
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
        };

        if (txReceipt && txHash && callbackRef.current) {
            handleTransactionSuccess();
        }
    }, [txReceipt, txHash, address]);

    const submitProject = async (
        projectName: string,
        projectUrl: string,
        fullProjectData?: ProjectSubmissionData,
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
            projectDataRef.current = { name: projectName, url: projectUrl, fullData: fullProjectData };

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

    const closeCongrats = () => {
        setShowCongrats(false);
        setProjectId(null);
        projectDataRef.current = { name: '', url: '' };
    };

    return {
        submitProject,
        isLoading,
        error,
        showCongrats,
        projectId,
        closeCongrats
    };
};