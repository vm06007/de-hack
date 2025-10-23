import { useState } from "react";
import Card from "@/components/Card";
import FieldImage from "@/components/FieldImage";
import Field from "@/components/Field";

const YourShop = ({}) => {
    const [images, setImages] = useState<File[]>([]);
    const [xProfileLink, setXProfileLink] = useState("https://x.com/ethglobal");
    const [dribbbleLink, setDribbbleLink] = useState(
        "https://dribbble.com/ethglobal"
    );
    const [instagramLink, setInstagramLink] = useState(
        "https://www.instagram.com/ethglobal/"
    );
    const [threadsLink, setThreadsLink] = useState(
        "https://www.threads.net/@ethglobal"
    );

    const handleChangePreviews = (file: File) => {
        setImages([...images, file]);
    };

    return (
        <Card title="Your organization">
            <div className="flex flex-col gap-8 p-5 pt-0 max-lg:px-3 max-md:gap-4">
                <FieldImage
                    classImage="w-full !h-78 object-cover"
                    label="Organization cover"
                    tooltip="Maximum 100 characters. No HTML or emoji allowed"
                    onChange={handleChangePreviews}
                    initialImage="/images/shop-banner.png"
                />
                <div className="flex gap-4 max-md:flex-col max-md:mt-4">
                    <Field
                        className="flex-1"
                        classInput="truncate"
                        label="X profile"
                        placeholder="Enter X profile"
                        tooltip="Maximum 100 characters. No HTML or emoji allowed"
                        value={xProfileLink}
                        onChange={(e) => setXProfileLink(e.target.value)}
                        required
                        validated
                    />
                    <Field
                        className="flex-1"
                        classInput="truncate"
                        label="Dribbble"
                        placeholder="Enter Dribbble"
                        tooltip="Maximum 100 characters. No HTML or emoji allowed"
                        value={dribbbleLink}
                        onChange={(e) => setDribbbleLink(e.target.value)}
                        required
                        validated
                    />
                </div>
                <div className="flex gap-4 max-md:flex-col">
                    <Field
                        className="flex-1"
                        classInput="truncate"
                        label="Instagram"
                        placeholder="Enter Instagram"
                        tooltip="Maximum 100 characters. No HTML or emoji allowed"
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                        required
                        validated
                    />
                    <Field
                        className="flex-1"
                        classInput="truncate"
                        label="Threads"
                        placeholder="Enter Threads"
                        tooltip="Maximum 100 characters. No HTML or emoji allowed"
                        value={threadsLink}
                        onChange={(e) => setThreadsLink(e.target.value)}
                        required
                        validated
                    />
                </div>
            </div>
        </Card>
    );
};

export default YourShop;
