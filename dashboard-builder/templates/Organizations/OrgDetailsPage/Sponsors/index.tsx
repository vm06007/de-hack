import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Editor from "@/components/Editor";
import Select from "@/components/Select";
import Field from "@/components/Field";
import PlusIcon from "@/components/PlusIcon";
import { useBecomeSponsor } from "@/src/hooks/useBecomeSponsor";
import { useSponsorsService } from "@/src/hooks/useSponsorsService";
import { depositStrategies } from "@/constants/depositStrategies";
import { getTokenAddress, getTokenDecimals, isSupportedToken } from "@/constants/tokenAddresses";

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
    sponsors?: PropsSponsor[];
    hackathon?: any;
    showModal?: boolean;
    setShowModal?: (show: boolean) => void;
};

// Type guard to check if sponsor is from backend API
const isBackendSponsor = (sponsor: BackendSponsor | PropsSponsor | any): sponsor is BackendSponsor => {
    return 'companyName' in sponsor && 'contributionAmount' in sponsor;
};

const Sponsors = ({ sponsors, hackathon, showModal: externalShowModal, setShowModal: externalSetShowModal }: SponsorsProps) => {
    const router = useRouter();
    const [internalShowModal, setInternalShowModal] = useState(false);
    const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
    const setShowModal = externalSetShowModal || setInternalShowModal;

    console.log('Sponsors component - externalShowModal:', externalShowModal, 'showModal:', showModal);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
    const [companyName, setCompanyName] = useState("");
    const [contributionAmount, setContributionAmount] = useState("");
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [prizeDistribution, setPrizeDistribution] = useState("");
    const [depositHook, setDepositHook] = useState({ id: 1, name: "Plain Deposit" });

    // Use the sponsors hook for backend data
    const { sponsors: backendSponsors, loading: sponsorsLoading } = useSponsorsService(hackathon?.id);

    // Use the becomeSponsor hook for smart contract interaction
    const {
        becomeSponsor,
        isLoading: contractLoading,
        walletCapabilities,
        transactionStrategy
    } = useBecomeSponsor(hackathon?.contractAddress || '');

    // Sponsors are automatically fetched by useSponsorsService

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

        // Validate token support if currency is not ETH
        if (hackathon?.sponsorCurrency && hackathon.sponsorCurrency !== 'ETH') {
            if (!isSupportedToken(hackathon.sponsorCurrency)) {
                errors.sponsorCurrency = `Token ${hackathon.sponsorCurrency} is not supported for sponsorship`;
            }
        }

        if (!prizeDistribution.trim()) {
            errors.prizeDistribution = "Prize distribution details are required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Use backend sponsors if available, otherwise fall back to props, limit to first 5
    const allSponsors = backendSponsors && backendSponsors.length > 0 ? backendSponsors : (sponsors && sponsors.length > 0 ? sponsors : []);
    const list = allSponsors.slice(0, 5);

    // Debug logging
    console.log('Sponsors component - backendSponsors:', backendSponsors);
    console.log('Sponsors component - props sponsors:', sponsors);
    console.log('Sponsors component - allSponsors:', allSponsors);
    console.log('Sponsors component - list:', list);

    const depositHookOptions = depositStrategies;

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
            // Get token address from lookup
            const tokenAddress = hackathon?.sponsorCurrency && hackathon.sponsorCurrency !== 'ETH'
                ? getTokenAddress(hackathon.sponsorCurrency) || undefined
                : undefined;

            const contractResult = await becomeSponsor(
                contributionAmount,
                async (result) => {
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
                    // Note: createSponsor functionality needs to be implemented in useSponsorsService
                    console.log("Sponsor data would be stored in backend:", sponsorData);

                    // Dispatch custom event to notify other components of sponsor update
                    window.dispatchEvent(new CustomEvent('sponsorUpdated', {
                        detail: { sponsor: sponsorData }
                    }));

                    console.log("Complete sponsor flow successful:", {
                        contractResult: result,
                        sponsorData
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
            },
            hackathon?.sponsorCurrency,
            tokenAddress
            );

            console.log("Smart contract call initiated:", contractResult);

        } catch (error) {
            console.error("Failed to submit sponsor application:", error);

            // Check if it's a user cancellation
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('User rejected') ||
                errorMessage.includes('User denied') ||
                errorMessage.includes('cancelled') ||
                errorMessage.includes('rejected')) {
                console.log("User cancelled the sponsor transaction");
                // Don't show alert for user cancellation, just reset state
            } else {
                alert("Failed to submit sponsor application. Please try again.");
            }
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
                                    {(() => {
                                        const logoUrl = isBackendSponsor(sponsor) ? sponsor.companyLogo : sponsor.logo;
                                        const sponsorName = isBackendSponsor(sponsor) ? sponsor.companyName : sponsor.name;

                                        console.log('Sponsor logo debug:', {
                                            sponsorName,
                                            logoUrl,
                                            isBackendSponsor: isBackendSponsor(sponsor),
                                            sponsor
                                        });

                                        return logoUrl ? (
                                            <Image
                                                className="rounded-lg opacity-100"
                                                src={logoUrl}
                                                width={40}
                                                height={40}
                                                alt={sponsorName}
                                                onError={() => {
                                                    console.log('Image failed to load:', logoUrl);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-b-surface2 flex items-center justify-center">
                                                <div className="text-caption text-t-secondary">
                                                    {sponsorName.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="grow">
                                    <div className="text-body-2 font-medium">
                                        {isBackendSponsor(sponsor) ? sponsor.companyName : sponsor.name}
                                    </div>
                                    <div className="text-caption text-t-secondary">
                                        {(() => {
                                            const amount = isBackendSponsor(sponsor) ? sponsor.contributionAmount : sponsor.tier;
                                            const currency = hackathon?.sponsorCurrency || 'USDC';

                                            console.log('Sponsor amount debug:', {
                                                sponsorName: isBackendSponsor(sponsor) ? sponsor.companyName : sponsor.name,
                                                amount,
                                                currency,
                                                isBackendSponsor: isBackendSponsor(sponsor),
                                                sponsor
                                            });

                                            return `$${amount} ${currency}`;
                                        })()}
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
                                    placeholder={`Minimum: $${hackathon?.sponsorMinContribution || '500'} ${hackathon?.sponsorCurrency || 'PYUSD'}`}
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

                        {/* Token Information - only show if currency is not ETH */}
                        {hackathon?.sponsorCurrency && hackathon.sponsorCurrency !== 'ETH' && (
                            <div>
                                <div style={{ display: 'none' }} className="p-3 rounded-lg bg-b-surface1 border border-s-stroke2">
                                    <div className="text-body-2 font-medium mb-1">
                                        Token: {hackathon.sponsorCurrency}
                                    </div>
                                    <div className="text-caption text-t-secondary">
                                        Contract Address: {getTokenAddress(hackathon.sponsorCurrency) || 'Not supported'}
                                    </div>
                                    <div className="text-caption text-t-secondary">
                                        Decimals: {getTokenDecimals(hackathon.sponsorCurrency) || 'Unknown'}
                                    </div>
                                    {!isSupportedToken(hackathon.sponsorCurrency) && (
                                        <div className="text-red-500 text-sm mt-2">
                                            This token is not supported for sponsorship
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Wallet Capability Information */}
                        {walletCapabilities && (
                            <div style={{ display: 'none' }} className="bg-b-surface1 border border-s-stroke2 rounded-lg p-4">
                                <h4 className="text-body-2 font-medium mb-3">Wallet Capabilities</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-caption text-t-secondary">EIP-7702 Support:</span>
                                        <span className={`text-caption font-medium ${
                                            walletCapabilities.supportsEIP7702 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {walletCapabilities.supportsEIP7702 ? 'Supported' : 'Not Supported'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-caption text-t-secondary">Transaction Batching:</span>
                                        <span className={`text-caption font-medium ${
                                            walletCapabilities.supportsBatching ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {walletCapabilities.supportsBatching ? 'Supported' : 'Not Supported'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-caption text-t-secondary">Smart Wallets:</span>
                                        <span className={`text-caption font-medium ${
                                            walletCapabilities.supportsSmartWallets ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {walletCapabilities.supportsSmartWallets ? 'Supported' : 'Not Supported'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-caption text-t-secondary">Transaction Strategy:</span>
                                        <span className="text-caption font-medium text-blue-500 capitalize">
                                            {transactionStrategy.replace('-', ' ')}
                                        </span>
                                    </div>
                                    {walletCapabilities.walletName && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-caption text-t-secondary">Wallet:</span>
                                            <span className="text-caption font-medium">
                                                {walletCapabilities.walletName}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 p-2 bg-b-surface2 rounded text-caption text-t-secondary">
                                    {transactionStrategy === 'legacy' && (
                                        <span>Your wallet will require separate approval and sponsor transactions.</span>
                                    )}
                                    {transactionStrategy === 'batched' && (
                                        <span>Your wallet supports batched transactions for optimal efficiency.</span>
                                    )}
                                    {transactionStrategy === 'smart-wallet' && (
                                        <span>Your wallet supports smart wallet features for enhanced functionality.</span>
                                    )}
                                </div>
                            </div>
                        )}

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
                                onExpand={() => router.push('/applications/sponsor')}
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
                                {isSubmitting || contractLoading ? "Processing..." :
                                 transactionStrategy === 'legacy' ? "Proceed (2 Transactions)" :
                                 transactionStrategy === 'batched' ? "Proceed (Batched)" :
                                 transactionStrategy === 'smart-wallet' ? "Proceed (Smart Wallet)" :
                                 "Proceed"}
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
