import { useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";

const ctaButtons = [
    { id: 1, name: "Join Hackathon" },
    { id: 2, name: "Register Now" },
    { id: 3, name: "Apply to Participate" },
    { id: 4, name: "Sign Up for Hackathon" },
];

const Cta = () => {
    const [ctaButton, setCtaButton] = useState(ctaButtons[0]);

    return (
        <Card classHead="!pl-3" title="Require Stake">
            <div className="p-3">
                <Select
                    value={ctaButton}
                    onChange={setCtaButton}
                    options={ctaButtons}
                />
            </div>
        </Card>
    );
};

export default Cta;
