const express = require('express');
const router = express.Router();
const { processHighlightClip, PLATFORM_SPECS } = require('../services/video-editor');
const { prisma } = require('../services/database');

/**
 * POST /api/clips/generate
 * Generate video clip from highlight
 */
router.post('/generate', async (req, res) => {
    try {
        const { highlightId, platform = 'youtube' } = req.body;

        if (!highlightId) {
            return res.status(400).json({ error: 'highlightId is required' });
        }

        if (!PLATFORM_SPECS[platform]) {
            return res.status(400).json({
                error: 'Invalid platform',
                validPlatforms: Object.keys(PLATFORM_SPECS)
            });
        }

        console.log(`🎬 Generating clip for highlight ${highlightId} (${platform})`);

        // Get highlight details
        const highlight = await prisma.highlight.findUnique({
            where: { id: highlightId },
            include: {
                sermon: true
            }
        });

        if (!highlight) {
            return res.status(404).json({ error: 'Highlight not found' });
        }

        // Check if clip already exists
        const existingClip = await prisma.clip.findFirst({
            where: {
                highlightId,
                platform
            }
        });

        if (existingClip && existingClip.status === 'COMPLETED') {
            console.log('✅ Clip already exists, returning existing');
            return res.json({ clip: existingClip });
        }

        // Create pending clip record
        const clip = await prisma.clip.create({
            data: {
                highlightId,
                platform,
                status: 'PROCESSING',
                duration: highlight.endTime - highlight.startTime,
                resolution: `${PLATFORM_SPECS[platform].width}x${PLATFORM_SPECS[platform].height}`
            }
        });

        // Process clip asynchronously
        processHighlightClip({
            videoUrl: highlight.sermon.videoUrl,
            startTime: highlight.startTime,
            endTime: highlight.endTime,
            platform,
            highlightId: highlight.id,
            sermonId: highlight.sermonId
        })
            .then(async (result) => {
                // Update clip with results
                await prisma.clip.update({
                    where: { id: clip.id },
                    data: {
                        status: 'COMPLETED',
                        videoUrl: result.clipUrl,
                        thumbnailUrl: result.thumbnailUrl,
                        fileSize: result.fileSize
                    }
                });
                console.log('✅ Clip processing completed:', clip.id);
            })
            .catch(async (error) => {
                console.error('❌ Clip processing failed:', error);
                await prisma.clip.update({
                    where: { id: clip.id },
                    data: {
                        status: 'FAILED'
                    }
                });
            });

        res.json({
            clip: {
                ...clip,
                message: 'Clip generation started. Check status endpoint for progress.'
            }
        });

    } catch (error) {
        console.error('Error generating clip:', error);
        res.status(500).json({ error: 'Failed to generate clip' });
    }
});

/**
 * GET /api/clips/:id
 * Get clip details and status
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const clip = await prisma.clip.findUnique({
            where: { id },
            include: {
                highlight: {
                    include: {
                        sermon: true
                    }
                }
            }
        });

        if (!clip) {
            return res.status(404).json({ error: 'Clip not found' });
        }

        res.json({ clip });

    } catch (error) {
        console.error('Error fetching clip:', error);
        res.status(500).json({ error: 'Failed to fetch clip' });
    }
});

/**
 * GET /api/clips/highlight/:highlightId
 * Get all clips for a highlight
 */
router.get('/highlight/:highlightId', async (req, res) => {
    try {
        const { highlightId } = req.params;

        const clips = await prisma.clip.findMany({
            where: { highlightId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ clips });

    } catch (error) {
        console.error('Error fetching clips:', error);
        res.status(500).json({ error: 'Failed to fetch clips' });
    }
});

module.exports = router;
