const express = require('express');
const { Queue } = require('bullmq');

const router = express.Router();

// Initialize queue connection
const videoQueue = new Queue('video-processing', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
});

// Get job status
router.get('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await videoQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({
                error: 'Job not found',
                jobId,
            });
        }

        const state = await job.getState();
        const progress = job.progress || 0;

        res.json({
            jobId: job.id,
            status: state, // 'waiting', 'active', 'completed', 'failed'
            progress: progress, // 0-100
            data: job.returnvalue || null, // Result if completed
            error: job.failedReason || null, // Error if failed
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Job status error:', error);
        res.status(500).json({
            error: error.message || 'Failed to get job status',
        });
    }
});

module.exports = router;
