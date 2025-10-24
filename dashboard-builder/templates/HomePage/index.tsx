"use client";

import Layout from "@/components/Layout";
import PopularHackathons from "@/components/PopularHackathons";
import Overview from "./Overview";
import SubmittedProjects from "./SubmittedProjects";
import GetMoreHackers from "./GetMoreHackers";
// import Comments from "./Comments";

import { useHackathons } from "@/src/hooks/useApiData";

const HomePage = () => {
    const { data: hackathons, loading } = useHackathons();

    // Transform all hackathons
    const allTransformedHackathons = (Array.isArray(hackathons) ? hackathons : [])
        .sort((a, b) => b.id - a.id) // Sort by ID descending (highest ID first)
        .map((hackathon) => ({
            id: hackathon.id,
            title: hackathon.title,
            image: hackathon.logoUrl || hackathon.image || "/images/hackathons/default.png",
            prize: parseFloat(hackathon.totalPrizePool) || 0,
            status: hackathon.status
        }));

    // Take only the first 8 (newest) hackathons
    const transformedHackathons = allTransformedHackathons.slice(0, 8);

    return (
        <Layout title="Judging Statistics">
            <div className="flex max-lg:block">
                <div className="col-left">
                    <Overview />
                    <SubmittedProjects />
                    <GetMoreHackers />
                </div>
                    <div className="col-right">
                        <PopularHackathons
                            title="Upcoming hackathons"
                            items={loading ? [] : transformedHackathons}
                            allItems={loading ? [] : allTransformedHackathons}
                        />
                    </div>
            </div>
        </Layout>
    );
};

export default HomePage;
