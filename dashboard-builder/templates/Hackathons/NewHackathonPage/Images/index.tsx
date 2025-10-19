import { useState } from "react";
import Card from "@/components/Card";
import FieldImage from "@/components/FieldImage";

const Images = () => {
    const [logoImage, setLogoImage] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const handleChangeLogo = (file: File) => {
        setLogoImage(file);
    };

    const handleChangeCover = (file: File) => {
        setCoverImage(file);
    };

    return (
        <Card title="Images">
            <div className="flex gap-6 px-5 pb-5 max-lg:px-3 max-lg:pb-3">
                <div className="w-[30%]">
                    <FieldImage
                        label="Logo"
                        tooltip="Upload your hackathon logo"
                        onChange={handleChangeLogo}
                    />
                </div>
                <div className="w-[70%]">
                    <FieldImage
                        label="Cover Image"
                        tooltip="Upload your hackathon cover image"
                        onChange={handleChangeCover}
                    />
                </div>
            </div>
        </Card>
    );
};

export default Images;
