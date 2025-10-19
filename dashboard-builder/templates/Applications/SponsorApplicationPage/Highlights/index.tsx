import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";

const Highlights = () => {
    const [highlights, setHighlights] = useState("");

    return (
        <Card title="Key Highlights">
            <div className="p-5 max-lg:p-3">
                <Field
                    label="What makes your sponsorship unique?"
                    placeholder="Highlight unique aspects of your sponsorship offer..."
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default Highlights;
