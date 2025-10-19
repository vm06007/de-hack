"use client";

import { notFound } from 'next/navigation';
import { useHackathon } from '@/src/hooks/useHackathons';
import HackathonDetails from '@/components/HackathonDetails';

interface PageProps {
    params: {
        id: string;
    };
}

export default function HackathonPage({ params }: PageProps) {
    const { hackathon, loading, error } = useHackathon(params.id);

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

    if (error || !hackathon) {
        notFound();
    }

    return <HackathonDetails hackathon={hackathon} />;
}
