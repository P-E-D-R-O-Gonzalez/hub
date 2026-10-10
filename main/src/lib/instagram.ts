// Validate CMS accounts before constructing public Instagram URLs.
export function readInstagramSources(content: unknown): string[] {
  if (!content || typeof content !== 'object') throw new Error('Local Media: invalid content.');
  const sources = (content as { sources?: unknown }).sources;
  if (sources === undefined || sources === null) return [];
  if (!Array.isArray(sources)) throw new Error('Local Media: sources must be a list.');
  const seen = new Set<string>();
  return sources.map((source, index) => {
    const username = typeof source?.username === 'string' ? source.username.trim().replace(/^@/, '') : '';
    if (!/^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/.test(username) || username.includes('..')) {
      throw new Error('Local Media: source ' + (index + 1) + ' needs a valid Instagram username (not a URL).');
    }
    const key = username.toLowerCase();
    if (seen.has(key)) throw new Error('Local Media: duplicate Instagram username @' + username + '.');
    seen.add(key);
    return username;
  });
}
