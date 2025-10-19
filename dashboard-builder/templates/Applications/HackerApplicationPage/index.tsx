"use client";

import Layout from "@/components/Layout";
import ProductDetails from "./ProductDetails";
import PersonalInfo from "./PersonalInfo";
import SkillsAndExperience from "./SkillsAndExperience";
import CoverImage from "./CoverImage";
import UploadFiles from "./UploadFiles";
import Portfolio from "./Portfolio";
import Highlights from "./Highlights";
import CTA from "./CTA";
import Demos from "./Demos";

const HackerApplicationPage = () => {
    return (
        <Layout title="Apply as Hacker" newProduct>
            <div className="flex max-lg:block">
                <div className="w-[calc(100%-33.75rem)] pr-3 max-4xl:w-[calc(100%-27.5rem)] max-2xl:w-[calc(100%-23rem)] max-lg:w-full max-lg:pr-0">
                    <ProductDetails />
                    <PersonalInfo />
                    <SkillsAndExperience />
                </div>
                <div className="w-[33.75rem] max-4xl:w-[27.5rem] max-2xl:w-[23rem] max-lg:w-full max-lg:mt-3">
                    {/*<CoverImage />*/}
                    <UploadFiles />
                    <Portfolio />
                    <Highlights />
                    <CTA />
                    {/*<Demos />*/}
                </div>
            </div>
        </Layout>
    );
};

export default HackerApplicationPage;
