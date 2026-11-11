// Read-only smoke test of actual locally generated publication artifacts.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const deps = process.env.QA_NODE_MODULES || path.join(process.env.TEMP, 'mk-frontend-qa-tools/node_modules');
const { chromium } = require(path.join(deps, 'playwright'));
const { default: AxeBuilder } = require(path.join(deps, '@axe-core/playwright'));
const root = path.resolve(__dirname, '..');
const candidate = process.env.QA_CANDIDATE_DIR || path.resolve(root, '../runtime/phase4c-candidate');
const output = path.resolve(root, '../runtime/phase4c-frontend-qa');
const forecast = JSON.parse(fs.readFileSync(path.join(candidate, 'data/v1/forecast.json')));
const arena = JSON.parse(fs.readFileSync(path.join(candidate, 'data/v1/model-arena.json')));
const results = [];
const server = http.createServer((request, response) => {
  let pathname = new URL(request.url, 'http://localhost').pathname.replace(/^\/milletegitsekmi\//, '/');
  const directory = pathname.startsWith('/data/v1/') ? candidate : root;
  const file = path.resolve(directory, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(directory + path.sep) || !fs.existsSync(file)) { response.statusCode = 404; return response.end(); }
  response.setHeader('Content-Type', file.endsWith('.json') ? 'application/json' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  response.end(fs.readFileSync(file));
});
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    for (const prefix of ['/', '/milletegitsekmi/']) {
      for (const width of [375, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
        await page.locator('#arena-output').waitFor({ state: 'visible' });
        assert.equal(forecast.forecast_status, 'insufficient_data', 'actual current candidate is expected to have no live forecast');
        assert.equal(await page.locator('#forecast-output').isVisible(), false);
        assert.match(await page.locator('#forecast-status').textContent(), /eksik|eski/);
        assert.equal(await page.locator('#forecast-chart polyline').count(), 0);
        assert.equal(await page.locator('#arena-rows tr').count(), arena.models.length);
        for (const horizon of ['overall', '1', '6', '12', '24']) {
          await page.locator('#arena-horizon').selectOption(horizon);
          for (let i = 0; i < arena.models.length; i++) {
            const entry = arena.models[i];
            const score = horizon === 'overall' ? entry.overall : entry.by_horizon[horizon];
            const cells = page.locator('#arena-rows tr').nth(i).locator('td');
            assert.equal(await cells.nth(0).textContent(), entry.model_name);
            assert.equal(await cells.nth(1).textContent(), score.mae.toLocaleString('tr-TR', { maximumFractionDigits: 2 }));
            assert.equal(await cells.nth(2).textContent(), score.rmse.toLocaleString('tr-TR', { maximumFractionDigits: 2 }));
            assert.match(await cells.nth(3).textContent(), new RegExp(`${score.n} hedef`));
          }
        }
        await page.locator('#arena-horizon').selectOption('overall');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        assert.deepEqual(axe.violations.map(v => v.id), []);
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.join(output, `actual-${prefix === '/' ? 'root' : 'project'}-${width}.png`), fullPage: true });
        results.push({ prefix, width, forecastStatus: forecast.forecast_status, models: arena.models.map(e => ({ name: e.model_name, mae: e.overall.mae, rmse: e.overall.rmse })), checkedHorizons: ['overall', '1', '6', '12', '24'], pageErrors: 0, axeViolations: 0 });
        await context.close();
      }
    }
    fs.writeFileSync(path.join(output, 'actual-results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
