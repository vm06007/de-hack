import { useState } from "react";
import { default as NextImage, ImageProps } from "next/image";
import { getSafeImageUrl, processImageUrl } from "@/src/lib/imageUtils";

interface SafeImageProps extends Omit<ImageProps, 'src'> {
    src: string | null | undefined;
    fallbackType?: 'icon' | 'banner';
    processUrl?: boolean;
}

const Image = ({ 
    className, 
    src, 
    fallbackType = 'icon', 
    processUrl = true,
    ...props 
}: SafeImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Process the image URL
    const processedSrc = processUrl 
        ? processImageUrl(src, fallbackType)
        : getSafeImageUrl(src, fallbackType);

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
            src={processedSrc}
            {...props}
        />
    );
};

export default Image;
