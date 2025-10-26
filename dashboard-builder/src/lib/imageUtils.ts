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

    // If it's a localhost URL, replace with production URL
    if (imageUrl.includes('localhost:5000')) {
        const productionUrl = imageUrl.replace('localhost:5000', 'https://octopus-app-szca5.ondigitalocean.app');
        return productionUrl;
    }

    // If it's a relative upload path, make it absolute with production URL
    if (imageUrl.startsWith('/uploads/')) {
        return `https://octopus-app-szca5.ondigitalocean.app${imageUrl}`;
    }

    // Return as is if it's already a valid URL
    return imageUrl;
}
