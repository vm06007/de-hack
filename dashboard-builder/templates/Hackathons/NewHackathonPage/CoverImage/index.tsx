import { useState } from "react";
import Card from "@/components/Card";
import FieldImage from "@/components/FieldImage";
// import Image from "@/components/Image";
// import Icon from "@/components/Icon";

const CoverImage = () => {
    const [images, setImages] = useState<File[]>([]);

    const handleChange = (file: File) => {
        setImages([...images, file]);
    };

    return (
        <Card
            classHead="!px-3"
            title="Main Icon"
        >
            <div className="p-3">
                <FieldImage onChange={handleChange} />
            </div>
        </Card>
    );
};

export default CoverImage;
