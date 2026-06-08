"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_js_1 = require("./config.js");
const routes_1 = require("./routes");
function createServer() {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)());
    // CORS
    const corsMiddleware = (0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests without Origin
            if (!origin) {
                return callback(null, true);
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
    // Handle preflight requests
    app.options('*', corsMiddleware);
    // Body parser
    app.use(express_1.default.json({
        limit: '10mb',
    }));
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
