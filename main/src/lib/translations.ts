import content from '../data/translations.json' with { type: 'json' };

export interface TranslationEntry { en: string; es: string }
const placeholders = (text: string) => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function createTranslator(entries: TranslationEntry[]) {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry.en !== 'string' || typeof entry.es !== 'string' || !entry.en.trim() || !entry.es.trim()) {
      throw new Error('Translations require non-empty English and Spanish text.');
    }
    const key = entry.en.trim();
    if (seen.has(key)) throw new Error(`Duplicate English translation: ${key}`);
    seen.add(key);
    if (JSON.stringify(placeholders(entry.en)) !== JSON.stringify(placeholders(entry.es))) {
      throw new Error(`Translation placeholders must match for: ${key}`);
    }
  }
  const pairs = entries.map(({en, es}) => ({en: en.trim(), es: es.trim()}));
  const spanish = Object.fromEntries(pairs.map(({en, es}) => [en, es]));
  const english = Object.fromEntries(pairs.map(({en, es}) => [es, en]));
  function translate(text: string, language: string): string {
    const copy = text.trim();
    const target = language === 'es' ? 'es' : 'en';
    const source = target === 'es' ? 'en' : 'es';
    const dictionary = target === 'es' ? spanish : english;
    let result = Object.hasOwn(dictionary, copy) ? dictionary[copy] : undefined;
    if (!result) {
      for (const pair of pairs) {
        if (!placeholders(pair[source]).length) continue;
        const tokens: string[] = [];
        const pattern = pair[source].split(/(\{\w+\})/).map(part => {
          if (/^\{\w+\}$/.test(part)) { tokens.push(part); return '(.+?)'; }
          return escapeRegex(part);
        }).join('');
        const match = new RegExp(`^${pattern}$`).exec(copy);
        if (!match) continue;
        result = pair[target].replace(/\{\w+\}/g, token => {
          const value = match[tokens.indexOf(token) + 1];
          // Panel titles are site copy; counts and account names are literal values.
          return token === '{title}' ? translate(value, language) : value;
        });
        break;
      }
    }
    return result ? text.replace(copy, () => result!) : text;
  }
  return { spanish, translate };
}

export const { spanish, translate } = createTranslator(content.entries);
