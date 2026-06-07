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
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin)
                return callback(null, true);
            // Allow configured SPA origins
            return callback(null, config_js_1.config.corsOrigin === '*' || origin === config_js_1.config.corsOrigin);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.get('/healthz', (_req, res) => res.json({ ok: true }));
    app.use('/api', routes_1.apiRouter);
    app.use((err, _req, res, _next) => {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({ error: 'internal_error' });
    });
    return app;
}
