export interface AnalysisData {
    status: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
    progress?: number;
    summary?: string;
    highlights?: any[]; // For raw storage
    error?: string;
    startedAt?: string;
    completedAt?: string;
    failedAt?: string;
}

export interface AIHighlight {
    start_time: string;
    end_time: string;
    title: string;
    caption: string;
    summary: string;
}

export interface Highlight {
    id: string;
    sermonId: string;
    title: string;
    startTime: number; // Int in Prisma
    endTime: number;   // Int in Prisma
    caption: string;
    emotion?: string | null;
    platform?: string | null;
    createdAt: Date;
    updatedAt: Date;
    clips?: Clip[];
}

export interface Clip {
    id: string;
    highlightId: string;
    platform: string;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
    duration: number;
    fileSize: number;
    resolution: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Sermon {
    id: string;
    userId: string;
    title: string;
    videoUrl: string;
    churchName?: string | null;
    analysisData?: AnalysisData | null;
    highlights?: Highlight[];
    createdAt: Date;
}

export interface User {
    id: string;
    email: string | null;
    name?: string | null;
    image?: string | null;
    role: 'USER' | 'ADMIN';
    status: 'PENDING' | 'ACTIVE';
    plan: 'FREE' | 'PRO';
    createdAt: Date;
    updatedAt: Date;
}

export interface VideoAnalysisRequest {
    videoId: string;
    videoUrl: string;
    userId: string;
    title: string;
}
