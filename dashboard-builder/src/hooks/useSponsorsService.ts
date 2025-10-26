import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { Sponsor } from '@/types/sponsor';

interface ApiSponsor {
    id: number;
    hackathonId: number;
    companyName: string;
    contributionAmount: string;
    companyLogo?: string;
    prizeDistribution?: string;
    depositHook?: string;
    transactionHash?: string;
    sponsorAddress?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

// Transform API sponsor data to UI format for sponsors list page
const transformApiSponsorToUI = (apiSponsor: ApiSponsor): Sponsor => {
    return {
        id: apiSponsor.id,
        name: apiSponsor.companyName,
        company: apiSponsor.companyName,
        email: '', // Not available in API
        logo: apiSponsor.companyLogo || '/default-avatar.png',
        tier: 'Standard', // Default value
        totalContributions: parseFloat(apiSponsor.contributionAmount) || 0,
        hackathonsSponsored: 1, // Default value
        successRate: Math.abs(apiSponsor.companyName.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0)) % 100, // Deterministic based on company name
        categories: ['Technology', 'Innovation'], // Mock data
        location: 'Global', // Mock data
        joinDate: new Date(apiSponsor.createdAt).toISOString().split('T')[0],
        lastActive: new Date(apiSponsor.updatedAt).toISOString().split('T')[0],
        reputation: Math.floor(Math.random() * 100), // Mock data
        totalPrizeMoney: parseFloat(apiSponsor.contributionAmount) || 0,
        favoriteCategories: ['Technology'], // Mock data
        socialLinks: {
            website: apiSponsor.sponsorAddress || '',
            twitter: '',
            linkedin: '',
        },
        companyWebsite: apiSponsor.sponsorAddress || '',
    };
};


export const useSponsorsService = (hackathonId?: number) => {
    const [sponsors, setSponsors] = useState<ApiSponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchSponsors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const endpoint = hackathonId
                ? `/sponsors?hackathonId=${hackathonId}`
                : '/sponsors';

            console.log('useSponsorsService - Fetching from endpoint:', endpoint);
            const apiResponse = await apiClient.get(endpoint);
            console.log('useSponsorsService - API Response:', apiResponse);

            const sponsorsData = (apiResponse as any)?.sponsors;
            if (!sponsorsData || !Array.isArray(sponsorsData)) {
                console.log('useSponsorsService - No sponsors data found, setting empty array');
                setSponsors([]);
                return;
            }

            const apiSponsors: ApiSponsor[] = sponsorsData;
            console.log('useSponsorsService - API Sponsors count:', apiSponsors.length);

            // Return raw API data instead of transforming it
            // Limit to 5 sponsors
            const limitedSponsors = apiSponsors.slice(0, 5);
            console.log('useSponsorsService - Limited sponsors count:', limitedSponsors.length);

            setSponsors(limitedSponsors);
            setError(null); // Clear any previous errors on success
        } catch (err) {
            console.error('useSponsorsService - Error fetching sponsors:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sponsors';
            setError(errorMessage);
            setSponsors([]);
        } finally {
            setLoading(false);
        }
    }, [hackathonId]);

    useEffect(() => {
        fetchSponsors();
    }, [hackathonId]);

    // Expose fetchSponsors function for manual refresh
    const refreshSponsors = fetchSponsors;

    const createSponsor = async (sponsorData: {
        hackathonId: number;
        companyName: string;
        contributionAmount: string;
        companyLogo?: string;
        prizeDistribution?: string;
        depositHook?: string;
        transactionHash?: string;
        sponsorAddress?: string;
    }): Promise<ApiSponsor> => {
        try {
            setIsCreating(true);
            setError(null);

            console.log('Creating sponsor with data:', sponsorData);
            const response = await apiClient.post('/sponsors', sponsorData);
            console.log('Sponsor created successfully:', response);

            // Add the new sponsor to the local state
            const newSponsor = response as ApiSponsor;
            setSponsors(prev => [...prev, newSponsor]);

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('sponsorUpdated', {
                detail: {
                    action: 'created',
                    sponsor: newSponsor,
                    hackathonId: sponsorData.hackathonId
                }
            }));

            return newSponsor;
        } catch (err) {
            console.error('Error creating sponsor:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return {
        sponsors,
        loading,
        error,
        isCreating,
        createSponsor,
        refreshSponsors,
    };
};

// Aggregate sponsors by company name
const aggregateSponsorsByName = (sponsors: ApiSponsor[]): Sponsor[] => {
    const aggregated = new Map<string, {
        sponsors: ApiSponsor[];
        totalContributions: number;
        hackathonsSponsored: number;
    }>();

    // Group sponsors by company name
    sponsors.forEach(sponsor => {
        const companyName = sponsor.companyName;
        if (!aggregated.has(companyName)) {
            aggregated.set(companyName, {
                sponsors: [],
                totalContributions: 0,
                hackathonsSponsored: 0
            });
        }

        const group = aggregated.get(companyName)!;
        group.sponsors.push(sponsor);
        group.totalContributions += parseFloat(sponsor.contributionAmount) || 0;
        group.hackathonsSponsored += 1;
    });

    // Transform aggregated data to UI format
    return Array.from(aggregated.entries()).map(([companyName, data], index) => {
        const firstSponsor = data.sponsors[0];
        return {
            id: index + 1, // Generate new ID for aggregated sponsor
            name: companyName,
            company: companyName,
            email: '', // Not available in API
            logo: firstSponsor.companyLogo || '/default-avatar.png',
            tier: 'Standard', // Default value
            totalContributions: data.totalContributions,
            hackathonsSponsored: data.hackathonsSponsored,
            successRate: (() => {
                // Custom success rates for specific companies
                const customRates: { [key: string]: number } = {
                    'ETHGlobal': 52, // Swapped from 18 to 52
                    'Token 2049': 18, // Swapped from 52 to 18
                };

                // Return custom rate if defined, otherwise use deterministic calculation
                return customRates[companyName] ?? Math.abs(companyName.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0)) % 100;
            })(),
            categories: ['Technology', 'Innovation'], // Mock data
            location: 'Global', // Mock data
            joinDate: new Date(firstSponsor.createdAt).toISOString().split('T')[0],
            lastActive: new Date(Math.max(...data.sponsors.map(s => new Date(s.updatedAt).getTime()))).toISOString().split('T')[0],
            reputation: Math.floor(Math.random() * 100), // Mock data
            totalPrizeMoney: data.totalContributions,
            favoriteCategories: ['Technology'], // Mock data
            socialLinks: {
                website: (() => {
                    // Create website URLs based on company name
                    const websiteMap: { [key: string]: string } = {
                        'Bitcoin.com': 'https://bitcoin.com',
                        'ETHGlobal': 'https://ethglobal.com',
                        'Token 2049': 'https://token2049.com',
                        'Verse Token': 'https://verse.io',
                        'Test.com': 'https://test.com'
                    };

                    // Return mapped website or create a generic one
                    return websiteMap[companyName] || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
                })(),
                twitter: '',
                linkedin: '',
            },
            companyWebsite: (() => {
                // Create website URLs based on company name
                const websiteMap: { [key: string]: string } = {
                    'Bitcoin.com': 'https://bitcoin.com',
                    'ETHGlobal': 'https://ethglobal.com',
                    'Token 2049': 'https://token2049.com',
                    'Verse Token': 'https://verse.io',
                    'Test.com': 'https://test.com'
                };

                // Return mapped website or create a generic one
                return websiteMap[companyName] || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
            })(),
        };
    });
};

// Hook for sponsors list page that returns transformed data
export const useSponsorsList = (hackathonId?: number) => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = hackathonId
                    ? `/sponsors?hackathonId=${hackathonId}`
                    : '/sponsors';

                console.log('useSponsorsList - Fetching from endpoint:', endpoint);
                const apiResponse = await apiClient.get(endpoint);
                console.log('useSponsorsList - API Response:', apiResponse);

                const sponsorsData = (apiResponse as any)?.sponsors;
                if (!sponsorsData || !Array.isArray(sponsorsData)) {
                    console.log('useSponsorsList - No sponsors data found');
                    setSponsors([]);
                    return;
                }

                const apiSponsors: ApiSponsor[] = sponsorsData;
                console.log('useSponsorsList - API Sponsors count:', apiSponsors.length);

                // Group sponsors by name and aggregate data
                const aggregatedSponsors = aggregateSponsorsByName(apiSponsors);
                console.log('useSponsorsList - Aggregated sponsors count:', aggregatedSponsors.length);

                // Limit to first 5 unique sponsors
                const limitedSponsors = aggregatedSponsors.slice(0, 5);
                console.log('useSponsorsList - Limited sponsors count:', limitedSponsors.length);

                setSponsors(limitedSponsors);
            } catch (err) {
                console.error('useSponsorsList - Error fetching sponsors:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setSponsors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsors();
    }, [hackathonId]);

    return {
        sponsors,
        loading,
        error,
    };
};
