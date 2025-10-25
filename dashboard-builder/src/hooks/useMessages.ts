import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useMessages = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/messages');
                setData(result as any[]);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Fallback data
                setData([
                    {
                        id: 1,
                        sender: "Jordan Stojanovski",
                        avatar: "/images/avatars/jordan.jpeg",
                        content: "Hey! Are you participating in the ETHGlobal hackathon?",
                        timestamp: "2024-01-15T14:30:00Z",
                        unread: false
                    },
                    {
                        id: 2,
                        sender: "Comrade Kim",
                        avatar: "/images/avatars/kim.webp",
                        content: "Yes! I'm really excited about it. The prize pool is huge!",
                        timestamp: "2024-01-15T14:35:00Z",
                        unread: true
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
