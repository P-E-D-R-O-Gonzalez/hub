import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { prepare, save, validate } from '../scripts/setup.mjs';

const input = { name: 'Our Community', repo: 'https://github.com/neighbors/website.git', branch: 'template', worker: 'our-community', origin: 'https://our-community.example.org/' };

test('accepts public repository URL and normalizes site origin', () => {
  assert.equal(validate(input).repo, 'neighbors/website');
  assert.equal(validate(input).origin, 'https://our-community.example.org');
});

test('rejects unsafe or unusable settings', () => {
  for (const [key, values] of Object.entries({
    name: ['', '<script>', 'Name\nInjected'],
    repo: ['https://attacker.test/owner/repo', 'owner/repo/extra', 'owner/..', 'token@github.com/owner/repo'],
    branch: ['-main', 'a..b', 'a b', 'main.lock', 'a/.hidden', '@', 'main:other'],
    worker: ['UPPER', '-site', 'site-', 'a'.repeat(64)],
    origin: ['http://site.example.org', 'https://site.example.org/admin', 'https://user:secret@site.example.org', 'https://site.example.org?secret=value', 'https://example.com', 'https://site.example.org:444'],
  })) for (const value of values) assert.throws(() => validate({ ...input, [key]: value }), `${key}: ${value}`);
});

test('updates matching CMS and Worker settings, preserves content, backs up and supports reruns', async t => {
  const root = await mkdtemp(resolve(tmpdir(), 'cms-setup-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixtures = {
    'public/admin/config.yml': { backend: { name: 'github' }, collections: [{ name: 'custom-content' }], media_folder: 'main/public/uploads' },
    'wrangler.jsonc': { name: 'old', main: 'worker/index.js', assets: { binding: 'ASSETS' }, vars: { KEEP: 'existing' } },
    'src/data/branding.json': { site_name: 'Old', browser_title: 'Old', logo: '/uploads/logo.png', logo_alt: 'Custom description', slogan: 'Keep this' },
  };
  for (const [path, value] of Object.entries(fixtures)) {
    await mkdir(dirname(resolve(root, path)), { recursive: true });
    await writeFile(resolve(root, path), JSON.stringify(value));
  }
  const plan = await prepare(root, input);
  assert.equal(JSON.parse(await readFile(resolve(root, 'wrangler.jsonc'), 'utf8')).name, 'old', 'preview does not write');
  const backup = await save(root, plan);
  const cms = JSON.parse(await readFile(resolve(root, 'public/admin/config.yml'), 'utf8'));
  const worker = JSON.parse(await readFile(resolve(root, 'wrangler.jsonc'), 'utf8'));
  const branding = JSON.parse(await readFile(resolve(root, 'src/data/branding.json'), 'utf8'));
  assert.equal(cms.backend.repo, worker.vars.GITHUB_REPO);
  assert.equal(cms.backend.base_url, worker.vars.SITE_ORIGIN);
  assert.equal(cms.backend.branch, 'template');
  assert.deepEqual(cms.collections, fixtures['public/admin/config.yml'].collections);
  assert.equal(cms.media_folder, 'main/public/uploads');
  assert.equal(worker.vars.KEEP, 'existing');
  assert.deepEqual(worker.assets, { binding: 'ASSETS' });
  assert.equal(branding.slogan, 'Keep this');
  assert.equal(branding.logo_alt, 'Custom description');
  assert.equal(branding.browser_title, input.name);
  assert.equal(await readFile(resolve(backup, 'wrangler.jsonc'), 'utf8'), JSON.stringify(fixtures['wrangler.jsonc']));
  const again = await prepare(root, input);
  assert.ok(again.files.every(file => file.before === file.after));
  const guide = await readFile(resolve(root, 'SETUP-CHECKLIST.md'), 'utf8');
  assert.match(guide, /https:\/\/our-community.example.org\/api\/callback/);
  assert.match(guide, /runtime settings, not the Builds variables/);
  assert.match(guide, /Production branch: template/);
  await writeFile(resolve(root, 'wrangler.jsonc'), 'invalid');
  await assert.rejects(prepare(root, input), /No files changed/);
  assert.equal(await readFile(resolve(root, 'public/admin/config.yml'), 'utf8'), again.files[0].before);
});
