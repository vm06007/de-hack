import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "@/components/Image";

type CongratsScreenProps = {
    open: boolean;
    onClose: () => void;
    projectName?: string;
    projectId?: number;
};

const CongratsScreen = ({ open, onClose, projectName, projectId }: CongratsScreenProps) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (open) {
            // Trigger confetti animation after a short delay
            const timer = setTimeout(() => {
                setShowConfetti(true);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            classWrapper="max-w-md"
        >
            <div className="relative text-center py-8 px-6">
                {/* Confetti Background */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                            src="/images/confetti.png"
                            alt="Confetti"
                            width={400}
                            height={400}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                    </div>
                )}

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
                        onClick={onClose}
                        className="w-full"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CongratsScreen;
