import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Textarea from "@/components/Textarea";

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState("");
    const [github, setGithub] = useState("");

    return (
        <Card title="Portfolio & Links">
            <div className="p-5 max-lg:p-3">
                <div className="flex flex-col gap-4">
                    <Field
                        label="GitHub Profile"
                        placeholder="https://github.com/yourusername"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                    />
                    <Textarea
                        label="Portfolio Description"
                        placeholder="Describe your best projects, achievements, and what you're most proud of..."
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                    />
                </div>
            </div>
        </Card>
    );
};

export default Portfolio;
