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
  return { logo, logoAlt, favicon };
}
