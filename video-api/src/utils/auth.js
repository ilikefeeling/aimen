const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 */
function verifyAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authorization token provided',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // For development: allow bypass if no JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️  WARNING: No JWT_SECRET set. Authentication bypassed for development.');
            req.user = { id: req.body.userId || 'dev-user' };
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.error('Auth error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token expired',
            });
        }

        return res.status(500).json({
            error: 'Authentication error',
            message: error.message,
        });
    }
}

/**
 * Generate JWT token (for testing)
 */
function generateToken(userId) {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = {
    verifyAuth,
    generateToken,
};
