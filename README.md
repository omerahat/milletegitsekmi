# Public MVP release

Current data comes from ./data/v1/current.json, with a closed schema in
./data/v1/current.schema.json. No backend or Supabase connection is required.
The configured 4,500-person capacity is an unverified display estimate.
Observation age above 30 minutes is stale; publication time is never measurement time.
JSON is checked every minute while open. Pages/CDN delay can exceed refresh time.
Forecasts, hourly history and Arena are unavailable until validated data is ready.
Room counts use labeled HTML bars and text values; no chart library or CDN is required.
Refresh failures retain the last valid observation. The refresh button retries immediately.
Displayed timestamps use Europe/Istanbul, with measurement age shown beside them.

Frontend QA, screenshots, local test commands and review/merge guidance: [qa/README.md](qa/README.md).

GitHub Pages: Settings > Pages > Build and deployment > Source: Deploy from a branch;
Branch: main; folder: / (root); Save. Leave Custom domain empty.
URL: https://omerahat.github.io/milletegitsekmi/

Publish only index.html, app.js, style.css, .nojekyll, README.md,
data/v1/current.json and data/v1/current.schema.json, plus existing .gitignore.
Never copy the private backend, runtime, database or credentials here.
