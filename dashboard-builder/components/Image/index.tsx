import { useState } from "react";
import { default as NextImage, ImageProps } from "next/image";

const Image = ({ className, ...props }: ImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className={`inline-block align-top bg-b-surface2 rounded-full flex items-center justify-center ${className || ""}`}>
                <span className="text-t-secondary text-xs">?</span>
            </div>
        );
    }

    return (
        <NextImage
            className={`inline-block align-top opacity-0 transition-opacity ${
                loaded && "opacity-100"
            } ${className || ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            {...props}
        />
    );
};

export default Image;
