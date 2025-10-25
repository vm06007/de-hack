import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import Editor from "@/components/Editor";
import Button from "@/components/Button";
import Image from "@/components/Image";
import toast from "react-hot-toast";
import { useSponsors } from "@/src/hooks/useSponsors";
import { useSubmitProject, ProjectSubmissionData } from "@/src/hooks/useSubmitProject";
import CongratsScreen from "@/components/CongratsScreen";
import { useAccount } from "wagmi";

type ProjectSubmissionProps = {
    open: boolean;
    onClose: () => void;
    hackathon?: any;
    onSubmit?: (projectData: any) => void;
};

const ProjectSubmission = ({ open, onClose, hackathon, onSubmit }: ProjectSubmissionProps) => {
    const [projectName, setProjectName] = useState("");
    const [githubLink, setGithubLink] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [description, setDescription] = useState("");
    const [teamMembers, setTeamMembers] = useState("");
    const [projectImages, setProjectImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [applyForMainTrack, setApplyForMainTrack] = useState(true);
    const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

    // Get sponsors list for sponsor track selection
    const { sponsors: backendSponsors, loading: sponsorsLoading, fetchSponsors } = useSponsors(hackathon?.id);

    // Get wallet address for participant identification
    const { address } = useAccount();

    // Use the submit project hook
    const {
        submitProject,
        isLoading: isTransactionLoading,
        error: transactionError,
        showCongrats,
        projectId,
        closeCongrats
    } = useSubmitProject(hackathon?.contractAddress);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!open) {
            resetForm();
        } else {
            // Fetch sponsors when modal opens
            if (hackathon?.id && fetchSponsors) {
                console.log('Fetching sponsors for hackathon:', hackathon.id);
                fetchSponsors();
            }
        }
    }, [open, hackathon?.id]);

    // Debug sponsors data
    useEffect(() => {
        console.log('Project Submission - Sponsors data:', {
            backendSponsors,
            sponsorsLoading,
            hackathonId: hackathon?.id,
            sponsorsCount: backendSponsors?.length || 0
        });
    }, [backendSponsors, sponsorsLoading, hackathon?.id]);

    const resetForm = () => {
        setProjectName("");
        setGithubLink("");
        setDemoUrl("");
        setDescription("");
        setTeamMembers("");
        setProjectImages([]);
        setImagePreviews([]);
        setApplyForMainTrack(true);
        setSelectedSponsors([]);
        setValidationErrors({});
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length + projectImages.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        const newImages = [...projectImages, ...files];
        setProjectImages(newImages);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = projectImages.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        // Cleanup old preview URL
        URL.revokeObjectURL(imagePreviews[index]);

        setProjectImages(newImages);
        setImagePreviews(newPreviews);
    };

    const toggleSponsorSelection = (sponsorId: string) => {
        setSelectedSponsors(prev =>
            prev.includes(sponsorId)
                ? prev.filter(id => id !== sponsorId)
                : [...prev, sponsorId]
        );
    };

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!projectName.trim()) {
            errors.projectName = "Project name is required";
        }

        if (!githubLink.trim()) {
            errors.githubLink = "GitHub link is required";
        } else {
            // Basic GitHub URL validation
            const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
            if (!githubRegex.test(githubLink.trim())) {
                errors.githubLink = "Please enter a valid GitHub repository URL";
            }
        }

        if (!description.trim()) {
            errors.description = "Project description is required";
        }

        if (projectImages.length === 0) {
            errors.images = "At least one project screenshot is required";
        }

        if (!applyForMainTrack && selectedSponsors.length === 0) {
            errors.tracks = "Please select at least one track (main or sponsor)";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert images to base64
            const imageBase64Promises = projectImages.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });

            const imageBase64Array = await Promise.all(imageBase64Promises);

            // Create team members array from the team members string
            const teamMembersArray = teamMembers.trim()
                ? teamMembers.split(',').map(member => ({
                    name: member.trim(),
                    role: 'Team Member',
                    email: '',
                    github: ''
                }))
                : [];

            // Create selected tracks array
            const selectedTracks = [];
            if (applyForMainTrack) {
                selectedTracks.push(1); // Main track ID
            }
            selectedTracks.push(...selectedSponsors.map(id => parseInt(id)));

            // Create project data for backend API
            const fullProjectData: ProjectSubmissionData = {
                hackathonId: hackathon?.id,
                title: projectName.trim(),
                description: description,
                teamMembers: teamMembersArray,
                selectedTracks: selectedTracks,
                demoUrl: demoUrl.trim() || undefined, // Include demo URL if provided
                githubUrl: githubLink.trim(),
                images: imageBase64Array,
                technologies: [], // Could be extracted from description or added as a field
                submittedByName: address || "Anonymous", // Use wallet address or fallback
                participantAddress: address, // Wallet address of the submitter
                contractAddress: hackathon?.contractAddress // Hackathon contract address
            };

            console.log("Submitting project:", fullProjectData);

            // Submit to blockchain and backend
            await submitProject(
                projectName.trim(),
                githubLink.trim(),
                fullProjectData,
                (result) => {
                    console.log("Project submission successful:", result);
                    // The congrats screen will be shown automatically by the hook
                    // Don't close the modal here - let the congrats screen handle it
                }
            );

            // Don't close the modal here - keep it open during transaction
            // The modal will be closed when the congrats screen is closed

        } catch (error) {
            console.error("Failed to submit project:", error);
            toast.error("Failed to submit project. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <Modal
            open={open}
            onClose={onClose}
            classWrapper="max-w-3xl"
        >
            <div className="max-h-[80vh] overflow-y-auto">
                {!showCongrats ? (
                    <>
                        <h3 className="text-h4 mb-6">Submit Your Project</h3>

                <div className="space-y-6">
                    {/* Project Name */}
                    <div>
                        <Field
                            label="Project Name"
                            placeholder="Enter your project name"
                            value={projectName}
                            onChange={(e) => {
                                setProjectName(e.target.value);
                                if (validationErrors.projectName) {
                                    setValidationErrors(prev => ({ ...prev, projectName: '' }));
                                }
                            }}
                        />
                        {validationErrors.projectName && (
                            <div className="text-red-500 text-sm mt-1">{validationErrors.projectName}</div>
                        )}
                    </div>

                    {/* Project Demo */}
                    <div>
                        <Field
                            label="Project Demo"
                            placeholder="https://youtube.com/watch?v=..."
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                        />
                    </div>

                    {/* GitHub Link */}
                    <div>
                        <Field
                            label="GitHub Repository"
                            placeholder="https://github.com/username/repository"
                            value={githubLink}
                            onChange={(e) => {
                                setGithubLink(e.target.value);
                                if (validationErrors.githubLink) {
                                    setValidationErrors(prev => ({ ...prev, githubLink: '' }));
                                }
                            }}
                        />
                        {validationErrors.githubLink && (
                            <div className="text-red-500 text-sm mt-1">{validationErrors.githubLink}</div>
                        )}
                    </div>

                    {/*
                    <Field
                        label="Team Members (Optional)"
                        placeholder="@alice, @bob, @charlie (GitHub usernames or wallet addresses)"
                        value={teamMembers}
                        onChange={(e) => setTeamMembers(e.target.value)}
                    />*/}

                    {/* Project Description */}
                    <div>
                        <label className="block text-body-2 mb-2">Project Description</label>
                        <div className="text-caption text-t-secondary mb-3">
                            Describe your project, its features, and the problem it solves
                        </div>
                        <Editor
                            content={description}
                            onChange={(content) => {
                                setDescription(content);
                                if (validationErrors.description) {
                                    setValidationErrors(prev => ({ ...prev, description: '' }));
                                }
                            }}
                            className="min-h-32"
                        />
                        {validationErrors.description && (
                            <div className="text-red-500 text-sm mt-1">{validationErrors.description}</div>
                        )}
                    </div>

                    {/* Project Images */}
                    <div>
                        <label className="block text-body-2 mb-2">Project Screenshots</label>
                        <div className="text-caption text-t-secondary mb-3">
                            Upload up to 5 screenshots of your application (required)
                        </div>

                        {/* Image previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={preview}
                                            alt={`Screenshot ${index + 1}`}
                                            width={200}
                                            height={150}
                                            className="rounded-lg object-cover w-full h-32"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload button */}
                        {projectImages.length < 5 && (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="project-images-upload"
                                />
                                <label
                                    htmlFor="project-images-upload"
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-b-surface1 rounded-lg hover:bg-b-surface2 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    Upload Screenshots ({projectImages.length}/5)
                                </label>
                            </>
                        )}

                        {validationErrors.images && (
                            <div className="text-red-500 text-sm mt-1">{validationErrors.images}</div>
                        )}
                    </div>

                    {/* Track Selection */}
                    <div>
                        <label className="block text-body-2 mb-3">Select Tracks</label>

                        {/* Main Track */}
                        <div className="mb-4">
                            <label className="flex items-center gap-3 p-3 rounded-lg bg-b-surface1 cursor-pointer hover:bg-b-surface2 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={applyForMainTrack}
                                    onChange={(e) => setApplyForMainTrack(e.target.checked)}
                                    className="w-5 h-5 rounded"
                                />
                                <div>
                                    <div className="text-body-2 font-medium">Main Track</div>
                                    <div className="text-caption text-t-secondary">
                                        Compete for the main hackathon prizes
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Sponsor Tracks */}
                        {sponsorsLoading ? (
                            <div className="text-center py-4">
                                <div className="text-body-2 text-t-secondary">Loading sponsors...</div>
                            </div>
                        ) : backendSponsors && backendSponsors.length > 0 ? (
                            <div>
                                <div className="text-body-2 mb-2">Sponsor Tracks</div>
                                <div className="space-y-2">
                                    {backendSponsors.map((sponsor: any) => {
                                        console.log('Rendering sponsor:', sponsor);
                                        return (
                                            <label
                                                key={sponsor.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-b-surface1 cursor-pointer hover:bg-b-surface2 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSponsors.includes(sponsor.id.toString())}
                                                    onChange={() => toggleSponsorSelection(sponsor.id.toString())}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <div className="flex items-center gap-3 flex-1">
                                                    {(sponsor.logo || sponsor.companyLogo) && (
                                                        <Image
                                                            src={sponsor.logo || sponsor.companyLogo}
                                                            alt={sponsor.name || sponsor.companyName || 'Sponsor'}
                                                            width={32}
                                                            height={32}
                                                            className="rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-body-2 font-medium">
                                                            {sponsor.name || sponsor.companyName || 'Unknown Sponsor'}
                                                        </div>
                                                        <div className="text-caption text-t-secondary">
                                                            ${sponsor.totalContributions || sponsor.contributionAmount || '0'} in prizes
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-body-2 text-t-secondary">No sponsor tracks available</div>
                                <div className="text-caption text-t-secondary mt-1">Only main track is available for this hackathon</div>
                            </div>
                        )}

                        {validationErrors.tracks && (
                            <div className="text-red-500 text-sm mt-1">{validationErrors.tracks}</div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={onClose}
                            className="flex-1"
                            isStroke
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={isSubmitting || isTransactionLoading}
                        >
                            {isSubmitting || isTransactionLoading ? "Processing Transaction..." : "Submit Project"}
                        </Button>
                    </div>
                </div>
                    </>
                ) : (
                    /* Congrats Screen Content */
                    <div className="relative text-center py-8 px-6">
                        {/* Confetti Background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <Image
                                src="/images/confetti.png"
                                alt="Confetti"
                                width={400}
                                height={400}
                                className="absolute inset-0 w-full h-full object-cover opacity-60"
                            />
                        </div>

                        {/* Congrats Image */}
                        <div className="relative z-10 mb-6">
                            <Image
                                src="/images/congrats.png"
                                alt="Congratulations"
                                width={200}
                                height={200}
                                className="mx-auto"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <h2 className="text-h3 font-bold text-t-primary mb-4">
                                Congrats!
                            </h2>

                            <div className="text-body-1 text-t-secondary mb-2">
                                You've successfully submitted your project!
                            </div>

                            {projectName && (
                                <div className="text-body-2 text-t-primary font-medium mb-2">
                                    "{projectName}"
                                </div>
                            )}

                            <div className="text-caption text-t-secondary mb-6">
                                Your project is now under review by our judges.
                            </div>

                            {/* Project ID for reference */}
                            {projectId && (
                                <div className="text-caption text-t-secondary mb-6">
                                    Project ID: #{projectId}
                                </div>
                            )}

                            {/* Close Button */}
                            <Button
                                onClick={() => {
                                    closeCongrats();
                                    onClose();
                                }}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    </>
    );
};

export default ProjectSubmission;