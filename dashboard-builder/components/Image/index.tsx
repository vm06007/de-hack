import { useState } from "react";
import { default as NextImage, ImageProps } from "next/image";
import { getSafeImageUrl, processImageUrl, FALLBACK_IMAGES } from "@/src/lib/imageUtils";

interface SafeImageProps extends Omit<ImageProps, 'src'> {
    src: string | null | undefined;
    fallbackType?: 'icon' | 'banner';
    processUrl?: boolean;
}

// Custom loader for uploaded images to bypass Next.js optimization
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    // If it's an uploaded image, return it as-is without optimization
    if (src.includes('/uploads/')) {
        return src;
    }
    // For other images, use default Next.js optimization
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};

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
        // Show the actual fallback image instead of a question mark
        const fallbackSrc = FALLBACK_IMAGES[fallbackType];
        return (
            <NextImage
                className={`inline-block align-top ${className || ""}`}
                src={fallbackSrc}
                alt="Fallback image"
                {...nextImageProps}
            />
        );
    }

    // Filter out custom props that shouldn't be passed to NextImage
    const { fallbackType: _, processUrl: __, ...nextImageProps } = props;

    // Use custom loader for uploaded images, default loader for others
    const loader = processedSrc.includes('/uploads/') ? customLoader : undefined;

    return (
        <NextImage
            className={`inline-block align-top opacity-0 transition-opacity ${
                loaded && "opacity-100"
            } ${className || ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            src={processedSrc}
            loader={loader}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            {...nextImageProps}
        />
    );
};

export default Image;
