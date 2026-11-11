'use strict';
const STALE_MS = 30 * 60 * 1000; // Allows a 15-minute publication cycle plus deployment delay.
const ROOM_LABELS = { arastirma_salonu: 'Araştırma', arastirma_salonu_sag: 'Araştırma sağ', arastirma_salonu_sol: 'Araştırma sol', nadir_eserler_salonu: 'Nadir eserler' };
let observation = null;
let failed = false;
let loading = false;
const el = id => document.getElementById(id);
function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(key => !['schema_version', 'source', 'total_count', 'rooms', 'observed_at', 'published_at'].includes(key))) throw new Error('Invalid observation');
  if (data.schema_version !== '1' || data.source !== 'd16' || !Number.isSafeInteger(data.total_count) || data.total_count < 0 || !data.rooms || Array.isArray(data.rooms) || typeof data.rooms !== 'object') throw new Error('Invalid observation');
  for (const key of ['observed_at', 'published_at']) {
    const value = data[key];
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 19) !== value.slice(0, 19)) throw new Error('Invalid timestamp');
  }
  if (Date.parse(data.published_at) > Date.now() + 120000 || Date.parse(data.observed_at) > Date.now() + 120000 || Date.parse(data.observed_at) > Date.parse(data.published_at)) throw new Error('Future observation');
  for (const [key, value] of Object.entries(data.rooms)) {
    if (!Object.hasOwn(ROOM_LABELS, key) || !Number.isSafeInteger(value) || value < 0) throw new Error('Invalid room');
  }
  return data;
}
function renderStatus() {
  if (!observation) return;
  const stale = Date.now() - Date.parse(observation.observed_at) > STALE_MS;
  const age = Math.max(0, Math.floor((Date.now() - Date.parse(observation.observed_at)) / 60000));
  el('observation-age').textContent = age < 1 ? 'Bir dakikadan kısa süre önce ölçüldü' : age < 60 ? `${age} dakika önce ölçüldü` : age < 1440 ? `${Math.floor(age / 60)} saat önce ölçüldü` : `${Math.floor(age / 1440)} gün önce ölçüldü`;
  el('freshness').textContent = failed ? 'Bağlantı sorunu' : stale ? 'Eski ölçüm' : 'Güncel ölçüm';
  el('freshness').className = stale || failed ? 'badge status-warning' : 'badge status-ok';
  const message = (failed ? 'Yenileme başarısız. Son alınan gözlem gösteriliyor. ' : '') + (stale ? 'Eski veri — son gözlem 30 dakikadan eski; canlı değildir.' : 'Son gözlem 30 dakika içinde alındı. Bu değer anlık doluluktan farklı olabilir.');
  if (el('status').textContent !== message) el('status').textContent = message;
  el('status').className = stale || failed ? 'status-warning' : 'status-ok';
}
function render() {
  el('occupancy').textContent = observation.total_count.toLocaleString('tr-TR') + ' kişi';
  el('percentage').textContent = 'Son yayımlanan gözlem · kişi sayısı';
  el('last-updated').textContent = 'Son gözlem: ' + new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(observation.observed_at)) + ' (İstanbul)';
  el('last-updated').dateTime = observation.observed_at;
  renderStatus();
  const counts = Object.values(observation.rooms);
  el('rooms-empty').hidden = counts.length > 0;
  el('rooms-empty').textContent = 'Salon ayrıntısı bulunmuyor.';
  for (const key of Object.keys(ROOM_LABELS)) {
    const count = observation.rooms[key];
    el('room-' + key).hidden = !Object.hasOwn(observation.rooms, key);
    el('room-' + key + '-count').textContent = count === undefined ? '—' : count.toLocaleString('tr-TR');
    el('room-' + key + '-meter').max = Math.max(1, ...counts);
    el('room-' + key + '-meter').value = count ?? 0;
  }
}
async function loadData() {
  if (loading) return;
  loading = true;
  el('refresh').disabled = true;
  el('refresh').textContent = 'Kontrol ediliyor…';
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
    else {
      el('status').textContent = error.message === 'empty' ? 'Henüz yayımlanmış gözlem yok. Otomatik olarak tekrar denenecek.' : 'Veri şu anda alınamıyor. Otomatik olarak tekrar denenecek.';
      el('status').className = 'status-warning';
      el('freshness').textContent = error.message === 'empty' ? 'Ölçüm bekleniyor' : 'Veriye ulaşılamıyor';
      el('freshness').className = 'badge status-warning';
      el('rooms-empty').textContent = 'Salon ayrıntıları veri alındığında görünecek.';
    }
  } finally {
    loading = false;
    el('refresh').disabled = false;
    el('refresh').textContent = 'Şimdi yenile';
  }
}
el('refresh').onclick = loadData;
loadData();
setInterval(loadData, 60000);
setInterval(renderStatus, 10000);
