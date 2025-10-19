import Card from "@/components/Card";
import Image from "@/components/Image";

const sponsors = [
    {
        id: 1,
        name: "Ethereum Foundation",
        logo: "/images/ethereum.svg",
        tier: "Platinum",
    },
    {
        id: 2,
        name: "Polygon",
        logo: "/images/polygon.svg",
        tier: "Gold",
    },
    {
        id: 3,
        name: "Chainlink",
        logo: "/images/chainlink.svg",
        tier: "Silver",
    },
    {
        id: 4,
        name: "Uniswap",
        logo: "/images/uniswap.svg",
        tier: "Bronze",
    },
];

const Sponsors = () => {
    return (
        <Card title="Sponsors">
            <div className="p-5 max-lg:p-3">
                <div className="space-y-4">
                    {sponsors.map((sponsor) => (
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
                                    {sponsor.tier} Sponsor
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-s-stroke2 text-center">
                    <div className="text-caption text-t-secondary">
                        Want to become a sponsor?
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Sponsors;
