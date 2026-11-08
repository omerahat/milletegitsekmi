# Public MVP release

Current data comes from ./data/v1/current.json, with a closed schema in
./data/v1/current.schema.json. No backend or Supabase connection is required.
The configured 4,500-person capacity is an unverified display estimate.
Observation age above 30 minutes is stale; publication time is never measurement time.
JSON is checked every minute while open. Pages/CDN delay can exceed refresh time.
Forecasts, hourly history and Arena are unavailable until validated data is ready.
ECharts 5.4.3 loads from jsDelivr; text occupancy and room details work if it fails.

GitHub Pages: Settings > Pages > Build and deployment > Source: Deploy from a branch;
Branch: main; folder: / (root); Save. Leave Custom domain empty.
URL: https://omerahat.github.io/milletegitsekmi/

Publish only index.html, app.js, style.css, .nojekyll, README.md,
data/v1/current.json and data/v1/current.schema.json, plus existing .gitignore.
Never copy the private backend, runtime, database or credentials here.
