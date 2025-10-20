import { useState } from "react";
import Card from "@/components/Card";
import FieldImage from "@/components/FieldImage";

type Props = {
    setLogoUrl: (s: string | undefined) => void;
    setCoverUrl: (s: string | undefined) => void;
};

const Images = ({ setLogoUrl, setCoverUrl }: Props) => {
    const [logoImage, setLogoImage] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleChangeLogo = async (file: File) => {
        setLogoImage(file);
        try {
            const dataUrl = await fileToDataUrl(file);
            // Upload to backend to get a stable URL
            const res = await fetch("http://localhost:5000/api/uploads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: dataUrl }),
            });
            if (res.ok) {
                const json = await res.json();
                setLogoUrl(json.url);
            } else {
                setLogoUrl(dataUrl);
            }
        } catch {}
    };

    const handleChangeCover = async (file: File) => {
        setCoverImage(file);
        try {
            const dataUrl = await fileToDataUrl(file);
            const res = await fetch("http://localhost:5000/api/uploads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: dataUrl }),
            });
            if (res.ok) {
                const json = await res.json();
                setCoverUrl(json.url);
            } else {
                setCoverUrl(dataUrl);
            }
        } catch {}
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
