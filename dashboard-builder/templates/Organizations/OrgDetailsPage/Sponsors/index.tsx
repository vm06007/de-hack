import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Editor from "@/components/Editor";
import Select from "@/components/Select";
import Field from "@/components/Field";
import PlusIcon from "@/components/PlusIcon";
import { useBecomeSponsor } from "@/src/hooks/useBecomeSponsor";
import { useSponsors } from "@/src/hooks/useSponsors";

type BackendSponsor = {
    id: number;
    companyName: string;
    companyLogo?: string;
    contributionAmount: string;
    prizeDistribution?: string;
    depositHook?: string;
    transactionHash?: string;
    sponsorAddress?: string;
};

type PropsSponsor = {
    id: number;
    name: string;
    logo: string;
    tier: string;
};

type SponsorsProps = {
    sponsors?: { id: number; name: string; logo: string; tier: string }[];
    hackathon?: any;
};

const Sponsors = ({ sponsors, hackathon }: SponsorsProps) => {
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
    const [companyName, setCompanyName] = useState("");
    const [contributionAmount, setContributionAmount] = useState("");
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [prizeDistribution, setPrizeDistribution] = useState("");
    const [depositHook, setDepositHook] = useState({ id: 1, name: "Plain Deposit" });

    // Use the sponsors hook for backend data
    const { sponsors: backendSponsors, loading: sponsorsLoading, createSponsor, fetchSponsors } = useSponsors(hackathon?.id);

    // Use the becomeSponsor hook for smart contract interaction
    const { becomeSponsor, isLoading: contractLoading } = useBecomeSponsor(hackathon?.contractAddress || '');

    // Fetch sponsors when component mounts
    useEffect(() => {
        if (hackathon?.id && fetchSponsors) {
            fetchSponsors();
        }
    }, [hackathon?.id]);

    // Local loading state for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form validation state
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    // Validate form fields
    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!companyName.trim()) {
            errors.companyName = "Company name is required";
        }

        if (!contributionAmount || contributionAmount.trim() === "") {
            errors.contributionAmount = "Contribution amount is required";
        } else {
            const contributionValue = parseFloat(contributionAmount);
            const minimumDeposit = hackathon?.sponsorMinContribution || 0;

            if (isNaN(contributionValue) || contributionValue <= 0) {
                errors.contributionAmount = "Please enter a valid amount";
            } else if (contributionValue < minimumDeposit) {
                errors.contributionAmount = `Minimum contribution is $${minimumDeposit} ${hackathon?.sponsorCurrency || 'USDC'}`;
            }
        }

        if (!prizeDistribution.trim()) {
            errors.prizeDistribution = "Prize distribution details are required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Use backend sponsors if available, otherwise fall back to props
    const list = backendSponsors && backendSponsors.length > 0 ? backendSponsors : (sponsors && sponsors.length > 0 ? sponsors : []);

    const depositHookOptions = [
        { id: 1, name: "Plain Deposit" },
        { id: 2, name: "Deposit To Aave" },
        { id: 3, name: "Deposit to Morpho" }
    ];

    const handleSponsorClick = (sponsor: any) => {
        setSelectedSponsor(sponsor);
        setShowDetailsModal(true);
    };

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

    const handleSubmit = async () => {
        // Clear previous validation errors
        setValidationErrors({});

        // Validate form
        if (!validateForm()) {
            return;
        }

        if (!hackathon?.id || !hackathon?.contractAddress) {
            alert("Error: No hackathon contract address found");
            return;
        }

        try {
            setIsSubmitting(true);

            console.log("Starting sponsor application with smart contract...");
            console.log("Contract address:", hackathon.contractAddress);
            console.log("Contribution amount (ETH):", contributionAmount);

            // First, call the smart contract
            const contractResult = await becomeSponsor(contributionAmount, async (result) => {
                console.log("Smart contract transaction successful:", result);

                try {
                    // Now call the backend with the transaction data
                    const sponsorData = {
                        hackathonId: hackathon.id,
                        companyName: companyName.trim(),
                        contributionAmount: contributionAmount,
                        companyLogo: logoPreview, // Base64 image data
                        prizeDistribution: prizeDistribution,
                        depositHook: depositHook.name,
                        transactionHash: result.hash,
                        sponsorAddress: result.sponsor || '',
                    };

                    console.log("Storing sponsor data in backend...", sponsorData);
                    const backendResult = await createSponsor(sponsorData);
                    console.log("Sponsor data stored in backend:", backendResult);

                    // Dispatch custom event to notify other components of sponsor update
                    window.dispatchEvent(new CustomEvent('sponsorUpdated', {
                        detail: { sponsor: backendResult }
                    }));

                    console.log("Complete sponsor flow successful:", {
                        contractResult: result,
                        backendResult
                    });

                    // Close modal and reset form after successful backend call
                    setShowModal(false);
                    setCompanyName("");
                    setContributionAmount("");
                    setCompanyLogo(null);
                    setLogoPreview(null);
                    setPrizeDistribution("");
                    setDepositHook({ id: 1, name: "Plain Deposit" });

                } catch (backendError) {
                    console.error("Backend call failed after successful contract transaction:", backendError);
                    alert("Smart contract transaction successful, but failed to save to backend. Please contact support.");
                }
            });

            console.log("Smart contract call initiated:", contractResult);

        } catch (error) {
            console.error("Failed to submit sponsor application:", error);
            alert("Failed to submit sponsor application. Please try again.");
            // Don't close modal on error so user can retry
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <>
        <Card
            title="Sponsors"
            headContent={<PlusIcon onClick={() => setShowModal(true)} />}
        >
            <div className="p-5 max-lg:p-3 flex flex-col h-full">
                <div className="grow">
                <div className="space-y-4">
                    {sponsorsLoading ? (
                        <div className="text-center py-4">
                            <div className="text-body-2 text-t-secondary">Loading sponsors...</div>
                        </div>
                    ) : list.length > 0 ? (
                        list.map((sponsor) => (
                            <div
                                key={sponsor.id}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-b-surface1 cursor-pointer hover:bg-black transition-colors"
                                onClick={() => handleSponsorClick(sponsor)}
                            >
                                <div className="relative shrink-0 w-10 h-10">
                                    {sponsor.companyLogo ? (
                                        <Image
                                            className="rounded-lg opacity-100"
                                            src={sponsor.companyLogo}
                                            width={40}
                                            height={40}
                                            alt={sponsor.companyName}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-b-surface2 flex items-center justify-center">
                                            <div className="text-caption text-t-secondary">
                                                {sponsor.companyName.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="grow">
                                    <div className="text-body-2 font-medium">
                                        {sponsor.companyName}
                                    </div>
                                    <div className="text-caption text-t-secondary">
                                        ${sponsor.contributionAmount} {hackathon?.sponsorCurrency || 'USDC'}
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
                                    onChange={(e) => {
                                        setCompanyName(e.target.value);
                                        if (validationErrors.companyName) {
                                            setValidationErrors(prev => ({ ...prev, companyName: '' }));
                                        }
                                    }}
                                />
                                {validationErrors.companyName && (
                                    <div className="text-red-500 text-sm mt-1">{validationErrors.companyName}</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Field
                                    label="Contribution Amount"
                                    type="number"
                                    placeholder={`Minimum: $${hackathon?.sponsorMinContribution || '500'} ${hackathon?.sponsorCurrency || 'USDC'}`}
                                    value={contributionAmount}
                                    onChange={(e) => {
                                        setContributionAmount(e.target.value);
                                        if (validationErrors.contributionAmount) {
                                            setValidationErrors(prev => ({ ...prev, contributionAmount: '' }));
                                        }
                                    }}
                                />
                                {validationErrors.contributionAmount && (
                                    <div className="text-red-500 text-sm mt-1">{validationErrors.contributionAmount}</div>
                                )}
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
                                onChange={(content) => {
                                    setPrizeDistribution(content);
                                    if (validationErrors.prizeDistribution) {
                                        setValidationErrors(prev => ({ ...prev, prizeDistribution: '' }));
                                    }
                                }}
                                className="min-h-24"
                            />
                            {validationErrors.prizeDistribution && (
                                <div className="text-red-500 text-sm mt-1">{validationErrors.prizeDistribution}</div>
                            )}
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
                                disabled={isSubmitting || contractLoading}
                            >
                                {isSubmitting || contractLoading ? "Processing..." : "Proceed"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        )}

        {showDetailsModal && selectedSponsor && (
            <Modal open={showDetailsModal} onClose={() => setShowDetailsModal(false)} classWrapper="p-0">
                <div className="p-0 max-w-2xl">
                    <h3 className="text-h4 mb-6">Sponsor Details</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0 w-16 h-16">
                                {selectedSponsor.companyLogo ? (
                                    <Image
                                        className="rounded-lg opacity-100"
                                        src={selectedSponsor.companyLogo}
                                        width={64}
                                        height={64}
                                        alt={selectedSponsor.companyName}
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-b-surface2 flex items-center justify-center">
                                        <div className="text-h4 text-t-secondary">
                                            {selectedSponsor.companyName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-h5 font-medium">{selectedSponsor.companyName}</h4>
                                <div className="text-body-2 text-t-secondary">
                                    ${selectedSponsor.contributionAmount} {hackathon?.sponsorCurrency || 'USDC'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-body-2 font-medium mb-2">Deposit Hook</label>
                                <div className="text-body-2 text-t-secondary">
                                    {selectedSponsor.depositHook || 'Plain Deposit'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-body-2 font-medium mb-2">Application Status</label>
                                <div className="text-body-2 text-t-secondary">
                                    {selectedSponsor.transactionHash === 'pending' ? 'Pending' : 'Completed'}
                                </div>
                            </div>
                        </div>

                        {selectedSponsor.prizeDistribution && (
                            <div>
                                <label className="block text-body-2 font-medium mb-2">Prize Distribution Details</label>
                                <div
                                    className="p-0 rounded-lg bg-b-surface1 text-body-2 text-t-secondary prose prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedSponsor.prizeDistribution }}
                                />
                            </div>
                        )}

                        {selectedSponsor.transactionHash && selectedSponsor.transactionHash !== 'pending' && (
                            <div className="pt-4 border-t border-s-stroke2">
                                <label className="block text-body-2 font-medium mb-2">Verify Funds</label>
                                <div className="text-caption text-t-secondary mb-3">
                                    Verify that funds have been deposited to the hackathon contract
                                </div>
                                <a
                                    href={`https://etherscan.io/tx/${selectedSponsor.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-button text-t-primary hover:underline"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                    </svg>
                                    View Transaction on Etherscan
                                </a>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={() => setShowDetailsModal(false)}
                                className="flex-1"
                            >
                                Close
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
