import { useState, useEffect, useCallback } from 'react';

export interface Sponsor {
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

export const useSponsors = (hackathonId?: number) => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSponsors = useCallback(async () => {
        if (!hackathonId) return;
        
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
            setSponsors(data.sponsors || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching sponsors:', err);
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

    // Remove automatic fetching to prevent infinite loops
    // Components should call fetchSponsors manually when needed

    return {
        sponsors,
        loading,
        error,
        fetchSponsors,
        createSponsor,
    };
};