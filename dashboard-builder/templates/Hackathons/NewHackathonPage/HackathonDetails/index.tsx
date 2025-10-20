import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Editor from "@/components/Editor";

type Props = {
    title: string;
    setTitle: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
};

const HackathonDetails = ({ title, setTitle, description, setDescription }: Props) => {

    return (
        <Card title="Hackathon details">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Field
                    label="Hackathon title"
                    placeholder="ie. DeFi Innovation Challenge 2025"
                    tooltip="Maximum 100 characters. No HTML or emoji allowed"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <Editor
                    label="Description"
                    tooltip="Describe the hackathon theme, goals, and what participants should build"
                    content={description}
                    onChange={setDescription}
                />
            </div>
        </Card>
    );
};

export default HackathonDetails;
