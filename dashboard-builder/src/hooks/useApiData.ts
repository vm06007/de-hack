import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

// Generic hook for API data
export const useApiData = (endpoint: string, fallback: any[] = []) => {
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get(endpoint);
                setData(result);
                setError(null);
            } catch (err) {
                console.error(`Failed to fetch ${endpoint}:`, err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setData(fallback);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};

// Specific hooks for common data
export const useHackathons = () => useApiData('/hackathons');
export const useUsers = () => useApiData('/users');
export const useOrganizations = () => useApiData('/organizations');
export const useAnalytics = () => useApiData('/analytics/overview');
export const useCountries = () => useApiData('/countries');
export const useFaqs = () => useApiData('/faqs');
export const useComments = () => useApiData('/comments');
export const useMessages = () => useApiData('/messages');
export const useNotifications = () => useApiData('/notifications');
export const useCompatibility = () => useApiData('/compatibility');
export const useTimeSlots = () => useApiData('/time-slots');
export const useAffiliateCenter = () => useApiData('/affiliate-center');
