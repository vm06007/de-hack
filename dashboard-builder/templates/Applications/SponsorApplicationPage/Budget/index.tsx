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
                    {/* Minimum Budget Requirements */}
                    <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-xl border border-s-stroke2">
                        <div className="flex items-center">
                            <div className="flex justify-center items-center w-8 h-8 mr-3 rounded-full bg-b-surface2">
                                <Icon className="fill-t-primary" name="info" />
                            </div>
                            <div>
                                <div className="text-sub-title-1 text-t-primary">Minimum Contribution</div>
                                <div className="text-caption text-t-secondary">To participate as sponsor</div>
                            </div>
                        </div>
                        <div className="text-h5 font-medium text-t-primary">$500</div>
                    </div>

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
