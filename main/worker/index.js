const COOKIE = '__Host-decap-oauth';
const cookie = (value, age = 600) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const random = () => encode(crypto.getRandomValues(new Uint8Array(32)));
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };
const text = (message, status) => new Response(message, { status, headers });

function popup(origin, result, success) {
  const nonce = random();
  const message = JSON.stringify(`authorization:github:${success ? 'success' : 'error'}:${JSON.stringify(result)}`).replaceAll('<', '\\u003c');
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>CMS sign in</title><p>Completing sign in. If this window stays open, close it and retry from the content manager.</p><script nonce="${nonce}">
    const origin = ${JSON.stringify(origin)};
    const openerWindow = window.opener;
    function receive(event) {
      if (event.origin !== origin || event.source !== openerWindow || event.data !== 'authorizing:github') return;
      window.removeEventListener('message', receive);
      openerWindow.postMessage(${message}, origin);
      window.close();
    }
    window.addEventListener('message', receive);
    if (openerWindow) openerWindow.postMessage('authorizing:github', origin);
  </script></html>`, { headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8',
    'Set-Cookie': cookie('', 0), 'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'` } });
}

export async function handleRequest(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  if (!['/api/auth', '/api/callback'].includes(url.pathname)) return env.ASSETS.fetch(request);
  if (request.method !== 'GET') return text('Method not allowed', 405);
  const origin = env.SITE_ORIGIN;
  if (url.origin !== origin || !origin?.startsWith('https://')) return text('Invalid authentication origin', 403);
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return text('CMS login is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET on the Worker.', 503);
  const callback = `${origin}/api/callback`;
  if (url.pathname === '/api/auth') {
    if (url.searchParams.get('provider') !== 'github') return text('Unsupported provider', 400);
    const state = random();
    const verifier = random();
    const challenge = encode(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.search = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, redirect_uri: callback,
      scope: 'repo', state, code_challenge: challenge, code_challenge_method: 'S256' }).toString();
    return new Response(null, { status: 302, headers: { ...headers, Location: authorize.href,
      'Set-Cookie': cookie(`${state}.${Date.now()}.${verifier}`) } });
  }
  const saved = (request.headers.get('Cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  const [state, issued, verifier] = (saved || '').split('.');
  const elapsed = Date.now() - Number(issued);
  if (!state || !verifier || state !== url.searchParams.get('state') || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > 600000) {
    return text('Invalid or expired sign-in attempt. Close this window and retry from /admin/.', 400);
  }
  if (url.searchParams.has('error') || !url.searchParams.get('code')) return popup(origin, { message: 'GitHub sign in was cancelled or denied.' }, false);
  try {
    const response = await fetcher('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET,
        code: url.searchParams.get('code'), redirect_uri: callback, code_verifier: verifier }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || typeof result.access_token !== 'string' || result.error) throw new Error('Token exchange failed');
    const permission = await fetcher('https://api.github.com/repos/P-E-D-R-O-Gonzalez/hub', {
      headers: { Authorization: `Bearer ${result.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Fontana-Aware-CMS' },
      signal: AbortSignal.timeout(15000),
    });
    if (!permission.ok || !(await permission.json()).permissions?.push) return popup(origin, { message: 'Your GitHub account needs write access to the hub repository.' }, false);
    return popup(origin, { token: result.access_token, provider: 'github' }, true);
  } catch {
    return popup(origin, { message: 'GitHub sign in failed. Please retry or check the OAuth App configuration.' }, false);
  }
}

export default { fetch: (request, env) => handleRequest(request, env) };
