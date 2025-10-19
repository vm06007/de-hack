import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useNotifications = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/notifications');
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Fallback data
                setData([
                    {
                        id: 1,
                        type: "hackathon",
                        title: "New Hackathon Available",
                        content: "ETHGlobal Online 2025 is now open for registration!",
                        timestamp: "2024-01-15T09:00:00Z",
                        unread: true
                    },
                    {
                        id: 2,
                        type: "application",
                        title: "Application Status Update",
                        content: "Your application to Unite DeFi 2025 has been accepted!",
                        timestamp: "2024-01-14T16:30:00Z",
                        unread: false
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
