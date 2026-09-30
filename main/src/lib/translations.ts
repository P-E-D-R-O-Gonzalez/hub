// Site-owned copy. Add translations here when editing English page or CMS copy.
export const spanish: Record<string, string> = {
  'Your Page Name': 'Nombre de tu página',
  'Your Page Name Data': 'Datos de tu página',
  'Your Page name TV': 'TV de tu página',
  'Date': 'Fecha', 'Time': 'Hora',
  'Calendar': 'Calendario',
  'Meetings, agendas and attachments.': 'Reuniones, órdenes del día y documentos adjuntos.',
  'View calendar': 'Ver calendario',
  'Traffic': 'Tráfico',
  'Check nearby road conditions.': 'Consulta las condiciones del tráfico cercano.',
  'Load Traffic Cams': 'Cargar cámaras de tráfico',
  'Visit website': 'Visitar sitio web',
  'On Demand Videos': 'Videos a pedido',
  'On demand videos': 'Videos a la carta',
  'Watch recorded city programs.': 'Mira programas grabados de la ciudad.',
  'Load Videos': 'Cargar videos',
  'Explore city maps and public data.': 'Explora mapas de la ciudad y datos públicos.',
  'Load City Data': 'Cargar datos de la ciudad',
  'City open data': 'Datos abiertos de la ciudad',
  'Flock Map': 'Mapa de Flock', 'Flock map': 'Mapa de cámaras Flock',
  'Find mapped camera locations.': 'Encuentra las ubicaciones de las cámaras en el mapa.',
  'Load Flock map': 'Cargar mapa de Flock',
  'Watch the local city broadcast.': 'Mira la transmisión local de la ciudad.',
  'Load Fontana TV': 'Cargar Fontana TV',
  'Local Groups': 'Grupos locales',
  'Discover local news and groups.': 'Descubre noticias y grupos locales.',
  'Browse groups': 'Explorar grupos',
  'Local Media': 'Medios locales',
  'Browse updates from local sources.': 'Consulta novedades de fuentes locales.',
  'Load Local Media': 'Cargar medios locales',
  'Report a city issue': 'Reportar un problema en la ciudad',
  'Send feedback': 'Enviar comentarios',
  'Get involved': 'Participar', 'Get Involved': 'Participa',
  'Back to home': 'Volver al inicio',
  'Back to Your Page Name': 'Volver a tu página',
  'Explore groups and ways to get involved in your community.': 'Explora grupos y formas de participar en tu comunidad.',
  'Choose a section': 'Elige una sección', 'Select a section': 'Selecciona una sección',
  'Choose a section above to see its information.': 'Elige una sección arriba para ver su información.',
  'No groups have been added to this section yet.': 'Todavía no se han agregado grupos a esta sección.',
  'Enable JavaScript to select and view a group section.': 'Activa JavaScript para seleccionar y ver una sección de grupos.',
  'Local News Groups': 'Grupos de noticias locales',
  'Climate Change Groups': 'Grupos sobre el cambio climático',
  'Religious Groups': 'Grupos religiosos', 'Immigration Groups': 'Grupos de inmigración',
  'Temperature': 'Temperatura', 'Air quality (US AQI)': 'Calidad del aire (ICA de EE. UU.)',
  'Wind': 'Viento', 'Loading...': 'Cargando...', 'Unavailable': 'No disponible',
  'Fontana 92335 · Data:': 'Fontana 92335 · Datos:',
  'Weather for Fontana, CA 92335': 'Clima en Fontana, CA 92335',
  'Hub boxes': 'Recursos de la comunidad', 'Community links': 'Enlaces de la comunidad',
  'Show': 'Mostrar', 'All sources': 'Todas las fuentes', 'Refresh feeds': 'Actualizar fuentes',
  'No Instagram sources are configured yet.': 'Todavía no hay fuentes de Instagram configuradas.',
  'If a feed is unavailable or asks you to sign in, use “View on Instagram”.': 'Si una fuente no está disponible o pide iniciar sesión, usa «Ver en Instagram».',
  'Enable JavaScript to view Instagram feeds.': 'Activa JavaScript para ver las fuentes de Instagram.',
  'View on Instagram ↗': 'Ver en Instagram ↗',
  'Requested fresh feeds from Instagram.': 'Se solicitaron actualizaciones a Instagram.',
};

const english = Object.fromEntries(Object.entries(spanish).map(([en, es]) => [es, en]));

export function translate(text: string, language: string): string {
  const copy = text.trim();
  const dictionary = language === 'es' ? spanish : english;
  let result = dictionary[copy];
  if (!result) {
    const action = /^(Open|Close|Abrir|Cerrar) (.+)$/.exec(copy);
    const sources = /^(All sources|Todas las fuentes) (\(\d+\))$/.exec(copy);
    const feed = /^(Instagram feed from|Publicaciones de Instagram de) (@.+)$/.exec(copy);
    if (action) {
      const open = action[1] === 'Open' || action[1] === 'Abrir';
      result = `${language === 'es' ? (open ? 'Abrir' : 'Cerrar') : (open ? 'Open' : 'Close')} ${translate(action[2], language)}`;
    } else if (sources) result = `${language === 'es' ? 'Todas las fuentes' : 'All sources'} ${sources[2]}`;
    else if (feed) result = `${language === 'es' ? 'Publicaciones de Instagram de' : 'Instagram feed from'} ${feed[2]}`;
  }
  return result ? text.replace(copy, result) : text;
}
