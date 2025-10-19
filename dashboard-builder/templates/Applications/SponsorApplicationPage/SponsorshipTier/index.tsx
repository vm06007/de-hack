import { useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import Field from "@/components/Field";
import { SelectOption } from "@/types/select";

const sponsorshipTiers: SelectOption[] = [
    { id: 1, name: "Bronze - $1,000 - Logo placement, social media mentions" },
    { id: 2, name: "Silver - $5,000 - Logo placement, booth space, judge participation" },
    { id: 3, name: "Gold - $10,000 - Premium logo placement, keynote opportunity, judge participation" },
    { id: 4, name: "Platinum - $25,000 - Title sponsor, keynote opportunity, judge participation, custom branding" },
];

const SponsorshipTier = () => {
    const [tier, setTier] = useState<SelectOption | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [additionalBenefits, setAdditionalBenefits] = useState("");

    return (
        <Card title="Sponsorship Tier & Benefits">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Select
                    label="Sponsorship Tier"
                    placeholder="Select sponsorship tier"
                    value={tier}
                    onChange={setTier}
                    options={sponsorshipTiers}
                />
                <Field
                    label="Custom Amount (if applicable)"
                    placeholder="Enter custom sponsorship amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                />
                <Field
                    label="Additional Benefits Requested"
                    placeholder="Describe any additional benefits or requirements you'd like to discuss..."
                    value={additionalBenefits}
                    onChange={(e) => setAdditionalBenefits(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default SponsorshipTier;
