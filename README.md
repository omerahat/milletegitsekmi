# Public MVP release

Current data comes from ./data/v1/current.json, with a closed schema in
./data/v1/current.schema.json. No backend or Supabase connection is required.
The configured 4,500-person capacity is an unverified display estimate.
Observation age above 30 minutes is stale; publication time is never measurement time.
JSON is checked every minute while open. Pages/CDN delay can exceed refresh time.
Hourly history remains unavailable. Experimental forecasts and recorded Arena results use separate validated contracts.
Room counts use labeled HTML bars and text values; no chart library or CDN is required.
Refresh failures retain the last valid observation. The refresh button retries immediately.
Displayed timestamps use Europe/Istanbul, with measurement age shown beside them.

Frontend QA, screenshots, local test commands and review/merge guidance: [qa/README.md](qa/README.md).

GitHub Pages: Settings > Pages > Build and deployment > Source: Deploy from a branch;
Branch: main; folder: / (root); Save. Leave Custom domain empty.
URL: https://omerahat.github.io/milletegitsekmi/

Publish only approved static assets (including forecasts.js), versioned public JSON and schemas,
.nojekyll, README.md and .gitignore.
Never copy the private backend, runtime, database or credentials here.

ï»¿# Public MVP release

Current data comes from ./data/v1/current.json, with a closed schema in
./data/v1/current.schema.json. No backend or Supabase connection is required.
The configured 4,500-person capacity is an unverified display estimate.
Observation age above 30 minutes is stale; publication time is never measurement time.
JSON is checked every minute while open. Pages/CDN delay can exceed refresh time.
Forecasts and Arena use the experimental contracts described below. Hourly history
is not published.
Room counts use labeled HTML bars and text values; no chart library or CDN is required.
Refresh failures retain the last valid observation. The refresh button retries immediately.
Displayed timestamps use Europe/Istanbul, with measurement age shown beside them.

Frontend QA, screenshots, local test commands and review/merge guidance: [qa/README.md](qa/README.md).

GitHub Pages: Settings > Pages > Build and deployment > Source: Deploy from a branch;
Branch: main; folder: / (root); Save. Leave Custom domain empty.
URL: https://omerahat.github.io/milletegitsekmi/

After release approval, publish only index.html, app.js, forecasts.js, style.css,
.nojekyll, README.md, the three data/v1 JSON artifacts and their schemas, plus
existing .gitignore. Keep QA evidence outside the deployed artifact set.
Never copy the private backend, runtime, database or credentials here.

# Phase 4C deployment candidate

`forecasts.js` loads `data/v1/forecast.json` and `data/v1/model-arena.json`
independently of occupancy. The forecast uses hourly interval ends in Istanbul
time, expires after 30 minutes, and provides an SVG plus a text table. Missing
context produces an explanation. The Arena shows recorded offline results even
when forecasting is unavailable; selecting a horizon changes scores and counts.
These experimental results do not establish production accuracy.

Run frontend contract tests with:

```powershell
node --test qa/frontend.test.cjs qa/forecasts.test.cjs
```

Browser checks use the existing external Playwright/axe installation (set
`QA_NODE_MODULES` and `QA_BROWSER_PATH` if needed):

```powershell
node qa/forecasts-browser.cjs
node qa/candidate-browser.cjs
```

The first uses clearly identified synthetic fixtures to exercise ready, missing,
stale, failure and recovery states at mobile/tablet/desktop widths. The second
reads actual generated artifacts from `../runtime/phase4c-candidate` (override
`QA_CANDIDATE_DIR`), verifies every displayed score against that JSON, and expects
the current candidate's unavailable forecast. Both check root and project hosting,
accessibility and browser errors, and save screenshots outside this repository in
`../runtime/phase4c-frontend-qa`. Neither publishes data.
