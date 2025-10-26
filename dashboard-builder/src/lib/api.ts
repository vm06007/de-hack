const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
            // Add timeout for requests
            signal: AbortSignal.timeout(10000), // 10 second timeout
        };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`API request attempt ${attempt}/${retries} for ${endpoint}`);
                const response = await fetch(url, config);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const data = await response.json();
                console.log(`API request successful for ${endpoint}:`, data);
                return data;
            } catch (error) {
                console.error(`API request failed for ${endpoint} (attempt ${attempt}/${retries}):`, error);
                
                if (attempt === retries) {
                    // On final attempt, re-throw the error instead of returning empty data
                    throw error;
                }
                
                // Wait before retrying (exponential backoff)
                const delay = Math.pow(2, attempt - 1) * 1000;
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // This should never be reached due to the throw in the catch block
        throw new Error(`API request failed after ${retries} attempts`);
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing
export { ApiClient };