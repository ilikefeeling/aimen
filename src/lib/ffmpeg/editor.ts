import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { loadFFmpeg } from './loader';
import { timeToSeconds } from '../gemini/client';

export interface VideoEditOptions {
    startTime: string;    // HH:MM:SS
    endTime: string;      // HH:MM:SS
    watermarkText?: string;
    watermarkLogo?: string;
    outputFormat?: 'mp4' | 'webm';
}

export interface EditProgress {
    stage: 'loading' | 'processing' | 'encoding' | 'complete';
    progress: number;
    message: string;
}

/**
 * Cuts video segment from start to end time
 * Runs entirely in the browser using FFmpeg.wasm
 */
export async function cutVideo(
    videoFile: File,
    options: VideoEditOptions,
    onProgress?: (progress: EditProgress) => void
): Promise<Blob> {
    try {
        // Load FFmpeg
        onProgress?.({ stage: 'loading', progress: 0, message: 'Loading video processor...' });
        const ffmpeg = await loadFFmpeg((p) => {
            if (p < 100) {
                onProgress?.({ stage: 'loading', progress: p, message: 'Loading video processor...' });
            }
        });

        // Write input file to FFmpeg filesystem
        onProgress?.({ stage: 'processing', progress: 10, message: 'Loading video file...' });
        const inputFileName = 'input.mp4';
        const outputFileName = `output.${options.outputFormat || 'mp4'}`;

        await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

        // Calculate time parameters
        const startSeconds = timeToSeconds(options.startTime);
        const endSeconds = timeToSeconds(options.endTime);
        const duration = endSeconds - startSeconds;

        onProgress?.({ stage: 'processing', progress: 30, message: 'Cutting video segment...' });

        // Build FFmpeg command
        const command = [
            '-i', inputFileName,
            '-ss', startSeconds.toString(),
            '-t', duration.toString(),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'ultrafast',
            '-crf', '23',
            outputFileName
        ];

        // Execute FFmpeg command
        await ffmpeg.exec(command);

        onProgress?.({ stage: 'encoding', progress: 80, message: 'Finalizing video...' });

        // Read output file
        const data = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([data as any], { type: `video/${options.outputFormat || 'mp4'}` });

        // Clean up
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);

        onProgress?.({ stage: 'complete', progress: 100, message: 'Video ready!' });

        return blob;
    } catch (error) {
        console.error('Error cutting video:', error);
        throw new Error('Failed to process video. Please try again.');
    }
}

/**
 * Adds watermark text to video
 */
export async function addWatermark(
    videoFile: File,
    options: VideoEditOptions,
    onProgress?: (progress: EditProgress) => void
): Promise<Blob> {
    try {
        onProgress?.({ stage: 'loading', progress: 0, message: 'Loading video processor...' });
        const ffmpeg = await loadFFmpeg();

        const inputFileName = 'input.mp4';
        const outputFileName = `output.${options.outputFormat || 'mp4'}`;

        await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

        onProgress?.({ stage: 'processing', progress: 30, message: 'Adding watermark...' });

        // Build watermark filter
        const watermarkText = options.watermarkText || 'aimen';
        const filter = `drawtext=text='${watermarkText}':fontcolor=white:fontsize=24:x=10:y=10:box=1:boxcolor=black@0.5`;

        const command = [
            '-i', inputFileName,
            '-vf', filter,
            '-c:v', 'libx264',
            '-c:a', 'copy',
            '-preset', 'ultrafast',
            outputFileName
        ];

        await ffmpeg.exec(command);

        onProgress?.({ stage: 'encoding', progress: 80, message: 'Finalizing video...' });

        const data = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([data as any], { type: `video/${options.outputFormat || 'mp4'}` });

        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);

        onProgress?.({ stage: 'complete', progress: 100, message: 'Watermark added!' });

        return blob;
    } catch (error) {
        console.error('Error adding watermark:', error);
        throw new Error('Failed to add watermark. Please try again.');
    }
}

/**
 * Combined operation: Cut video and add watermark in one pass
 */
export async function processHighlight(
    videoFile: File,
    options: VideoEditOptions,
    onProgress?: (progress: EditProgress) => void
): Promise<Blob> {
    try {
        onProgress?.({ stage: 'loading', progress: 0, message: 'Initializing...' });
        const ffmpeg = await loadFFmpeg();

        const inputFileName = 'input.mp4';
        const outputFileName = `highlight.${options.outputFormat || 'mp4'}`;

        await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

        onProgress?.({ stage: 'processing', progress: 20, message: 'Processing highlight...' });

        const startSeconds = timeToSeconds(options.startTime);
        const endSeconds = timeToSeconds(options.endTime);
        const duration = endSeconds - startSeconds;

        // Build command with both cut and watermark
        const command = [
            '-i', inputFileName,
            '-ss', startSeconds.toString(),
            '-t', duration.toString(),
        ];

        // Add watermark filter if provided
        if (options.watermarkText) {
            const watermarkText = options.watermarkText;
            const filter = `drawtext=text='${watermarkText}':fontcolor=white@0.8:fontsize=28:x=20:y=H-th-20:box=1:boxcolor=black@0.6:boxborderw=5`;
            command.push('-vf', filter);
        }

        // Add encoding options optimized for social media
        command.push(
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'fast',
            '-crf', '23',
            '-profile:v', 'high',
            '-level', '4.0',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            outputFileName
        );

        onProgress?.({ stage: 'encoding', progress: 50, message: 'Encoding video...' });

        await ffmpeg.exec(command);

        onProgress?.({ stage: 'encoding', progress: 90, message: 'Finalizing...' });

        const data = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([data as any], { type: `video/${options.outputFormat || 'mp4'}` });

        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);

        onProgress?.({ stage: 'complete', progress: 100, message: 'Highlight ready!' });

        return blob;
    } catch (error) {
        console.error('Error processing highlight:', error);
        throw new Error('Failed to process highlight. Please try again.');
    }
}

/**
 * Gets video duration in seconds
 */
export async function getVideoDuration(videoFile: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };

        video.onerror = () => {
            reject(new Error('Failed to load video metadata'));
        };

        video.src = URL.createObjectURL(videoFile);
    });
}
