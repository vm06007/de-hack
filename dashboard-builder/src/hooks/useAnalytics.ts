import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useAnalytics = () => {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/analytics/overview');
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Fallback data
                setData({
                    totalUsers: 0,
                    totalHackathons: 0,
                    totalApplications: 0,
                    metrics: {}
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
