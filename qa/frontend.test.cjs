const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');

function snapshot(overrides = {}) {
  return { schema_version: '1', source: 'd16', total_count: 1242,
    observed_at: new Date(Date.now() - 60000).toISOString(), published_at: new Date().toISOString(),
    rooms: { arastirma_salonu_sag: 45 }, ...overrides };
}

async function app(result) {
  const elements = new Map([['occupancy', { textContent: '—' }]]);
  const intervals = [];
  const requests = [];
  let next = result;
  const context = {
    document: { baseURI: 'https://example.com/milletegitsekmi/', getElementById(id) {
      if (!elements.has(id)) elements.set(id, { textContent: '', className: '', hidden: false });
      return elements.get(id);
    } },
    window: { addEventListener() {} }, URL, AbortSignal, Intl, Date, Number, Object, Error,
    setInterval(callback) { intervals.push(callback); },
    async fetch(url) {
      requests.push(url.href);
      if (next instanceof Error) throw next;
      return { ok: true, status: 200, async json() { return next; } };
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  await new Promise(setImmediate);
  return { elements, requests, intervals, async refresh(value) {
    next = value;
    await vm.runInContext('loadData()', context);
  } };
}

test('current count, Istanbul time and accessible room values are available without a CDN', async () => {
  const { elements, requests } = await app(snapshot({ observed_at: '2026-11-08T20:27:10Z' }));
  assert.match(elements.get('occupancy').textContent, /1.242 kişi/);
  assert.match(elements.get('last-updated').textContent, /23:27/);
  assert.equal(elements.get('room-arastirma_salonu_sag-count').textContent, '45');
  assert.deepEqual(requests, ['https://example.com/milletegitsekmi/data/v1/current.json']);
});

test('a failed automatic refresh retains the last valid observation and recovers', async () => {
  const ui = await app(snapshot());
  await ui.refresh(new Error('offline'));
  assert.match(ui.elements.get('occupancy').textContent, /1.242/);
  assert.match(ui.elements.get('status').textContent, /Yenileme başarısız/);
  assert.match(ui.elements.get('freshness').textContent, /Bağlantı/);
  await ui.refresh(snapshot({ total_count: 800, rooms: {} }));
  assert.match(ui.elements.get('occupancy').textContent, /800 kişi/);
  assert.equal(ui.elements.get('room-arastirma_salonu_sag').hidden, true);
  assert.equal(ui.elements.get('rooms-empty').hidden, false);
  assert.equal(ui.elements.get('refresh').disabled, false);
});

test('old observations are never described as live', async () => {
  const { elements } = await app(snapshot({ observed_at: new Date(Date.now() - 3600000).toISOString() }));
  assert.match(elements.get('status').textContent, /canlı değildir/);
  assert.equal(elements.get('freshness').textContent, 'Eski ölçüm');
});

test('UTC timestamps retain support for exporter microseconds', async () => {
  const { elements } = await app(snapshot({ observed_at: '2026-11-08T20:27:10.123456Z' }));
  assert.match(elements.get('occupancy').textContent, /1.242 kişi/);
});

test('malformed and untrusted data shows a recoverable error', async () => {
  for (const value of [null, [], {}, snapshot({ total_count: -1 }),
    snapshot({ rooms: JSON.parse('{"__proto__":1}') }),
    snapshot({ rooms: { constructor: 1 } }),
    snapshot({ observed_at: '2026-02-30T12:00:00Z' }),
    snapshot({ published_at: '2099-01-01T00:00:00Z' }),
    snapshot({ extra: '<img src=x onerror=alert(1)>' })]) {
    const { elements } = await app(value);
    assert.equal(elements.get('occupancy').textContent, '—');
    assert.match(elements.get('status').textContent, /alınamıyor/);
    assert.equal(elements.get('status').className, 'status-warning');
    assert.equal(elements.get('refresh').disabled, false);
  }
});
