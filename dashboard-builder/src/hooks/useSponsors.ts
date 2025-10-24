import { useState, useEffect, useCallback } from 'react';
import { Sponsor } from '@/types/sponsor';

export interface ApiSponsor {
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

// Transform API sponsor data to UI format
const transformApiSponsorToUI = (apiSponsor: ApiSponsor): Sponsor => {
    return {
        id: apiSponsor.id,
        name: apiSponsor.companyName,
        company: apiSponsor.companyName,
        email: '', // Not available in API
        logo: apiSponsor.companyLogo || '/default-avatar.png',
        tier: 'Standard', // Added 'tier' with a default value
        totalContributions: parseFloat(apiSponsor.contributionAmount) || 0,
        hackathonsSponsored: 1, // Default value
        successRate: Math.random() * 100, // Mock data
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

export const useSponsors = (hackathonId?: number) => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSponsors = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const url = hackathonId
                ? `http://localhost:5000/api/sponsors?hackathonId=${hackathonId}`
                : 'http://localhost:5000/api/sponsors';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
            }

            const data = await response.json();
            const apiSponsors: ApiSponsor[] = data.sponsors || [];
            const transformedSponsors = apiSponsors.map(transformApiSponsorToUI);
            setSponsors(transformedSponsors);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching sponsors:', err);
            // Set empty array on error to prevent undefined issues
            setSponsors([]);
        } finally {
            setLoading(false);
        }
    }, [hackathonId]);

    const createSponsor = async (sponsorData: {
        hackathonId: number;
        companyName: string;
        contributionAmount: string;
        companyLogo?: string;
        prizeDistribution?: string;
        depositHook?: string;
        transactionHash?: string;
        sponsorAddress?: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/sponsors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sponsorData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create sponsor: ${response.statusText}`);
            }

            const newSponsor = await response.json();
            setSponsors(prev => [...prev, newSponsor]);
            return newSponsor;
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating sponsor:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch sponsors on mount
    useEffect(() => {
        fetchSponsors();
    }, [fetchSponsors]);

    return {
        sponsors,
        loading,
        error,
        fetchSponsors,
        createSponsor,
    };
};