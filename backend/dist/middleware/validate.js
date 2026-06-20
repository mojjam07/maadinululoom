"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParams = validateParams;
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.body);
            req.body = result;
            return next();
        }
        catch (e) {
            return res.status(400).json({ error: 'invalid_request', details: e.errors || e.message });
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.params);
            req.params = result;
            return next();
        }
        catch (e) {
            return res.status(400).json({ error: 'invalid_params', details: e.errors || e.message });
        }
    };
}
