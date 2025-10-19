const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Hackathons
    async getHackathons(params?: {
        status?: string;
        category?: string;
        isOnline?: boolean;
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/hackathons?${searchParams.toString()}`);
    }

    async getHackathon(id: string) {
        return this.request(`/hackathons/${id}`);
    }

    async createHackathon(data: any) {
        return this.request('/hackathons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateHackathon(id: string, data: any) {
        return this.request(`/hackathons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteHackathon(id: string) {
        return this.request(`/hackathons/${id}`, {
            method: 'DELETE',
        });
    }

    async getHackathonApplications(hackathonId: string, params?: {
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/hackathons/${hackathonId}/applications?${searchParams.toString()}`);
    }

    async applyToHackathon(hackathonId: string, data: any) {
        return this.request(`/hackathons/${hackathonId}/applications`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateApplicationStatus(hackathonId: string, applicationId: string, data: any) {
        return this.request(`/hackathons/${hackathonId}/applications/${applicationId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async addPrizeToHackathon(hackathonId: string, data: any) {
        return this.request(`/hackathons/${hackathonId}/prizes`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async addWinnerToHackathon(hackathonId: string, data: any) {
        return this.request(`/hackathons/${hackathonId}/winners`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async trackHackathonAnalytics(hackathonId: string, data: any) {
        return this.request(`/hackathons/${hackathonId}/analytics`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Users
    async getUsers(params?: {
        role?: string;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/users?${searchParams.toString()}`);
    }

    async getUser(id: string) {
        return this.request(`/users/${id}`);
    }

    async createUser(data: any) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateUser(id: string, data: any) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async getUserStats(id: string) {
        return this.request(`/users/${id}/stats`);
    }

    async getTopHackers(limit?: number) {
        const searchParams = new URLSearchParams();
        if (limit) {
            searchParams.append('limit', limit.toString());
        }
        return this.request(`/users/top/hackers?${searchParams.toString()}`);
    }

    async trackUserAnalytics(userId: string, data: any) {
        return this.request(`/users/${userId}/analytics`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Organizations
    async getOrganizations(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/organizations?${searchParams.toString()}`);
    }

    async getOrganization(identifier: string) {
        return this.request(`/organizations/${identifier}`);
    }

    async createOrganization(data: any) {
        return this.request('/organizations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateOrganization(id: string, data: any) {
        return this.request(`/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteOrganization(id: string) {
        return this.request(`/organizations/${id}`, {
            method: 'DELETE',
        });
    }

    async getOrganizationHackathons(id: string, params?: {
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/organizations/${id}/hackathons?${searchParams.toString()}`);
    }

    async getOrganizationStats(id: string) {
        return this.request(`/organizations/${id}/stats`);
    }

    // Analytics
    async getAnalyticsOverview(params?: {
        startDate?: string;
        endDate?: string;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/analytics/overview?${searchParams.toString()}`);
    }

    async getEntityAnalytics(type: string, id: string, params?: {
        metric?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/analytics/entity/${type}/${id}?${searchParams.toString()}`);
    }

    async getAnalyticsTrends(params?: {
        metric?: string;
        entityType?: string;
        days?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/analytics/trends?${searchParams.toString()}`);
    }

    async getTopEntitiesByMetric(metric: string, params?: {
        entityType?: string;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }
        return this.request(`/analytics/top/${metric}?${searchParams.toString()}`);
    }

    async trackAnalytics(data: any) {
        return this.request('/analytics/track', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDashboardAnalytics(userId: string) {
        return this.request(`/analytics/dashboard?userId=${userId}`);
    }
}

// Create and export the API client instance
export const api = new ApiClient(API_BASE_URL);

// Export types for use in components
export type ApiResponse<T> = {
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

export type Hackathon = {
    id: string;
    title: string;
    description?: string;
    image?: string;
    category: string;
    status: 'draft' | 'active' | 'concluded' | 'scheduled';
    startDate: string;
    endDate: string;
    registrationDeadline?: string;
    totalPrizePool: string;
    maxParticipants?: number;
    currentParticipants: number;
    requirements: string[];
    tags: string[];
    isOnline: boolean;
    location?: string;
    organizerId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

export type User = {
    id: string;
    email: string;
    username: string;
    name: string;
    avatar?: string;
    role: 'hacker' | 'organizer' | 'admin';
    location?: string;
    joinDate: string;
    lastActive: string;
    reputation: string;
    totalEarnings: string;
    participationCount: number;
    hackathonsWon: number;
    skills: string[];
    favoriteCategories: string[];
    socialLinks: {
        github?: string;
        twitter?: string;
        linkedin?: string;
    };
    createdAt: string;
    updatedAt: string;
};

export type Organization = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    socialLinks: {
        twitter?: string;
        linkedin?: string;
        discord?: string;
    };
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};
