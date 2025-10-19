import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Textarea from "@/components/Textarea";
import Compatibility from "@/components/Compatibility";

const SkillsAndExperience = () => {
    const [experience, setExperience] = useState("");
    const [previousHackathons, setPreviousHackathons] = useState("");

    return (
        <Card title="Skills & Experience">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Compatibility classItemName="w-[calc(25%-0.75rem)] max-2xl:w-[calc(33.333%-0.75rem)] max-md:w-[calc(50%-0.75rem)]" />
                <Textarea
                    label="Technical Experience"
                    placeholder="Describe your technical background, programming languages, frameworks, and tools you're proficient with..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                />
                <Textarea
                    label="Previous Hackathon Experience"
                    placeholder="Tell us about any previous hackathons you've participated in, projects you've built, or awards you've won..."
                    value={previousHackathons}
                    onChange={(e) => setPreviousHackathons(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default SkillsAndExperience;
