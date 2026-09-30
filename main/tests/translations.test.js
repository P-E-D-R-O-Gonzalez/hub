import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTranslator, translate } from '../src/lib/translations.ts';

test('CMS translation file and fields match the runtime data', () => {
  const config = JSON.parse(readFileSync(new URL('../public/admin/config.yml', import.meta.url)));
  const editor = config.collections.find(c => c.name === 'pages').files.find(f => f.name === 'translations');
  assert.equal(editor.file, 'main/src/data/translations.json');
  assert.deepEqual(editor.fields[0].fields.map(f => f.name), ['en', 'es']);
  assert.equal(translate('Fontana Calendar', 'es'), 'Calendario de Fontana');
});

test('CMS edits and new phrases are used, including dynamic placeholders', () => {
  const { translate: t } = createTranslator([
    {en: 'Open {title}', es: 'Mostrar: {title}'},
    {en: 'Local Media', es: 'Noticias locales'},
    {en: 'All sources ({count})', es: 'Fuentes: {count}'},
    {en: 'Instagram feed from {account}', es: 'Cuenta {account}'},
    {en: 'New paragraph.', es: 'Nuevo párrafo.'},
  ]);
  assert.equal(t('Open Local Media', 'es'), 'Mostrar: Noticias locales');
  assert.equal(t('All sources (3)', 'es'), 'Fuentes: 3');
  assert.equal(t('Instagram feed from @fontana', 'es'), 'Cuenta @fontana');
  assert.equal(t(' New paragraph. ', 'es'), ' Nuevo párrafo. ');
  assert.equal(t('Missing text', 'es'), 'Missing text');
  assert.equal(t('toString', 'es'), 'toString');
});

test('invalid CMS data fails clearly', () => {
  assert.throws(() => createTranslator([{en: 'Open {title}', es: 'Abrir'}]), /placeholders/);
  assert.throws(() => createTranslator([{en: 'Date', es: 'Fecha'}, {en: 'Date', es: 'Día'}]), /Duplicate/);
  assert.throws(() => createTranslator([{en: 'Date', es: ' '}]), /non-empty/);
});
