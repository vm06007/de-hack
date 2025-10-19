"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Image from "@/components/Image";
import Tabs from "@/components/Tabs";
import Select from "@/components/Select";
import ShopItem from "@/components/ShopItem";
// import Spinner from "@/components/Spinner";
import Profile from "./Profile";

import { useHackathons } from "@/src/hooks/useHackathons";

const types = [
    { id: 1, name: "Online Hackathons" },
    { id: 2, name: "In Person Hackathons" },
];

const sortOptions = [
    { id: 1, name: "Most recent" },
    { id: 2, name: "Oldest" },
    { id: 3, name: "Most popular" },
];

const OrgPage = () => {
    const [type, setType] = useState(types[0]);
    const [sort, setSort] = useState(sortOptions[0]);

    // Get hackathons data
    const { data: hackathons, loading, error } = useHackathons();

    return (
        <Layout hideSidebar>
            <div className="">
                <Image
                    className="w-full object-cover rounded-4xl max-md:min-h-35 max-md:rounded-2xl"
                    src="/images/shop-banner.png"
                    width={1880}
                    height={510}
                    alt="shop-banner"
                    priority={true}
                />
            </div>
            <div className="relative z-2 max-w-340 -mt-10 mx-auto max-[1519px]:max-w-290 max-md:px-1">
                <Profile />
                <div className="flex mt-17 max-md:block max-lg:mt-11 max-md:mt-5">
                    <Tabs
                        className="mr-auto max-md:w-full"
                        classButton="px-7.5 max-md:grow max-md:px-3"
                        items={types}
                        value={type}
                        setValue={setType}
                    />
                    <Select
                        className="min-w-45 max-md:hidden"
                        classButton="border-transparent bg-b-surface2"
                        value={sort}
                        onChange={setSort}
                        options={sortOptions}
                    />
                </div>
                {type.id === 1 && (
                    <>
                        <div className="flex flex-wrap mt-4 -mx-3 max-md:flex-col max-md:gap-3 max-md:m-0 max-md:mt-5">
                            {loading ? (
                                <div className="w-full text-center py-8">Loading online hackathons...</div>
                            ) : error ? (
                                <div className="w-full text-center py-8">Error loading hackathons: {error}</div>
                            ) : (
                                (Array.isArray(hackathons) ? hackathons.filter(h => h.type === 'online') : []).map((hackathon) => (
                                    <ShopItem
                                        className="w-[calc(33.333%-1.5rem)] mt-6 mx-3 max-lg:w-[calc(50%-1.5rem)] max-md:w-full max-md:m-0"
                                        value={hackathon}
                                        key={hackathon.id}
                                    />
                                ))
                            )}
                        </div>
                        {/*<Spinner className="mt-10 mb-12 max-lg:my-7 max-md:mt-5 max-md:mb-0" />*/}
                    </>
                )}
                {type.id === 2 && (
                    <>
                        <div className="flex flex-wrap mt-4 -mx-3 max-md:flex-col max-md:gap-3 max-md:m-0 max-md:mt-5">
                            {loading ? (
                                <div className="w-full text-center py-8">Loading in-person hackathons...</div>
                            ) : error ? (
                                <div className="w-full text-center py-8">Error loading hackathons: {error}</div>
                            ) : (
                                (Array.isArray(hackathons) ? hackathons.filter(h => h.type === 'in-person') : []).map((hackathon) => (
                                    <ShopItem
                                        className="w-[calc(33.333%-1.5rem)] mt-6 mx-3 max-lg:w-[calc(50%-1.5rem)] max-md:w-full max-md:m-0"
                                        value={hackathon}
                                        key={hackathon.id}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default OrgPage;
