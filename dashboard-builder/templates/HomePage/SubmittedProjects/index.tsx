import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import Card from "@/components/Card";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import ProjectJudgingModal from "@/components/ProjectJudgingModal";

import { useProjects, useHackathons } from "@/src/hooks/useApiData";

import "swiper/css";
import "swiper/css/navigation";

const SubmittedProjects = () => {
    const [isFirstSlide, setIsFirstSlide] = useState(true);
    const [isLastSlide, setIsLastSlide] = useState(false);
    const [transformedProjects, setTransformedProjects] = useState<any[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHackathon, setSelectedHackathon] = useState<string>("all");
    const { data: projects, loading, error } = useProjects();
    const { data: hackathons } = useHackathons();

    const handleSlideChange = (swiper: SwiperType) => {
        setIsFirstSlide(swiper.isBeginning);
        setIsLastSlide(swiper.progress >= 0.99);
    };

    const handleProjectClick = (project: any, index: number) => {
        setSelectedProject(project);
        setSelectedProjectIndex(index);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    const handleNextProject = () => {
        if (selectedProjectIndex < filteredProjects.length - 1) {
            const nextIndex = selectedProjectIndex + 1;
            setSelectedProjectIndex(nextIndex);
            setSelectedProject(filteredProjects[nextIndex]);
        }
    };

    const handlePrevProject = () => {
        if (selectedProjectIndex > 0) {
            const prevIndex = selectedProjectIndex - 1;
            setSelectedProjectIndex(prevIndex);
            setSelectedProject(filteredProjects[prevIndex]);
        }
    };

    const handleScoreSubmit = async (projectId: number, score: number) => {
        try {
            // Here you would call the API to submit the score
            console.log(`Submitting score ${score} for project ${projectId}`);
            // TODO: Implement API call to submit judge score
            alert(`Score ${score} submitted for project ${projectId}`);
        } catch (error) {
            console.error("Failed to submit score:", error);
            throw error;
        }
    };

    // Transform project data in useEffect to avoid hydration mismatch
    useEffect(() => {
        if (projects && Array.isArray(projects)) {
            const transformed = projects
                .sort((a, b) => b.id - a.id) // Sort by ID descending (highest ID first)
                .map((project) => {
                    // Map status to appropriate colors and display text
                    const statusColors = {
                        'submitted': 'label-green',
                        'under_review': 'label-yellow',
                        'approved': 'label-green',
                        'rejected': 'label-red'
                    };

                    const statusDisplay = {
                        'submitted': 'Ready',
                        'under_review': 'Ongoing',
                        'approved': 'Ready',
                        'rejected': 'Rejected'
                    };

                    // Get the first team member's info for avatar and name
                    const firstTeamMember = project.teamMembers && project.teamMembers.length > 0 ? project.teamMembers[0] : null;
                    const avatar = firstTeamMember?.github ? `https://github.com/${firstTeamMember.github}.png` : "/images/avatars/avatar-1.jpg";
                    // Truncate wallet address to 0x123...321 format
                    const truncateAddress = (address: any) => {
                        if (!address || typeof address !== 'string' || address.length < 10) return "0x0000...0000";
                        return `${address.slice(0, 5)}...${address.slice(-3)}`;
                    };
                    const submittedBy = truncateAddress(project.submittedBy) || "0x0000...0000";
                    const originalSubmittedBy = project.submittedBy; // Keep original full address

                    return {
                        id: project.id,
                        title: project.title || "Project Submission",
                        icon: "product-think",
                        backgroundImage: "linear-gradient(135deg, #3B82F6, #3B82F6CC)",
                        avatar: avatar,
                        time: project.createdAt ? (() => {
                            const date = new Date(project.createdAt);
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            const year = date.getFullYear();
                            return `${month}/${day}/${year}`;
                        })() : "Today",
                        status: statusDisplay[project.status as keyof typeof statusDisplay] || "Ready",
                        statusColor: statusColors[project.status as keyof typeof statusColors] || "label-green",
                        project: project,
                        submittedBy: submittedBy,
                        originalSubmittedBy: originalSubmittedBy, // Store original full address
                        hackathonId: project.hackathonId
                    };
                });
            setTransformedProjects(transformed);
        }
    }, [projects]);

    // Filter projects based on selected hackathon
    useEffect(() => {
        if (selectedHackathon === "all") {
            setFilteredProjects(transformedProjects);
        } else {
            const filtered = transformedProjects.filter(project =>
                project.hackathonId === parseInt(selectedHackathon)
            );
            setFilteredProjects(filtered);
        }
    }, [transformedProjects, selectedHackathon]);

    if (loading) {
        return <Card title="Submitted Projects"><div className="p-5">Loading projects...</div></Card>;
    }

    if (error) {
        return <Card title="Submitted Projects"><div className="p-5">Error loading projects: {error}</div></Card>;
    }

    return (
        <>
        <Card
            className="overflow-hidden"
            title="Submitted Projects"
            headContent={
                <div className="flex items-center gap-3">
                    {/* Hackathon Filter Dropdown */}
                    <select
                        value={selectedHackathon}
                        onChange={(e) => setSelectedHackathon(e.target.value)}
                        className="px-3 py-2 bg-b-surface2 border border-s-stroke2 rounded-lg text-t-primary focus:outline-none focus:border-blue-500 min-w-48"
                    >
                        <option value="all">All Hackathons</option>
                        {hackathons && Array.isArray(hackathons) && hackathons.map((hackathon) => (
                            <option key={hackathon.id} value={hackathon.id}>
                                {hackathon.title}
                            </option>
                        ))}
                    </select>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-1">
                        <Button
                            className="arrow-prev fill-t-secondary disabled:border-transparent disabled:fill-t-secondary rotate-180"
                            icon="arrow"
                            isCircle
                            isStroke
                        />
                        <Button
                            className="arrow-next fill-t-secondary disabled:border-transparent disabled:fill-t-secondary"
                            icon="arrow"
                            isStroke
                            isCircle
                        />
                    </div>
                </div>
            }
        >
            <div
                className={`relative p-5 pt-6 before:absolute before:-left-3 before:top-0 before:bottom-0 before:z-3 before:w-40 before:bg-linear-to-r before:from-b-surface2 before:to-transparent before:pointer-events-none before:transition-opacity after:absolute after:-right-3 after:top-0 after:bottom-0 after:z-10 after:w-40 after:bg-linear-to-l after:from-b-surface2 after:to-transparent after:pointer-events-none after:transition-opacity hover:before:opacity-0 hover:after:opacity-0 max-3xl:before:w-29 max-3xl:after:w-29 max-lg:before:w-25 max-lg:after:w-25 max-md:before:w-20 max-md:after:w-20 max-md:px-3 max-md:py-4 ${
                    isFirstSlide ? "before:opacity-0" : ""
                } ${isLastSlide ? "after:opacity-0" : ""}`}
            >
                <Swiper
                    slidesPerView={"auto"}
                    spaceBetween={16}
                    modules={[Navigation]}
                    navigation={{
                        nextEl: ".arrow-next",
                        prevEl: ".arrow-prev",
                    }}
                    onSlideChange={handleSlideChange}
                    onInit={handleSlideChange}
                    onProgress={handleSlideChange}
                    className="mySwiper !overflow-visible"
                >
                    {filteredProjects.map((project, index) => (
                        <SwiperSlide className="!w-51.5" key={project.id}>
                            <div
                                className="!flex flex-col !h-59 p-4.5 border border-s-stroke2 rounded-3xl bg-b-highlight transition-all hover:bg-b-surface2 hover:shadow-depth cursor-pointer"
                                onClick={() => handleProjectClick(project, index)}
                            >
                                <div
                                    className="flex justify-center items-center w-16 h-16 mb-auto rounded-full"
                                    style={{
                                        background: project.backgroundImage,
                                    }}
                                >
                                    <Icon
                                        className="size-6 opacity-100 fill-white"
                                        name={project.icon}
                                    />
                                </div>
                                <div className="mb-2 text-sub-title-1">
                                    {project.title}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="mr-auto text-caption text-t-tertiary">
                                        {project.time}
                                    </div>
                                    <div
                                        className={`inline-flex items-center h-5 px-1.5 rounded border text-caption leading-none capitalize ${project.statusColor}`}
                                    >
                                        {project.status}
                                    </div>
                                </div>
                                <div className="mt-2 text-caption text-t-tertiary">
                                    by {project.submittedBy}
                                </div>
                                <div className="mt-1 text-caption text-t-tertiary">
                                    {hackathons?.find(h => h.id === project.hackathonId)?.title || 'Unknown Hackathon'}
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </Card>

        {/* Project Judging Modal */}
        {selectedProject && (
            <ProjectJudgingModal
                open={isModalOpen}
                onClose={handleCloseModal}
                project={{
                    ...selectedProject.project,
                    participantAddress: selectedProject.originalSubmittedBy, // Use original full address
                    submittedBy: selectedProject.originalSubmittedBy // Use original full address
                }}
                onScore={handleScoreSubmit}
                onNextProject={handleNextProject}
                onPrevProject={handlePrevProject}
                hasNextProject={selectedProjectIndex < filteredProjects.length - 1}
                hasPrevProject={selectedProjectIndex > 0}
            />
        )}
    </>
    );
};

export default SubmittedProjects;
