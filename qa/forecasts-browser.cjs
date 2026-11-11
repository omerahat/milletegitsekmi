// Synthetic browser fixtures exercise rendering only; never published as evaluations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { forecast, arena, unavailable, multiForecast } = require('./forecasts.test.cjs');
const deps = process.env.QA_NODE_MODULES || path.join(process.env.TEMP, 'mk-frontend-qa-tools/node_modules');
const { chromium } = require(path.join(deps, 'playwright'));
const { default: AxeBuilder } = require(path.join(deps, '@axe-core/playwright'));
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '../../omerahat-infra/.local/phase6-browser');
const current = JSON.parse(fs.readFileSync(path.join(root, 'data/v1/current.json')));
let mode = 'ready';
const server = http.createServer((request, response) => {
  let pathname = new URL(request.url, 'http://localhost').pathname;
  pathname = pathname.replace(/^\/milletegitsekmi\//, '/');
  if (pathname.endsWith('.json')) {
    response.setHeader('Content-Type', 'application/json');
    if (pathname.endsWith('/current.json')) return response.end(JSON.stringify({ ...current, observed_at: new Date(Date.now() - 60000).toISOString(), published_at: new Date().toISOString() }));
    if (mode === 'offline') { response.statusCode = 404; return response.end('{}'); }
    if (pathname.endsWith('/forecast.json')) {
      if (mode === 'arena-offline') return response.end(JSON.stringify(forecast()));
      const value = mode === 'unavailable' ? unavailable() : mode.startsWith('multi') ? multiForecast() : forecast();
      if (mode === 'multi-long-unavailable') {
        const window = value.windows['24'];
        Object.assign(window, { model_name: null, model_version: null, model_status: 'unavailable', forecast_status: 'generation_failure', input_bounds: null, predictions: [] });
        window.readiness = { ...window.readiness, ready: false, reasons: ['generation_failure'] };
        Object.assign(value, value.windows['24']);
      }
      if (mode === 'inconsistent') { value.readiness.ready = false; value.method = 'LastObservationPersistence'; }
      if (mode === 'stale') { value.forecast_origin = new Date(Date.now() - 7200000).toISOString(); value.observed_at = new Date(Date.now() - 7260000).toISOString(); value.predictions.forEach((p, i) => { const start = Math.ceil(Date.parse(value.forecast_origin) / 3600000) * 3600000 + i * 3600000; p.interval_start = new Date(start).toISOString(); p.target_timestamp = new Date(start + 3600000).toISOString(); }); }
      let raw = JSON.stringify(value);
      if (mode === 'duplicate-top') raw = raw.replace('"model_status":"experimental"', '"model_status":"validated","model_status":"experimental"');
      if (mode === 'duplicate-nested') raw = raw.replace('"ready":true', '"ready":false,"ready":true');
      if (mode === 'duplicate-method') raw = raw.replace('"method":"NaiveBaseline"', '"method":"LastObservationPersistence","method":"NaiveBaseline"');
      if (mode === 'duplicate-model') raw = raw.replace('"model_name":"NaiveBaseline"', '"model_name":"LastObservationPersistence","model_name":"NaiveBaseline"');
      if (mode === 'duplicate-escaped') raw = raw.replace('"ready":true', '"r\\u0065ady":false,"ready":true');
      if (mode === 'malformed') raw = '{"forecast_status":}';
      if (mode === 'oversized') raw = `{"padding":"${'x'.repeat(1048577)}"}`;
      if (mode === 'valid-nested') raw = raw.replace('"warnings":[]', '"warnings":["nested {\\"safe\\":true}"]');
      return response.end(raw);
    }
    if (mode === 'arena-offline') { response.statusCode = 404; return response.end('{}'); }
    const value = arena();
    value.models.push(...['GradientBoosting', 'LightGBM'].map(model_name => ({ ...value.models[0], model_name, approved_for_live_inference: false })));
    value.warnings = ['Synthetic browser fixture: eight origins cannot validate production accuracy.', '<img src=x onerror=alert(1)>'];
    const raw = JSON.stringify(value);
    return response.end(mode === 'arena-duplicate' ? raw.replace('"evaluation_windows":8', '"evaluation_windows":0,"evaluation_windows":8') : raw);
  }
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname.slice(1));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { response.statusCode = 404; return response.end(); }
  response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  response.end(fs.readFileSync(file));
});
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const results = [];
  try {
    for (const prefix of ['/', '/milletegitsekmi/']) {
      for (const width of [375, 768, 1440]) {
        mode = 'ready';
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        const errors = [];
        const strictScenarios = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
        await page.locator('#forecast-output').waitFor({ state: 'visible' });
        await page.locator('#arena-output').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#forecast-rows tr').count(), 6);
        assert.equal(await page.locator('#forecast-chart polyline').count(), 1);
        for (const horizon of [1, 3, 6, 12, 24]) {
          await page.locator(`[data-forecast-horizon="${horizon}"]`).click();
          assert.equal(await page.locator('#forecast-rows tr').count(), horizon);
          assert.equal(await page.locator(`[data-forecast-horizon="${horizon}"]`).getAttribute('aria-pressed'), 'true');
          assert.equal(await page.locator('#forecast-headline').isVisible(), horizon === 1);
        }
        assert.equal(await page.locator('#arena-rows tr').count(), 3);
        mode = 'multi'; await page.evaluate(() => loadForecastData());
        for (const h of [1, 3, 6, 12, 24]) {
          await page.locator(`[data-forecast-horizon="${h}"]`).click();
          assert.equal(await page.locator('#forecast-rows tr').count(), h);
          assert.match(await page.locator('#forecast-method').textContent(), h === 24 ? /LastObservationPersistence/ : /NaiveBaseline/);
        }
        mode = 'multi-long-unavailable'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), false);
        await page.locator('[data-forecast-horizon="6"]').click();
        assert.equal(await page.locator('#forecast-output').isVisible(), true);
        assert.equal(await page.locator('#forecast-rows tr').count(), 6);
        mode = 'ready'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#arena img').count(), 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.locator('#arena-horizon').selectOption('1');
        assert.match(await page.locator('#arena-rows').textContent(), /8 hedef/);
        const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        assert.deepEqual(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
        await page.screenshot({ path: path.join(output, `forecast-${prefix === '/' ? 'root' : 'project'}-${width}.png`), fullPage: true });
        for (const scenario of ['duplicate-top', 'duplicate-nested', 'duplicate-method', 'duplicate-model', 'duplicate-escaped', 'malformed', 'oversized']) {
          mode = scenario;
          await page.evaluate(() => loadForecastData());
          assert.equal(await page.locator('#forecast-output').isVisible(), true, `${scenario} retains last valid forecast`);
          assert.equal(await page.locator('#arena-output').isVisible(), true, `${scenario} leaves Arena available`);
          assert.match(await page.locator('#occupancy').textContent(), /\d/);
          strictScenarios.push({ name: scenario, forecastRejected: true, arenaRetained: true, occupancyRetained: true });
        }
        mode = 'valid-nested'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), true, 'valid nested JSON accepted');
        strictScenarios.push({ name: 'valid-nested', forecastAccepted: true });
        mode = 'arena-duplicate'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#arena-output').isVisible(), true, 'duplicate Arena key retains prior valid record');
        assert.equal(await page.locator('#forecast-output').isVisible(), true, 'invalid Arena leaves forecast available');
        strictScenarios.push({ name: 'duplicate-arena', arenaRejected: true, forecastRetained: true });
        mode = 'arena-offline'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), true, 'Arena 404 leaves forecast available');
        assert.equal(await page.locator('#arena-output').isVisible(), true, 'missing Arena retains prior record');
        strictScenarios.push({ name: 'arena-404', forecastRetained: true, arenaUnavailable: true });
        mode = 'unavailable'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), false);
        assert.equal(await page.locator('#arena-output').isVisible(), true);
        assert.match(await page.locator('#forecast-status').textContent(), /eksik/);
        mode = 'inconsistent'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), false);
        assert.equal(await page.locator('#arena-output').isVisible(), true);
        assert.equal(await page.locator('#occupancy').textContent().then(v => /\d/.test(v)), true);
        mode = 'stale'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), true);
        assert.match(await page.locator('#forecast-status').textContent(), /eski/);
        mode = 'offline'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), true);
        assert.equal(await page.locator('#arena-output').isVisible(), true);
        mode = 'ready'; await page.evaluate(() => loadForecastData());
        assert.equal(await page.locator('#forecast-output').isVisible(), true);
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        assert.deepEqual(errors, []);
        results.push({ prefix, width, axeViolations: 0, pageErrors: 0, states: ['ready', 'unavailable', 'inconsistent-safe-unavailable', 'stale', 'offline', 'recovered'], strictScenarios, textReflow: '200%' });
        await context.close();
      }
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
