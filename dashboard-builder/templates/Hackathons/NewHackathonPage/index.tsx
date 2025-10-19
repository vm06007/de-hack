"use client";

import { useState } from "react";
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

    return (
        <Layout title="Host New Hackathon" newProduct>
            <div className="flex max-lg:block">
                <div className="w-[calc(100%-33.75rem)] pr-3 max-4xl:w-[calc(100%-27.5rem)] max-2xl:w-[calc(100%-23rem)] max-lg:w-full max-lg:pr-0">
                    <HackathonDetails />
                    <HackathonTiming />
                    <Images />
                    <CategoryAndAttributes />
                </div>
                <div className="w-[33.75rem] max-4xl:w-[27.5rem] max-2xl:w-[23rem] max-lg:w-full max-lg:mt-3">
                    {/*<CoverImage />*/}
                    {/*<UploadProductFiles />*/}
                    <Highlights
                        totalPrize={totalPrize}
                        setTotalPrize={setTotalPrize}
                    />
                    <Price />
                    <CTA />
                    <Demos />
                </div>
            </div>
        </Layout>
    );
};

export default NewHackathonPage;
