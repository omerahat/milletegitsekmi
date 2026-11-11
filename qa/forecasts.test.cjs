const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../forecasts.js'), 'utf8');
const context = vm.createContext({ document: { getElementById: () => ({}), querySelectorAll: () => [] }, Date, Intl, URL, AbortSignal, TextDecoder, Uint8Array, setInterval() {}, fetch: async () => { throw Error('offline'); } });
vm.runInContext(source, context);
function forecast() {
  const origin = Date.now();
  return { schema_version: '1', forecast_origin: new Date(origin).toISOString(), generated_at: new Date(origin).toISOString(), observed_at: new Date(origin - 60000).toISOString(), observed_occupancy: 0, model_status: 'experimental', model_name: 'NaiveBaseline', model_version: 'baseline-v1', method: 'NaiveBaseline', readiness: { ready: true, reasons: [], max_observation_age_minutes: 15, required_context: 'exact quality hours for requested seasonal targets', quality_policy: 'ml-data-v1-inferred5m-no-fill' }, freshness: { max_age_minutes: 15, source_age_seconds: 60 }, input_bounds: [0, 23], evaluation_summary: null, target_semantics: 'hourly interval end; complete future intervals only', forecast_status: 'experimental_available', horizon_hours: 24, warnings: [], predictions: Array.from({ length: 24 }, (_, i) => ({ horizon_hour: i + 1, interval_start: new Date(Math.ceil(origin / 3600000) * 3600000 + i * 3600000).toISOString(), target_timestamp: new Date(Math.ceil(origin / 3600000) * 3600000 + (i + 1) * 3600000).toISOString(), predicted_occupancy: i })) };
}
function arena() {
  return { schema_version: '1', generated_at: new Date().toISOString(), comparison_id: 'synthetic-test-only', protocol: 'test', primary_window_count: 8, warnings: [], current_forecast_model: null, evaluation_origins: [], baseline_comparison: null, models: [{ model_name: 'NaiveBaseline', evaluation_status: 'evaluated', evaluation_windows: 8, overall: { mae: 0, rmse: 0, n: 192 }, by_horizon: { '1': { mae: 0, rmse: 0, n: 8 } }, baseline_improvement_pct: 0, initial_quality_gate: false, fitted_artifact_status: 'unavailable', fitted_artifact_version: null, approved_for_live_inference: true, model_status: 'experimental' }] };
}
test('forecast accepts exact hourly alignment and true zero observations', () => {
  const value = forecast();
  assert.equal(context.validatePublicForecast(value), value);
});
test('forecast rejects future observations, invented points and invalid values', () => {
  for (const mutate of [v => { v.observed_at = new Date(Date.now() + 3600000).toISOString(); }, v => v.predictions.pop(), v => { v.predictions[0].predicted_occupancy = NaN; }, v => { v.predictions[0].horizon_hour = 2; }, v => { v.predictions[0].target_timestamp = v.forecast_origin; }, v => { v.model_name = 'GradientBoosting'; }]) {
    const value = forecast(); mutate(value);
    assert.throws(() => context.validatePublicForecast(value));
  }
});
test('unavailable forecast has no predictions and remains an explicit state', () => {
  const value = unavailable();
  assert.equal(context.validatePublicForecast(value), value);
  value.predictions = forecast().predictions;
  assert.throws(() => context.validatePublicForecast(value));
});
test('Arena preserves zero error and rejects non-finite or unrecorded metrics', () => {
  assert.equal(context.validatePublicArena(arena()).models[0].overall.mae, 0);
  for (const mutate of [v => { v.models[0].overall.mae = NaN; }, v => { v.models[0].overall.n = 0; }, v => { v.models[0].evaluation_status = 'failed'; }, v => v.models.push(v.models[0])]) {
    const value = arena(); mutate(value);
    assert.throws(() => context.validatePublicArena(value));
  }
});
function unavailable() {
  const value = forecast();
  Object.assign(value, { model_name: null, model_version: null, model_status: 'unavailable', forecast_status: 'insufficient_data', input_bounds: null, predictions: [] });
  value.readiness = { ...value.readiness, ready: false, reasons: ['missing_or_invalid_model_context'] };
  return value;
}
test('forecast rejects contradictory readiness, identities, stale metadata and promotion claims', () => {
  for (const mutate of [
    v => { v.readiness.ready = false; v.readiness.reasons = ['missing_or_invalid_model_context']; },
    v => { v.method = 'LastObservationPersistence'; },
    v => { v.model_name = 'LastObservationPersistence'; },
    v => { v.predictions = []; }, v => v.predictions.reverse(),
    v => { v.forecast_status = 'stale'; },
    v => { v.freshness.source_age_seconds = 0; },
    v => { v.model_status = 'validated'; },
    v => { v.method = 'unknown'; },
    v => { v.readiness.required_context = 'fresh actual observation'; },
    v => { v.observed_at = '2026-02-30T00:00:00Z'; }
  ]) {
    const value = forecast(); mutate(value);
    assert.throws(() => context.validatePublicForecast(value));
  }
});
test('frontend rejects arbitrary unknown public fields recursively', () => {
  function paths(v, prefix = []) {
    if (!v || typeof v !== 'object') return [];
    return [...(Array.isArray(v) ? [] : [prefix]), ...Object.entries(v).flatMap(([k, child]) => paths(child, [...prefix, k]))];
  }
  for (const [original, validate] of [[forecast(), context.validatePublicForecast], [arena(), context.validatePublicArena]]) {
    for (const keys of paths(original)) {
      const value = structuredClone(original);
      let target = value; for (const k of keys) target = target[k];
      target.unexpected = { nested: 'PRIVATE_CANARY' };
      assert.throws(() => validate(value));
    }
  }
});
test('fresh sources cannot claim stale reasons and persistence must hold its observation', () => {
  const fresh = unavailable(); fresh.readiness.reasons = ['stale_observation'];
  assert.throws(() => context.validatePublicForecast(fresh));
  const persistence = forecast();
  persistence.method = persistence.model_name = 'LastObservationPersistence';
  persistence.readiness.required_context = 'fresh actual observation';
  assert.throws(() => context.validatePublicForecast(persistence));
  persistence.input_bounds = [0, 0];
  persistence.predictions.forEach(p => { p.predicted_occupancy = 0; });
  assert.equal(context.validatePublicForecast(persistence), persistence);
});
test('strict public JSON rejects duplicate keys after escape decoding at every object depth', () => {
  for (const raw of [
    '{"a":1,"a":2}',
    '{"outer":{"a":1,"a":2}}',
    '{"readiness":{"ready":false,"ready":true}}',
    '{"model_name":"NaiveBaseline","method":"LastObservationPersistence","model_name":"LastObservationPersistence"}',
    '{"a":1,"\\u0061":2}',
    '{"readiness":{"ready":true,"reasons":[]},"nested":[{"value":1}]}'
  ]) {
    if (raw.includes('"nested"')) assert.deepEqual(JSON.parse(JSON.stringify(context.parseStrictJson(raw))), { readiness: { ready: true, reasons: [] }, nested: [{ value: 1 }] });
    else assert.throws(() => context.parseStrictJson(raw));
  }
});
test('bounded public response reader rejects oversized and invalid UTF-8 bodies', async () => {
  const large = new Response(' '.repeat(1048577));
  await assert.rejects(() => context.readPublicJson(large), /too large/);
  const invalidUtf8 = new Response(new Uint8Array([0xff]));
  await assert.rejects(() => context.readPublicJson(invalidUtf8));
  assert.deepEqual(JSON.parse(JSON.stringify(await context.readPublicJson(new Response('{"ok":[1,true,null]}')))), { ok: [1, true, null] });
});
test('strict public JSON rejects malformed syntax and non-finite numeric overflow', () => {
  for (const raw of ['{"a":}', '{"a":1,}', 'true false', '{"a":1e999}', '[01]']) assert.throws(() => context.parseStrictJson(raw));
});
function multiForecast() {
  const template = forecast();
  const windows = Object.fromEntries([1, 3, 6, 12, 24].map(h => {
    const value = structuredClone(template);
    value.horizon_hours = h;
    value.predictions = value.predictions.slice(0, h);
    if (h === 24) {
      value.method = value.model_name = 'LastObservationPersistence';
      value.readiness.required_context = 'fresh actual observation';
      value.input_bounds = [0, 0];
      value.predictions.forEach(p => { p.predicted_occupancy = 0; });
    }
    return [String(h), value];
  }));
  return { ...windows['24'], windows, forecast_id: 'a'.repeat(64) };
}
test('independent window contracts preserve selected model and reject nested corruption', () => {
  const data = multiForecast();
  context.validatePublicForecast(data);
  assert.equal(data.windows['6'].model_name, 'NaiveBaseline');
  assert.equal(data.windows['24'].model_name, 'LastObservationPersistence');
  for (const mutate of [v => v.windows['3'].predictions.pop(), v => { v.windows['6'].private = 'canary'; }, v => { v.windows['1'].horizon_hours = 3; }, v => { v.windows['12'].forecast_origin = new Date(0).toISOString(); }]) {
    const invalid = structuredClone(data); mutate(invalid);
    assert.throws(() => context.validatePublicForecast(invalid));
  }
});
module.exports = { forecast, arena, unavailable, multiForecast };

test('dynamic forecast axis includes the observation with proportional padding', () => {
  const [low, high] = context.chartDomain([1000, 1300, 1200]);
  assert(low > 0 && low < 1000 && high > 1300);
  const flat = context.chartDomain([0, 0]);
  assert(flat[0] === 0 && flat[1] > 0);
});
test('preferred forecast only falls back when the v2 artifact is absent', async () => {
  vm.runInContext(`fetchPublicArtifact = async name => { if (name === 'forecast-5min') { const error = new Error('missing'); error.status = 404; throw error; } return legacyFixture; };`, context);
  context.legacyFixture = forecast();
  assert.equal(await context.loadPreferredForecast(), context.legacyFixture);
  vm.runInContext(`fetchPublicArtifact = async () => ({schema_version:'99'});`, context);
  await assert.rejects(context.loadPreferredForecast());
});
function fiveMinuteForecast() {
  const origin = Date.now() - 1000;
  const first = (Math.floor(origin / 300000) + 1) * 300000;
  return {schema_version:'2',granularity_minutes:5,forecast_id:'a'.repeat(24),generated_at:new Date(origin).toISOString(),observed_at:new Date(origin-60000).toISOString(),observed_occupancy:1100,readiness:{ready:true,reasons:[]},freshness:{source_age_seconds:60,max_source_age_seconds:900},warnings:[],windows:Object.fromEntries([1,3,6,12,24].map(h=>[String(h),{horizon_hours:h,status:'available',method:'PreviousDay',model_version:'five-minute-v1',fallback_reason:null,predictions:Array.from({length:h*12},(_,i)=>({target_timestamp:new Date(first+i*300000).toISOString(),interval_start:new Date(first+i*300000).toISOString(),interval_end:new Date(first+(i+1)*300000).toISOString(),predicted_occupancy:1000+i,step:i+1,granularity_minutes:5}))}]))};
}
test('v2 validates every horizon and rejects fabricated timing, values and nested fields', () => {
  assert.equal(context.validateFiveMinuteForecast(fiveMinuteForecast()).windows['24'].predictions.length,288);
  for(const mutate of [v=>v.windows['1'].predictions.pop(),v=>v.windows['3'].predictions[0].interval_start=v.generated_at,v=>v.windows['6'].predictions[0].predicted_occupancy=-1,v=>v.windows['12'].predictions[0].private='secret',v=>v.windows['24'].method='LastObservationPersistence',v=>v.freshness.source_age_seconds=0]) {const value=fiveMinuteForecast();mutate(value);assert.throws(()=>context.validateFiveMinuteForecast(value));}
});
test('v2 render exposes selected count, Istanbul labels and pointer/keyboard inspection', () => {
  const nodes = new Map();
  function node() { return {hidden:false,value:'0',children:[],attributes:{},setAttribute(k,v){this.attributes[k]=v;},append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},querySelectorAll(){return [];},getBoundingClientRect(){return {left:0,width:720};}}; }
  const document = {getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},createElement:node,createElementNS:node,querySelectorAll(){return [];}};
  const view = vm.createContext({document,Date,Intl,URL,AbortSignal,TextDecoder,Uint8Array,setInterval(){},fetch:async()=>{throw Error('offline');}});
  vm.runInContext(source,view);
  const data=fiveMinuteForecast();
  for(const h of [1,3,6,12,24]){vm.runInContext(`selectedForecastHorizon=${h}`,view);view.renderFiveMinuteForecast(data);assert.equal(nodes.get('forecast-rows').children.length,h*12);assert.equal(nodes.get('forecast-output').hidden,false);}
  nodes.get('forecast-point').value='1';nodes.get('forecast-point').oninput();assert(nodes.get('forecast-tooltip').textContent.includes('2/288'));
  nodes.get('forecast-chart').onpointermove({clientX:670});assert(nodes.get('forecast-tooltip').textContent.includes('288/288'));
  assert(nodes.get('forecast-headline').textContent.includes('kişi'));
});
