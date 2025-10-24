import { useState, useEffect } from "react";
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
    onNextProject?: () => void;
    onPrevProject?: () => void;
    hasNextProject?: boolean;
    hasPrevProject?: boolean;
}

const ProjectJudgingModal = ({
    open,
    onClose,
    project,
    onScore,
    onNextProject,
    onPrevProject,
    hasNextProject = false,
    hasPrevProject = false
}: ProjectJudgingModalProps) => {
    // Utility function to filter out invalid image URLs
    const getValidImages = (images: string[]) => {
        return images.filter(image =>
            image &&
            !image.includes('example.com') &&
            !image.includes('picsum.photos') &&
            !image.includes('via.placeholder.com') &&
            !image.includes('localhost') &&
            (image.startsWith('http') || image.startsWith('/'))
        );
    };
    const [score, setScore] = useState(1.0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'judge' | 'scanner' | 'ai-agent'>('judge');
    const [aiMessage, setAiMessage] = useState('');
    const [delegateAddress, setDelegateAddress] = useState('');
    const [isDelegating, setIsDelegating] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<any>(null);
    const [isRulesExpanded, setIsRulesExpanded] = useState(false);
    const [isScannerExpanded, setIsScannerExpanded] = useState(false);
    const { address } = useAccount();

    // Reset scan results when project changes
    useEffect(() => {
        setScanResults(null);
    }, [project.id]);

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

    const handleScan = async () => {
        setIsScanning(true);
        try {
            // Simulate scanning process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Deterministic results based on project ID
            const projectId = project.id;
            let mockResults;

            switch (projectId) {
                case 1:
                    mockResults = {
                        authenticity: 'green',
                        plagiarism: 'green',
                        aiDetection: 'green',
                        geniusLevel: 8,
                        duplicateFound: false,
                        duplicateRepo: '',
                        flags: []
                    };
                    break;
                case 2:
                    mockResults = {
                        authenticity: 'green',
                        plagiarism: 'red',
                        aiDetection: 'green',
                        geniusLevel: 5,
                        duplicateFound: true,
                        duplicateRepo: 'https://github.com/example/duplicate-project',
                        flags: [
                            'High AI usage detected',
                            'Possible code reuse',
                            'Similar project found'
                        ]
                    };
                    break;
                case 3:
                    mockResults = {
                        authenticity: 'green',
                        plagiarism: 'green',
                        aiDetection: 'red',
                        geniusLevel: 6,
                        duplicateFound: false,
                        duplicateRepo: '',
                        flags: [
                            'High AI usage detected',
                            'Generated content detected'
                        ]
                    };
                    break;
                case 4:
                    mockResults = {
                        authenticity: 'red',
                        plagiarism: 'green',
                        aiDetection: 'green',
                        geniusLevel: 4,
                        duplicateFound: true,
                        duplicateRepo: 'https://github.com/example/suspicious-project',
                        flags: [
                            'Suspicious code patterns',
                            'Unusual development timeline'
                        ]
                    };
                    break;
                case 5:
                    mockResults = {
                        authenticity: 'red',
                        plagiarism: 'red',
                        aiDetection: 'red',
                        geniusLevel: 3,
                        duplicateFound: true,
                        duplicateRepo: 'https://github.com/example/multiple-issues',
                        flags: [
                            'High AI usage detected',
                            'Possible code reuse',
                            'Suspicious code patterns',
                            'Generated content detected',
                            'Similar project found'
                        ]
                    };
                    break;
                case 6:
                    mockResults = {
                        authenticity: 'green',
                        plagiarism: 'green',
                        aiDetection: 'green',
                        geniusLevel: 9,
                        duplicateFound: false,
                        duplicateRepo: '',
                        flags: []
                    };
                    break;
                default:
                    mockResults = {
                        authenticity: 'green',
                        plagiarism: 'green',
                        aiDetection: 'green',
                        geniusLevel: 7,
                        duplicateFound: false,
                        duplicateRepo: '',
                        flags: []
                    };
            }

            setScanResults(mockResults);
        } catch (error) {
            console.error("Scan failed:", error);
            alert("Scan failed. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <>
        <style jsx>{`
            .slider::-webkit-slider-thumb {
                appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #3B82F6;
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .slider::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #3B82F6;
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
        `}</style>
        <Modal open={open} onClose={onClose} classWrapper="max-w-[67.5vw] w-full !p-0">
            <div className="h-[80vh] flex rounded-2xl overflow-hidden">
                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content Area - 50% */}
                    <div className="flex-1 overflow-y-auto p-8 rounded-l-2xl">
                        {/* Project Header */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-h4 font-bold">{project.title}</h2>
                                <div className="flex items-center gap-2 relative z-10">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Previous clicked', { hasPrevProject, onPrevProject });
                                            if (onPrevProject) onPrevProject();
                                        }}
                                        disabled={!hasPrevProject}
                                        className={`p-2 rounded-lg transition-colors relative z-10 ${
                                            hasPrevProject
                                                ? 'bg-b-surface2 hover:bg-b-surface1 text-t-primary cursor-pointer hover:scale-105'
                                                : 'bg-b-surface2 text-t-secondary cursor-not-allowed'
                                        }`}
                                        title="Previous Project"
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        <Icon name="chevron" className="w-4 h-4 rotate-90 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Next clicked', { hasNextProject, onNextProject });
                                            if (onNextProject) onNextProject();
                                        }}
                                        disabled={!hasNextProject}
                                        className={`p-2 rounded-lg transition-colors relative z-10 ${
                                            hasNextProject
                                                ? 'bg-b-surface2 hover:bg-b-surface1 text-t-primary cursor-pointer hover:scale-105'
                                                : 'bg-b-surface2 text-t-secondary cursor-not-allowed'
                                        }`}
                                        title="Next Project"
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        <Icon name="chevron" className="w-4 h-4 -rotate-90 text-white" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)} bg-opacity-20`}>
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-t-secondary">
                                    SUBMITTED by {project.submittedByName}
                                </span>
                            </div>
                        </div>

                        {/* Project Screenshots */}
                        {project.images && getValidImages(project.images).length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-h6 font-semibold mb-2">Project Screenshots</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {getValidImages(project.images)
                                        .slice(0, 4)
                                        .map((image, index) => (
                                        <Image
                                            key={index}
                                            src={image}
                                            alt={`Project screenshot ${index + 1}`}
                                            width={200}
                                            height={120}
                                            className="rounded-lg w-full"
                                            onError={(e) => {
                                                console.warn(`Failed to load image: ${image}`);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ))}
                                </div>
                                {getValidImages(project.images).length > 4 && (
                                    <div className="text-xs text-t-secondary mt-2 text-center">
                                        +{getValidImages(project.images).length - 4} more screenshots
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
                                        {project.images && project.images[index] && getValidImages([project.images[index]]).length > 0 ? (
                                            <Image
                                                src={project.images[index]}
                                                alt={`Project screenshot ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="rounded-lg w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.warn(`Failed to load image: ${project.images[index]}`);
                                                    e.currentTarget.style.display = 'none';
                                                }}
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
                                {project.images ? `${getValidImages(project.images).length}/5 screenshots submitted` : "0/5 screenshots submitted"}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 50% */}
                    <div className="w-80 flex-1 border-l border-s-stroke2 bg-b-surface2 overflow-y-auto h-full rounded-r-2xl">
                        <div className="p-8">
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
                                    onClick={() => setActiveTab('scanner')}
                                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                                        activeTab === 'scanner'
                                            ? 'bg-b-highlight text-t-primary'
                                            : 'bg-b-surface2 text-t-secondary hover:text-t-primary'
                                    }`}
                                >
                                    Scanner
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
                                    {/* Judging Rules */}
                                    <div className="bg-b-surface1 rounded-lg border border-s-stroke2">
                                        <button
                                            onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-b-surface2 transition-colors"
                                        >
                                            <span className="text-t-primary font-medium">Judging Rules & Info</span>
                                            <Icon
                                                name="chevron"
                                                className={`w-4 h-4 text-t-secondary transition-transform ${
                                                    isRulesExpanded ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        {isRulesExpanded && (
                                            <div className="px-4 pb-4 border-t border-s-stroke2">
                                                <div className="space-y-2 text-sm pt-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-t-secondary">Hackathon:</span>
                                                        <span className="text-t-primary font-medium">DeFi Innovation Challenge</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-t-secondary">Submitted Projects:</span>
                                                        <span className="text-t-primary font-medium">12 projects</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-t-secondary">Remaining Points:</span>
                                                        <span className="text-t-primary font-medium">85/100 points</span>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-s-stroke2">
                                                        <div className="text-t-secondary text-xs">
                                                            <strong className="text-t-primary">Scoring Rules:</strong>
                                                        </div>
                                                        <div className="text-t-secondary text-xs mt-1">
                                                            • Total budget: 100 points
                                                        </div>
                                                        <div className="text-t-secondary text-xs">
                                                            • Max 10 points per project
                                                        </div>
                                                        <div className="text-t-secondary text-xs">
                                                        •  Unused points are forfeited
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Current Scores */}
                                    {Object.keys(project.judgeScores).length > 0 && (
                                        <div>
                                            <h4 className="text-h6 font-semibold mb-2">Current Scores</h4>
                                            <div className="space-y-1">
                                                {Object.entries(project.judgeScores).map(([judgeId, judgeData]) => {
                                                    // Handle both old format (number) and new format (object with scores)
                                                    const score = typeof judgeData === 'number'
                                                        ? judgeData
                                                        : judgeData.scores
                                                            ? Object.values(judgeData.scores).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(judgeData.scores).length
                                                            : 0;

                                                    return (
                                                        <div key={judgeId} className="flex justify-between items-center p-2 bg-b-surface2 rounded text-sm">
                                                            <span>Judge {judgeId}</span>
                                                            <span className="font-medium">{Math.round(score * 10) / 10}/10</span>
                                                        </div>
                                                    );
                                                })}
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
                                            {/* Star Rating Display */}
                                            <div className="flex justify-center gap-1 mb-3">
                                                {Array.from({ length: 10 }, (_, index) => {
                                                    const starNumber = index + 1;
                                                    const isActive = starNumber <= Math.round(score);

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="w-5 h-5 transition-all duration-200 cursor-pointer hover:scale-110"
                                                            style={{
                                                                filter: isActive
                                                                    ? 'contrast(0) hue-rotate(-45deg) sepia(1) brightness(1.5)'
                                                                    : 'grayscale(100%) brightness(0.5)'
                                                            }}
                                                            onClick={() => setScore(starNumber)}
                                                        >
                                                            <Icon
                                                                name="star-fill"
                                                                className="w-5 h-5"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Input Field */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Score (1-10)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={Math.round(score)}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 1;
                                                        setScore(Math.max(1, Math.min(10, value)));
                                                    }}
                                                    className="w-full px-3 py-2 border border-s-stroke2 rounded-lg bg-b-surface2 text-t-primary focus:outline-none focus:border-blue-500 text-center text-lg font-semibold"
                                                />
                                            </div>

                                            {/* Slider */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Adjust Score
                                                </label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    step="0.1"
                                                    value={score}
                                                    onChange={(e) => setScore(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-b-surface2 rounded-lg appearance-none cursor-pointer slider"
                                                    style={{
                                                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(score - 1) * 11.11}%, #374151 ${(score - 1) * 11.11}%, #374151 100%)`
                                                    }}
                                                />
                                                <div className="flex justify-between text-xs text-t-secondary mt-1">
                                                    <span>1</span>
                                                    <span>5</span>
                                                    <span>10</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Submit Button - Outside collapsible area */}
                                    <div className="mt-6">
                                        <Button
                                            onClick={handleScoreSubmit}
                                            disabled={isSubmitting || score < 1 || score > 10}
                                            className="w-full text-sm"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Score"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Scanner Tab */}
                            {activeTab === 'scanner' && (
                                <div className="space-y-4">
                                    {/* Scanner Description - Collapsible */}
                                    <div className="bg-b-surface1 rounded-lg border border-s-stroke2">
                                        <button
                                            onClick={() => setIsScannerExpanded(!isScannerExpanded)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-b-surface2 transition-colors"
                                        >
                                            <span className="text-t-primary font-medium">Project Scanner</span>
                                            <Icon
                                                name="chevron"
                                                className={`w-4 h-4 text-t-secondary transition-transform ${
                                                    isScannerExpanded ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        {isScannerExpanded && (
                                            <div className="px-4 pb-4 border-t border-s-stroke2">
                                                <div className="pt-4">
                                                    <p className="text-sm text-t-secondary mb-4">
                                                        Perform quick scan to check authenticity of the project and detect signs of plagiarism or previously submitted projects.
                                                    </p>
                                                    <div className="mb-4">
                                                        <div className="text-xs text-t-secondary mb-2">Scan Features:</div>
                                                        <div className="space-y-1 text-xs text-t-secondary">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                                <span>Authenticity verification</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                                <span>Plagiarism detection</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                                <span>AI usage & mock data</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                                <span>Genius level assessment</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scan Button - Outside collapsible area */}
                                    <div>
                                        <Button
                                            onClick={handleScan}
                                            disabled={isScanning}
                                            className="w-full text-sm mb-4"
                                        >
                                            {isScanning ? "Scanning..." : "Start Scan"}
                                        </Button>
                                    </div>

                                    {/* Scan Results */}
                                    {scanResults && (
                                        <div className="space-y-6 mt-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-t-primary">Scan Results</h3>
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                                    scanResults.authenticity === 'green' && scanResults.plagiarism === 'green'
                                                        ? 'bg-green-500/20 text-green-500'
                                                        : 'bg-red-500/20 text-red-500'
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        scanResults.authenticity === 'green' && scanResults.plagiarism === 'green'
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }`}></div>
                                                    {scanResults.authenticity === 'green' && scanResults.plagiarism === 'green'
                                                        ? 'All Checks Passed'
                                                        : 'Issues Detected'}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Authenticity */}
                                                <div className="flex items-center justify-between py-3 border-b border-b-surface1">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            scanResults.authenticity === 'green' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></div>
                                                        <span className="text-t-primary font-medium">Authenticity</span>
                                                    </div>
                                                    <div className={`text-sm font-medium ${
                                                        scanResults.authenticity === 'green' ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {scanResults.authenticity === 'green' ? 'PASS' : 'FAIL'}
                                                    </div>
                                                </div>

                                                {/* Plagiarism */}
                                                <div className="flex items-center justify-between py-3 border-b border-b-surface1">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            scanResults.plagiarism === 'green' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></div>
                                                        <span className="text-t-primary font-medium">Plagiarism</span>
                                                    </div>
                                                    <div className={`text-sm font-medium ${
                                                        scanResults.plagiarism === 'green' ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {scanResults.plagiarism === 'green' ? 'PASS' : 'DETECTED'}
                                                    </div>
                                                </div>

                                                {/* AI Detection */}
                                                <div className="flex items-center justify-between py-3 border-b border-b-surface1">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            scanResults.aiDetection === 'green' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></div>
                                                        <span className="text-t-primary font-medium">AI Detection</span>
                                                    </div>
                                                    <div className={`text-sm font-medium ${
                                                        scanResults.aiDetection === 'green' ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {scanResults.aiDetection === 'green' ? 'LOW' : 'HIGH'}
                                                    </div>
                                                </div>

                                                {/* Genius Level */}
                                                <div className="flex items-center justify-between py-3 border-b border-b-surface1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                        <span className="text-t-primary font-medium">Genius Level</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-t-primary font-medium">
                                                            {scanResults.geniusLevel}/10
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {Array.from({ length: 10 }, (_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                                        i < scanResults.geniusLevel ? 'bg-yellow-400' : 'bg-b-surface1'
                                                                    }`}
                                                                ></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Flags */}
                                            {scanResults.flags.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-t-primary font-medium">Flags</h4>
                                                    <div className="space-y-2">
                                                        {scanResults.flags.map((flag, index) => (
                                                            <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                                {flag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Duplicate Detection */}
                                            {scanResults.duplicateFound && (
                                                <div className="space-y-3">
                                                    <h4 className="text-t-primary font-medium">Possible Duplicate Found</h4>
                                                    <div className="text-sm text-red-400 mb-2">
                                                        Similar project detected - needs manual review
                                                    </div>
                                                    <a
                                                        href={scanResults.duplicateRepo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                                                    >
                                                        {scanResults.duplicateRepo}
                                                    </a>
                                                </div>
                                            )}

                                            {/* Scan Summary */}
                                            <div className="space-y-3">
                                                <h4 className="text-t-primary font-medium">Scan Summary</h4>
                                                <div className="text-sm text-t-secondary">
                                                    {scanResults.authenticity === 'green' && scanResults.plagiarism === 'green'
                                                        ? 'Project appears authentic with no major issues detected.'
                                                        : 'Project requires manual review due to detected issues.'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
        </>
    );
};

export default ProjectJudgingModal;
