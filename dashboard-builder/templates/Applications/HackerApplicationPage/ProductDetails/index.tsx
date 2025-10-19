import { useState } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Select from "@/components/Select";
import { SelectOption } from "@/types/select";

const categories: SelectOption[] = [
    { id: 1, name: "DeFi" },
    { id: 2, name: "NFTs" },
    { id: 3, name: "Web3" }
];

const ProductDetails = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<SelectOption | null>(null);

    return (
        <Card title="Hacker Application Details">
            <div className="flex flex-col gap-8 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <Field
                    label="Application Title"
                    placeholder="Enter your application title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <Field
                    label="Why do you want to participate in this hackathon?"
                    placeholder="Describe your motivation and what you hope to achieve..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    textarea
                    required
                />
                <Select
                    label="Preferred Category"
                    placeholder="Select category"
                    value={category}
                    onChange={setCategory}
                    options={categories}
                />
            </div>
        </Card>
    );
};

export default ProductDetails;
