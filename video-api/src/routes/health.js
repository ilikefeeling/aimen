const express = require('express');
const { checkGeminiAuth } = require('../utils/health');
const router = express.Router();

router.get('/gemini', async (req, res) => {
    const result = await checkGeminiAuth();
    if (result.valid) {
        res.json({ status: 'healthy', ...result });
    } else {
        res.status(503).json({ status: 'unhealthy', ...result });
    }
});

module.exports = router;
