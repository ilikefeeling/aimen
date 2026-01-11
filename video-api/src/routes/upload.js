const express = require('express');
const multer = require('multer');
const { Queue } = require('bullmq');
const { uploadToStorage } = require('../services/storage');
const { verifyAuth } = require('../utils/auth');
const { prisma } = require('../services/database');

const router = express.Router();

// Multer configuration (500MB limit)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: MP4, MOV, AVI`));
        }
    },
});

// Initialize Bull queue
const videoQueue = new Queue('video-processing', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
});

// Upload endpoint - AUTH DISABLED FOR TESTING
router.post('/', upload.single('video'), async (req, res) => {
    try {
        const { userId, title } = req.body;
        const videoFile = req.file;

        console.log('Upload request:', { userId, title, fileSize: videoFile?.size });

        if (!videoFile) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // 1. Upload to Supabase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}-${videoFile.originalname}`;
        const filePath = `${userId}/${fileName}`; // RLS 정책: bucket 내에서 userId 폴더 사용

        console.log('Uploading to storage:', filePath);

        const { url, error: uploadError } = await uploadToStorage(filePath, videoFile.buffer, videoFile.mimetype);

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload video to storage' });
        }

        console.log('Upload successful:', url);

        // 2. Create sermon record in database
        console.log('Attempting to create sermon record in database...');
        let sermonRecord;
        try {
            sermonRecord = await prisma.sermon.create({
                data: {
                    userId,
                    title,
                    videoUrl: url,
                },
            });
            console.log('✅ Sermon record created:', sermonRecord.id);
        } catch (dbError) {
            console.error('❌ Database error:', dbError.message);
            console.error('Full error:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
        }

        // 3. Add analysis job to queue
        console.log('Attempting to add job to queue...');
        let job;
        try {
            job = await videoQueue.add('analyze-video', {
                videoId: sermonRecord.id,
                videoUrl: url,
                userId,
                title,
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: false, // Keep completed jobs for history
                removeOnFail: false,
            });
            console.log('✅ Job added to queue:', job.id);
        } catch (queueError) {
            console.error('❌ Queue error:', queueError.message);
            console.error('Full error:', queueError);
            throw new Error(`Queue error: ${queueError.message}`);
        }

        // 4. Sermon record created (no status field to update)

        // 5. Return response
        res.json({
            success: true,
            videoId: sermonRecord.id,
            jobId: job.id,
            message: 'Video uploaded successfully. Analysis queued.',
            url: url,
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: error.message || 'Upload failed',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

module.exports = router;
