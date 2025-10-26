"use client";

import { use } from 'react';
import { notFound } from 'next/navigation';
import { useHackathon } from '@/src/hooks/useHackathons';
import OrgDetailsPage from '@/templates/Organizations/OrgDetailsPage';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function HackathonPage({ params }: PageProps) {
    const { id } = use(params);
    const { hackathon, loading, error, refetch } = useHackathon(id);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading hackathon...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">Failed to load hackathon</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => refetch?.()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!hackathon) {
        notFound();
    }

    return <OrgDetailsPage hackathon={hackathon} />;
}
