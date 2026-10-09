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

export function readLocalGroups(content: unknown): GroupSection[] {
  if (!content || typeof content !== 'object' || Array.isArray(content)) throw new Error('Invalid Local Groups content.');
  const data = content as Record<string, any>;
  // Accept older content while existing CMS sessions transition to the category list.
  const categories = Object.hasOwn(data, 'categories') ? data.categories ?? [] : Object.values(data);
  if (!Array.isArray(categories)) throw new Error('Local Groups categories must be a list.');
  return categories.map((section, index) => {
    const id = `group-category-${index + 1}`;
    if (!section || typeof section.title !== 'string' || !section.title.trim()) throw new Error(`Missing title for ${id}.`);
    const entries = section.entries ?? [];
    if (!Array.isArray(entries)) throw new Error(`Invalid groups for ${id}.`);
    // Empty CMS template rows are placeholders, not published groups.
    const publishedEntries = entries.filter(entry => !(entry && entry.name === '' && entry.summary === '' && !entry.link));
    return { id, title: section.title, entries: publishedEntries.map(entry => {
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
