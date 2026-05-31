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
    app.use((0, cors_1.default)({ origin: config_js_1.config.corsOrigin, credentials: true }));
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
