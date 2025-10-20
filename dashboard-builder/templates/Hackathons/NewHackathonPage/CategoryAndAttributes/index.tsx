import { useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import Switch from "@/components/Switch";
import Compatibility from "@/components/Compatibility";
import JudgingIncentives from "@/components/JudgingIncentives";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import { SelectOption } from "@/types/select";

const judgingModels = [
    { id: 1, name: "Open Voting" },
    { id: 2, name: "Commit Reveal" },
    { id: 3, name: "ZK-Voting (MACI)" },
];

const judges = [
    {
        id: 1,
        name: "Vitalik Buterin",
        avatar: "/images/vitalik.jpg",
        role: "Researcher",
        company: "EF",
        wallet: "0x123...321",
    },
    {
        id: 2,
        name: "Sandeep Nailwal",
        avatar: "/images/sandeep.webp",
        role: "Co-Founder",
        company: "Polygon",
        wallet: "0x456...654",
    },
    {
        id: 3,
        name: "Sergey Nazarov",
        avatar: "/images/nazarov.jpg",
        role: "Founder",
        company: "Chainlink",
        wallet: "0x789...987",
    },
    {
        id: 4,
        name: "Hayden Adams",
        avatar: "/images/hayden.jpg",
        role: "Founder",
        company: "Uniswap",
        wallet: "0xabc...cba",
    },
    {
        id: 5,
        name: "Kartik Talwar",
        avatar: "/images/kartik.jpg",
        role: "Founder",
        company: "ETHGlobal",
        wallet: "0xdef...fed",
    },
    {
        id: 6,
        name: "Vitalik Marincenko",
        avatar: "/images/vitalik-marincenko.jpg",
        role: "Developer",
        company: "Bitcoin.com",
        wallet: "0x012...210",
    },
];

type CategoryAndAttributesProps = {
    judgingModel: any;
    setJudgingModel: (value: any) => void;
    selectedJudges: number[];
    setSelectedJudges: (judges: number[]) => void;
    allowAIAgentDelegations: boolean;
    setAllowAIAgentDelegations: (value: boolean) => void;
};

const CategoryAndAttributes = ({
    judgingModel,
    setJudgingModel,
    selectedJudges,
    setSelectedJudges,
    allowAIAgentDelegations,
    setAllowAIAgentDelegations,
}: CategoryAndAttributesProps) => {

    const toggleJudge = (judgeId: number) => {
        if (selectedJudges.includes(judgeId)) {
            setSelectedJudges(selectedJudges.filter(id => id !== judgeId));
        } else {
            setSelectedJudges([...selectedJudges, judgeId]);
        }
    };

    return (
        <Card title="Invite Judges">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Select
                    label="Voting Model"
                    tooltip="Choose the voting mechanism for judging"
                    placeholder="Select voting model"
                    value={judgingModel}
                    onChange={setJudgingModel}
                    options={judgingModels}
                />

                <div>
                    <div className="mb-4 text-button">Invite Judges</div>
                    <div className="grid grid-cols-2 gap-4">
                        {judges.map((judge) => (
                            <div
                                key={judge.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    selectedJudges.includes(judge.id)
                                        ? 'border-primary-01 bg-primary-01/10'
                                        : 'border-s-stroke2 hover:border-s-stroke1'
                                }`}
                                onClick={() => toggleJudge(judge.id)}
                            >
                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                    <Image
                                        className="w-full h-full object-cover object-center opacity-100"
                                        src={judge.avatar}
                                        fill
                                        alt={judge.name}
                                        sizes="32px"
                                    />
                                </div>
                                <div className="grow">
                                    <div className="text-button">{judge.name}</div>
                                    <div className="text-caption text-t-secondary">
                                        {judge.role} at {judge.company} ({judge.wallet})
                                    </div>
                                </div>
                                {selectedJudges.includes(judge.id) && (
                                    <Icon name="check" className="w-4 h-4 fill-primary-01" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <JudgingIncentives />

                <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-2xl">
                    <div>
                        <div className="text-body-2 font-medium">Allow AI Agent Delegations</div>
                        <div className="text-caption text-t-secondary">
                            Enable AI agents to assist or delegate judging tasks
                        </div>
                    </div>
                    <Switch
                        checked={allowAIAgentDelegations}
                        onChange={() => setAllowAIAgentDelegations(!allowAIAgentDelegations)}
                    />
                </div>
            </div>
        </Card>
    );
};

export default CategoryAndAttributes;
