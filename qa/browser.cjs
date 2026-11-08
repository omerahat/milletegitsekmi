// Optional browser QA: install playwright and @axe-core/playwright outside the site.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const deps = process.env.QA_NODE_MODULES || path.join(process.env.TEMP, 'mk-frontend-qa-tools/node_modules');
const { chromium } = require(path.join(deps, 'playwright'));
const { default: AxeBuilder } = require(path.join(deps, '@axe-core/playwright'));
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:8765/milletegitsekmi-frontend-qa/';
const output = path.join(__dirname, 'screenshots');
const sample = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/v1/current.json')));
const fresh = { ...sample, observed_at: new Date(Date.now() - 60000).toISOString(), published_at: new Date().toISOString() };

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true,
    ...(process.env.QA_BROWSER_PATH ? { executablePath: process.env.QA_BROWSER_PATH } : {}) });
  const results = [];
  try {
    for (const width of [375, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.qaLayoutShift = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.qaLayoutShift += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      const errors = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      await page.goto(base);
      await page.getByRole('button', { name: 'Şimdi yenile' }).waitFor();
      await page.waitForTimeout(300);
      assert.match(await page.locator('#occupancy').textContent(), /kişi/);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        countVisible: document.getElementById('occupancy').getBoundingClientRect().bottom < innerHeight,
        targetHeight: document.getElementById('refresh').getBoundingClientRect().height,
        layoutShift: window.qaLayoutShift
      }));
      assert.equal(layout.overflow, false);
      assert.equal(layout.countVisible, true);
      assert.ok(layout.targetHeight >= 44);
      assert.ok(layout.layoutShift < 0.1, 'initial layout shift should stay below 0.1');
      await page.screenshot({ path: path.join(output, `after-${width}.png`), fullPage: true });
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(node => node === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#today').evaluate(node => node === document.activeElement), true);
      assert.deepEqual(errors, []);
      assert.ok(requests.every(url => url.startsWith(base) || url.startsWith('data:')));
      results.push({ width, ...layout, axeViolations: accessibility.violations.length, pageErrors: errors.length, requests: requests.length });
      await context.close();
    }

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install();
    let mode = 'loading';
    let dataRequests = 0;
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    await page.route('**/data/v1/current.json', async route => {
      dataRequests++;
      if (mode === 'loading') await pending;
      if (mode === 'offline') return route.abort();
      if (mode === 'missing') return route.fulfill({ status: 404, body: '' });
      if (mode === 'server-error') return route.fulfill({ status: 500, body: '' });
      if (mode === 'empty') return route.fulfill({ status: 204, body: '' });
      if (mode === 'malformed') return route.fulfill({ contentType: 'application/json', body: '{invalid' });
      const data = mode === 'unsafe' ? { ...fresh, rooms: { '<img src=x onerror=alert(1)>': 100 } } : mode === 'no-rooms' ? { ...fresh, rooms: {} } : mode === 'large' ? { ...fresh, total_count: Number.MAX_SAFE_INTEGER, rooms: { arastirma_salonu_sag: Number.MAX_SAFE_INTEGER } } : fresh;
      return route.fulfill({ json: data });
    });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Kontrol ediliyor…' }).waitFor();
    await page.evaluate(() => Promise.all([loadData(), loadData()]));
    assert.equal(dataRequests, 1, 'refresh calls must not overlap a pending request');
    await page.screenshot({ path: path.join(output, 'loading-mobile.png'), fullPage: true });
    mode = 'fresh'; release();
    await page.getByRole('button', { name: 'Şimdi yenile' }).waitFor();
    assert.equal(await page.locator('#freshness').textContent(), 'Güncel ölçüm');
    await page.screenshot({ path: path.join(output, 'fresh-mobile.png'), fullPage: true });
    mode = 'offline';
    await page.clock.runFor(60000);
    await page.waitForFunction(() => document.getElementById('status').textContent.includes('Yenileme başarısız'));
    assert.ok((await page.locator('#occupancy').textContent()).includes(fresh.total_count.toLocaleString('tr-TR')));
    await page.screenshot({ path: path.join(output, 'offline-mobile.png'), fullPage: true });
    mode = 'no-rooms';
    await page.getByRole('button', { name: 'Şimdi yenile' }).click();
    await page.waitForFunction(() => document.getElementById('freshness').textContent === 'Güncel ölçüm');
    assert.equal(await page.locator('.room:visible').count(), 0);
    assert.equal(await page.locator('#rooms-empty').isVisible(), true);
    for (mode of ['missing', 'empty', 'server-error', 'malformed', 'unsafe']) {
      await page.reload();
      await page.getByRole('button', { name: 'Şimdi yenile' }).waitFor();
      assert.equal(await page.locator('#occupancy').textContent(), '—');
      assert.equal(await page.locator('#today img').count(), 0);
      assert.match(await page.locator('#freshness').textContent(), /Ölçüm bekleniyor|Veriye ulaşılamıyor/);
    }
    await page.screenshot({ path: path.join(output, 'error-mobile.png'), fullPage: true });
    mode = 'fresh';
    await page.getByRole('button', { name: 'Şimdi yenile' }).click();
    await page.waitForFunction(() => document.getElementById('freshness').textContent === 'Güncel ölçüm');
    mode = 'offline';
    await page.clock.runFor(31 * 60000);
    assert.match(await page.locator('#status').textContent(), /canlı değildir/);
    mode = 'large';
    await page.getByRole('button', { name: 'Şimdi yenile' }).click();
    await page.waitForFunction(() => document.getElementById('occupancy').textContent.includes('9.007'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'large valid counts must wrap');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'enlarged text must reflow');
    await page.screenshot({ path: path.join(output, 'large-count-enlarged-text.png'), fullPage: true });
    assert.deepEqual(errors, []);
    await page.close();
    const noScript = await browser.newPage({ javaScriptEnabled: false });
    await noScript.goto(base);
    assert.equal(await noScript.locator('noscript').isVisible(), true);
    await noScript.close();
    fs.writeFileSync(path.join(__dirname, 'browser-results.json'), JSON.stringify({ layouts: results, scenarios: ['loading', 'overlapping refresh guard', 'fresh', 'stale', 'automatic refresh failure', 'manual recovery', 'missing rooms', '404', '204', 'HTTP 500', 'malformed JSON', 'unsafe keys', 'age transition', 'large valid counts', '200% text reflow', 'JavaScript disabled'] }, null, 2));
    console.log(JSON.stringify(results, null, 2));
    console.log('Browser reliability scenarios passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
