import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readWeather } from '../src/lib/weather.ts';
const defaults = JSON.parse(readFileSync(new URL('../src/data/weather.json', import.meta.url)));
test('weather defaults preserve Fontana and both services use the selected coordinates',()=>{
 const initial = readWeather(defaults);
 assert.equal(initial.temperatureSuffix,'°F');
 assert.equal(initial.windSuffix,' mph');
 const changed = readWeather({...defaults,city:'Other city',latitude:0,longitude:180,temperature_unit:'celsius',wind_speed_unit:'kmh'});
 for (const address of [changed.weatherUrl,changed.airUrl]) {
  const url=new URL(address);
  assert.equal(url.searchParams.get('latitude'),'0');
  assert.equal(url.searchParams.get('longitude'),'180');
 }
 assert.equal(new URL(changed.weatherUrl).searchParams.get('temperature_unit'),'celsius');
 assert.equal(changed.temperatureSuffix,'°C');
 assert.equal(changed.windSuffix,' km/h');
 assert.equal(changed.city,'Other city');
});
test('wind units and visibility follow CMS choices',()=>{
 for(const [unit,suffix] of [['mph',' mph'],['kmh',' km/h'],['ms',' m/s'],['kn',' kn']]) {
  const config=readWeather({...defaults,wind_speed_unit:unit,enabled:false});
  assert.equal(config.enabled,false);
  assert.equal(config.windSuffix,suffix);
  assert.equal(new URL(config.weatherUrl).searchParams.get('wind_speed_unit'),unit);
 }
});
test('invalid coordinates and units stop publication instead of showing misleading readings',()=>{
 for(const invalid of [{latitude:91},{latitude:-91},{longitude:181},{longitude:-181},{latitude:NaN},{longitude:Infinity},{latitude:''},{latitude:'34'},{city:' '},{temperature_unit:'kelvin'},{wind_speed_unit:'invalid'},{enabled:'false'}]) assert.throws(()=>readWeather({...defaults,...invalid}),/Weather:/);
});
