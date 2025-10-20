import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Select from "@/components/Select";

type PrizeDistribution = {
    id: number;
    name: string;
    amount: string;
    percentage: number;
};

const distributionTypes = [
    { id: 1, name: "Equally" },
    { id: 2, name: "Ladder" },
    { id: 3, name: "Custom" },
];

const currencies = [
    { id: 1, name: "ETH" },
    { id: 2, name: "USDC" },
    { id: 3, name: "USDT" },
    { id: 4, name: "DAI" },
    { id: 5, name: "WETH" },
    { id: 6, name: "MATIC" },
    { id: 7, name: "AVAX" },
    { id: 8, name: "BNB" },
];

type HighlightsProps = {
    totalPrize: string;
    setTotalPrize: (value: string) => void;
};

const Highlights = ({ totalPrize, setTotalPrize }: HighlightsProps) => {
    const [distributions, setDistributions] = useState<PrizeDistribution[]>([
        { id: 1, name: "1st Place", amount: "", percentage: 50 },
        { id: 2, name: "2nd Place", amount: "", percentage: 30 },
        { id: 3, name: "3rd Place", amount: "", percentage: 20 },
    ]);
    const [distributionType, setDistributionType] = useState(distributionTypes[0]);
    const [prizeCurrency, setPrizeCurrency] = useState(currencies[1]); // Default to USDC

    const addDistribution = () => {
        const newId = Math.max(...distributions.map(d => d.id)) + 1;
        const newDistribution: PrizeDistribution = {
            id: newId,
            name: `${distributions.length + 1}${getOrdinalSuffix(distributions.length + 1)} Place`,
            amount: "",
            percentage: 0
        };
        setDistributions([...distributions, newDistribution]);
    };

    const removeDistribution = (id: number) => {
        if (distributions.length > 1) {
            const newDistributions = distributions.filter(d => d.id !== id);
            // Update titles to be sequential (1st, 2nd, 3rd, etc.)
            const updatedDistributions = newDistributions.map((d, index) => ({
                ...d,
                name: `${index + 1}${getOrdinalSuffix(index + 1)} Place`
            }));
            setDistributions(updatedDistributions);
        }
    };

    const updateDistribution = (id: number, field: keyof PrizeDistribution, value: string | number) => {
        setDistributions(distributions.map(d => {
            if (d.id === id) {
                const updated = { ...d, [field]: value };

                // If percentage is being updated, calculate the new amount
                if (field === 'percentage') {
                    const total = parseFloat(totalPrize) || 0;
                    const newAmount = (total * (value as number)) / 100;
                    updated.amount = newAmount.toFixed(2);
                }

                // If amount is being updated, calculate the new percentage
                if (field === 'amount') {
                    const total = parseFloat(totalPrize) || 0;
                    const newPercentage = total > 0 ? ((parseFloat(value as string) || 0) / total) * 100 : 0;
                    updated.percentage = newPercentage;
                }

                return updated;
            }
            return d;
        }));
    };

    const getOrdinalSuffix = (num: number) => {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    };

    const calculateAmounts = () => {
        const total = parseFloat(totalPrize) || 0;
        const type = distributionType.name.toLowerCase();

        if (type === "equally") {
            const equalAmount = total / distributions.length;
            setDistributions(distributions.map((d, index) => ({
                ...d,
                name: `${index + 1}${getOrdinalSuffix(index + 1)} Place`,
                amount: equalAmount.toFixed(2),
                percentage: (100 / distributions.length)
            })));
        } else if (type === "ladder") {
            // Ladder distribution: 50%, 30%, 20% for first 3, then 0% for additional places
            const percentages = [50, 30, 20];
            const remaining = distributions.length - 3;
            if (remaining > 0) {
                for (let i = 0; i < remaining; i++) {
                    percentages.push(0);
                }
            }

            setDistributions(distributions.map((d, index) => ({
                ...d,
                name: `${index + 1}${getOrdinalSuffix(index + 1)} Place`,
                percentage: percentages[index] || 0,
                amount: ((total * (percentages[index] || 0)) / 100).toFixed(2)
            })));
        }
        // For "custom" type, we don't auto-calculate - user can input manually
    };

    useEffect(() => {
        calculateAmounts();
    }, [totalPrize, distributionType, distributions.length]);

    const totalAmount = distributions.reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0);
    const isTotalMatching = Math.abs(totalAmount - parseFloat(totalPrize || "0")) < 0.01;

    const isCustomMode = distributionType.name.toLowerCase() === "custom";

    return (
        <Card classHead="!pl-3" title="Prize Pool & Funding">
            <div className="p-3">
                <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                        <Field
                            classInput="pl-12.5"
                            label={`Total Prize Pool`}
                            placeholder="10"
                            tooltip="Total prize pool for the hackathon"
                            value={totalPrize}
                            onChange={(e) => setTotalPrize(e.target.value)}
                            required
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 left-1 w-10 h-10 flex items-center justify-center bg-secondary-04 rounded-full pointer-events-none">
                                <Icon
                                    className="fill-black"
                                    name="usd-circle"
                                />
                            </div>
                        </Field>
                    </div>
                    <div className="flex-1">
                        <Select
                            label="Prize Currency"
                            tooltip="Select the currency for the prize pool"
                            placeholder="Select currency"
                            value={prizeCurrency}
                            onChange={setPrizeCurrency}
                            options={currencies}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <Select
                        label="Prize Pool Distribution"
                        tooltip="Select how to distribute the prize pool"
                        placeholder="Select distribution type"
                        value={distributionType}
                        onChange={setDistributionType}
                        options={distributionTypes}
                    />
                </div>


                <div className="space-y-3">
                    {distributions.map((distribution, index) => (
                        <div key={distribution.id} className="flex items-end gap-3">
                            <div className="flex-1">
                                <Field
                                    label={distribution.name}
                                    placeholder="Enter amount"
                                    value={distribution.amount}
                                    onChange={(e) => updateDistribution(distribution.id, "amount", e.target.value)}
                                    disabled={!isCustomMode}
                                />
                            </div>
                            <div className="w-20">
                                <Field
                                    label="%"
                                    placeholder="0"
                                    value={distribution.percentage.toString()}
                                    onChange={(e) => updateDistribution(distribution.id, "percentage", parseFloat(e.target.value) || 0)}
                                    disabled={!isCustomMode}
                                />
                            </div>
                            <Button
                                className="w-10 h-10 flex items-center justify-center mb-1"
                                isStroke
                                onClick={() => removeDistribution(distribution.id)}
                                disabled={distributions.length <= 1}
                            >
                                <Icon name="close" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-s-stroke2">
                    <div className="flex items-center justify-between">
                        <div className="text-body-2 text-t-secondary">
                            Total: {totalPrize} | Distributed: {totalAmount.toFixed(2)} |
                            <span className={isTotalMatching ? "text-green-500" : "text-red-500"}>
                                {isTotalMatching ? " ✓ Balanced" : " ✗ Imbalanced"}
                            </span>
                        </div>
                        <Button
                            className="flex items-center gap-2"
                            isStroke
                            onClick={addDistribution}
                        >
                            <Icon name="plus" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Highlights;
