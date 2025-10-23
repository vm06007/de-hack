import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Icon from "@/components/Icon";
import Select from "@/components/Select";
import Switch from "@/components/Switch";
import { depositStrategies } from "@/constants/depositStrategies";
import { getTokenDecimals, SUPPORTED_CURRENCIES } from "@/constants/tokenAddresses";

const currencies = [
    { id: 1, name: "ETH" },
    { id: 2, name: "PYUSD" },
    { id: 3, name: "USDC" },
    { id: 4, name: "USDT" },
    { id: 5, name: "DAI" }
];

type PriceProps = {
    allowSponsors: boolean;
    setAllowSponsors: (value: boolean) => void;
    sponsorCurrency: any;
    setSponsorCurrency: (value: any) => void;
    minSponsorContribution: string;
    setMinSponsorContribution: (value: string) => void;
    requireStaking: boolean;
    setRequireStaking: (value: boolean) => void;
    stakingCurrency: any;
    setStakingCurrency: (value: any) => void;
    stakingAmount: string;
    setStakingAmount: (value: string) => void;
    automaticStakeReturn: boolean;
    setAutomaticStakeReturn: (value: boolean) => void;
};

const Price = ({
    allowSponsors,
    setAllowSponsors,
    sponsorCurrency,
    setSponsorCurrency,
    minSponsorContribution,
    setMinSponsorContribution,
    requireStaking,
    setRequireStaking,
    stakingCurrency,
    setStakingCurrency,
    stakingAmount,
    setStakingAmount,
    automaticStakeReturn,
    setAutomaticStakeReturn,
}: PriceProps) => {

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
                        <>
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
                        </>
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
                        <>
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


                            <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-2xl">
                                <div>
                                    <div className="text-body-2 font-medium">Automatic Stake Return</div>
                                    <div className="text-caption text-t-secondary">
                                        Stake returned automatically upon project submission
                                    </div>
                                </div>
                                <Switch
                                    checked={automaticStakeReturn}
                                    onChange={() => setAutomaticStakeReturn(!automaticStakeReturn)}
                                />
                            </div>
                        </>
                    )}

                </div>
            </div>
        </Card>
    );
};

export default Price;
