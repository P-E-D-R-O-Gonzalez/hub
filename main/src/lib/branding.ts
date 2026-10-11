export function readBranding(content: unknown) {
  if (!content || typeof content !== 'object') throw new Error('Branding: invalid content.');
  const data = content as Record<string, unknown>;
  function image(key: string, extensions: RegExp) {
    const value = data[key];
    if (value === undefined || value === null || value === '') return '';
    if (typeof value !== 'string' || !/^\/(?!\/)/.test(value) || /[\\?#<>]/.test(value) || value.split('/').includes('..') || !extensions.test(value)) {
      throw new Error('Branding: ' + key + ' must be an uploaded image path.');
    }
    return value;
  }
  const logo = image('logo', /\.(png|jpe?g|webp|gif|svg)$/i);
  const favicon = image('favicon', /\.(png|ico|svg)$/i);
  const logoAlt = typeof data.logo_alt === 'string' ? data.logo_alt.trim() : '';
  if (!logoAlt) throw new Error('Branding: logo description is required.');
  const siteName = data.site_name === undefined ? logoAlt : typeof data.site_name === 'string' ? data.site_name.trim() : '';
  if (!siteName) throw new Error('Branding: site name is required.');
  if (data.browser_title != null && typeof data.browser_title !== 'string') throw new Error('Branding: browser title must be text.');
  const browserTitle = typeof data.browser_title === 'string' && data.browser_title.trim() ? data.browser_title.trim() : siteName;
  if (data.slogan != null && typeof data.slogan !== 'string') throw new Error('Branding: slogan must be text.');
  const slogan = typeof data.slogan === 'string' ? data.slogan.trim() : '';
  return { logo, logoAlt, favicon, siteName, browserTitle, slogan };
}
