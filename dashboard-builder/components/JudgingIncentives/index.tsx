import { useState } from "react";
import Tooltip from "@/components/Tooltip";
import Field from "@/components/Field";

type JudgingIncentivesProps = {
    className?: string;
};

const incentiveOptions = [
    { id: 1, value: "0.1%", label: "0.1%" },
    { id: 2, value: "0.2%", label: "0.2%" },
    { id: 3, value: "0.3%", label: "0.3%" },
    { id: 4, value: "0.5%", label: "0.5%" },
    { id: 5, value: "0.8%", label: "0.8%" },
    { id: 6, value: "custom", label: "Custom" },
];

const JudgingIncentives = ({ className }: JudgingIncentivesProps) => {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [customValue, setCustomValue] = useState("");

    const handleClick = (id: number, value: string) => {
        setActiveId(id);
        if (value === "custom") {
            setCustomValue("");
        }
    };

    return (
        <div className={className || ""}>
            <div className="flex items-center mb-4">
                <div className="text-button">Judging Incentives</div>
                <Tooltip
                    className="ml-1.5"
                    content="Judges will be rewarded with a portion of the prize pool"
                />
            </div>
            <div className="flex flex-wrap -mt-3 -mx-1.5">
                {incentiveOptions.map((item) => (
                    <div
                        className={`flex items-center h-12 mt-3 mx-1.5 gap-2 border border-s-stroke2 rounded-full px-2.5 text-button transition-colors cursor-pointer hover:border-s-highlight ${
                            activeId === item.id ? "!border-s-focus" : ""
                        }`}
                        onClick={() => handleClick(item.id, item.value)}
                        key={item.id}
                    >
                        <div className="truncate">{item.label}</div>
                    </div>
                ))}
            </div>
            {activeId === 6 && (
                <div className="mt-4">
                    <Field
                        label="Custom Percentage"
                        placeholder="Enter custom percentage (e.g., 1.5%)"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export default JudgingIncentives;
