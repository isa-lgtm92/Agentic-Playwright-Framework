import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 4173);
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Playwright AI demo</title>
  </head>
  <body>
    <main>
      <h1>Welcome</h1>
      <form id="greeting-form">
        <label for="name">Your name</label>
        <input id="name" name="name" autocomplete="name" required>
        <button type="submit">Show greeting</button>
      </form>
      <p id="greeting" role="status" aria-live="polite"></p>
    </main>
    <script>
      document.querySelector('#greeting-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = new FormData(event.currentTarget).get('name').trim();
        document.querySelector('#greeting').textContent = name ? 'Hello, ' + name + '!' : '';
      });
    </script>
  </body>
</html>`;

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/api/health' && request.method === 'GET') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url.pathname === '/' && request.method === 'GET') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(html);
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Demo application listening at http://127.0.0.1:${port}`);
});
