import Icon from "@/components/Icon";
import Link from "next/link";
import Button from "@/components/Button";
import Image from "@/components/Image";
import { useSponsors } from "@/src/hooks/useSponsors";
import { useRegisterHacker } from "@/src/hooks/useRegisterHacker";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

type Props = {
    description?: string;
    title?: string;
    hackathon?: any;
    onSponsorModalOpen?: () => void;
};

const getHighlights = (hackathon: any, sponsorContributions: number = 0) => {
    const highlights = [
        "Global Online Hackathon",
    ];

    // Calculate development period from start and end dates
    if (hackathon?.startDate && hackathon?.endDate) {
        const startDate = new Date(hackathon.startDate);
        const endDate = new Date(hackathon.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        highlights.push(`${diffDays}-day development period`);
    } else {
        highlights.push("30-day development period");
    }

    // Calculate total prize pool including sponsor contributions (same logic as Prize Pool component)
    // Use the same calculation as in OrgDetailsPage: Number(hackathon.totalPrizePool) || 500000
    const basePrizePool = hackathon?.totalPrizePool ? Number(hackathon.totalPrizePool) : 500000;
    const totalPrizePool = basePrizePool + sponsorContributions;
    const prizeAmount = Number(totalPrizePool).toLocaleString();
    highlights.push(`$${prizeAmount}+ total prize pool`);

    // Add cost of participation if staking is required (without $ if currency specified)
    if (hackathon?.requireStaking && hackathon?.stakingAmount) {
        highlights.push(`${hackathon.stakingAmount} ${hackathon.stakingCurrency} participation stake`);
    }

    // Add voting model
    if (hackathon?.judgingModel) {
        highlights.push(`${hackathon.judgingModel} voting model`);
    }

    return highlights;
};

const Description = ({ description, title, hackathon, onSponsorModalOpen }: Props) => {
    // Use backend sponsor data to calculate contributions
    const { sponsors: backendSponsors, fetchSponsors } = useSponsors(hackathon?.id);
    
    // Get wallet connection status
    const { isConnected } = useAccount();
    
    // Use the registerHacker hook for smart contract interaction
    const { registerHacker, isLoading: registrationLoading, isRegistered } = useRegisterHacker(hackathon?.contractAddress || '');

    // Calculate sponsor contributions from backend data
    const sponsorContributions = backendSponsors?.reduce((sum, sponsor) => {
        const amount = parseFloat(sponsor.contributionAmount || '0');
        return sum + amount;
    }, 0) || 0;

    // Listen for sponsor updates via custom events
    useEffect(() => {
        const handleSponsorUpdate = () => {
            if (hackathon?.id && fetchSponsors) {
                fetchSponsors();
            }
        };

        // Listen for custom sponsor update events
        window.addEventListener('sponsorUpdated', handleSponsorUpdate);

        return () => {
            window.removeEventListener('sponsorUpdated', handleSponsorUpdate);
        };
    }, [hackathon?.id, fetchSponsors]);

    // Fetch sponsor data when component mounts
    useEffect(() => {
        if (hackathon?.id && fetchSponsors) {
            fetchSponsors();
        }
    }, [hackathon?.id]);

    // Extract stake amount from hackathon data
    const getStakeAmount = () => {
        if (hackathon?.requireStaking && hackathon?.stakingAmount) {
            return hackathon.stakingAmount.toString();
        }
        return "0.0001"; // Default stake amount in ETH
    };

    // Handle hacker registration
    const handleHackerRegistration = async () => {
        // Check wallet connection first
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!hackathon?.contractAddress) {
            toast.error("Error: No hackathon contract address found");
            return;
        }

        try {
            const stakeAmount = getStakeAmount();
            console.log("Starting hacker registration with smart contract...");
            console.log("Contract address:", hackathon.contractAddress);
            console.log("Stake amount (ETH):", stakeAmount);

            // First, call the smart contract
            const contractResult = await registerHacker(stakeAmount, async (result) => {
                console.log("Smart contract registration successful:", result);
                
                try {
                    // TODO: Add backend call here when needed
                    // const hackerData = {
                    //     hackathonId: hackathon.id,
                    //     participantAddress: result.participant,
                    //     stakeAmount: result.stakeAmount,
                    //     transactionHash: result.hash,
                    // };
                    // const backendResult = await createHackerRegistration(hackerData);
                    
                    console.log("Complete hacker registration successful:", result);

                } catch (backendError) {
                    console.error("Backend call failed after successful contract transaction:", backendError);
                    toast.error("Smart contract registration successful, but failed to save to backend. Please contact support.");
                }
            });

            console.log("Smart contract call initiated:", contractResult);

        } catch (error) {
            console.error("Failed to register for hackathon:", error);
            // Error toasts are already handled in the hook
        }
    };

    // Handle project submission
    const handleProjectSubmission = () => {
        // Check wallet connection first
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        // TODO: Open project submission modal/form
        console.log("Opening project submission form...");
        toast.info("Project submission form coming soon!");
        // This will be replaced with actual modal/form logic
    };

    // Default description if none provided
    const defaultDescription = `<p>Join the most prestigious <strong>blockchain hackathon</strong> in the ecosystem. ${title || 'This hackathon'} brings together the brightest minds in <strong>Web3 development</strong> for an intensive 30-day building experience. This global event connects developers, designers, and entrepreneurs from around the world to build the future of decentralized technology.</p><p>Participants will have access to cutting-edge tools, expert mentorship, and a supportive community. From DeFi protocols to NFT marketplaces, gaming platforms to infrastructure solutions - this hackathon welcomes all innovative projects that push the boundaries of what's possible on Ethereum 🚀</p><p><strong>🚀 Perfect for:</strong></p><ul><li>DeFi Protocol Development</li><li>NFT & Gaming Projects</li><li>Infrastructure & Tooling</li><li>Privacy & Security Solutions</li><li>Social & DAO Applications</li><li>Cross-chain Integration</li></ul><p>Whether you're a seasoned blockchain developer or just starting your Web3 journey, ${title || 'this hackathon'} provides the perfect platform to showcase your skills, learn from industry experts, and potentially launch your next big project. The hackathon features workshops, networking events, and direct access to leading protocols and VCs. 😎</p>`;

    const content = description || defaultDescription;

    return (
        <div className="flex text-[1.125rem] font-medium leading-[1.75rem] max-lg:block">
        <div className="grow pr-16 max-xl:pr-10 max-lg:pr-0">
            <div className="mb-8 text-h4 max-md:mb-6 max-md:text-h5">
                Overview
            </div>
            <div
                className="[&_p,&_ul]:mb-7 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline [&_a]:hover:no-underline [&_p:last-child,&_ul:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
        <div className="shrink-0 w-91 max-lg:flex max-lg:gap-15 max-lg:w-full max-lg:mt-16 max-md:flex-col max-md:gap-8 max-md:mt-8">
            <div className="max-lg:flex-1">
                <div className="mb-8 text-h4 max-lg:mb-3 max-lg:text-h5">
                    Highlights
                </div>
                <ul>
                    {getHighlights(hackathon, sponsorContributions).map((highlight) => (
                        <li
                            className="flex items-center py-5 border-t border-s-stroke2 first:border-t-0"
                            key={highlight}
                        >
                            <Icon
                                className="mr-3 fill-t-primary"
                                name="check-circle-fill"
                            />{" "}
                            {highlight}
                        </li>
                    ))}
                </ul>
                <div className="flex flex-col gap-3 shrink-0 mt-2">
                    <Button 
                        className="w-full" 
                        isBlack
                        onClick={isRegistered ? handleProjectSubmission : handleHackerRegistration}
                        disabled={registrationLoading}
                    >
                        {registrationLoading ? "Processing..." : (isRegistered ? "Submit Project" : "Hacker Application")}
                    </Button>
                    <Button 
                        className="w-full" 
                        isStroke
                        onClick={() => {
                            if (!isConnected) {
                                toast.error("Please connect your wallet first");
                                return;
                            }
                            console.log('Sponsor Application button clicked, onSponsorModalOpen:', onSponsorModalOpen);
                            onSponsorModalOpen?.();
                        }}
                    >
                        {hackathon?.allowSponsors && hackathon?.sponsorMinContribution
                            ? `Sponsor Application (${hackathon.sponsorMinContribution} ${hackathon.sponsorCurrency} Min)`
                            : "Sponsor Application"
                        }
                    </Button>
                </div>
            </div>
            <div className="mt-15 max-lg:flex-1 max-lg:mt-0">
                <div className="flex items-center">
                    <div className="shrink-0">
                        <Image
                            className="size-17 object-cover opacity-100 rounded-full"
                            src="/images/avatar.png"
                            width={68}
                            height={68}
                            alt="shop-banner"
                        />
                    </div>
                    <div className="grow pl-6">
                        <div className="text-h4 max-lg:text-h5">Organization</div>
                        <div className="text-t-secondary">ETHGlobal (0x123...321)</div>
                    </div>
                </div>
                <div className="flex mt-8 border-t border-s-stroke2">
                    <div className="flex-1 pt-8 pr-8 border-r border-s-stroke2 max-md:pt-6">
                        <div className="flex items-center gap-2">
                            <div className="text-h4">4.96</div>
                            <Icon
                                className="!size-4 fill-t-primary"
                                name="star-fill"
                            />
                        </div>
                        <div>Ratings</div>
                    </div>
                    <div className="flex-1 pt-8 pl-8 max-md:pt-6">
                        <div className="text-h4">8+</div>
                        <div>Years hosting</div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Description;
