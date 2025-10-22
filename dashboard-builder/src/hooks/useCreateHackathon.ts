import { useContract, useContractWrite } from "@thirdweb-dev/react";
import toast from "react-hot-toast";
import { DEHACK_PLATFORM_ABI } from "@/src/lib/abi";

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

// Contract address - DeHack Platform Factory on mainnet
const DEHACK_PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_DEHACK_PLATFORM_ADDRESS || "0x553db01f160771DF2b483F6E9BB5AD173B040151";

export const useCreateHackathon = () => {
    const { contract } = useContract(DEHACK_PLATFORM_ADDRESS, DEHACK_PLATFORM_ABI);
    
    const { mutateAsync: createHackathon, isLoading, error } = useContractWrite(contract, "createHackathon");

    const createHackathonWithToast = async (params: CreateHackathonParams) => {
        try {
            console.log("Contract address:", DEHACK_PLATFORM_ADDRESS);
            console.log("Contract instance:", contract);
            console.log("Parameters:", params);
            
            toast.loading("Preparing transaction...", { id: "create-hackathon" });

            // Convert ETH value to wei using BigInt to avoid scientific notation
            const ethValue = parseFloat(params.value);
            const valueInWei = (BigInt(Math.floor(ethValue * 1000000000000000000))).toString();
            console.log("ETH value:", ethValue);
            console.log("Value in wei:", valueInWei);

            // Convert string values to proper format for the contract call
            const result = await createHackathon({
                args: [
                    params.hackathonId,
                    params.startTime,
                    params.endTime,
                    params.minimumSponsorContribution,
                    params.stakeAmount,
                    params.prizeDistribution,
                    params.selectedJudges,
                    [
                        params.votingConfig.systemType,
                        params.votingConfig.useQuadraticVoting,
                        params.votingConfig.votingPowerPerJudge,
                        params.votingConfig.maxWinners
                    ]
                ],
                overrides: {
                    value: valueInWei
                }
            });

            toast.loading("Transaction submitted, waiting for confirmation...", { id: "create-hackathon" });

            // Wait for the transaction to be mined
            const receipt = await result.receipt;

            // Parse the HackathonCreated event from the transaction receipt
            // The HackathonCreated event signature hash is: 0x526b2cf7f5bb87f9a4c01a6eb8c01bf90405b9726286908ac1dfd93944da0e84
            const hackathonCreatedEventSignature = "0x526b2cf7f5bb87f9a4c01a6eb8c01bf90405b9726286908ac1dfd93944da0e84";
            
            const hackathonCreatedEvent = receipt.logs.find(log => {
                return log.topics && log.topics[0] === hackathonCreatedEventSignature;
            });

            if (hackathonCreatedEvent) {
                // Extract data from the event log
                // Topics: [0] = event signature, [1] = hackathonAddress, [2] = organizer
                // Data: hackathonId, prizePool, votingSystem, useQuadraticVoting
                const hackathonAddress = "0x" + hackathonCreatedEvent.topics[1].slice(26); // Remove 0x and first 24 chars
                const organizer = "0x" + hackathonCreatedEvent.topics[2].slice(26); // Remove 0x and first 24 chars
                
                // Parse the data field (contains hackathonId, prizePool, votingSystem, useQuadraticVoting)
                const data = hackathonCreatedEvent.data.slice(2); // Remove 0x
                const hackathonId = BigInt("0x" + data.slice(0, 64)).toString();
                
                console.log("Parsed event data:", {
                    hackathonAddress,
                    organizer,
                    hackathonId,
                    rawTopics: hackathonCreatedEvent.topics,
                    rawData: hackathonCreatedEvent.data
                });
                
                toast.success("Hackathon created successfully!", { id: "create-hackathon" });
                
                return {
                    ...result,
                    hackathonAddress,
                    hackathonId
                };
            } else {
                console.log("Available logs:", receipt.logs.map(log => ({
                    topics: log.topics,
                    data: log.data,
                    address: log.address
                })));
                toast.error("HackathonCreated event not found in transaction", { id: "create-hackathon" });
                throw new Error("HackathonCreated event not found");
            }
        } catch (err) {
            console.error("Error creating hackathon:", err);
            toast.error("Failed to create hackathon. Please try again.", { id: "create-hackathon" });
            throw err;
        }
    };

    return {
        createHackathon: createHackathonWithToast,
        isLoading,
        error
    };
};