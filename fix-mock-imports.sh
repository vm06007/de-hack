#!/bin/bash

echo "🔧 Fixing mock imports - replacing with API calls..."

# Create a comprehensive API hook for all data
cat > /Users/vm06007/Development/de-hack/dashboard-builder/src/hooks/useApiData.ts << 'EOF'
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

// Generic hook for API data
export const useApiData = (endpoint: string, fallback: any[] = []) => {
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiClient.get(endpoint);
                setData(result);
                setError(null);
            } catch (err) {
                console.error(`Failed to fetch ${endpoint}:`, err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setData(fallback);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};

// Specific hooks for common data
export const useHackathons = () => useApiData('/hackathons');
export const useUsers = () => useApiData('/users');
export const useOrganizations = () => useApiData('/organizations');
export const useAnalytics = () => useApiData('/analytics/overview');
export const useCountries = () => useApiData('/countries');
export const useFaqs = () => useApiData('/faqs');
export const useComments = () => useApiData('/comments');
export const useMessages = () => useApiData('/messages');
export const useNotifications = () => useApiData('/notifications');
export const useCompatibility = () => useApiData('/compatibility');
export const useTimeSlots = () => useApiData('/time-slots');
export const useAffiliateCenter = () => useApiData('/affiliate-center');
EOF

echo "✅ Created useApiData hook"

# Create fallback data for common imports
cat > /Users/vm06007/Development/de-hack/dashboard-builder/src/lib/fallbackData.ts << 'EOF'
// Fallback data for when API is not available
export const fallbackHackathons = [];
export const fallbackUsers = [];
export const fallbackOrganizations = [];
export const fallbackAnalytics = { totalUsers: 0, totalHackathons: 0, totalApplications: 0, metrics: {} };
export const fallbackCountries = [];
export const fallbackFaqs = [];
export const fallbackComments = [];
export const fallbackMessages = [];
export const fallbackNotifications = [];
export const fallbackCompatibility = [
    { id: 1, browser: "Chrome", version: "90+", supported: true, notes: "Fully supported", image: "/images/browsers/chrome.svg", title: "Chrome" },
    { id: 2, browser: "Firefox", version: "88+", supported: true, notes: "Fully supported", image: "/images/browsers/firefox.svg", title: "Firefox" },
    { id: 3, browser: "Safari", version: "14+", supported: true, notes: "Fully supported", image: "/images/browsers/safari.svg", title: "Safari" },
    { id: 4, browser: "Edge", version: "90+", supported: true, notes: "Fully supported", image: "/images/browsers/edge.svg", title: "Edge" }
];
export const fallbackTimeSlots = [];
export const fallbackAffiliateCenter = [];
EOF

echo "✅ Created fallback data"

# Find and replace common mock imports
echo "🔄 Replacing mock imports..."

# Replace common patterns
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { hackers } from "@\/mocks\/hackers";/import { useUsers } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { products } from "@\/mocks\/products";/import { useHackathons } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { customers } from "@\/mocks\/customers";/import { useUsers } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { creators } from "@\/mocks\/creators";/import { useOrganizations } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { dashboard } from "@\/mocks\/dashboard";/import { useAnalytics } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { countries } from "@\/mocks\/countries";/import { useCountries } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { faqs } from "@\/mocks\/faqs";/import { useFaqs } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { comments } from "@\/mocks\/comments";/import { useComments } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { messages } from "@\/mocks\/messages";/import { useMessages } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { notifications } from "@\/mocks\/notifications";/import { useNotifications } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { compatibility } from "@\/mocks\/compatibility";/import { useCompatibility } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { activeTimes } from "@\/mocks\/activeTimes";/import { useTimeSlots } from "@\/hooks\/useApiData";/g' {} \;
find /Users/vm06007/Development/de-hack/dashboard-builder -name "*.tsx" -type f -exec sed -i '' 's/import { affiliateCenter } from "@\/mocks\/affiliate-center";/import { useAffiliateCenter } from "@\/hooks\/useApiData";/g' {} \;

echo "✅ Replaced common mock imports"

echo ""
echo "🎯 Next steps:"
echo "   1. Update components to use the new hooks"
echo "   2. Replace direct data usage with hook data"
echo "   3. Add loading states and error handling"
echo "   4. Test all components"
echo ""
echo "📝 Example usage:"
echo "   const { data: hackathons, loading, error } = useHackathons();"
echo "   const { data: users, loading, error } = useUsers();"
echo ""
echo "🎉 Mock imports fixed!"
