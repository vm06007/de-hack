"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useHackathons = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get('/hackathons');
                setData(result.data || result);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch hackathons:', err);
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

export const useHackathon = (id: string) => {
    const [hackathon, setHackathon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get(`/hackathons/${id}`);
                if (result) {
                    setHackathon(result);
                    setError(null);
                } else {
                    setError('Hackathon not found');
                    setHackathon(null);
                }
            } catch (err) {
                console.error('Failed to fetch hackathon:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setHackathon(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHackathon();
        }
    }, [id]);

    return { hackathon, loading, error };
};