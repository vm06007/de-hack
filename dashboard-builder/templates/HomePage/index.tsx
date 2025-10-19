"use client";

import Layout from "@/components/Layout";
import PopularHackathons from "@/components/PopularHackathons";
import Overview from "./Overview";
// import ProductView from "./ProductView";
import TransactionsOverview from "./TransactionsOverview";
import GetMoreHackers from "./GetMoreHackers";
// import Comments from "./Comments";

import { useHackathons } from "@/src/hooks/useApiData";

const HomePage = () => {
    const { data: hackathons, loading } = useHackathons();

    return (
        <Layout title="Dashboard">
            <div className="flex max-lg:block">
                <div className="col-left">
                    <Overview />
                    {/*<ProductView />*/}
                    <TransactionsOverview />
                    <GetMoreHackers />
                </div>
                <div className="col-right">
                    <PopularHackathons
                        title="Upcoming hackathons"
                        items={loading ? [] : hackathons}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
