import { GoogleGenerativeAI } from '@google/generative-ai';
import { Highlight, AIHighlight } from '@/types';
import { SERMON_HIGHLIGHT_PROMPT, buildAnalysisMessage, VIDEO_ANALYSIS_PROMPT } from './prompt';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Analyzes sermon transcript and extracts highlights using Gemini 1.5 Pro
 */
export async function analyzeSermonTranscript(transcript: string): Promise<AIHighlight[]> {
    try {
        // Use Gemini 1.5 Pro for best results
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const result = await model.generateContent([
            { text: SERMON_HIGHLIGHT_PROMPT },
            { text: buildAnalysisMessage(transcript) },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const parsed = JSON.parse(text);

        if (!parsed.highlights || !Array.isArray(parsed.highlights)) {
            throw new Error('Invalid response format from Gemini API');
        }

        return parsed.highlights as AIHighlight[];
    } catch (error) {
        console.error('Error analyzing sermon transcript:', error);
        throw new Error('Failed to analyze sermon. Please try again.');
    }
}

/**
 * Analyzes sermon video file and extracts highlights using Gemini 1.5 Pro
 * This method uploads the video to Gemini and analyzes it directly
 */
export async function analyzeSermonVideo(videoFile: File): Promise<AIHighlight[]> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // Convert File to base64 or appropriate format for Gemini
        const fileBuffer = await videoFile.arrayBuffer();
        const base64Video = Buffer.from(fileBuffer).toString('base64');

        const result = await model.generateContent([
            { text: VIDEO_ANALYSIS_PROMPT },
            {
                inlineData: {
                    data: base64Video,
                    mimeType: videoFile.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const parsed = JSON.parse(text);

        if (!parsed.highlights || !Array.isArray(parsed.highlights)) {
            throw new Error('Invalid response format from Gemini API');
        }

        return parsed.highlights as AIHighlight[];
    } catch (error) {
        console.error('Error analyzing sermon video:', error);
        throw new Error('Failed to analyze video. Please try again.');
    }
}

/**
 * Validates highlight time format (HH:MM:SS)
 */
export function validateTimeFormat(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(time);
}

/**
 * Converts HH:MM:SS to seconds
 */
export function timeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Converts seconds to HH:MM:SS
 */
export function secondsToTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return [hours, minutes, seconds]
        .map(val => val.toString().padStart(2, '0'))
        .join(':');
}

/**
 * Validates that all highlights are within valid time ranges
 */
export function validateHighlights(highlights: AIHighlight[]): boolean {
    for (const highlight of highlights) {
        // Check time format
        if (!validateTimeFormat(highlight.start_time) || !validateTimeFormat(highlight.end_time)) {
            return false;
        }

        // Check that end time is after start time
        const startSeconds = timeToSeconds(highlight.start_time);
        const endSeconds = timeToSeconds(highlight.end_time);

        if (endSeconds <= startSeconds) {
            return false;
        }

        // Check duration is between 30-60 seconds (as per requirements)
        const duration = endSeconds - startSeconds;
        if (duration < 30 || duration > 60) {
            console.warn(`Highlight duration ${duration}s is outside recommended range (30-60s)`);
        }
    }

    return true;
}
