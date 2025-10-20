"use client";

import Layout from "@/components/Layout";
import Image from "@/components/Image";
import Gallery from "./Gallery";
import Description from "./Description";
import Comments from "./Comments";
import Populars from "./Populars";
import PrizePool from "./PrizePool";
import Sponsors from "./Sponsors";
import Judges from "./Judges";
import HackathonStats from "./HackathonStats";

type OrgDetailsPageProps = { hackathon?: any };

const OrgDetailsPage = ({ hackathon }: OrgDetailsPageProps) => {
    const title = hackathon?.title || "ETHGlobal Online 2026";
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Debug: log the dates to see what we're getting
    console.log('Hackathon dates:', { startDate: hackathon?.startDate, endDate: hackathon?.endDate });

    const subheader = hackathon?.startDate && hackathon?.endDate
        ? `${formatDate(hackathon.startDate)} - ${formatDate(hackathon.endDate)}`
        : "October 1st - November 1st, 2026";
    const logo = hackathon?.logoUrl || "/images/html.svg";
    const coverImage = hackathon?.image;
    const prizePool = hackathon?.totalPrizePool ? Number(hackathon.totalPrizePool) : 500000;
    const sponsors = hackathon?.sponsors || undefined;
    return (
        <Layout hideSidebar>
            <div className="flex flex-col gap-22 max-w-310 mx-auto py-10 max-[1519px]:max-w-290 max-xl:gap-16 max-lg:py-6 max-md:py-3 max-md:gap-8 max-md:px-1">
                <div>
                    <div className="flex max-md:block">
                        <div className="grow">
                            <div className="-mt-1.5 text-h3 max-lg:mt-0 max-lg:text-h4 max-md:text-h5">{title}</div>
                            <div className="flex items-center gap-3 mt-2.5">
                                <div className="">
                                    <Image
                                        className="w-full h-full object-contain opacity-100"
                                        src={logo}
                                        width={40}
                                        height={40}
                                        alt="logo"
                                    />
                                </div>
                                <div className="truncate text-h6 text-t-secondary max-lg:text-sub-title-1">{subheader}</div>
                            </div>
                        </div>
                    </div>
                    <Gallery coverUrl={coverImage} />
                </div>
                <Description description={hackathon?.description} title={hackathon?.title} hackathon={hackathon} />
                <div className="grid grid-cols-4 gap-6 max-2xl:grid-cols-2 max-lg:grid-cols-1">
                    <PrizePool totalPrize={prizePool} />
                    <Sponsors sponsors={sponsors} hackathon={hackathon} />
                    <Judges hackathon={hackathon} />
                    <HackathonStats />
                </div>
                {/* <Comments /> */}
                <Populars />
            </div>
        </Layout>
    );
};

export default OrgDetailsPage;
