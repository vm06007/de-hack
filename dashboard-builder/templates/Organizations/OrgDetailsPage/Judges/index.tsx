import Card from "@/components/Card";
import Image from "@/components/Image";

const judges = [
    {
        id: 1,
        name: "Vitalik Buterin",
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
        avatar: "/images/nazarov.jpg",
        role: "Founder",
        company: "Chainlink",
    },
    {
        id: 4,
        name: "Hayden Adams",
        avatar: "/images/hayden.jpg",
        role: "Founder",
        company: "Uniswap",
    },
    {
        id: 5,
        name: "Kartik Talwar",
        avatar: "/images/kartik.jpg",
        role: "Founder",
        company: "ETHGlobal",
    },
    {
        id: 6,
        name: "Vitalik Marincenko",
        avatar: "/images/vitalik-m.jpg",
        role: "Lead",
        company: "Bitcoin.com",
    },
];

type JudgesProps = {
    hackathon?: any;
};

const Judges = ({ hackathon }: JudgesProps) => {
    return (
        <Card title="Judges">
            <div className="p-5 max-lg:p-3 flex flex-col h-full">
                <div className="grow">
                <div className="space-y-4">
                    {hackathon?.selectedJudges && hackathon.selectedJudges.length > 0 ? (
                        hackathon.selectedJudges.map((judgeId: number) => {
                            const judge = judges.find(j => j.id === judgeId);
                            if (!judge) return null;
                            return (
                                <div
                                    key={judge.id}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1"
                                >
                                    <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden">
                                        <Image
                                            className="w-full h-full object-cover object-center opacity-100"
                                            src={judge.avatar}
                                            fill
                                            alt={judge.name}
                                            sizes="40px"
                                        />
                                    </div>
                                    <div className="grow">
                                        <div className="text-body-2 font-medium">
                                            {judge.name}
                                        </div>
                                        <div className="text-caption text-t-secondary">
                                            {judge.role} at {judge.company}
                                        </div>
                                        {hackathon?.judgeIncentive && (
                                            <div className="text-caption text-t-primary">
                                                {hackathon.judgeIncentive}% incentive
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        judges.map((judge) => (
                            <div
                                key={judge.id}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1"
                            >
                                <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                        className="w-full h-full object-cover object-center opacity-100"
                                        src={judge.avatar}
                                        fill
                                        alt={judge.name}
                                        sizes="40px"
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
                        ))
                    )}
                </div>
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
