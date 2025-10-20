import { useState } from "react";
import Card from "@/components/Card";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Editor from "@/components/Editor";
import Select from "@/components/Select";
import Field from "@/components/Field";

const defaultSponsors = [
    {
        id: 1,
        name: "Ethereum Foundation",
        logo: "/images/ethereum.svg",
        tier: "$25,000",
    },
    {
        id: 2,
        name: "Polygon",
        logo: "/images/polygon.svg",
        tier: "$10,000",
    },
    {
        id: 3,
        name: "Chainlink",
        logo: "/images/chainlink.svg",
        tier: "$1,000",
    },
    {
        id: 4,
        name: "Uniswap",
        logo: "/images/uniswap.svg",
        tier: "$25,000",
    },
];

type SponsorsProps = {
    sponsors?: { id: number; name: string; logo: string; tier: string }[];
    hackathon?: any;
};

const Sponsors = ({ sponsors, hackathon }: SponsorsProps) => {
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [contributionAmount, setContributionAmount] = useState("");
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [prizeDistribution, setPrizeDistribution] = useState("");
    const [depositHook, setDepositHook] = useState({ id: 1, name: "Plain Deposit" });
    const list = sponsors && sponsors.length > 0 ? sponsors : [];

    const depositHookOptions = [
        { id: 1, name: "Plain Deposit" },
        { id: 2, name: "Deposit To Aave" },
        { id: 3, name: "Deposit to Morpho" }
    ];

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setCompanyLogo(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        // Handle sponsor application submission
        console.log("Sponsor application:", {
            companyName,
            contributionAmount,
            companyLogo,
            prizeDistribution,
            depositHook: depositHook.name
        });
        setShowModal(false);
        // Reset form
        setCompanyName("");
        setContributionAmount("");
        setCompanyLogo(null);
        setLogoPreview(null);
        setPrizeDistribution("");
        setDepositHook({ id: 1, name: "Plain Deposit" });
    };
    return (
        <>
        <Card title="Sponsors">
            <div className="p-5 max-lg:p-3 flex flex-col h-full">
                <div className="grow">
                <div className="space-y-4">
                    {list.length > 0 ? (
                        list.map((sponsor) => (
                            <div
                                key={sponsor.id}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1"
                            >
                                <div className="relative shrink-0 w-10 h-10">
                                    <Image
                                        className="rounded-lg opacity-100"
                                        src={sponsor.logo}
                                        width={40}
                                        height={40}
                                        alt={sponsor.name}
                                    />
                                </div>
                                <div className="grow">
                                    <div className="text-body-2 font-medium">
                                        {sponsor.name}
                                    </div>
                                    <div className="text-caption text-t-secondary">
                                        {sponsor.tier}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-body-2 text-t-secondary mb-4">
                                No sponsors yet
                            </div>
                            <Button
                                onClick={() => setShowModal(true)}
                                className="w-full"
                            >
                                Apply as a sponsor
                            </Button>
                        </div>
                    )}
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-s-stroke2 text-center">
                    {hackathon?.allowSponsors && hackathon?.sponsorMinContribution ? (
                        <div className="text-caption text-t-secondary">
                            Minimum contribution: ${hackathon.sponsorMinContribution} {hackathon.sponsorCurrency}
                        </div>
                    ) : (
                        <div className="text-caption text-t-secondary">
                            Want to become a sponsor?
                        </div>
                    )}
                </div>
            </div>
        </Card>

        {showModal && (
            <Modal open={showModal} onClose={() => setShowModal(false)} classWrapper="p-0">
                <div className="p-0 max-w-2xl">
                    <h3 className="text-h4 mb-6">Become a Sponsor</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-[1fr_9fr] gap-4">
                            <div>
                                <label className="block text-button mb-4">Add Logo</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="cursor-pointer block"
                                    >
                                        {logoPreview ? (
                                            <div className="w-16 h-13 rounded-[50px] bg-b-surface1 border border-s-stroke2 overflow-hidden hover:bg-b-surface2 transition-colors">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-13 rounded-[50px] bg-b-surface1 border border-s-stroke2 flex items-center justify-center hover:bg-b-surface2 transition-colors">
                                                <div className="text-caption text-t-secondary">Upload</div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <Field
                                    label="Company Name"
                                    placeholder="Enter your company name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Field
                                    label="Contribution Amount"
                                    type="number"
                                    placeholder={`Minimum: $${hackathon?.sponsorMinContribution || '500'} ${hackathon?.sponsorCurrency || 'USDC'}`}
                                    value={contributionAmount}
                                    onChange={(e) => setContributionAmount(e.target.value)}
                                />
                            </div>
                            <div>
                                <Select
                                    label="Deposit Hook"
                                    tooltip="Funds will be deposited to protocol before distribution to earn additional yield while waiting in contract"
                                    options={depositHookOptions}
                                    value={depositHook}
                                    onChange={setDepositHook}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-body-2 mb-2">Prize Distribution Details</label>
                            <div className="text-caption text-t-secondary mb-3">
                                Describe how prizes will be distributed, bounties, tracks, and prize splitting
                            </div>
                            <Editor
                                content={prizeDistribution}
                                onChange={setPrizeDistribution}
                                className="min-h-24"
                            />
                        </div>

                        <div className="flex gap-3 pt-0">
                            <Button
                                onClick={() => setShowModal(false)}
                                className="flex-1"
                                isStroke
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="flex-1"
                            >
                                Proceed
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        )}
        </>
    );
};

export default Sponsors;
