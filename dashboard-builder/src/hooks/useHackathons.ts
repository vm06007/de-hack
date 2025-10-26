"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useHackathons = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching hackathons...');
            const result = await apiClient.get('/hackathons');
            console.log('Hackathons fetched successfully:', result);
            setData(result.data || result);
        } catch (err) {
            console.error('Failed to fetch hackathons:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hackathons';
            setError(errorMessage);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};

export const useHackathon = (id: string) => {
    const [hackathon, setHackathon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHackathon = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log(`Fetching hackathon ${id}...`);
            const result = await apiClient.get(`/hackathons/${id}`);
            console.log(`Hackathon ${id} fetched successfully:`, result);
            if (result) {
                setHackathon(result);
            } else {
                setError('Hackathon not found');
                setHackathon(null);
            }
        } catch (err) {
            console.error(`Failed to fetch hackathon ${id}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hackathon';
            setError(errorMessage);
            setHackathon(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchHackathon();
        }
    }, [id]);

    return { hackathon, loading, error, refetch: fetchHackathon };
};