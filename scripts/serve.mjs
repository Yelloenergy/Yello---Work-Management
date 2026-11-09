import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleClients } from './client-api.mjs';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT || 3114);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  try {
    const apiUrl=new URL(request.url,'http://localhost');
    if(await handleClients(request,response,apiUrl))return;
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root) || !types[path.extname(target)]) { response.writeHead(404); response.end('Not found'); return; }
    const content = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[path.extname(target)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'" });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 400);
    response.end(error.code === 'ENOENT' ? 'Not found' : 'Bad request');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Work Management: http://127.0.0.1:${port}`));
