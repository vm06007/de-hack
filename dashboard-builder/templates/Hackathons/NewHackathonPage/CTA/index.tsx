import { useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import { depositStrategies } from "@/constants/depositStrategies";
import CompactUnifiedBalance from "@/components/nexus/CompactUnifiedBalance";

type CtaProps = {
    ethAmount?: number;
    totalPrize?: string;
    judgingIncentivePercentage?: number;
};

const ctaButtons = [
    { id: 1, name: "Join Hackathon" },
    { id: 2, name: "Register Now" },
    { id: 3, name: "Apply to Participate" },
    { id: 4, name: "Sign Up for Hackathon" },
];

const Cta = ({ ethAmount = 0, totalPrize = "", judgingIncentivePercentage = 0 }: CtaProps) => {
    const [ctaButton, setCtaButton] = useState(ctaButtons[0]);
    const [depositStrategy, setDepositStrategy] = useState(depositStrategies[0]);

    return (
        <Card classHead="!pl-3" title="DeFi Settings">
            <div className="p-3">
                <div className="flex flex-col gap-4">
                    <Select
                        label="Deposit Strategy"
                        tooltip="Funds will be deposited to protocol before distribution to earn additional yield while waiting in contract"
                        placeholder="Select deposit strategy"
                        value={depositStrategy}
                        onChange={setDepositStrategy}
                        options={depositStrategies}
                    />

                    {/* ETH Amount Display */}
                    <div className="p-4 bg-b-surface1 rounded-2xl">
                        <div className="text-body-2 font-medium mb-2">Total ETH Required</div>
                        <div className="text-body-1 font-bold text-primary-01">
                            {ethAmount.toFixed(6)} ETH
                        </div>
                        {judgingIncentivePercentage > 0 && (
                            <div className="text-caption text-t-secondary mt-1">
                                Includes {judgingIncentivePercentage}% judging incentives
                            </div>
                        )}
                    </div>

                    {/* Unified Balance Widget */}
                    <CompactUnifiedBalance requiredEthAmount={ethAmount} />
                </div>
            </div>
        </Card>
    );
};

export default Cta;
