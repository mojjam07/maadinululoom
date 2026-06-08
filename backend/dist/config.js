"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function must(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}
exports.config = {
    // Allowed frontend origins
    corsOrigins: (process.env.CORS_ORIGINS ||
        "http://localhost:5173,https://maadinul.vercel.app")
        .split(",")
        .map(origin => origin.trim()),
    // Supabase
    supabaseUrl: must("SUPABASE_URL"),
    supabaseServiceRoleKey: must("SUPABASE_SERVICE_ROLE_KEY"),
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
};
