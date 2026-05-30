import { createServer } from './server';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
createServer().listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`maadin-backend listening on http://localhost:${port}`);
});
