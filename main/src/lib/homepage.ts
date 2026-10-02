type SectionType = 'link' | 'embed' | 'text' | 'media';
interface HomeSection {
  type: SectionType;
  title: string;
  description: string;
  button_label: string;
  url: string;
  embed_url: string;
  panel_title: string;
}

function text(value: unknown, label: string, required = true): string {
  if (!required && (value === undefined || value === null)) return '';
  if (typeof value !== 'string' || (required && !value.trim())) throw new Error(`Home page: ${label} is required.`);
  return value.trim();
}

function link(value: unknown, label: string, embed = false): string {
  const result = text(value, label);
  if (/\s|\\/.test(result)) throw new Error(`Home page: invalid ${label}.`);
  if (!embed && /^\/(?!\/)/.test(result)) return result;
  let url: URL;
  try { url = new URL(result); } catch { throw new Error(`Home page: invalid ${label}.`); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Home page: ${label} must use HTTPS without credentials.`);
  return result;
}

export function readHomepage(content: unknown): { sections: HomeSection[]; footer_links: { label: string; url: string }[] } {
  if (!content || typeof content !== 'object') throw new Error('Invalid Home page content.');
  const data = content as Record<string, any>;
  const rawSections = data.sections ?? [];
  const rawLinks = data.footer_links ?? [];
  if (!Array.isArray(rawSections) || !Array.isArray(rawLinks)) throw new Error('Home page sections and footer links must be lists.');
  let mediaCount = 0;
  const sections: HomeSection[] = [];
  for (const section of rawSections) {
    if (!section || typeof section !== 'object') throw new Error('Invalid Home page section.');
    if (section.enabled !== undefined && typeof section.enabled !== 'boolean') throw new Error('Home page visibility must be true or false.');
    if (section.enabled === false) continue;
    if (!['link', 'embed', 'text', 'media'].includes(section.type)) throw new Error('Unknown Home page section type.');
    if (section.type === 'media' && ++mediaCount > 1) throw new Error('Use only one visible Local Media section.');
    const title = text(section.title, 'section title');
    sections.push({
      type: section.type,
      title,
      description: text(section.description, `${title} description`, false),
      button_label: section.type === 'text' ? '' : text(section.button_label, `${title} button text`),
      url: ['link', 'embed'].includes(section.type) ? link(section.url, `${title} link`) : '',
      embed_url: section.type === 'embed' ? link(section.embed_url, `${title} embed URL`, true) : '',
      panel_title: text(section.panel_title, `${title} panel title`, false) || title,
    });
  }
  const footer_links = rawLinks.map(item => {
    if (!item || typeof item !== 'object') throw new Error('Invalid Home page footer link.');
    return { label: text(item.label, 'footer link text'), url: link(item.url, 'footer link') };
  });
  return { sections, footer_links };
}
