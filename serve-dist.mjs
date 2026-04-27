import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const root = resolve("dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = join(root, pathname);
  const finalPath = existsSync(filePath) ? filePath : join(root, "index.html");

  response.setHeader("Content-Type", types[extname(finalPath)] || "application/octet-stream");
  createReadStream(finalPath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Aava preview: http://127.0.0.1:${port}`);
});
