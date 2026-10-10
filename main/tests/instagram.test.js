import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readInstagramSources } from '../src/lib/instagram.ts';

test('CMS source edits preserve order, accept @ and allow removing all feeds', () => {
  assert.deepEqual(readInstagramSources({sources:[{username:'@second.account'},{username:' first_account '}]}), ['second.account','first_account']);
  for (const content of [{sources:[]},{sources:null},{}]) assert.deepEqual(readInstagramSources(content),[]);
});

test('malformed and duplicate accounts cannot generate feed URLs', () => {
  for (const username of ['', 'https://instagram.com/account', '../account', 'a/b', 'a?x=1', '.account', 'account.', 'a..b', 'a'.repeat(31)]) {
    assert.throws(() => readInstagramSources({sources:[{username}]}), /Local Media/);
  }
  assert.throws(() => readInstagramSources({sources:[{username:'Example'},{username:'@example'}]}), /duplicate/);
  assert.throws(() => readInstagramSources({sources:'account'}), /list/);
});

test('CMS writes the same source file that the viewer reads', () => {
  const config = JSON.parse(readFileSync(new URL('../public/admin/config.yml',import.meta.url)));
  const entry = config.collections.find(c=>c.name==='pages').files.find(f=>f.name==='instagram');
  assert.equal(entry.file,'main/src/data/instagram.json');
  const content = JSON.parse(readFileSync(new URL('../src/data/instagram.json',import.meta.url)));
  assert.doesNotThrow(()=>readInstagramSources(content));
  const viewer = readFileSync(new URL('../src/components/InstagramFeed.astro',import.meta.url),'utf8');
  assert.match(viewer, /import content from '..\/data\/instagram.json'/);
  assert.match(viewer, /readInstagramSources\(content\)/);
});
