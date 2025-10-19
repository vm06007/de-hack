import { useState } from "react";
import Card from "@/components/Card";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const CoverImage = () => {
    const [image, setImage] = useState("/images/upload-image.svg");

    return (
        <Card title="Cover Image">
            <div className="p-5 max-lg:p-3">
                <div className="relative h-40 rounded-3xl overflow-hidden">
                    <Image
                        className="object-cover opacity-100"
                        src={image}
                        alt="Cover"
                        fill
                        sizes="400px"
                    />
                </div>
                <div className="flex gap-3 mt-4">
                    <Button className="flex-1" isStroke>
                        <Icon name="upload" />
                        Upload Image
                    </Button>
                    <Button className="flex-1" isStroke>
                        <Icon name="link" />
                        Add Link
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default CoverImage;
