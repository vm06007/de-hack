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
    const generateAIDescription = () => {
        const defaultDescription = `<p>Join the most prestigious <strong>blockchain hackathon</strong> in the ecosystem. ${title || 'This hackathon'} brings together the brightest minds in <strong>Web3 development</strong> for an intensive 30-day building experience. This global event connects developers, designers, and entrepreneurs from around the world to build the future of decentralized technology.</p><p>Participants will have access to cutting-edge tools, expert mentorship, and a supportive community. From DeFi protocols to NFT marketplaces, gaming platforms to infrastructure solutions - this hackathon welcomes all innovative projects that push the boundaries of what's possible on Ethereum 🚀</p><p><strong>🚀 Perfect for:</strong></p><ul><li>DeFi Protocol Development</li><li>NFT & Gaming Projects</li><li>Infrastructure & Tooling</li><li>Privacy & Security Solutions</li><li>Social & DAO Applications</li><li>Cross-chain Integration</li></ul><p>Whether you're a seasoned blockchain developer or just starting your Web3 journey, ${title || 'this hackathon'} provides the perfect platform to showcase your skills, learn from industry experts, and potentially launch your next big project. The hackathon features workshops, networking events, and direct access to leading protocols and VCs. 😎</p>`;
        console.log('Generating AI description:', defaultDescription);
        setDescription(defaultDescription);
    };

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
                    onAIGenerate={generateAIDescription}
                />
            </div>
        </Card>
    );
};

export default HackathonDetails;
