import Card from "@/components/Card";
import Image from "@/components/Image";

const defaultSponsors = [
    {
        id: 1,
        name: "Ethereum Foundation",
        logo: "/images/ethereum.svg",
        tier: "$25,000",
    },
    {
        id: 2,
        name: "Polygon",
        logo: "/images/polygon.svg",
        tier: "$10,000",
    },
    {
        id: 3,
        name: "Chainlink",
        logo: "/images/chainlink.svg",
        tier: "$1,000",
    },
    {
        id: 4,
        name: "Uniswap",
        logo: "/images/uniswap.svg",
        tier: "$25,000",
    },
];

type SponsorsProps = { 
    sponsors?: { id: number; name: string; logo: string; tier: string }[];
    hackathon?: any;
};

const Sponsors = ({ sponsors, hackathon }: SponsorsProps) => {
    const list = sponsors && sponsors.length > 0 ? sponsors : defaultSponsors;
    return (
        <Card title="Sponsors">
            <div className="p-5 max-lg:p-3 flex flex-col h-full">
                <div className="grow">
                <div className="space-y-4">
                    {list.map((sponsor) => (
                        <div
                            key={sponsor.id}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1"
                        >
                            <div className="relative shrink-0 w-10 h-10">
                                <Image
                                    className="rounded-lg opacity-100"
                                    src={sponsor.logo}
                                    width={40}
                                    height={40}
                                    alt={sponsor.name}
                                />
                            </div>
                            <div className="grow">
                                <div className="text-body-2 font-medium">
                                    {sponsor.name}
                                </div>
                                <div className="text-caption text-t-secondary">
                                    {sponsor.tier}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-s-stroke2 text-center">
                    {hackathon?.allowSponsors && hackathon?.sponsorMinContribution ? (
                        <div className="text-caption text-t-secondary">
                            Minimum contribution: ${hackathon.sponsorMinContribution} {hackathon.sponsorCurrency}
                        </div>
                    ) : (
                        <div className="text-caption text-t-secondary">
                            Want to become a sponsor?
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Sponsors;
