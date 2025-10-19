import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useCompatibility = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/compatibility');
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch compatibility data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Fallback data
                setData([
                    { id: 1, browser: "Chrome", version: "90+", supported: true, notes: "Fully supported", image: "/images/browsers/chrome.svg", title: "Chrome" },
                    { id: 2, browser: "Firefox", version: "88+", supported: true, notes: "Fully supported", image: "/images/browsers/firefox.svg", title: "Firefox" },
                    { id: 3, browser: "Safari", version: "14+", supported: true, notes: "Fully supported", image: "/images/browsers/safari.svg", title: "Safari" },
                    { id: 4, browser: "Edge", version: "90+", supported: true, notes: "Fully supported", image: "/images/browsers/edge.svg", title: "Edge" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};