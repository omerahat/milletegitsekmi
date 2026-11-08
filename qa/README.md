# Frontend QA and review handoff

Worktree: `C:\Users\ahato\projects\MK\milletegitsekmi-frontend-qa`

Branch: `frontend/qa-ux-polish`; base: `65e8a87`.

Frontend QA changes are prepared for review on this branch. Integration uses the
repository owner's existing GitHub-linked identity for individual commands;
global and publisher configuration remain unchanged.

Scope is frontend only. The original checkout, `mk-platform`, data files, schema,
SQLite, publishing scripts, workflows, credentials and scheduled tasks were not edited.
The integration PR targets main; deployment awaits review and merge.

## Audit findings

- Baseline Chromium screenshots at 375, 768 and 1440 pixels showed no horizontal
  overflow. The public GitHub Pages page was also opened and captured successfully.
- The identity was already a dark interface with blue/purple accents. Preserved it,
  while bounding desktop content width and making spacing and unavailable cards consistent.
- Room counts were available through chart tooltips when ECharts loaded. Slanted
  mobile labels were harder to scan, and a CDN failure produced a dense text fallback.
  Replaced this one bar chart with labeled native HTML bars and always-visible counts.
  Bars compare counts, not capacity. Missing rooms stay hidden; zero stays visible.
- Fixed header/60px content-offset rules could diverge when desktop text wrapped.
  The header now participates in document flow. Removed obsolete timeline/model
  styling and full-screen/snap-layout overrides from the earlier interface.
- Stale data was already distinguished correctly using observation time. Added a
  freshness badge, relative age and measurement timestamp beside the count; time is
  explicitly Europe/Istanbul. Recent data is called a recent measurement, never live.
- Loading/error states had no manual retry, and first-load failures retained a
  loading-style room panel. Added a 44px+ retry target and explicit failure/empty
  states. Refresh failures retain the last valid observation and its timestamp.
  Concurrent refresh calls are guarded. The 60-second refresh and 10-second age
  update remain intact. Unchanged live-region messages are not repeatedly assigned.
- Unknown room properties could pass validation through inherited object names.
  Own-property checks now enforce the room allowlist. Null/array input, extra fields,
  invalid calendar timestamps and future publication timestamps are rejected.
  UTC fractional seconds, including exporter microseconds, remain accepted.
- Added a keyboard skip link, clear focus styles, semantic time/section labels,
  text equivalents for bars, a no-JavaScript message and higher-contrast text colors.
- Forecast and Arena remain explicitly unavailable. Removed the disabled model
  selection button and English duplicate subtitle. No forecasts/history are invented.

## Files

- `index.html`: accessible structure, count/timestamp hierarchy, room bars, retry,
  unavailable states; removed external ECharts script.
- `app.js`: defensive input validation, freshness/age, stable room updates, retry guard.
- `style.css`: responsive styles preserving the palette; removed obsolete CSS.
- `README.md`: current rendering behavior and QA link.
- `qa/frontend.test.cjs`: dependency-free Node regression tests.
- `qa/browser.cjs`: optional Playwright/axe checks, with screenshots/results.
- Four mobile/desktop before/after screenshots and this document: review evidence.
- Generated browser results and additional screenshots remain local, outside the commit.

## Screenshots

| Viewport | Before | After |
| --- | --- | --- |
| 375 | [Mobile](screenshots/before-375.png) | [Mobile](screenshots/after-375.png) |
| 1440 | [Desktop](screenshots/before-1440.png) | [Desktop](screenshots/after-1440.png) |

Tablet, public baseline, loading, fresh, failed-refresh, invalid-first-load and
large-count screenshots were also reviewed locally and are excluded from the commit.

Baseline/after layout screenshots use the unchanged repository snapshot. Fresh/error
scenarios intercept network responses in the browser only. No fixture overwrites data.

## Validation

- Existing private `mk-platform/scripts/smoke-frontend.cjs`: 8 scenarios pass,
  including project-relative/custom-domain paths and fresh/stale/missing/offline data.
  Executed unchanged in memory with only the checkout path redirected to this worktree.
- `node --test qa/frontend.test.cjs`: 5 tests pass, including invalid payload variants,
  recovery, UTC microseconds, Istanbul formatting and stale labels.
- Headless Chromium: 375/768/1440 have no horizontal overflow, count visible in
  first viewport, refresh target approximately 47px tall, no page errors, zero axe
  WCAG 2 A/AA and 2.1 AA violations. Machine results are generated locally.
- Browser scenarios cover delayed initial load, fresh/stale data, actual interval
  refresh failure, manual recovery, empty rooms, 404, invalid JSON, hostile room keys,
  204/500 responses, overlapping refresh calls, aging past 30 minutes, maximum safe
  integer counts, 200% enlarged text and JS disabled.
- Stress testing found overflow with large counts at 200% text; room counts and
  percentage text now wrap. Repeated browser checks pass.
- Only four local requests on normal load: HTML, CSS, JS and current JSON.
  No chart library, external font, Supabase or model result request.
- `git diff --check` passes. No data/schema or infrastructure changes.

To repeat Node tests, run from this worktree:

```powershell
node --test qa/frontend.test.cjs
```

To serve with the same project subpath (run from the parent MK directory):

```powershell
py -m http.server 8765 --bind 127.0.0.1 --directory C:/Users/ahato/projects/MK
```

Optional browser dependencies live outside the repository; no production dependency
or manifest was added. In a fresh test environment:

```powershell
npm.cmd install --prefix "$env:TEMP/mk-frontend-qa-tools" playwright @axe-core/playwright --no-audit --no-fund
& "$env:TEMP/mk-frontend-qa-tools/node_modules/.bin/playwright.cmd" install chromium
node qa/browser.cjs
```

`QA_NODE_MODULES` can override the dependency location, `QA_BASE_URL` the served
URL, and `QA_BROWSER_PATH` the browser executable. This session used the existing
`chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe`
under `%LOCALAPPDATA%/ms-playwright`. The browser script regenerates QA evidence.

Existing smoke command, run from MK (reads the private test without editing it):

```powershell
node -e "const source=require('fs').readFileSync('mk-platform/scripts/smoke-frontend.cjs','utf8');new Function('require',source.replaceAll('milletegitsekmi/','milletegitsekmi-frontend-qa/'))(require)"
```

## Remaining limits

- Real iOS/Android, Safari, Firefox, screen-reader announcements and physical touch
  interaction have not been manually tested. Axe and keyboard checks are evidence,
  not a complete accessibility audit.
- Browser layout-shift measurements are local lab checks, not field Core Web Vitals.
- Network/cached Pages publication timing is outside frontend scope. Recent
  observations can still differ from actual occupancy; stale records remain labeled.
- Capacity remains an unverified 4,500-person estimate. Room counts need not sum
  to the total. The UI makes both caveats explicit.
- Forecast/history/model results remain unavailable as required.

## Integration safeguards

Rebase this isolated QA branch on the latest remote main and rerun the eight smoke
scenarios, five regression tests and browser checks. The PR diff must contain only
frontend, tests and review documentation. Keep `data/v1/current.json` identical to
the rebased main snapshot. Automatic publication may advance main afterward;
verify the PR still has no data changes before merge.

Do not reset or edit the publisher checkout, change publishing configuration,
disable collection, modify SQLite or touch ML models. Open the PR for review;
do not merge it as part of integration.
