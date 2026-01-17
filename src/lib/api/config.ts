/**
 * API Configuration for Multi-platform Support (Web & Mobile)
 */

const IS_MOBILE = typeof window !== 'undefined' && ((window as any).Capacitor || (window as any).webkit || (window as any).android);

// Production Vercel URL (Backend)
const PROD_URL = 'https://aimen-lyart.vercel.app';

// Local Development URL
const DEV_URL = 'http://localhost:3000';

// Video API URL (typically port 3001 in dev)
const VIDEO_API_BASE_URL = process.env.NEXT_PUBLIC_VIDEO_API_URL || (IS_MOBILE ? 'https://aimen-video-api.vercel.app' : 'http://localhost:3001');

/**
 * Get the base URL for API requests.
 * In mobile environment, we must use absolute URLs.
 */
export function getApiBaseUrl(): string {
    if (IS_MOBILE) {
        return PROD_URL;
    }

    // In browser, relative paths are preferred if on the same domain
    return '';
}

/**
 * Helper to resolve General API endpoint paths (Next.js)
 */
export function resolveApiUrl(path: string): string {
    const baseUrl = getApiBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
}

/**
 * Helper to resolve Video API endpoint paths (Separate Express Server)
 */
export function resolveVideoApiUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${VIDEO_API_BASE_URL}${cleanPath}`;
}

export const API_CONFIG = {
    IS_MOBILE,
    PROD_URL,
    DEV_URL,
    VIDEO_API_URL: VIDEO_API_BASE_URL,
    baseUrl: getApiBaseUrl(),
};
