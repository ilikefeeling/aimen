import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;

/**
 * Loads FFmpeg.wasm with multithreading support
 * This function ensures FFmpeg is only loaded once
 */
export async function loadFFmpeg(
    onProgress?: (progress: number) => void
): Promise<FFmpeg> {
    // Return existing instance if already loaded
    if (ffmpegInstance && ffmpegInstance.loaded) {
        return ffmpegInstance;
    }

    // Wait if currently loading
    if (isLoading) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (ffmpegInstance && ffmpegInstance.loaded) {
                    clearInterval(checkInterval);
                    resolve(ffmpegInstance);
                }
            }, 100);
        });
    }

    isLoading = true;

    try {
        const ffmpeg = new FFmpeg();

        // Set up progress handler
        if (onProgress) {
            ffmpeg.on('progress', ({ progress }) => {
                onProgress(Math.round(progress * 100));
            });
        }

        // Log handler for debugging
        ffmpeg.on('log', ({ message }) => {
            console.log('[FFmpeg]', message);
        });

        // Load FFmpeg core with multithreading support
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });

        ffmpegInstance = ffmpeg;
        isLoading = false;

        console.log('FFmpeg loaded successfully with multithreading support');
        return ffmpeg;
    } catch (error) {
        isLoading = false;
        console.error('Error loading FFmpeg:', error);
        throw new Error('Failed to load video processing engine. Please refresh the page.');
    }
}

/**
 * Unloads FFmpeg instance to free up memory
 */
export function unloadFFmpeg(): void {
    if (ffmpegInstance) {
        ffmpegInstance = null;
    }
}

/**
 * Checks if FFmpeg is currently loaded
 */
export function isFFmpegLoaded(): boolean {
    return ffmpegInstance !== null && ffmpegInstance.loaded;
}

/**
 * Gets the current FFmpeg instance
 */
export function getFFmpegInstance(): FFmpeg | null {
    return ffmpegInstance;
}
