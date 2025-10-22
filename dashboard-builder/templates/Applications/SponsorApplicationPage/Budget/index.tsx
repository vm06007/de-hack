import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Icon from "@/components/Icon";

const Budget = () => {
    const [budget, setBudget] = useState("");

    return (
        <Card title="Sponsorship Budget">
            <div className="p-5 max-lg:p-3">
                <div className="flex flex-col gap-6">
                    {/* Budget Input */}
                    <Field
                        classInput="pl-12.5"
                        label="Your Sponsorship Budget (USD)"
                        placeholder="Enter your sponsorship budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    >
                        <div className="absolute top-1/2 -translate-y-1/2 left-1 w-10 h-10 flex items-center justify-center bg-secondary-04 rounded-full pointer-events-none">
                            <Icon
                                className="fill-black"
                                name="usd-circle"
                            />
                        </div>
                    </Field>
                </div>
            </div>
        </Card>
    );
};

export default Budget;
