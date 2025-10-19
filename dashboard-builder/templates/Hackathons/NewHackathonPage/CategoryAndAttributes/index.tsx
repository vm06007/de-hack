import { useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import Switch from "@/components/Switch";
import Compatibility from "@/components/Compatibility";
import JudgingIncentives from "@/components/JudgingIncentives";
import { SelectOption } from "@/types/select";

const categories: SelectOption[] = [
    { id: 1, name: "DeFi" },
    { id: 2, name: "NFTs" },
    { id: 3, name: "Web3" },
];

const CategoryAndAttributes = () => {
    const [category, setCategory] = useState<SelectOption | null>(null);
    const [allowAIAgentDelegations, setAllowAIAgentDelegations] = useState(false);

    return (
        <Card title="Invite Judges">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Select
                    label="Voting Model"
                    tooltip="Select the main category for your hackathon"
                    placeholder="Select category"
                    value={category}
                    onChange={setCategory}
                    options={categories}
                />
                <Compatibility classItemName="w-[calc(25%-0.75rem)] max-2xl:w-[calc(33.333%-0.75rem)] max-md:w-[calc(50%-0.75rem)]" />
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
