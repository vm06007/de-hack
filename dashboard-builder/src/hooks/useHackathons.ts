import { useState, useEffect } from 'react';
import { api, type Hackathon, type ApiResponse } from '../lib/api';

export function useHackathons(params?: {
    status?: string;
    category?: string;
    isOnline?: boolean;
    page?: number;
    limit?: number;
}) {
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<ApiResponse<Hackathon>['pagination']>();

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getHackathons(params);
                setHackathons(response.data);
                setPagination(response.pagination);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch hackathons');
            } finally {
                setLoading(false);
            }
        };

        fetchHackathons();
    }, [params?.status, params?.category, params?.isOnline, params?.page, params?.limit]);

    return { hackathons, loading, error, pagination };
}

export function useHackathon(id: string) {
    const [hackathon, setHackathon] = useState<Hackathon | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getHackathon(id);
                setHackathon(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch hackathon');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHackathon();
        }
    }, [id]);

    return { hackathon, loading, error };
}
