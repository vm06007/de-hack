import Card from "@/components/Card";
import Icon from "@/components/Icon";
import PlusIcon from "@/components/PlusIcon";
import { NumericFormat } from "react-number-format";
import { useSponsorsService } from "@/src/hooks/useSponsorsService";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";

type PrizePoolProps = {
    totalPrize?: number;
    prizeTiers?: any[];
    sponsors?: any[];
    hackathon?: any;
};

const PrizePool = ({ totalPrize = 500000, prizeTiers = [], sponsors = [], hackathon }: PrizePoolProps) => {
    const ethPrice = 2500; // ETH price in USD
    const [lastSponsorCount, setLastSponsorCount] = useState(0);
    const isRefreshing = useRef(false);

    // Use backend sponsor data (prioritize backend data over static props)
    const { sponsors: backendSponsors, refreshSponsors } = useSponsorsService(hackathon?.id);
    const sponsorData = backendSponsors || sponsors;

    // Memoize sponsor contributions calculation to prevent unnecessary recalculations
    const sponsorContributions = useMemo(() => {
        if (!sponsorData || !Array.isArray(sponsorData)) return 0;
        
        return sponsorData.reduce((sum, sponsor) => {
            const amount = parseFloat(sponsor.contributionAmount || '0');
            return sum + amount;
        }, 0);
    }, [sponsorData]);

    // Memoize total prize pool calculation
    const totalPrizePool = useMemo(() => {
        return totalPrize + sponsorContributions;
    }, [totalPrize, sponsorContributions]);

    const ethAmount = useMemo(() => {
        return totalPrizePool / ethPrice;
    }, [totalPrizePool, ethPrice]);

    // Only refresh when sponsor count changes (new sponsor added)
    useEffect(() => {
        if (!hackathon?.id || !refreshSponsors) return;

        const currentSponsorCount = sponsorData?.length || 0;
        
        // Only refresh if sponsor count has increased (new sponsor added)
        if (currentSponsorCount > lastSponsorCount) {
            console.log(`Prize Pool - Sponsor count increased from ${lastSponsorCount} to ${currentSponsorCount}, refreshing...`);
            setLastSponsorCount(currentSponsorCount);
            
            // Optional: refresh data from backend to ensure consistency
            if (isRefreshing.current) return;
            
            isRefreshing.current = true;
            refreshSponsors().finally(() => {
                isRefreshing.current = false;
            });
        }
    }, [sponsorData?.length, lastSponsorCount, hackathon?.id, refreshSponsors]);

    // Listen for sponsor updates via custom events (for real-time updates)
    useEffect(() => {
        const handleSponsorUpdate = () => {
            console.log('Prize Pool - Sponsor update event received, refreshing...');
            if (refreshSponsors && !isRefreshing.current) {
                isRefreshing.current = true;
                refreshSponsors().finally(() => {
                    isRefreshing.current = false;
                });
            }
        };

        // Listen for custom sponsor update events
        window.addEventListener('sponsorUpdated', handleSponsorUpdate);

        return () => {
            window.removeEventListener('sponsorUpdated', handleSponsorUpdate);
        };
    }, [refreshSponsors]);

    // Initialize sponsor count on mount
    useEffect(() => {
        if (sponsorData?.length !== undefined) {
            setLastSponsorCount(sponsorData.length);
        }
    }, [hackathon?.id]); // Only on hackathon change

    // Debug logging (only when values actually change)
    useEffect(() => {
        console.log('Prize Pool - Updated values:', {
            sponsorCount: sponsorData?.length || 0,
            sponsorContributions,
            basePrize: totalPrize,
            totalPrizePool
        });
    }, [sponsorData?.length, sponsorContributions, totalPrize, totalPrizePool]);

    // Note: useSponsorsService automatically fetches data when hackathonId changes

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
