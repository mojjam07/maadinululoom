"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function must(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
exports.config = {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    supabaseUrl: must('SUPABASE_URL'),
    supabaseServiceRoleKey: must('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
};
