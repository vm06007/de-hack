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
            </div>
        </Card>
    );
};

export default SkillsAndExperience;
