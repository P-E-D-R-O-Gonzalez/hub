import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHomepage } from '../src/lib/homepage.ts';
const content = JSON.parse(readFileSync(new URL('../src/data/homepage.json', import.meta.url)));

test('published homepage retains its visible cards and footer links', () => {
  const home = readHomepage(content);
  assert.equal(home.sections.length, content.sections.filter(section => section.enabled !== false).length);
  assert.deepEqual(home.footer_links, content.footer_links);
  assert.equal(home.sections.find(section => section.title === 'Fontana Data').embed_url, 'https://arcg.is/01ejfO0');
});

test('editors can reorder, hide, add text and remove all cards', () => {
  const home = readHomepage({ sections: [content.sections.find(section => section.type === 'media'), { enabled: false }, { type: 'text', title: 'Notice', description: 'Community update' }, content.sections[0]] });
  assert.deepEqual(home.sections.map(s => s.title), ['Local Media', 'Notice', 'Fontana Calendar']);
  assert.deepEqual(readHomepage({ sections: [], footer_links: [] }), { sections: [], footer_links: [] });
});

test('unsafe URLs and incomplete interactive cards fail the build', () => {
  for (const url of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'https://user:password@example.com', 'http://example.com']) {
    assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], url }] }));
  }
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[1], embed_url: '/admin/' }] }));
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], button_label: '' }] }));
  assert.throws(() => readHomepage({ sections: [content.sections.find(section => section.type === 'media'), content.sections.find(section => section.type === 'media')] }));
});


test('ICE supports empty text cards while interactive cards still require titles', () => {
  const ice = JSON.parse(readFileSync(new URL('../src/data/ice.json', import.meta.url)));
  const page = readHomepage(ice, { allowEmptyTextCards: true });
  assert.equal(page.sections.length, 12);
  assert.ok(page.sections.every(section => section.type === 'text' && !section.title && !section.description));
  assert.throws(() => readHomepage(ice));
  assert.throws(() => readHomepage({ sections: [{ ...content.sections[0], title: '' }] }, { allowEmptyTextCards: true }));
});
