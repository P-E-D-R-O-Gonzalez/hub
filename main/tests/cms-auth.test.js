import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { handleRequest } from '../worker/index.js';
const origin = 'https://hub.pdgonzalez2004.workers.dev';
const env = { SITE_ORIGIN: origin, GITHUB_CLIENT_ID: 'test-id', GITHUB_CLIENT_SECRET: 'test-secret', ASSETS: { fetch: () => new Response('asset') } };
async function start() {
  const response = await handleRequest(new Request(`${origin}/api/auth?provider=github`), env);
  return { response, target: new URL(response.headers.get('Location')), cookie: response.headers.get('Set-Cookie').split(';')[0] };
}
test('static requests reach assets and missing credentials fail closed', async () => {
  assert.equal(await (await worker.fetch(new Request(`${origin}/admin/`), env, {})).text(), 'asset');
  assert.equal((await handleRequest(new Request(`${origin}/api/auth?provider=github`), { ...env, GITHUB_CLIENT_SECRET: '' })).status, 503);
  assert.equal((await handleRequest(new Request('https://other.example/api/auth?provider=github'), env)).status, 403);
});
test('authorization uses PKCE and a secure state cookie', async () => {
  const { response, target } = await start();
  assert.equal(response.status, 302);
  assert.equal(target.origin, 'https://github.com');
  assert.equal(target.searchParams.get('redirect_uri'), `${origin}/api/callback`);
  assert.equal(target.searchParams.get('code_challenge_method'), 'S256');
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Lax/);
  assert.ok(target.searchParams.get('state'));
});
test('missing, wrong and expired state never exchange tokens', async () => {
  const { cookie, target } = await start();
  const state = target.searchParams.get('state');
  for (const [query, header] of [[state, ''], ['wrong', cookie], [state, cookie.replace(/\.\d+\./, '.1.')]]) {
    const result = await handleRequest(new Request(`${origin}/api/callback?code=abc&state=${query}`, { headers: { Cookie: header } }), env, () => { throw new Error('Must not fetch'); });
    assert.equal(result.status, 400);
  }
});
test('successful callback checks repository access and restricts popup messages', async () => {
  const { cookie, target } = await start();
  let calls = 0;
  const fetcher = async (_url, options) => {
    calls++;
    if (calls === 1) { assert.ok(JSON.parse(options.body).code_verifier); return Response.json({ access_token: 'test-token' }); }
    return Response.json({ permissions: { push: true } });
  };
  const response = await handleRequest(new Request(`${origin}/api/callback?code=abc&state=${target.searchParams.get('state')}`, { headers: { Cookie: cookie } }), env, fetcher);
  const html = await response.text();
  assert.equal(calls, 2);
  assert.match(html, /authorization:github:success:/);
  assert.match(html, /event.origin !== origin/);
  assert.match(html, /event.source !== openerWindow/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(response.headers.get('Set-Cookie'), /Max-Age=0/);
});
test('denied repository access does not return the token', async () => {
  const { cookie, target } = await start();
  let calls = 0;
  const result = await handleRequest(new Request(`${origin}/api/callback?code=abc&state=${target.searchParams.get('state')}`, { headers: { Cookie: cookie } }), env,
    async () => Response.json(++calls === 1 ? { access_token: 'do-not-return' } : { permissions: { push: false } }));
  const html = await result.text();
  assert.match(html, /authorization:github:error:/);
  assert.ok(!html.includes('do-not-return'));
});
