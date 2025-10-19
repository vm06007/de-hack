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
                </div>
            </div>
        </Card>
    );
};

export default Portfolio;
