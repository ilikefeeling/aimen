export interface Highlight {
    start_time: string;  // HH:MM:SS format
    end_time: string;    // HH:MM:SS format
    title: string;
    caption: string;     // SNS caption with Bible verse
    summary: string;     // 3-line summary for messenger
}

export interface VideoAnalysisRequest {
    videoUrl?: string;
    transcript?: string;
    videoFile?: File;
}

export interface VideoAnalysisResponse {
    highlights: Highlight[];
    status: 'success' | 'error';
    message?: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
    subscriptionStatus: 'pending' | 'free' | 'pro' | 'expired';
    approvalStatus: 'pending' | 'approved' | 'rejected';
    role: 'user' | 'admin';
    createdAt: Date;
}

export interface Video {
    id: string;
    userId: string;
    title: string;
    originalUrl?: string;
    transcript?: string;
    highlights?: Highlight[];
    analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
}

export interface Payment {
    id: string;
    userId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    subscriptionPlan: 'free' | 'pro';
    merchantUid: string;
    createdAt: Date;
}
