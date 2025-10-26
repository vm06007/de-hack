import { useState } from "react";
import Card from "@/components/Card";
import Switch from "@/components/Switch";
import Select from "@/components/Select";
import Button from "@/components/Button";

const projectSubmissionOptions = [
    { id: 1, name: "Any Time" },
    { id: 2, name: "Half Way" },
    { id: 3, name: "Last Day Only" },
];

type DemosProps = {
    onDeploy?: () => void;
    isLoading?: boolean;
};

const Demos = ({ onDeploy, isLoading }: DemosProps) => {
    const [allowJoinAnyTime, setAllowJoinAnyTime] = useState(false);
    const [requireApproval, setRequireApproval] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [projectSubmission, setProjectSubmission] = useState(projectSubmissionOptions[0]);

    return (
        <div className="card">
            <div 
                className="flex items-center h-12 pl-5 max-lg:pl-3 cursor-pointer" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="mr-auto text-h6">Extra Options</div>
                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            {isExpanded && (
                <div className="pt-3">
                    <div className="flex flex-col gap-6 p-3">
                        <Select
                            label="Project submission"
                            tooltip="When projects submission opens"
                            placeholder="Select submission timing"
                            value={projectSubmission}
                            onChange={setProjectSubmission}
                            options={projectSubmissionOptions}
                        />
                        <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-2xl">
                            <div>
                                <div className="text-body-2 font-medium">Allow to apply at any time</div>
                                <div className="text-caption text-t-secondary">
                                    Hackers can still apply after hackathon start
                                </div>
                            </div>
                            <Switch
                                checked={allowJoinAnyTime}
                                onChange={() => setAllowJoinAnyTime(!allowJoinAnyTime)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-b-surface1 rounded-2xl">
                            <div>
                                <div className="text-body-2 font-medium">Require application approval</div>
                                <div className="text-caption text-t-secondary">
                                    Hackers needs to be approved to join
                                </div>
                            </div>
                            <Switch
                                checked={requireApproval}
                                onChange={() => setRequireApproval(!requireApproval)}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="mt-4">
                <Button
                    className="w-full"
                    isBlack
                    onClick={onDeploy}
                    disabled={isLoading}
                >
                    {isLoading ? "Deploying..." : "Deploy Hackathon"}
                </Button>
            </div>
        </div>
    );
};

export default Demos;
