"use client";

import Link from "next/link";
import Image from "next/image";

interface HackathonCardProps {
    hackathon: {
        id: number;
        title: string;
        image: string;
        startDate: string;
        endDate: string;
    };
}

const HackathonCard = ({ hackathon }: HackathonCardProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Link
            href={`/hackathon/${hackathon.id}`}
            className="group relative block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative shrink-0">
                        <Image
                            className="w-12 h-12 rounded-lg object-cover"
                            src={hackathon.image}
                            fallbackType="icon"
                            width={48}
                            height={48}
                            alt={hackathon.title}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {hackathon.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                        </p>
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                    <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </div>
            </div>
        </Link>
    );
};

export default HackathonCard;
