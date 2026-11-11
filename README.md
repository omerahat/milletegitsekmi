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

### Five-minute forecast UI (v2)

The static page first requests `data/v1/forecast-5min.json`, whose payload is
version 2. `mk-platform/scripts/sync_public_contracts.py` owns its schema and
embedded `PUBLIC_DTO_V2`; do not hand-edit generated definitions. A 404 falls
back to the original hourly artifact; malformed/incompatible v2 fails closed.
Current occupancy and historical hourly Arena load independently.

For v2 each horizon contains 12/36/72/144/288 points or an explicit unavailable
state. Target timestamps are the strictly next UTC five-minute boundary and
subsequent boundaries; labels use Europe/Istanbul. Straight chart segments are
visual connections, not inferred intermediate measurements. The padded Y axis
includes the source observation and can start above zero. Hover/pointer movement
and a keyboard/touch range control inspect individual values. All target values
remain available in a collapsed table. Persistence is shown flat and explained;
no uncertainty or production accuracy is invented. The unverified capacity
percentage was removed. Historical hourly evaluation stays separate from live
tracking, with model versions and protocol details collapsed.

Validation: `node --test qa/forecasts.test.cjs qa/frontend.test.cjs` (20 passed).
`QA_PLAYWRIGHT=/path/to/playwright node qa/five-minute-browser.cjs` exercises
375/768/1440px, horizons, keyboard/pointer inspection, overflow and failure
isolation using synthetic fixtures. Browser execution in this macOS sandbox is
blocked by Chromium MachPort bootstrap permission denial; responsive layout,
physical touch, screen readers and visual screenshots are **not verified**.

Deploy backend contract/publisher support and the companion infra exact-route
allowlists before enabling v2 publication; frontend may deploy first because it
retains v1 fallback. Keep existing current.json and hourly artifacts throughout.
Rollback the frontend static snapshot and disable new forecast publication;
retain old artifacts and tracking records. No database downgrade is needed.
No production deployment was performed.
