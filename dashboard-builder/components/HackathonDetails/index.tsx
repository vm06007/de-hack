"use client";

import { useState, useEffect } from 'react';
import { Hackathon } from '@/lib/api';

interface HackathonDetailsProps {
    hackathon: Hackathon;
}

const HackathonDetails = ({ hackathon }: HackathonDetailsProps) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await api.getHackathonApplications(hackathon.id);
                setApplications(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [hackathon.id]);


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'concluded':
                return 'bg-gray-100 text-gray-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {hackathon.title}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hackathon.status)}`}>
                                {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                            </span>
                            <span className="text-gray-500">
                                {hackathon.category}
                            </span>
                            {hackathon.isOnline ? (
                                <span className="text-blue-600">🌐 Online</span>
                            ) : (
                                <span className="text-green-600">📍 {hackathon.location}</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                            ${parseFloat(hackathon.totalPrizePool).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Prize Pool</div>
                    </div>
                </div>

                {hackathon.image && (
                    <div className="mb-6">
                        <img 
                            src={hackathon.image} 
                            alt={hackathon.title}
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                )}

                {hackathon.description && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-3">Description</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {hackathon.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Dates */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-gray-500">Start Date</div>
                            <div className="font-medium">{formatDate(hackathon.startDate)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">End Date</div>
                            <div className="font-medium">{formatDate(hackathon.endDate)}</div>
                        </div>
                        {hackathon.registrationDeadline && (
                            <div>
                                <div className="text-sm text-gray-500">Registration Deadline</div>
                                <div className="font-medium">{formatDate(hackathon.registrationDeadline)}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Participants */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Participants</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-gray-500">Current Participants</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {hackathon.currentParticipants}
                            </div>
                        </div>
                        {hackathon.maxParticipants && (
                            <div>
                                <div className="text-sm text-gray-500">Max Participants</div>
                                <div className="font-medium">{hackathon.maxParticipants}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Requirements */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                    {hackathon.requirements.length > 0 ? (
                        <ul className="space-y-2">
                            {hackathon.requirements.map((requirement, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                    <span className="text-sm">{requirement}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No specific requirements</p>
                    )}
                </div>
            </div>

            {/* Tags */}
            {hackathon.tags.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {hackathon.tags.map((tag, index) => (
                            <span 
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Applications */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Applications</h3>
                    <p className="text-gray-500 text-sm">
                        {applications.length} applications received
                    </p>
                </div>
                
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading applications...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <p className="text-red-500">Error loading applications: {error}</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">No applications yet</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {applications.map((application: any) => (
                            <div key={application.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{application.hackerId}</div>
                                        <div className="text-sm text-gray-500">
                                            Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </span>
                                </div>
                                {application.motivation && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-700">{application.motivation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HackathonDetails;
