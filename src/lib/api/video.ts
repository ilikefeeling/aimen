const VIDEO_API_URL = process.env.NEXT_PUBLIC_VIDEO_API_URL || 'http://localhost:3001';

export interface UploadResponse {
    success: boolean;
    videoId: string;
    jobId: string;
    message: string;
    url: string;
}

export interface JobStatus {
    jobId: string;
    status: 'waiting' | 'active' | 'completed' | 'failed';
    progress: number;
    data?: any;
    error?: string;
    timestamp?: string;
}

/**
 * Upload video to processing server
 */
export async function uploadVideo(
    file: File,
    title: string,
    userId: string,
    token?: string
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('userId', userId);

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Uploading to:', `${VIDEO_API_URL}/api/upload`);

    const response = await fetch(`${VIDEO_API_URL}/api/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    return response.json();
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${VIDEO_API_URL}/api/jobs/${jobId}`);

    if (!response.ok) {
        throw new Error('Failed to get job status');
    }

    return response.json();
}

/**
 * Poll job status until complete
 */
export async function pollJobStatus(
    jobId: string,
    onProgress: (status: JobStatus) => void,
    interval = 2000
): Promise<JobStatus> {
    return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
            try {
                const status = await getJobStatus(jobId);
                onProgress(status);

                if (status.status === 'completed') {
                    clearInterval(pollInterval);
                    resolve(status);
                } else if (status.status === 'failed') {
                    clearInterval(pollInterval);
                    reject(new Error(status.error || 'Job failed'));
                }
            } catch (error) {
                clearInterval(pollInterval);
                reject(error);
            }
        }, interval);

        // Timeout after 10 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
            reject(new Error('Job processing timeout (10 minutes)'));
        }, 600000);
    });
}
