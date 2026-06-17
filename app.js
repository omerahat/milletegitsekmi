// app.js
// Supabase Storage public URL'inin sonuna mutlaka '/' ekliyoruz!
const SUPABASE_URL = 'https://yrqscwhoqgznswocevfl.supabase.co/storage/v1/object/public/forecast-data/';

let dashboardData = null;
let historyData = null;
let selectedModel = null;
let forecastChart = null;

// Kütüphane maksimum kapasitesi — yüzdelik dilimleri ve renk bucket'larını buna göre hesapla
const MAX_CAPACITY = 4500; 

async function loadData() {
  try {
    console.log('🔄 Veriler Supabase Storage üzerinden çekiliyor...');
    
    // URL birleşimini garantiye almak için araya elle slash koymuyoruz, ana URL'de var.
    const [dashboardRes, historyRes] = await Promise.all([
      fetch(SUPABASE_URL + 'dashboard.json?t=' + Date.now()), // Cache kırıcı ekledik
      fetch(SUPABASE_URL + 'history.json?t=' + Date.now())
    ]);
    
    if (!dashboardRes.ok || !historyRes.ok) {
      throw new Error(`HTTP Hatası! Dashboard: ${dashboardRes.status}, History: ${historyRes.status}`);
    }
    
    dashboardData = await dashboardRes.json();
    historyData = await historyRes.json();
    
    console.log('✅ Dashboard Verisi:', dashboardData);
    console.log('✅ Geçmiş Verisi:', historyData);
    
    // Zaman damgası kontrolü
    const updateTime = dashboardData.generated_at ? new Date(dashboardData.generated_at) : new Date();
    document.getElementById('last-updated').textContent = 
      'Son Güncelleme: ' + updateTime.toLocaleString('tr-TR');
    
    // Model seçiciyi başlat (en düşük MAE'li model otomatik seçilir)
    initModelSelector();
    
    // Grafikleri çizdir
    renderForecast();
    renderTimeline();
    renderArena();
  } catch (e) {
    console.error('❌ Veri yükleme hatası detayları:', e);
    document.getElementById('last-updated').textContent = 'Veri yüklenemedi. Konsolu (F12) kontrol et.';
  }
}

function renderForecast() {
  const chartDom = document.getElementById('forecast-chart');
  if (!chartDom || !dashboardData || !dashboardData.models) {
    console.warn('⚠️ Forecast: dashboardData veya models eksik', dashboardData);
    if (chartDom) chartDom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:1.2rem;">⏳ Veri bekleniyor...</div>';
    return;
  }
  
  if (!forecastChart) {
    forecastChart = echarts.init(chartDom);
    window.addEventListener('resize', () => forecastChart.resize());
  }
  
  // Model verilerini güvenli bir şekilde filtrele
  console.log('🔍 Forecast ham modeller:', dashboardData.models.map(m => ({ model: m.model, available: m.available, hasForecast: !!m.forecast, hasPredictions: !!(m.predictions && m.predictions.length) })));
  let models = dashboardData.models.filter(m => m.available && (m.forecast || (m.predictions && m.predictions.length)));
  
  // Sadece seçili modeli göster
  if (selectedModel) {
    const filtered = models.filter(m => m.model === selectedModel);
    if (filtered.length > 0) models = filtered;
  }
  
  if (models.length === 0) {
    console.warn('⚠️ Çizilecek uygun tahmin modeli bulunamadı.');
    chartDom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:1.2rem;">⚠️ Çizilecek tahmin verisi bulunamadı</div>';
    return;
  }
  
  // Zaman damgalarını al (Eğer forecast objesi yoksa dashboardData.timestamp array'ini kullan)
  let timestamps = [];
  if (dashboardData.timestamp) {
    timestamps = dashboardData.timestamp.map(t => {
      const d = new Date(t);
      return isNaN(d) ? t : d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    });
  } else if (models[0]?.forecast?.timestamps) {
    timestamps = models[0].forecast.timestamps.map(t => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  }
  
  // İlk modelin forecast yapısını konsola dök
  console.log('🔬 İlk model forecast yapısı:', JSON.stringify(models[0].forecast, null, 2));
  console.log('🔬 İlk model keys:', Object.keys(models[0]));
  
  // Serileri oluştur (Model çıktılarının array formatına uyumluluk sağlandı)
  const series = models.map(m => {
    // forecast objesi içindeki olası anahtar isimlerini dene
    let dataValues = null;
    if (m.forecast) {
      dataValues = m.forecast.forecast_values || m.forecast.values || m.forecast.predictions || m.forecast.data || m.forecast;
      // Eğer forecast direkt array ise onu kullan
      if (Array.isArray(m.forecast)) dataValues = m.forecast;
    }
    if (!dataValues || !Array.isArray(dataValues)) {
      dataValues = m.predictions;
    }
    console.log(`📈 ${m.model}: dataValues tipi=${typeof dataValues}, dizi mi=${Array.isArray(dataValues)}, uzunluk=${Array.isArray(dataValues) ? dataValues.length : 'N/A'}, ilk 3=${Array.isArray(dataValues) ? JSON.stringify(dataValues.slice(0,3)) : dataValues}`);
    return {
      name: m.model,
      type: 'line',
      smooth: true,
      data: dataValues,
      lineStyle: { width: 3 },
      symbol: 'circle',
      symbolSize: 6
    };
  });
  
  const option = {
    tooltip: { trigger: 'axis', backgroundColor: '#1f1f2e', textStyle: { color: '#fff' }, valueFormatter: (v) => Math.round(v) },
    legend: { 
      data: models.map(m => m.model),
      textStyle: { color: '#ccc' },
      top: '5%'
    },
    grid: { left: '4%', right: '4%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: timestamps,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa' }
    },
    yAxis: {
      type: 'value',
      name: 'Kişi Sayısı',
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa', formatter: function(v) { return Math.round(v); } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    // Çizginin yoğunluğa göre renk değiştirmesini sağlayan sihirli alan
    visualMap: {
      show: true,
      type: 'piecewise',
      top: 'center',
      right: 0,
      dimension: 1,
      textStyle: { color: '#ccc' },
      pieces: [
        { lt: MAX_CAPACITY * 0.4, color: '#52c41a', label: 'Rahat (%0-40)' },
        { gte: MAX_CAPACITY * 0.4, lt: MAX_CAPACITY * 0.7, color: '#faad14', label: 'Normal (%40-70)' },
        { gte: MAX_CAPACITY * 0.7, lt: MAX_CAPACITY * 0.9, color: '#fa8c16', label: 'Yoğun (%70-90)' },
        { gte: MAX_CAPACITY * 0.9, color: '#f5222d', label: 'Çok Yoğun (%90+)' }
      ]
    },
    series: series
  };
  
  console.log('🎨 Forecast final option: series=' + series.length + ', timestamps=' + timestamps.length);
  console.log('🎨 Chart container boyutu:', chartDom.offsetWidth, 'x', chartDom.offsetHeight);
  try {
    forecastChart.setOption(option, true);
    console.log('✅ Forecast chart setOption başarılı');
  } catch(e) {
    console.error('❌ Forecast setOption hatası:', e);
  }
}

function renderTimeline() {
  const chartDom = document.getElementById('timeline-chart');
  // history.json yapısı 'models' veya 'entries' içeriyor olabilir, esnek kontrol sağlıyoruz
  const entries = historyData?.entries || historyData;
  if (!chartDom || !entries || !entries.length) return;
  
  const chart = echarts.init(chartDom);
  const dates = entries.map(e => e.date ? e.date : new Date(e.timestamp).toLocaleDateString('tr-TR'));
  
  // Mevcut model isimlerini güvenli bir şekilde topla
  let sampleModels = entries[0].models || [];
  if (!Array.isArray(sampleModels) && typeof sampleModels === 'object') {
    sampleModels = Object.keys(sampleModels).map(k => ({ model: k }));
  }
  
  const modelNames = sampleModels.map(m => m.model || m);
  
  // Her entry için MAE değerini çıkaran yardımcı fonksiyon
  function getMAEForModel(entry, name) {
    if (Array.isArray(entry.models)) {
      const m = entry.models.find(item => item.model === name);
      return m ? m.mae : null;
    } else if (entry.models && entry.models[name]) {
      return entry.models[name].mae || entry.models[name];
    }
    return entry.mae || null;
  }
  
  // Animasyon: Başlangıçta seriler boş, slider tam sağda (tüm veri görünür)
  function buildSeries(visibleCount) {
    return modelNames.map(name => ({
      name: name,
      type: 'line',
      smooth: true,
      data: entries.slice(0, visibleCount).map(e => getMAEForModel(e, name)),
      animation: true,
      animationDuration: 400
    }));
  }
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: modelNames, textStyle: { color: '#ccc' } },
    grid: { left: '4%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa', rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: 'MAE (Hata Oranı)',
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: buildSeries(entries.length) // Başlangıçta tüm veriler gösterilsin
  };
  
  chart.setOption(option);
  
  // --- Animasyon Kontrolleri ---
  let isPlaying = false;
  let currentIndex = entries.length; // Slider sonda (tüm veri)
  let animTimer = null;
  const playBtn = document.getElementById('play-btn');
  const slider = document.getElementById('timeline-slider');
  
  function updateVisibleData(index) {
    chart.setOption({ series: buildSeries(index) });
    if (slider) slider.value = (index / entries.length) * 100;
    currentIndex = index;
  }
  
  function stopAnimation() {
    isPlaying = false;
    if (animTimer) clearTimeout(animTimer);
    animTimer = null;
    if (playBtn) playBtn.textContent = '▶ Oynat';
  }
  
  function playAnimation() {
    if (!isPlaying || currentIndex >= entries.length) {
      stopAnimation();
      return;
    }
    updateVisibleData(currentIndex);
    currentIndex++;
    animTimer = setTimeout(playAnimation, 500);
  }
  
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopAnimation();
      } else {
        // Sondaysak başa sar
        if (currentIndex >= entries.length) currentIndex = 0;
        isPlaying = true;
        playBtn.textContent = '⏸ Durdur';
        playAnimation();
      }
    });
  }
  
  if (slider) {
    slider.addEventListener('input', () => {
      stopAnimation();
      const pct = parseInt(slider.value);
      const idx = Math.max(1, Math.round((pct / 100) * entries.length));
      updateVisibleData(idx);
    });
  }
  
  window.addEventListener('resize', () => chart.resize());
}

function renderArena() {
  const chartDom = document.getElementById('arena-chart');
  if (!chartDom || !dashboardData || !dashboardData.models) return;
  
  const chart = echarts.init(chartDom);
  
  const models = dashboardData.models
    .filter(m => m.available && m.mae)
    .sort((a, b) => b.mae - a.mae); // Büyükten küçüğe sırala (ECharts barda ters basar)
  
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '4%', right: '6%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'MAE (Düşük Hata = İyi)',
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    yAxis: {
      type: 'category',
      data: models.map(m => m.model),
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#fff', fontSize: 13 }
    },
    series: [{
      name: 'Hata Skoru (MAE)',
      type: 'bar',
      data: models.map((m, i) => {
        // En düşük hataya sahip olana (yani dizideki son elemana, çünkü ters sıraladık) yeşil ver
        const isBest = (i === models.length - 1);
        return {
          value: m.mae,
          itemStyle: {
            color: isBest ? '#52c41a' : '#fa8c16'
          }
        };
      }),
      label: {
        show: true,
        position: 'right',
        formatter: function(params) { return params.value.toFixed(2); },
        color: '#fff',
        fontWeight: 'bold'
      }
    }]
  };
  
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
}

function initModelSelector() {
  const container = document.getElementById('forecast-model-selector');
  if (!container) return;
  
  const models = dashboardData.models.filter(m => m.available && m.mae);
  if (models.length === 0) return;
  
  // MAE'ye göre artan sırala (düşük MAE = daha başarılı)
  models.sort((a, b) => a.mae - b.mae);
  const bestModel = models[0].model;
  selectedModel = bestModel;
  
  // Radio buton kartlarını oluştur
  container.innerHTML = models.map((m, i) => `
    <label class="model-radio ${m.model === bestModel ? 'selected' : ''}">
      <input type="radio" name="model-select" value="${m.model}" ${m.model === bestModel ? 'checked' : ''}>
      <span class="model-name">${m.model}</span>
      <span class="model-mae">MAE: ${m.mae.toFixed(1)}</span>
    </label>
  `).join('');
  
  // Radio değişikliğini dinle
  container.querySelectorAll('input[name="model-select"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedModel = e.target.value;
        // Seçili kartı görsel olarak işaretle
        container.querySelectorAll('.model-radio').forEach(label => label.classList.remove('selected'));
        e.target.closest('.model-radio').classList.add('selected');
        // Grafiği yeniden çiz
        renderForecast();
      }
    });
  });
}

// Dom hazır olduğunda tetikle
document.addEventListener('DOMContentLoaded', loadData);