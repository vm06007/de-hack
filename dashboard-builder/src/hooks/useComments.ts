import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useComments = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/comments');
                setData(result as any[]);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch comments:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Fallback data
                setData([
                    {
                        id: 1,
                        author: "Jordan Stojanovski",
                        avatar: "/images/avatars/jordan.jpeg",
                        content: "Great hackathon! Looking forward to participating.",
                        timestamp: "2024-01-15T10:30:00Z",
                        likes: 12,
                        replies: [
                            {
                                id: 1,
                                author: "Comrade Kim",
                                avatar: "/images/avatars/kim.webp",
                                content: "Same here! The prizes look amazing.",
                                timestamp: "2024-01-15T11:00:00Z",
                                likes: 5
                            }
                        ]
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
