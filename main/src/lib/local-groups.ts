export interface GroupEntry {
  name: string;
  link: string;
  summary: string;
}

export interface GroupSection {
  id: string;
  title: string;
  entries: GroupEntry[];
}

const categories = ['news', 'climate-change', 'religious', 'immigration'];

export function readLocalGroups(content: unknown): GroupSection[] {
  if (!content || typeof content !== 'object') throw new Error('Invalid Local Groups content.');
  return categories.map(id => {
    const section = (content as Record<string, any>)[id];
    if (!section || typeof section.title !== 'string' || !section.title.trim()) throw new Error(`Missing title for ${id}.`);
    const entries = section.entries ?? [];
    if (!Array.isArray(entries)) throw new Error(`Invalid groups for ${id}.`);
    return { id, title: section.title, entries: entries.map(entry => {
      if (!entry || typeof entry.name !== 'string' || !entry.name.trim() || typeof entry.summary !== 'string') {
        throw new Error(`Each group in ${id} needs a name and description.`);
      }
      const link = entry.link ?? '';
      if (typeof link !== 'string') throw new Error(`Invalid website for ${entry.name}.`);
      if (link) {
        const url = new URL(link);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error(`Website for ${entry.name} must use HTTP or HTTPS without credentials.`);
      }
      return { name: entry.name, summary: entry.summary, link };
    }) };
  });
}
