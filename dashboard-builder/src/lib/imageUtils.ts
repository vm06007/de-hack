/**
 * Image utility functions for handling URLs and fallbacks
 */

// Fallback image paths
export const FALLBACK_IMAGES = {
    icon: '/images/default/icon.png',
    banner: '/images/default/banner.jpg',
} as const;

/**
 * Get a safe image URL with fallback
 * @param imageUrl - The original image URL
 * @param fallbackType - Type of fallback image ('icon' or 'banner')
 * @returns Safe image URL or fallback
 */
export function getSafeImageUrl(
    imageUrl: string | null | undefined, 
    fallbackType: keyof typeof FALLBACK_IMAGES = 'icon'
): string {
    // If no image URL provided, return fallback
    if (!imageUrl) {
        return FALLBACK_IMAGES[fallbackType];
    }

    // If it's already a local path, return as is
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }

    // If it's a data URL, return as is
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    // If it's a relative path, make it absolute
    if (!imageUrl.startsWith('http')) {
        return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    }

    // For external URLs, check if they're accessible
    // In production, we'll trust the URL and let Next.js handle the error
    return imageUrl;
}

/**
 * Check if an image URL is valid
 * @param imageUrl - The image URL to check
 * @returns True if the URL looks valid
 */
export function isValidImageUrl(imageUrl: string | null | undefined): boolean {
    if (!imageUrl) return false;
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
        imageUrl.toLowerCase().includes(ext)
    );
    
    // Check for data URLs
    const isDataUrl = imageUrl.startsWith('data:image/');
    
    // Check for local paths
    const isLocalPath = imageUrl.startsWith('/');
    
    return hasImageExtension || isDataUrl || isLocalPath;
}

/**
 * Get image URL with production domain fallback
 * @param imageUrl - The image URL from backend
 * @param fallbackType - Type of fallback image
 * @returns Processed image URL
 */
export function processImageUrl(
    imageUrl: string | null | undefined,
    fallbackType: keyof typeof FALLBACK_IMAGES = 'icon'
): string {
    if (!imageUrl) {
        return FALLBACK_IMAGES[fallbackType];
    }

    // Debug logging
    console.log('Processing image URL:', imageUrl);

    // If it's already a complete URL, handle mixed content
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('URL is already complete:', imageUrl);
        
        // Fix mixed content by converting HTTP to HTTPS for production domains
        if (imageUrl.startsWith('http://octopus-app-szca5.ondigitalocean.app')) {
            const httpsUrl = imageUrl.replace('http://', 'https://');
            console.log('Fixed mixed content, converted to HTTPS:', httpsUrl);
            return httpsUrl;
        }
        
        // Also fix any other HTTP URLs that might cause mixed content in production
        if (imageUrl.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
            const httpsUrl = imageUrl.replace('http://', 'https://');
            console.log('Fixed mixed content for HTTPS page, converted to HTTPS:', httpsUrl);
            return httpsUrl;
        }
        
        return imageUrl;
    }

    // If it's a local static asset (images, icons, etc.), return as-is
    if (imageUrl.startsWith('/images/') || imageUrl.startsWith('/icons/') || imageUrl.startsWith('/logos/')) {
        console.log('Local static asset, returning as-is:', imageUrl);
        return imageUrl;
    }

    // If it's a relative upload path, the backend should have provided the full URL
    // But if it didn't, we'll fall back to the fallback image
    if (imageUrl.startsWith('/uploads/')) {
        console.warn('Backend should have provided full URL for uploads, using fallback:', imageUrl);
        return FALLBACK_IMAGES[fallbackType];
    }

    // If it's any other relative path, return fallback
    if (imageUrl.startsWith('/')) {
        console.warn('Unexpected relative path, using fallback:', imageUrl);
        return FALLBACK_IMAGES[fallbackType];
    }

    // Return as is if it's already a valid URL
    console.log('Returning URL as is:', imageUrl);
    return imageUrl;
}
