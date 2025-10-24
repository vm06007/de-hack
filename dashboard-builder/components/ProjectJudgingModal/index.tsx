import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { useAccount } from "wagmi";

interface ProjectJudgingModalProps {
    open: boolean;
    onClose: () => void;
    project: {
        id: number;
        title: string;
        description: string;
        demoUrl?: string;
        githubUrl: string;
        images: string[];
        submittedBy?: string;
        submittedByName: string;
        ensName?: string;
        status: string;
        createdAt: string;
        hackathonId: number;
        judgeScores: Record<string, number>;
        totalScore: number;
    };
    onScore?: (projectId: number, score: number) => void;
}

const ProjectJudgingModal = ({ open, onClose, project, onScore }: ProjectJudgingModalProps) => {
    const [score, setScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'judge' | 'ai-agent'>('judge');
    const [aiMessage, setAiMessage] = useState('');
    const [delegateAddress, setDelegateAddress] = useState('');
    const [isDelegating, setIsDelegating] = useState(false);
    const { address } = useAccount();

    const handleScoreSubmit = async () => {
        if (score < 1 || score > 10) {
            alert("Please enter a score between 1 and 10");
            return;
        }

        setIsSubmitting(true);
        try {
            if (onScore) {
                await onScore(project.id, score);
            }
            onClose();
        } catch (error) {
            console.error("Failed to submit score:", error);
            alert("Failed to submit score. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'text-blue-500';
            case 'under_review': return 'text-yellow-500';
            case 'approved': return 'text-green-500';
            case 'rejected': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const handleAiDelegation = async () => {
        if (!delegateAddress) {
            alert("Please enter a delegate address");
            return;
        }

        setIsDelegating(true);
        try {
            // TODO: Implement AI delegation logic
            console.log(`Delegating voting to ${delegateAddress}`);
            alert(`Voting delegated to ${delegateAddress}`);
        } catch (error) {
            console.error("Failed to delegate voting:", error);
            alert("Failed to delegate voting. Please try again.");
        } finally {
            setIsDelegating(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} classWrapper="max-w-[67.5vw] w-full">
            <div className="h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-s-stroke2">
                    <div>
                        <h2 className="text-h3 font-bold">{project.title}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)} bg-opacity-20`}>
                                {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-t-secondary">
                                by {project.submittedByName}
                            </span>
                        </div>
                    </div>
                    <Button onClick={onClose} isStroke>
                        <Icon name="close" className="w-5 h-5" />
                    </Button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content Area - 50% */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Project Screenshots */}
                        {project.images && project.images.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-h6 font-semibold mb-2">Project Screenshots</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {project.images.slice(0, 4).map((image, index) => (
                                        <Image
                                            key={index}
                                            src={image}
                                            alt={`Project screenshot ${index + 1}`}
                                            width={200}
                                            height={120}
                                            className="rounded-lg w-full"
                                        />
                                    ))}
                                </div>
                                {project.images.length > 4 && (
                                    <div className="text-xs text-t-secondary mt-2 text-center">
                                        +{project.images.length - 4} more screenshots
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-4">
                            <h3 className="text-h6 font-semibold mb-2">Project Description</h3>
                            <div className="bg-b-surface2 rounded-lg p-3">
                                <textarea
                                    value={project.description}
                                    readOnly
                                    className="w-full h-20 px-2 py-1 border border-s-stroke2 rounded bg-b-surface2 text-t-primary resize-none text-sm"
                                    rows={5}
                                    placeholder="Project description will appear here..."
                                />
                            </div>
                        </div>

                        {/* Project Demo */}
                        <div className="mb-4">
                            <h3 className="text-h6 font-semibold mb-2">Project Demo</h3>
                            <div className="bg-b-surface2 rounded-lg p-3">
                                {project.demoUrl ? (
                                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                                        <Icon name="external-link" className="w-4 h-4" />
                                        <span className="text-sm font-medium truncate">{project.demoUrl}</span>
                                    </a>
                                ) : (
                                    <div className="text-sm text-t-secondary">No demo link provided</div>
                                )}
                            </div>
                        </div>

                        {/* GitHub Repository */}
                        <div className="mb-4">
                            <h3 className="text-h6 font-semibold mb-2">GitHub Repository</h3>
                            <div className="bg-b-surface2 rounded-lg p-3">
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                                    <Icon name="github" className="w-4 h-4" />
                                    <span className="text-sm font-medium truncate">{project.githubUrl}</span>
                                </a>
                            </div>
                        </div>


                        {/* Project Screenshots Gallery */}
                        <div className="mb-4">
                            <h3 className="text-h6 font-semibold mb-2">Project Screenshots</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <div key={index} className="aspect-square bg-b-surface2 rounded-lg border-2 border-s-stroke2 flex items-center justify-center">
                                        {project.images && project.images[index] ? (
                                            <Image
                                                src={project.images[index]}
                                                alt={`Project screenshot ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="rounded-lg w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <Icon name="image" className="w-6 h-6 text-t-secondary mx-auto mb-1" />
                                                <div className="text-xs text-t-secondary">Screenshot {index + 1}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'none' }} className="text-xs text-t-secondary mt-2 text-center">
                                {project.images ? `${project.images.length}/5 screenshots submitted` : "0/5 screenshots submitted"}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 50% */}
                    <div className="w-80 flex-1 border-l border-s-stroke2 bg-b-surface2 overflow-y-auto">
                        <div className="p-4">
                            {/* Tab Navigation */}
                            <div className="flex mb-4">
                                <button
                                    onClick={() => setActiveTab('judge')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-l-lg transition-colors ${
                                        activeTab === 'judge'
                                            ? 'bg-b-highlight text-t-primary'
                                            : 'bg-b-surface2 text-t-secondary hover:text-t-primary'
                                    }`}
                                >
                                    Judge
                                </button>
                                <button
                                    onClick={() => setActiveTab('ai-agent')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-r-lg transition-colors ${
                                        activeTab === 'ai-agent'
                                            ? 'bg-b-highlight text-t-primary'
                                            : 'bg-b-surface2 text-t-secondary hover:text-t-primary'
                                    }`}
                                >
                                    AI Agent
                                </button>
                            </div>

                            {/* Judge Tab */}
                            {activeTab === 'judge' && (
                                <div className="space-y-4">
                                    {/* Current Scores */}
                                    {Object.keys(project.judgeScores).length > 0 && (
                                        <div>
                                            <h4 className="text-h6 font-semibold mb-2">Current Scores</h4>
                                            <div className="space-y-1">
                                                {Object.entries(project.judgeScores).map(([judgeId, score]) => (
                                                    <div key={judgeId} className="flex justify-between items-center p-2 bg-b-surface2 rounded text-sm">
                                                        <span>Judge {judgeId}</span>
                                                        <span className="font-medium">{score}/10</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center p-2 bg-b-highlight rounded font-semibold text-sm">
                                                    <span>Total Score</span>
                                                    <span>{project.totalScore}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Your Score */}
                                    <div>
                                        <h4 className="text-h6 font-semibold mb-2">Your Score</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Score (1-10)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={score}
                                                    onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-s-stroke2 rounded bg-b-surface2 text-t-primary focus:outline-none focus:border-blue-500 text-sm"
                                                    placeholder="Enter score 1-10"
                                                />
                                            </div>

                                            <Button
                                                onClick={handleScoreSubmit}
                                                disabled={isSubmitting || score < 1 || score > 10}
                                                className="w-full text-sm"
                                            >
                                                {isSubmitting ? "Submitting..." : "Submit Score"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI Agent Tab */}
                            {activeTab === 'ai-agent' && (
                                <div className="space-y-4">
                                    {/* AI Chat */}
                                    <div>
                                        <h4 className="text-h6 font-semibold mb-2">AI Agent Chat</h4>
                                        <div className="space-y-2">
                                            <textarea
                                                value={aiMessage}
                                                onChange={(e) => setAiMessage(e.target.value)}
                                                placeholder="Ask AI agent about this project..."
                                                className="w-full h-40 px-2 py-1 border border-s-stroke2 rounded bg-b-surface2 text-t-primary focus:outline-none focus:border-blue-500 resize-y text-sm"
                                                rows={10}
                                            />
                                            <Button className="w-full text-sm" isStroke>
                                                Send to AI Agent
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Delegate Voting */}
                                    <div>
                                        <h4 className="text-h6 font-semibold mb-2">Delegate Voting</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Delegate Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={delegateAddress}
                                                    onChange={(e) => setDelegateAddress(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full px-2 py-1 border border-s-stroke2 rounded bg-b-surface2 text-t-primary focus:outline-none focus:border-blue-500 text-sm"
                                                />
                                            </div>

                                            <Button
                                                onClick={handleAiDelegation}
                                                disabled={isDelegating || !delegateAddress}
                                                className="w-full text-sm"
                                            >
                                                {isDelegating ? "Delegating..." : "Delegate to AI Agent"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Current Wallet */}
                                    <div className="p-2 bg-b-surface2 rounded">
                                        <div className="text-xs text-t-secondary mb-1">Your Wallet</div>
                                        <div className="font-mono text-xs text-t-primary break-all">
                                            {address || "Not connected"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectJudgingModal;
