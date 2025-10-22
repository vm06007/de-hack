import { useState, useRef, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';

// Hackathon contract ABI - register function and isRegistered view
const HACKATHON_ABI = [
    {
        "inputs": [],
        "name": "register",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "isRegistered",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
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
                "internalType": "uint256",
                "name": "stakeAmount",
                "type": "uint256"
            }
        ],
        "name": "ParticipantRegistered",
        "type": "event"
    }
] as const;

export interface RegisterHackerResult {
    hash: `0x${string}`;
    participant?: string;
    stakeAmount?: string;
}

export const useRegisterHacker = (contractAddress: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const callbackRef = useRef<((result: RegisterHackerResult) => void) | null>(null);
    const stakeAmountRef = useRef<string>('');
    
    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error } = useWriteContract();
    
    // Check if the current user is registered
    const { data: isRegistered, refetch: refetchRegistrationStatus } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: HACKATHON_ABI,
        functionName: 'isRegistered',
        args: address ? [address] : undefined,
        enabled: !!address && !!contractAddress,
    });
    
    // Wait for transaction receipt
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: contractWriteData,
    });
    
    // Update txHash when contractWriteData changes
    useEffect(() => {
        if (contractWriteData && contractWriteData !== txHash) {
            console.log("Hacker registration contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "register-hacker" });
        }
    }, [contractWriteData, txHash]);

    // Handle receipt when it arrives
    useEffect(() => {
        console.log("Hacker registration useEffect triggered:", {
            txReceipt: !!txReceipt,
            txHash: txHash,
            hasCallback: !!callbackRef.current,
            receiptStatus: txReceipt?.status
        });
        
        if (txReceipt && txHash && callbackRef.current) {
            console.log("Processing hacker registration transaction receipt...", txReceipt);
            
            if (txReceipt.status === 'success') {
                toast.success("Successfully registered for hackathon!", { id: "register-hacker" });
                
                // Create the result object with known data (no event parsing needed)
                const result: RegisterHackerResult = {
                    hash: txHash,
                    participant: address, // We know the participant is the connected wallet
                    stakeAmount: stakeAmountRef.current // Store stake amount in ref
                };
                
                console.log("Calling hacker registration success callback...", result);
                callbackRef.current(result);
                
                // Refetch registration status after successful transaction
                refetchRegistrationStatus();
            } else {
                console.error("Registration transaction failed!");
                toast.error("Registration transaction failed!", { id: "register-hacker" });
            }
            
            // Clean up
            callbackRef.current = null;
            setTxHash(undefined);
            setIsLoading(false);
        }
    }, [txReceipt, txHash, address, refetchRegistrationStatus]);

    const registerHacker = async (
        stakeAmount: string,
        onSuccess?: (result: RegisterHackerResult) => void
    ): Promise<RegisterHackerResult> => {
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            toast.error("Please enter a valid stake amount");
            throw new Error("Invalid stake amount");
        }

        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }
            
            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            stakeAmountRef.current = stakeAmount; // Store for later use
            
            console.log("Wallet connected:", { address, isConnected });
            console.log("Contract address:", contractAddress);
            console.log("Stake amount (ETH):", stakeAmount);
            
            toast.loading("Please confirm transaction in your wallet...", { id: "register-hacker" });

            // Convert stake amount to wei
            const stakeInWei = parseEther(stakeAmount);
            console.log("Stake in wei:", stakeInWei.toString());

            console.log("About to call writeContract for register...");
            
            // writeContract doesn't return the hash directly - it triggers the wallet
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: HACKATHON_ABI,
                functionName: "register",
                value: stakeInWei
            });

            console.log("writeContract called, waiting for user to confirm in wallet...");

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };

        } catch (err: any) {
            console.error("Error registering hacker:", err);
            toast.error(`Failed to register: ${err.message || "Unknown error"}`, { id: "register-hacker" });
            setIsLoading(false);
            callbackRef.current = null;
            throw err;
        }
    };

    return {
        registerHacker,
        isLoading,
        error,
        isRegistered: !!isRegistered,
        refetchRegistrationStatus
    };
};