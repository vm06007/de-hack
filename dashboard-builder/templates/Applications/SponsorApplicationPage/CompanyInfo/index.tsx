import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Textarea from "@/components/Textarea";

const CompanyInfo = () => {
    const [companyName, setCompanyName] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [contactEmail, setContactEmail] = useState("");

    return (
        <Card title="Company Information">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Field
                    label="Company Name"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                />
                <Field
                    label="Website"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />
                <Field
                    label="Contact Email"
                    placeholder="contact@yourcompany.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                />
                <Textarea
                    label="Company Description"
                    placeholder="Tell us about your company, its mission, and what you do..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
        </Card>
    );
};

export default CompanyInfo;
