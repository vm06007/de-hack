"use client";

import Layout from "@/components/Layout";
import PopularHackathons from "@/components/PopularHackathons";
import RefundRequests from "@/components/RefundRequests";
import Overview from "./Overview";
import ProductView from "./ProductView";
import OverviewSlider from "./OverviewSlider";
import GetMoreCustomers from "./GetMoreCustomers";
import Comments from "./Comments";

import { popularHackathons } from "@/mocks/products";

const HomePage = () => {
    return (
        <Layout title="Dashboard">
            <div className="flex max-lg:block">
                <div className="col-left">
                    <Overview />
                    <ProductView />
                    <OverviewSlider />
                    <GetMoreCustomers />
                </div>
                <div className="col-right">
                    <PopularHackathons
                        title="Upcoming hackathons"
                        items={popularHackathons}
                    />
                    <RefundRequests />
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
