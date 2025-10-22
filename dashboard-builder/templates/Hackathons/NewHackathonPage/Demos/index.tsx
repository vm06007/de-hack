import { useState } from "react";
import Card from "@/components/Card";
import Switch from "@/components/Switch";
import Select from "@/components/Select";

const projectSubmissionOptions = [
    { id: 1, name: "Any Time" },
    { id: 2, name: "Half Way" },
    { id: 3, name: "Last Day Only" },
];

const Demos = () => {
    const [allowJoinAnyTime, setAllowJoinAnyTime] = useState(false);
    const [projectSubmission, setProjectSubmission] = useState(projectSubmissionOptions[0]);

    return (
        <Card classHead="!pl-3" title="Extra Options">
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
                        <div className="text-body-2 font-medium">Allow to join any time</div>
                        <div className="text-caption text-t-secondary">
                            Hackers can join also after hackathon started
                        </div>
                    </div>
                    <Switch
                        checked={allowJoinAnyTime}
                        onChange={() => setAllowJoinAnyTime(!allowJoinAnyTime)}
                    />
                </div>
            </div>
        </Card>
    );
};

export default Demos;
