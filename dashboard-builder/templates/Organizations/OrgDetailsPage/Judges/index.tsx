import Card from "@/components/Card";
import Image from "@/components/Image";
import PlusIcon from "@/components/PlusIcon";

const judges = [
    {
        id: 1,
        name: "Vitalik Buterin",
        avatar: "/images/vitalik.jpg",
        role: "Researcher",
        company: "EF",
        wallet: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    },
    {
        id: 2,
        name: "Sandeep Nailwal",
        avatar: "/images/sandeep.webp",
        role: "Co-Founder",
        company: "Polygon",
        wallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    },
    {
        id: 3,
        name: "Sergey Nazarov",
        avatar: "/images/nazarov.jpg",
        role: "Founder",
        company: "Chainlink",
        wallet: "0x53C61cfb8128ad59244E8c1D26109252ACe23d14",
    },
    {
        id: 4,
        name: "Hayden Adams",
        avatar: "/images/hayden.jpg",
        role: "Founder",
        company: "Uniswap",
        wallet: "0x50EC05ADe8280758E2077fcBC08D878D4aef79C3",
    },
    {
        id: 5,
        name: "Kartik Talwar",
        avatar: "/images/kartik.jpg",
        role: "Founder",
        company: "ETHGlobal",
        wallet: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    },
    {
        id: 6,
        name: "Vitalik Marincenko",
        avatar: "/images/vitalik-m.jpg",
        role: "Lead",
        company: "Bitcoin.com",
        wallet: "0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689",
    },
];

type JudgesProps = {
    hackathon?: any;
};

const Judges = ({ hackathon }: JudgesProps) => {
    const handleJudgeClick = (wallet: string) => {
        window.open(`https://etherscan.io/address/${wallet}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card
            title="Judges"
            headContent={<PlusIcon onClick={() => console.log('Judges plus clicked')} />}
        >
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
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1 cursor-pointer hover:bg-black transition-colors"
                                    onClick={() => handleJudgeClick(judge.wallet)}
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
                                className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1 cursor-pointer hover:bg-black transition-colors"
                                onClick={() => handleJudgeClick(judge.wallet)}
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
                        Selected from global judge's council.
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Judges;
