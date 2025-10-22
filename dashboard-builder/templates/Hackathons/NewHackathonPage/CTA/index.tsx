import { useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import { depositStrategies } from "@/constants/depositStrategies";

const ctaButtons = [
    { id: 1, name: "Join Hackathon" },
    { id: 2, name: "Register Now" },
    { id: 3, name: "Apply to Participate" },
    { id: 4, name: "Sign Up for Hackathon" },
];

const Cta = () => {
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
                </div>
            </div>
        </Card>
    );
};

export default Cta;
