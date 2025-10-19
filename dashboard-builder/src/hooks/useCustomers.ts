import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useCustomers = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/customers');
                setData(result.data || result);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch customers:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
