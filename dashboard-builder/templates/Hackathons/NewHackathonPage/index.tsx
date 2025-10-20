"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const NewHackathonPage = () => {
    const [totalPrize, setTotalPrize] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
    const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
    const [prizeTiers, setPrizeTiers] = useState<any[]>([]);
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    const [startDate, setStartDate] = useState(now);
    const [startTime, setStartTime] = useState(now);
    const [endDate, setEndDate] = useState(oneWeekFromNow);
    const [endTime, setEndTime] = useState(oneWeekFromNow);

    // Hackathon Settings
    const [allowSponsors, setAllowSponsors] = useState(false);
    const [sponsorMinContribution, setSponsorMinContribution] = useState("500");
    const [sponsorCurrency, setSponsorCurrency] = useState({ id: 2, name: "USDC" });
    const [requireStaking, setRequireStaking] = useState(false);
    const [stakingAmount, setStakingAmount] = useState("0.001");
    const [stakingCurrency, setStakingCurrency] = useState({ id: 1, name: "ETH" });
    const [selectedJudges, setSelectedJudges] = useState<number[]>([]);
    const [allowAIDelegation, setAllowAIDelegation] = useState(false);
    const [judgingModel, setJudgingModel] = useState({ id: 1, name: "Open Voting" });

    const router = useRouter();

    const handleDeploy = async () => {
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
                }),
            });
            if (!res.ok) throw new Error(`Create failed: ${res.status}`);
            const json = await res.json();
            console.log("Hackathon created:", json);
            const id = json?.id;
            if (id) {
                router.push(`/hackathons/${id}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to deploy hackathon");
        }
    };

    return (
        <Layout title="Host New Hackathon" newProduct onDeploy={handleDeploy}>
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
                    />
                </div>
                <div className="w-[33.75rem] max-4xl:w-[27.5rem] max-2xl:w-[23rem] max-lg:w-full max-lg:mt-3">
                    {/*<CoverImage />*/}
                    {/*<UploadProductFiles />*/}
                    <Highlights totalPrize={totalPrize} setTotalPrize={setTotalPrize} onTiersChange={setPrizeTiers} />
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
                    />
                    <CTA />
                    <Demos />
                </div>
            </div>
        </Layout>
    );
};

export default NewHackathonPage;
