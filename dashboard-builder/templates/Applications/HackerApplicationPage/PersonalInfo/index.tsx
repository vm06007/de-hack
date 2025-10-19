import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Textarea from "@/components/Textarea";

const PersonalInfo = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [bio, setBio] = useState("");

    return (
        <Card title="Personal Information">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Field
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <Field
                    label="Email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Field
                    label="GitHub Profile"
                    placeholder="https://github.com/yourusername"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                />
                <Field
                    label="LinkedIn Profile"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                />
                <Textarea
                    label="Bio"
                    placeholder="Tell us about yourself, your background, and interests..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default PersonalInfo;
