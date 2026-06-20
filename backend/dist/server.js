"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const csurf_1 = __importDefault(require("csurf"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_js_1 = require("./config.js");
const routes_1 = require("./routes");
function createServer() {
    const app = (0, express_1.default)();
    // Rate limiting: general API limiter
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000, // 1 minute
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
    });
    // Stricter limiter for auth endpoints
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
    });
    // Apply general limiter to API surface
    app.use('/api', apiLimiter);
    // Security headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", '*'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    // CORS
    const corsMiddleware = (0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests without Origin
            if (!origin) {
                return callback(null, true);
            }
            // Allow any localhost origin (different dev ports) to avoid CORS during local development
            try {
                const lower = origin.toLowerCase();
                if (lower.startsWith('http://localhost') || lower.startsWith('https://localhost')) {
                    return callback(null, true);
                }
            }
            catch (e) {
                // ignore and continue to configured origins check
            }
            // Allow configured origins
            if (config_js_1.config.corsOrigins.includes(origin)) {
                return callback(null, true);
            }
            console.warn(`Blocked by CORS: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS',
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
        ],
    });
    // Apply CORS
    app.use(corsMiddleware);
    // Apply auth-specific rate limiting
    app.use('/api/auth', authLimiter);
    // Handle preflight requests
    app.options('*', corsMiddleware);
    // Body parser
    app.use(express_1.default.json({
        limit: '10mb',
    }));
    // Cookie parser required for CSRF tokens stored in cookies
    app.use((0, cookie_parser_1.default)());
    // CSRF protection for API routes except webhooks (webhooks use raw body)
    const csrfProtection = (0, csurf_1.default)({ cookie: true });
    app.use('/api', (req, res, next) => {
        if (req.path.startsWith('/webhooks'))
            return next();
        return csrfProtection(req, res, next);
    });
    // CSRF token endpoint for clients
    app.get('/api/csrf-token', (req, res) => {
        // @ts-ignore
        return res.json({ csrfToken: req.csrfToken ? req.csrfToken() : null });
    });
    // Health check
    app.get('/healthz', (_req, res) => {
        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
        });
    });
    // API routes
    app.use('/api', routes_1.apiRouter);
    // Global error handler
    app.use((err, _req, res, _next) => {
        console.error(err);
        res.status(500).json({
            error: 'internal_error',
        });
    });
    return app;
}
