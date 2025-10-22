import Card from "@/components/Card";
import Icon from "@/components/Icon";
import PlusIcon from "@/components/PlusIcon";
import { NumericFormat } from "react-number-format";
import { useSponsors } from "@/src/hooks/useSponsors";
import { useEffect } from "react";

type PrizePoolProps = {
    totalPrize?: number;
    prizeTiers?: any[];
    sponsors?: any[];
    hackathon?: any;
};

const PrizePool = ({ totalPrize = 500000, prizeTiers = [], sponsors = [], hackathon }: PrizePoolProps) => {
    const ethPrice = 2500; // ETH price in USD

    // Use backend sponsor data
    const { sponsors: backendSponsors, fetchSponsors } = useSponsors(hackathon?.id);
    const sponsorData = backendSponsors && backendSponsors.length > 0 ? backendSponsors : sponsors;

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

    // Calculate sponsor contributions from backend data
    const sponsorContributions = sponsorData?.reduce((sum, sponsor) => {
        const amount = parseFloat(sponsor.contributionAmount || '0');
        return sum + amount;
    }, 0) || 0;

    // Calculate total prize pool including sponsor contributions
    const totalPrizePool = totalPrize + sponsorContributions;
    const ethAmount = totalPrizePool / ethPrice;

    // Refresh sponsor data when hackathon changes
    useEffect(() => {
        if (hackathon?.id && fetchSponsors) {
            fetchSponsors();
        }
    }, [hackathon?.id, fetchSponsors]);

    // Use dynamic prize tiers if available, otherwise use default breakdown
    const displayTiers = prizeTiers && prizeTiers.length > 0 ? prizeTiers : [
        { name: "1st Place", amount: totalPrize * 0.5, percentage: 50 },
        { name: "2nd Place", amount: totalPrize * 0.3, percentage: 30 },
        { name: "3rd Place", amount: totalPrize * 0.2, percentage: 20 }
    ];

    return (
        <Card
            title="Prize Pool"
            headContent={<PlusIcon onClick={() => console.log('Prize Pool plus clicked')} />}
        >
            <div className="p-5 max-lg:p-3 flex flex-col h-full">
                <div className="grow">
                <div className="text-center">
                    <NumericFormat
                        className="block mb-5 text-h3 max-lg:text-h4"
                        value={totalPrizePool}
                        thousandSeparator=","
                        decimalScale={0}
                        displayType="text"
                        prefix="$"
                    />
                    {/*<div className="text-body-2 text-t-secondary">
                        {ethAmount.toFixed(2)} ETH
                    </div>*/}
                </div>
                <div className="mt-4 pt-4 border-t border-s-stroke2 h-40">
                    {displayTiers.map((tier, index) => (
                        <div key={index} className="flex justify-between items-center mb-2">
                            <div className="text-caption text-t-secondary">{tier.name}</div>
                            <NumericFormat
                                className="text-body-2"
                                value={tier.amount}
                                thousandSeparator=","
                                decimalScale={0}
                                displayType="text"
                                prefix="$"
                            />
                        </div>
                    ))}
                    <div className="flex justify-between items-center">
                        <div className="text-caption text-t-secondary">Sponsors</div>
                        <NumericFormat
                            className="text-body-2"
                            value={sponsorContributions}
                            thousandSeparator=","
                            decimalScale={0}
                            displayType="text"
                            prefix="$"
                        />
                    </div>
                </div>
                </div>
                <div className="mt-6 pt-4 border-t border-s-stroke2 text-center text-t-secondary">
                    <div className="text-caption mb-2">Verify funds deposited</div>
                    <a
                        className="inline-flex items-center gap-2 text-button text-t-primary hover:underline"
                        href={`https://etherscan.io/address/${hackathon?.contractAddress || '0xDeHackPrizePoolContract'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {hackathon?.contractAddress ?
                            `${hackathon.contractAddress.slice(0, 8)}...${hackathon.contractAddress.slice(-6)}` :
                            '0xDeHackPrizePoolContract'
                        }
                    </a>
                </div>
            </div>
        </Card>
    );
};

export default PrizePool;
