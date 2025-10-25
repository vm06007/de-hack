"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import Layout from "@/components/Layout";
import HackathonDetails from "./HackathonDetails";
import Images from "./Images";
import CategoryAndAttributes from "./CategoryAndAttributes";
// import CoverImage from "./CoverImage";
// import UploadProductFiles from "./UploadProductFiles";
import Price from "./Price";
import Highlights from "./Highlights";
import CTA from "./CTA";
import Demos from "./Demos";
import HackathonTiming from "./HackathonTiming";
import { useCreateHackathon, VotingConfig } from "@/src/hooks/useCreateHackathon";
import { useEthPrice, useUsdToEth } from "@/src/hooks/useEthPrice";
import { getTokenDecimals } from "@/constants/tokenAddresses";
import { parseUnits } from "viem";

const NewHackathonPage = () => {
    const [totalPrize, setTotalPrize] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
    const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
    const [prizeTiers, setPrizeTiers] = useState<any[]>([]);
    const [ethAmount, setEthAmount] = useState<number>(0);
    const [judgingIncentivePercentage, setJudgingIncentivePercentage] = useState<number>(0);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 25 * 60 * 1000); // 5 minutes in the future
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    const [startDate, setStartDate] = useState(fiveMinutesFromNow);
    const [startTime, setStartTime] = useState(fiveMinutesFromNow);
    const [endDate, setEndDate] = useState(oneWeekFromNow);
    const [endTime, setEndTime] = useState(oneWeekFromNow);

    // Hackathon Settings
    const [allowSponsors, setAllowSponsors] = useState(false);
    const [sponsorMinContribution, setSponsorMinContribution] = useState("500");
    const [sponsorCurrency, setSponsorCurrency] = useState({ id: 2, name: "PYUSD" });
    const [requireStaking, setRequireStaking] = useState(false);
    const [stakingAmount, setStakingAmount] = useState("0.01");
    const [stakingCurrency, setStakingCurrency] = useState({ id: 1, name: "ETH" });
    const [automaticStakeReturn, setAutomaticStakeReturn] = useState(false);
    const [depositStrategy, setDepositStrategy] = useState({ id: 1, name: "Plain Deposit" });
    const [selectedJudges, setSelectedJudges] = useState<number[]>([]);
    const [allowAIDelegation, setAllowAIDelegation] = useState(false);
    const [judgingModel, setJudgingModel] = useState({ id: 1, name: "Open Voting" });
    const [votingType, setVotingType] = useState({ id: 1, name: "Linear Voting" });

    const router = useRouter();
    const { address } = useAccount();
    const { createHackathon, isLoading } = useCreateHackathon();

    // Direct ETH price access for debugging
    const { data: ethPrice, isLoading: isEthPriceLoading } = useEthPrice();
    const { ethAmount: directEthAmount, isLoading: isDirectConversionLoading } = useUsdToEth(parseFloat(totalPrize) || 0);

    // Calculate total ETH amount including judging incentives
    const calculateTotalEthAmount = () => {
        const baseEthAmount = ethAmount;
        const incentiveAmount = (baseEthAmount * judgingIncentivePercentage) / 100;
        return baseEthAmount + incentiveAmount;
    };

    const totalEthAmount = calculateTotalEthAmount();

    const callBackendAPI = async (hackathonAddress: string, hackathonId: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/hackathons", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    title: title || "Untitled Hackathon",
                    description: description,
                    status: "scheduled",
                    isOnline: true,
                    createdBy: 1,
                    totalPrizePool: totalPrize,
                    prizeTiers,
                    // Send cover image as the main image
                    image: coverUrl,
                    // Send logo separately if we want to store it
                    logoUrl: logoUrl,
                    // Send dates
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    // Sponsor settings
                    allowSponsors,
                    sponsorMinContribution,
                    sponsorCurrency: sponsorCurrency.name,
                    // Staking settings
                    requireStaking,
                    stakingAmount,
                    stakingCurrency: stakingCurrency.name,
                    // Judge settings
                    selectedJudges,
                    judgingModel: judgingModel.name,
                    allowAIDelegation,
                    // Blockchain data
                    contractAddress: hackathonAddress,
                    hackathonId: hackathonId,
                }),
            });

            if (!res.ok) throw new Error(`Create failed: ${res.status}`);
            const json = await res.json();
            console.log("Hackathon created in backend:", json);

            toast.success("Hackathon created successfully!");

            const id = json?.id;
            if (id) {
                router.push(`/hackathons/${id}`);
            }
        } catch (e) {
            console.error("Backend API error:", e);
            toast.error("Failed to save hackathon data to backend");
        }
    };

    const handleDeploy = async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            // Convert dates and times to Unix timestamps
            // Combine date and time for accurate timestamps
            const startDateTime = new Date(startDate);
            startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());
            
            const endDateTime = new Date(endDate);
            endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());
            
            const startTimestamp = Math.floor(startDateTime.getTime() / 1000);
            const endTimestamp = Math.floor(endDateTime.getTime() / 1000);
            
            // Debug logging to verify timestamps include time
            console.log('Date/Time conversion:', {
                startDate: startDate.toISOString(),
                startTime: startTime.toISOString(),
                startDateTime: startDateTime.toISOString(),
                startTimestamp,
                endDate: endDate.toISOString(),
                endTime: endTime.toISOString(),
                endDateTime: endDateTime.toISOString(),
                endTimestamp,
                timeDifference: endTimestamp - startTimestamp
            });

            // Generate a unique hackathon ID using timestamp + random component
            const timestamp = Math.floor(Date.now() / 1000);
            const randomComponent = Math.floor(Math.random() * 1000000);
            const hackathonId = `${timestamp}${randomComponent}`;

            // Convert prize distribution from tiers to wei using BigInt to avoid scientific notation
            const prizeDistribution = prizeTiers.map(tier => {
                const amount = parseFloat(tier.amount || "0");
                return (BigInt(Math.floor(amount * 1000000000000000000))).toString();
            });

            // Convert judge IDs to real addresses
            const judgeAddressMap: { [key: number]: string } = {
                1: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Vitalik Buterin
                2: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Sandeep Nailwal
                3: "0x75aa660720f3dcb5973DA8A81450647C18ae35E4", // Sergey Nazarov
                4: "0x50EC05ADe8280758E2077fcBC08D878D4aef79C3", // Hayden Adams
                5: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Kartik Talwar
                6: "0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689", // Vitalik Marincenko
                7: "0x8ba1f109551bD432803012645aac136c4b4d8b6", // Stani Kulechov
                8: "0xCf7Ed3AccA5aC9b869C65C6fD4C8C4C8C4C8C4C8", // Devin Finzer
            };

            const judgeAddresses = selectedJudges.map(judgeId => {
                return judgeAddressMap[judgeId] || "0x0000000000000000000000000000000000000000";
            });

            // Filter out zero addresses and log for debugging
            const validJudgeAddresses = judgeAddresses.filter(addr => addr !== "0x0000000000000000000000000000000000000000");

            // If no valid judges, show warning
            if (validJudgeAddresses.length === 0) {
                toast.error("Please select at least one valid judge");
                return;
            }

            // Create voting config based on judging model
            const votingConfig: VotingConfig = {
                systemType: judgingModel.id === 1 ? 0 : 1, // 0 = Open, 1 = MACI, etc.
                useQuadraticVoting: allowAIDelegation,
                votingPowerPerJudge: "1",
                maxWinners: "3"
            };

            // Convert stake amount from ETH to wei using BigInt to avoid scientific notation
            const stakeAmountInWei = (BigInt(Math.floor(parseFloat(stakingAmount) * 1000000000000000000))).toString();

            // Convert sponsor contribution using correct decimal precision based on currency
            let sponsorContributionInWei: string;
            if (sponsorCurrency.name === 'ETH') {
                // ETH uses 18 decimals
                sponsorContributionInWei = (BigInt(Math.floor(parseFloat(sponsorMinContribution) * 1000000000000000000))).toString();
            } else {
                // Token currencies use their specific decimal precision
                const tokenDecimals = getTokenDecimals(sponsorCurrency.name);
                if (!tokenDecimals) {
                    toast.error(`Token decimals not found for ${sponsorCurrency.name}`);
                    return;
                }
                const sponsorAmount = parseUnits(sponsorMinContribution, tokenDecimals);
                sponsorContributionInWei = sponsorAmount.toString();
                console.log(`Sponsor contribution: ${sponsorMinContribution} ${sponsorCurrency.name} (${tokenDecimals} decimals) = ${sponsorContributionInWei}`);
            }

            // Use dynamic ETH amount based on prize pool conversion, fallback to 0.0001 for testing
            const finalEthAmount = ethAmount > 0 ? ethAmount : (directEthAmount > 0 ? directEthAmount : 0);
            const baseEthValue = finalEthAmount > 0 ? finalEthAmount : 0.0001;

            // Add judging incentives percentage to the base ETH amount
            const incentiveAmount = (baseEthValue * judgingIncentivePercentage) / 100;
            const ethValue = (baseEthValue + incentiveAmount).toString();
            console.log("Prize pool conversion:", {
                totalPrize,
                ethAmount,
                directEthAmount,
                finalEthAmount,
                baseEthValue,
                judgingIncentivePercentage,
                incentiveAmount,
                ethValue,
                ethPrice,
                isEthPriceLoading,
                isDirectConversionLoading,
                timestamp: new Date().toISOString()
            });

            // Call the blockchain transaction with callback for when we get the contract address
            await createHackathon({
                hackathonId,
                startTime: startTimestamp.toString(),
                endTime: endTimestamp.toString(),
                minimumSponsorContribution: sponsorContributionInWei,
                stakeAmount: stakeAmountInWei,
                prizeDistribution,
                selectedJudges: validJudgeAddresses, // Use only valid judge addresses
                votingConfig,
                value: ethValue // Dynamic ETH amount based on prize pool
            }, async (result) => {
                // This callback is called when we get the contract address from the receipt
                console.log("Got contract address, calling backend API...");
                if (result.hackathonAddress && result.hackathonId) {
                    await callBackendAPI(result.hackathonAddress, result.hackathonId);
                } else {
                    console.error("Missing contract address or hackathon ID");
                    toast.error("Failed to get contract address");
                }
            });

            console.log("Transaction submitted, waiting for confirmation to get contract address...");

        } catch (e) {
            console.error("Blockchain transaction error:", e);
            toast.error("Failed to create hackathon on blockchain");
        }
    };

    return (
        <Layout title="Host New Hackathon" newProduct onDeploy={handleDeploy} isLoading={isLoading}>
            <div className="flex max-lg:block">
                <div className="w-[calc(100%-33.75rem)] pr-3 max-4xl:w-[calc(100%-27.5rem)] max-2xl:w-[calc(100%-23rem)] max-lg:w-full max-lg:pr-0">
                    <HackathonDetails title={title} setTitle={setTitle} description={description} setDescription={setDescription} />
                    <HackathonTiming
                        startDate={startDate}
                        setStartDate={setStartDate}
                        startTime={startTime}
                        setStartTime={setStartTime}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        endTime={endTime}
                        setEndTime={setEndTime}
                    />
                    <Images setLogoUrl={setLogoUrl} setCoverUrl={setCoverUrl} />
                    <CategoryAndAttributes
                        judgingModel={judgingModel}
                        setJudgingModel={setJudgingModel}
                        selectedJudges={selectedJudges}
                        setSelectedJudges={setSelectedJudges}
                        allowAIAgentDelegations={allowAIDelegation}
                        setAllowAIAgentDelegations={setAllowAIDelegation}
                        votingType={votingType}
                        setVotingType={setVotingType}
                        onJudgingIncentiveChange={setJudgingIncentivePercentage}
                    />
                </div>
                <div className="w-[33.75rem] max-4xl:w-[27.5rem] max-2xl:w-[23rem] max-lg:w-full max-lg:mt-3">
                    {/*<CoverImage />*/}
                    {/*<UploadProductFiles />*/}
                    <Highlights
                        totalPrize={totalPrize}
                        setTotalPrize={setTotalPrize}
                        onTiersChange={setPrizeTiers}
                        onEthAmountChange={setEthAmount}
                    />
                    <Price
                        allowSponsors={allowSponsors}
                        setAllowSponsors={setAllowSponsors}
                        sponsorCurrency={sponsorCurrency}
                        setSponsorCurrency={setSponsorCurrency}
                        minSponsorContribution={sponsorMinContribution}
                        setMinSponsorContribution={setSponsorMinContribution}
                        requireStaking={requireStaking}
                        setRequireStaking={setRequireStaking}
                        stakingCurrency={stakingCurrency}
                        setStakingCurrency={setStakingCurrency}
                        stakingAmount={stakingAmount}
                        setStakingAmount={setStakingAmount}
                        automaticStakeReturn={automaticStakeReturn}
                        setAutomaticStakeReturn={setAutomaticStakeReturn}
                    />
                    <CTA
                        ethAmount={totalEthAmount}
                        totalPrize={totalPrize}
                        judgingIncentivePercentage={judgingIncentivePercentage}
                    />
                    <Demos />
                </div>
            </div>
        </Layout>
    );
};

export default NewHackathonPage;
