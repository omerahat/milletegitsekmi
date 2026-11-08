'use strict';
const MAX_CAPACITY = 4500; // Configured estimate, not a verified physical capacity.
const STALE_MS = 30 * 60 * 1000; // Allows a 15-minute publication cycle plus deployment delay.
const ROOM_LABELS = { arastirma_salonu: 'Araştırma', arastirma_salonu_sag: 'Araştırma sağ', arastirma_salonu_sol: 'Araştırma sol', nadir_eserler_salonu: 'Nadir eserler' };
let observation = null;
let chart = null;
let failed = false;
const el = id => document.getElementById(id);
function validate(data) {
  if (data.schema_version !== '1' || data.source !== 'd16' || !Number.isSafeInteger(data.total_count) || data.total_count < 0 || !data.rooms || Array.isArray(data.rooms) || typeof data.rooms !== 'object') throw new Error('Invalid observation');
  for (const key of ['observed_at', 'published_at']) {
    if (typeof data[key] !== 'string' || !data[key].endsWith('Z') || !Number.isFinite(Date.parse(data[key]))) throw new Error('Invalid timestamp');
  }
  if (Date.parse(data.observed_at) > Date.now() + 120000 || Date.parse(data.observed_at) > Date.parse(data.published_at)) throw new Error('Future observation');
  for (const [key, value] of Object.entries(data.rooms)) {
    if (!ROOM_LABELS[key] || !Number.isSafeInteger(value) || value < 0) throw new Error('Invalid room');
  }
  return data;
}
function renderStatus() {
  if (!observation) return;
  const stale = Date.now() - Date.parse(observation.observed_at) > STALE_MS;
  el('status').textContent = (failed ? 'Yenileme başarısız. Son alınan gözlem gösteriliyor. ' : '') + (stale ? 'Eski veri — son gözlem 30 dakikadan eski; canlı değildir.' : 'Son gözlem 30 dakika içinde alındı.');
  el('status').className = stale || failed ? 'status-warning' : 'status-ok';
}
function render() {
  el('occupancy').textContent = observation.total_count.toLocaleString('tr-TR') + ' kişi';
  el('percentage').textContent = '%' + (observation.total_count / MAX_CAPACITY * 100).toFixed(1) + ' · Yapılandırılmış kapasite tahmini: 4.500 kişi (doğrulanmamış)';
  el('last-updated').textContent = 'Son gözlem: ' + new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(observation.observed_at)) + ' (İstanbul)';
  renderStatus();
  const rooms = Object.entries(observation.rooms);
  if (!rooms.length || !window.echarts) {
    el('today-chart').textContent = rooms.length ? 'Salonlar: ' + rooms.map(([key, count]) => ROOM_LABELS[key] + ': ' + count).join(' · ') : 'Salon ayrıntısı bulunmuyor.';
    return;
  }
  if (!chart) chart = echarts.init(el('today-chart'));
  chart.setOption({ tooltip: { trigger: 'axis' }, grid: { left: 50, right: 20, bottom: 65 }, xAxis: { type: 'category', data: rooms.map(([key]) => ROOM_LABELS[key]), axisLabel: { color: '#aaa', interval: 0, rotate: 15 } }, yAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: '#ffffff15' } } }, series: [{ type: 'bar', data: rooms.map(([, count]) => count), itemStyle: { color: '#4a9eff', borderRadius: [6, 6, 0, 0] } }] });
}
async function loadData() {
  try {
    const url = new URL('./data/v1/current.json', document.baseURI);
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (response.status === 404 || response.status === 204) throw new Error('empty');
    if (!response.ok) throw new Error('http');
    observation = validate(await response.json());
    failed = false;
    render();
  } catch (error) {
    failed = true;
    if (observation) renderStatus();
    else el('status').textContent = error.message === 'empty' ? 'Henüz yayımlanmış gözlem yok. Otomatik olarak tekrar denenecek.' : 'Veri şu anda alınamıyor. Otomatik olarak tekrar denenecek.';
  }
}
window.addEventListener('resize', () => chart?.resize());
loadData();
setInterval(loadData, 60000);
setInterval(renderStatus, 10000);
