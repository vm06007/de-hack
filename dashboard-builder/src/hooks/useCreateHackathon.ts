import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import toast from "react-hot-toast";
import { DEHACK_PLATFORM_ABI, DEHACK_PLATFORM_ADDRESS } from "@/src/lib/wagmi";
import { parseEther } from "viem";
import { useState, useRef, useEffect } from "react";

export interface VotingConfig {
    systemType: number; // 0 = Open, 1 = MACI, 2 = ZK, 3 = RevealCommit
    useQuadraticVoting: boolean;
    votingPowerPerJudge: string;
    maxWinners: string;
}

export interface CreateHackathonParams {
    hackathonId: string;
    startTime: string;
    endTime: string;
    minimumSponsorContribution: string;
    stakeAmount: string;
    prizeDistribution: string[];
    selectedJudges: string[];
    votingConfig: VotingConfig;
    value: string; // ETH value to send with transaction
}

export interface HackathonCreatedResult {
    hash: `0x${string}`;
    hackathonAddress?: string;
    hackathonId?: string;
}

export const useCreateHackathon = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const callbackRef = useRef<((result: HackathonCreatedResult) => void) | null>(null);
    
    const { address, isConnected } = useAccount();
    const { writeContract, data: contractWriteData, error } = useWriteContract();
    
    // Wait for transaction receipt
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: contractWriteData,
    });
    
    // Update txHash when contractWriteData changes
    useEffect(() => {
        if (contractWriteData && contractWriteData !== txHash) {
            console.log("Contract write data received:", contractWriteData);
            setTxHash(contractWriteData);
            toast.loading("Transaction submitted, waiting for confirmation...", { id: "create-hackathon" });
        }
    }, [contractWriteData, txHash]);

    // Handle receipt when it arrives
    useEffect(() => {
        console.log("useEffect triggered:", {
            txReceipt: !!txReceipt,
            txHash: txHash,
            hasCallback: !!callbackRef.current,
            receiptStatus: txReceipt?.status
        });
        
        if (txReceipt && txHash && callbackRef.current) {
            console.log("Processing transaction receipt...", txReceipt);
            
            // Parse the HackathonCreated event
            const hackathonCreatedEventSignature = "0x526b2cf7f5bb87f9a4c01a6eb8c01bf90405b9726286908ac1dfd93944da0e84";
            
            const hackathonCreatedEvent = txReceipt.logs.find(log => {
                return log.topics && log.topics[0] === hackathonCreatedEventSignature;
            });

            if (hackathonCreatedEvent && hackathonCreatedEvent.topics[1]) {
                // Extract hackathon address from event
                const hackathonAddress = "0x" + hackathonCreatedEvent.topics[1].slice(26);
                
                // Parse hackathon ID from data
                const data = hackathonCreatedEvent.data.slice(2);
                const hackathonId = BigInt("0x" + data.slice(0, 64)).toString();
                
                console.log("Extracted contract address:", hackathonAddress);
                console.log("Extracted hackathon ID:", hackathonId);
                
                // Call the callback with the extracted data
                const result: HackathonCreatedResult = {
                    hash: txHash,
                    hackathonAddress,
                    hackathonId
                };
                
                callbackRef.current(result);
                
                // Clean up
                callbackRef.current = null;
                setTxHash(undefined);
                setIsLoading(false);
            } else {
                console.error("Could not extract hackathon address from event");
                toast.error("Could not get contract address from transaction");
                setIsLoading(false);
            }
        }
    }, [txReceipt, txHash]);

    const createHackathon = async (
        params: CreateHackathonParams,
        onSuccess?: (result: HackathonCreatedResult) => void
    ): Promise<HackathonCreatedResult> => {
        try {
            // Check wallet connection first
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                throw new Error("Wallet not connected");
            }
            
            setIsLoading(true);
            callbackRef.current = onSuccess || null;
            
            console.log("Wallet connected:", { address, isConnected });
            console.log("Contract address:", DEHACK_PLATFORM_ADDRESS);
            console.log("Parameters:", params);
            
            toast.loading("Submitting transaction...", { id: "create-hackathon" });

            // Convert ETH value to wei
            const valueInWei = parseEther(params.value);
            console.log("ETH value:", params.value);
            console.log("Value in wei:", valueInWei.toString());

            console.log("About to call writeContract...");
            
            // writeContract doesn't return the hash directly - it triggers the wallet
            writeContract({
                address: DEHACK_PLATFORM_ADDRESS,
                abi: DEHACK_PLATFORM_ABI,
                functionName: "createHackathon",
                args: [
                    BigInt(params.hackathonId),
                    BigInt(params.startTime),
                    BigInt(params.endTime),
                    BigInt(params.minimumSponsorContribution),
                    BigInt(params.stakeAmount),
                    params.prizeDistribution.map(p => BigInt(p)),
                    params.selectedJudges as `0x${string}`[],
                    [
                        params.votingConfig.systemType,
                        params.votingConfig.useQuadraticVoting,
                        BigInt(params.votingConfig.votingPowerPerJudge),
                        BigInt(params.votingConfig.maxWinners)
                    ]
                ],
                value: valueInWei
            });

            console.log("writeContract called, waiting for user to confirm in wallet...");
            
            toast.loading("Please confirm transaction in your wallet...", { id: "create-hackathon" });

            // Return empty hash initially - the real hash will come from contractWriteData
            return { hash: "0x" as `0x${string}` };
        } catch (err) {
            console.error("Error creating hackathon:", err);
            toast.error("Failed to create hackathon. Please try again.", { id: "create-hackathon" });
            setIsLoading(false);
            callbackRef.current = null;
            throw err;
        }
    };

    return {
        createHackathon,
        isLoading,
        error
    };
};