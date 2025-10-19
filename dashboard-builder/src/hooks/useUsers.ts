import { useState, useEffect } from 'react';
import { api, type User, type ApiResponse } from '../lib/api';

export function useUsers(params?: {
    role?: string;
    page?: number;
    limit?: number;
    search?: string;
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<ApiResponse<User>['pagination']>();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getUsers(params);
                setUsers(response.data);
                setPagination(response.pagination);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [params?.role, params?.page, params?.limit, params?.search]);

    return { users, loading, error, pagination };
}

export function useUser(id: string) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getUser(id);
                setUser(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch user');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    return { user, loading, error };
}

export function useTopHackers(limit?: number) {
    const [hackers, setHackers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopHackers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getTopHackers(limit);
                setHackers(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch top hackers');
            } finally {
                setLoading(false);
            }
        };

        fetchTopHackers();
    }, [limit]);

    return { hackers, loading, error };
}
