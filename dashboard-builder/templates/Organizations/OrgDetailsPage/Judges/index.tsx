import Card from "@/components/Card";
import Image from "@/components/Image";

const judges = [
    {
        id: 1,
        name: "Vitalik Buterin!",
        avatar: "/images/vitalik.jpg",
        role: "Researcher",
        company: "EF",
    },
    {
        id: 2,
        name: "Sandeep Nailwal",
        avatar: "/images/sandeep.webp",
        role: "Co-Founder",
        company: "Polygon",
    },
    {
        id: 3,
        name: "Sergey Nazarov",
        avatar: "/images/sergey.jpg",
        role: "Co-Founder",
        company: "Chainlink",
    },
    {
        id: 4,
        name: "Hayden Adams",
        avatar: "/images/hayden.jpg",
        role: "Founder",
        company: "Uniswap",
    },
];

const Judges = () => {
    return (
        <Card title="Judges">
            <div className="p-5 max-lg:p-3">
                <div className="space-y-4">
                    {judges.map((judge) => (
                        <div
                            key={judge.id}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1"
                        >
                            <div className="relative shrink-0 w-10 h-10">
                                <Image
                                    className="rounded-full opacity-100"
                                    src={judge.avatar}
                                    width={40}
                                    height={40}
                                    alt={judge.name}
                                />
                            </div>
                            <div className="grow">
                                <div className="text-body-2 font-medium">
                                    {judge.name}
                                </div>
                                <div className="text-caption text-t-secondary">
                                    {judge.role} at {judge.company}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-s-stroke2 text-center">
                    <div className="text-caption text-t-secondary">
                        Expert judges from leading Web3 companies
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Judges;
