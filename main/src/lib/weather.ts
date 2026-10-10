export function readWeather(content: unknown) {
  if (!content || typeof content !== 'object') throw new Error('Weather: invalid settings.');
  const data = content as Record<string, unknown>;
  if (typeof data.enabled !== 'boolean') throw new Error('Weather: visibility must be true or false.');
  const city = typeof data.city === 'string' ? data.city.trim() : '';
  if (!city) throw new Error('Weather: city name is required.');
  function coordinate(key: string, limit: number) {
    const value = data[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > limit) throw new Error('Weather: ' + key + ' must be a number between ' + -limit + ' and ' + limit + '.');
    return value;
  }
  const latitude = coordinate('latitude', 90);
  const longitude = coordinate('longitude', 180);
  if (data.temperature_unit !== 'celsius' && data.temperature_unit !== 'fahrenheit') throw new Error('Weather: choose Celsius or Fahrenheit.');
  const windLabels: Record<string, string> = { mph: 'mph', kmh: 'km/h', ms: 'm/s', kn: 'kn' };
  if (typeof data.wind_speed_unit !== 'string' || !Object.hasOwn(windLabels, data.wind_speed_unit)) throw new Error('Weather: invalid wind speed unit.');
  const coordinates = { latitude: String(latitude), longitude: String(longitude) };
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.search = new URLSearchParams({ ...coordinates, current: 'temperature_2m,wind_speed_10m', temperature_unit: data.temperature_unit, wind_speed_unit: data.wind_speed_unit }).toString();
  const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airUrl.search = new URLSearchParams({ ...coordinates, current: 'us_aqi' }).toString();
  return { enabled: data.enabled, city, weatherUrl: weatherUrl.href, airUrl: airUrl.href, temperatureSuffix: data.temperature_unit === 'fahrenheit' ? '°F' : '°C', windSuffix: ' ' + windLabels[data.wind_speed_unit] };
}
