import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Link from "next/link";

const highlights = [
    {
        id: 1,
        title: "Global Online Hackathon",
        icon: "globe",
    },
    {
        id: 2,
        title: "30-day development period",
        icon: "calendar",
    },
    {
        id: 3,
        title: "$500K+ total prize pool",
        icon: "trophy",
    },
    {
        id: 4,
        title: "Sponsor minimum",
        icon: "info",
    },
    {
        id: 5,
        title: "Stake requirement",
        icon: "wallet",
    },
];

const Highlights = () => {
    return (
        <Card title="Highlights">
            <div className="p-5 max-lg:p-3">
                <div className="flex flex-col gap-4">
                    {highlights.map((highlight) => (
                        <div
                            key={highlight.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-b-surface1 border border-s-stroke2"
                        >
                            <div className="flex justify-center items-center w-6 h-6 rounded-full bg-b-surface2">
                                <Icon
                                    className="fill-t-primary"
                                    name={highlight.icon}
                                />
                            </div>
                            <div className="text-sub-title-1 text-t-primary">
                                {highlight.title}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Application Buttons */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-s-stroke2">
                    <Link href="/applications/hacker" className="flex-1">
                        <Button className="w-full" isBlack>
                            Apply as Hacker
                        </Button>
                    </Link>
                    <Link href="/applications/sponsor" className="flex-1">
                        <Button className="w-full" isStroke>
                            Apply as Sponsor
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default Highlights;
