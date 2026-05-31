"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("./server.js");
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
(0, server_js_1.createServer)().listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`maadin-backend listening on http://localhost:${port}`);
});
