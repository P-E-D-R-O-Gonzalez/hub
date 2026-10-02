import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHomepage } from '../src/lib/homepage.ts';
const content = JSON.parse(readFileSync(new URL('../src/data/homepage.json', import.meta.url)));

test('existing homepage migrates with its eight cards and footer', () => {
  const home = readHomepage(content);
  assert.equal(home.sections.length, 8);
  assert.equal(home.footer_links.length, 3);
  assert.equal(home.sections[3].embed_url, 'https://example.com');
});

test('editors can reorder, hide, add text and remove all cards', () => {
  const home = readHomepage({ sections: [content.sections[7], { enabled: false }, { type: 'text', title: 'Notice', description: 'Community update' }, content.sections[0]] });
  assert.deepEqual(home.sections.map(s => s.title), ['Local Media', 'Notice', 'Calendar']);
  assert.deepEqual(readHomepage({ sections: [], footer_links: [] }), { sections: [], footer_links: [] });
});

test('unsafe URLs and incomplete interactive cards fail the build', () => {
  for (const url of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'https://user:password@example.com', 'http://example.com']) {
    assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], url }] }));
  }
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[1], embed_url: '/admin/' }] }));
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], button_label: '' }] }));
  assert.throws(() => readHomepage({ sections: [content.sections[7], content.sections[7]] }));
});
