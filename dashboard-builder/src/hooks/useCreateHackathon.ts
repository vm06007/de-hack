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
const DEHACK_PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_DEHACK_PLATFORM_ADDRESS || "0x2D55ab16d7ebDEcE1Dbf199A3930f399d0A4C176";

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
            const hackathonCreatedEvent = receipt.logs.find(log => {
                try {
                    const parsed = contract.interface.parseLog(log);
                    return parsed?.name === "HackathonCreated";
                } catch {
                    return false;
                }
            });

            if (hackathonCreatedEvent) {
                const parsedEvent = contract.interface.parseLog(hackathonCreatedEvent);
                const hackathonAddress = parsedEvent?.args.hackathonAddress;
                const hackathonId = parsedEvent?.args.hackathonId.toString();
                
                toast.success("Hackathon created successfully!", { id: "create-hackathon" });
                
                return {
                    ...result,
                    hackathonAddress,
                    hackathonId
                };
            } else {
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