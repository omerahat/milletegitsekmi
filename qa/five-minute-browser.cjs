// Synthetic contract fixtures verify UI only; these are not accuracy measurements.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.QA_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
let mode = 'available';
function fixture() {
  const generated = Date.now() - 1000;
  const start = (Math.floor(generated / 300000) + 1) * 300000;
  return { schema_version: '2', granularity_minutes: 5, forecast_id: 'a'.repeat(24), generated_at: new Date(generated).toISOString(), observed_at: new Date(generated - 60000).toISOString(), observed_occupancy: 1100, readiness: { ready: true, reasons: [] }, freshness: { source_age_seconds: 60, max_source_age_seconds: 900 }, warnings: [], windows: Object.fromEntries([1,3,6,12,24].map(h => [String(h), { horizon_hours:h, status:'available', method:'PreviousDay', model_version:'five-minute-v1', fallback_reason:null, predictions:Array.from({length:h*12},(_,i)=>({target_timestamp:new Date(start+i*300000).toISOString(), interval_start:new Date(start+i*300000).toISOString(),interval_end:new Date(start+(i+1)*300000).toISOString(),predicted_occupancy:1000+i,step:i+1,granularity_minutes:5})) }])) };
}
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  if (pathname.endsWith('/forecast-5min.json')) { const data=fixture(); if(mode==='incompatible')data.schema_version='99'; if(mode==='unavailable')for(const w of Object.values(data.windows))Object.assign(w,{status:'unavailable',method:null,model_version:null,fallback_reason:'missing_history',predictions:[]}); res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(data)); }
  if (pathname.endsWith('/current.json')) { const data=JSON.parse(fs.readFileSync(path.join(root,'data/v1/current.json')));data.observed_at=new Date(Date.now()-60000).toISOString(); data.published_at=new Date().toISOString();return res.end(JSON.stringify(data)); }
  const filename=path.join(root, pathname==='/'?'index.html':pathname.slice(1));
  if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)){res.statusCode=404;return res.end();}
  res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(filename));
});
(async()=>{let browser;
try { browser=await chromium.launch({headless:true, ...(process.env.QA_BROWSER_PATH?{executablePath:process.env.QA_BROWSER_PATH}:{})});
for(const width of [375,768,1440]) { const page=await browser.newPage({viewport:{width,height:1000}});await page.route('http://millet.test/**', async route => {
const request = { url: new URL(route.request().url()).pathname };
const headers = {}; let status = 200;
server.emit('request', request, {setHeader(key,value){headers[key]=value;},set statusCode(value){status=value;},end(body){route.fulfill({status,headers,body:body || ''});}});
}); await page.goto('http://millet.test/'); await page.waitForFunction(()=>document.querySelector('#forecast-status').textContent.includes('72 beş'));
assert(await page.locator('#occupancy').textContent()!=='—');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
for(const h of [1,3,6,12,24]){await page.locator(`[data-forecast-horizon="${h}"]`).click();assert.equal(await page.locator('#forecast-rows tr').count(),h*12);}
await page.locator('#forecast-point').focus(); await page.keyboard.press('ArrowRight');assert((await page.locator('#forecast-tooltip').textContent()).includes('2/288'));await page.locator('#forecast-chart').dispatchEvent('pointermove',{clientX:200});assert((await page.locator('#forecast-tooltip').textContent()).includes('kişi'));
await page.screenshot({path:`/tmp/millet-forecast-${width}.png`,fullPage:true});
for(const state of ['unavailable','incompatible']){mode=state;await page.reload();await page.waitForTimeout(150);assert(await page.locator('#forecast-output').isHidden());assert(await page.locator('#occupancy').textContent()!=='—');}mode='available';await page.close();console.log(`PASS ${width}px: horizons, tooltip, keyboard, overflow, failure isolation`);
}
} finally {if(browser)await browser.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
