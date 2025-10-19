import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Icon from "@/components/Icon";
import Select from "@/components/Select";
import Switch from "@/components/Switch";


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

const Price = () => {
    const [allowSponsors, setAllowSponsors] = useState(false);
    const [sponsorCurrency, setSponsorCurrency] = useState(currencies[0]);
    const [minSponsorContribution, setMinSponsorContribution] = useState("");
    const [requireStaking, setRequireStaking] = useState(false);
    const [stakingCurrency, setStakingCurrency] = useState(currencies[0]);
    const [stakingAmount, setStakingAmount] = useState("");

    return (
        <Card classHead="!pl-3" title="Hackathon Settings">
            <div className="p-3">
                <div className="flex flex-col gap-6">

                    <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-2xl">
                        <div>
                            <div className="text-body-2 font-medium">Allow Sponsors</div>
                            <div className="text-caption text-t-secondary">
                                Enable sponsors to contribute to the prize pool
                            </div>
                        </div>
                        <Switch
                            checked={allowSponsors}
                            onChange={() => setAllowSponsors(!allowSponsors)}
                        />
                    </div>

                    {allowSponsors && (
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Field
                                    label="Minimum Contribution"
                                    placeholder="100"
                                    tooltip="Minimum amount sponsors must contribute"
                                    value={minSponsorContribution}
                                    onChange={(e) => setMinSponsorContribution(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Select
                                    label="Sponsor Currency"
                                    tooltip="Currency sponsors must pay in"
                                    placeholder="Select currency"
                                    value={sponsorCurrency}
                                    onChange={setSponsorCurrency}
                                    options={currencies}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-2xl">
                        <div>
                            <div className="text-body-2 font-medium">Require Staking</div>
                            <div className="text-caption text-t-secondary">
                                Require hackers to stake tokens to join the hackathon
                            </div>
                        </div>
                        <Switch
                            checked={requireStaking}
                            onChange={() => setRequireStaking(!requireStaking)}
                        />
                    </div>

                    {requireStaking && (
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Field
                                    label="Staking Amount"
                                    placeholder="50"
                                    tooltip="Amount hackers must stake to join"
                                    value={stakingAmount}
                                    onChange={(e) => setStakingAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Select
                                    label="Staking Currency"
                                    tooltip="Currency hackers must stake in"
                                    placeholder="Select currency"
                                    value={stakingCurrency}
                                    onChange={setStakingCurrency}
                                    options={currencies}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Card>
    );
};

export default Price;
