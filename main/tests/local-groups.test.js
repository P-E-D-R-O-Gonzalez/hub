import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readLocalGroups } from '../src/lib/local-groups.ts';

test('legacy category objects remain readable during migration', () => {
  const category = { title: 'Local News', entries: [{ name: 'Paper', summary: 'Daily news' }] };
  assert.deepEqual(readLocalGroups({ news: category }), readLocalGroups({ categories: [category] }));
});

test('new categories, reordering, duplicate names, and empty lists work', () => {
  const groups = [{ name: 'Community garden', summary: 'Meet on Sundays', link: 'https://example.com' }];
  const categories = [{ title: 'Gardening', entries: groups }, { title: 'Arts' }, { title: 'Gardening' }];
  const result = readLocalGroups({ categories });
  assert.deepEqual(result.map(c => c.title), ['Gardening', 'Arts', 'Gardening']);
  assert.equal(new Set(result.map(c => c.id)).size, 3);
  assert.deepEqual(result[0].entries, groups);
  assert.deepEqual(readLocalGroups({ categories: categories.toReversed() }).map(c => c.title), categories.toReversed().map(c => c.title));
  assert.deepEqual(readLocalGroups({ categories: [] }), []);
  assert.deepEqual(readLocalGroups({ categories: null }), []);
});

test('bad categories and unsafe group links fail validation', () => {
  for (const categories of [{}, [null], [{ title: ' ' }], [{ title: 'Arts', entries: {} }], [{ title: 'Arts', entries: [{ name: 'Unsafe', summary: '', link: 'javascript:alert(1)' }] }]]) {
    assert.throws(() => readLocalGroups({ categories }));
  }
});

test('CMS exposes a category list containing a group list', () => {
  const config = JSON.parse(readFileSync(new URL('../public/admin/config.yml', import.meta.url)));
  const editor = config.collections.find(c => c.name === 'pages').files.find(f => f.name === 'local_groups');
  assert.equal(editor.fields[0].name, 'categories');
  assert.equal(editor.fields[0].widget, 'list');
  assert.equal(editor.fields[0].fields.find(f => f.name === 'entries').widget, 'list');
});
