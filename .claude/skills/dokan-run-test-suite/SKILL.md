---
name: dokan-run-test-suite
description: Execute the Dokan Playwright test suite (E2E + API), locally or via GitHub Actions. Invoke when the user asks to run, kick off, trigger, re-run, debug, or inspect the automated test runs. Phrases such as "run the suite", "run e2e tests", "trigger CI", "execute the QA suite", or "check the failed run" should activate this skill.
---

# Run the Dokan Test Suite

Procedural reference for executing the Playwright suite at `tests/pw/`. The suite covers ~1,400 tests across six E2E shards and one API shard. In CI, total wall-clock is approximately 14–18 minutes with the parallel-build workflow; locally, a full run takes 30 minutes or more on a single machine.

## Selecting an execution target

| Target | Use when | Approximate cost |
| --- | --- | --- |
| **Local** | Iterating on a single spec, reproducing a failure, no PR open yet | 1–10 min for a spec, 30+ min for the full suite |
| **GitHub Actions** | Validating a PR, pre-merge check, scheduled or developer-dispatched runs | 14–18 min wall clock |

When a pull request is open, prefer the GitHub Actions path. When the user is mid-development, prefer local execution.

---

## Local execution

All commands assume `tests/pw/` as the working directory unless noted otherwise.

### 1. Docker pre-flight

`wp-env` requires a running Docker daemon. Verify it is reachable before invoking any wp-env commands. If the daemon is not reachable, start Docker Desktop without prompting the user — this is a routine, low-risk action — and surface a single status message while waiting.

**macOS** (the team's primary platform):

```bash
if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon not reachable; opening Docker Desktop..."
    open -a Docker
    for i in $(seq 1 45); do
        docker info >/dev/null 2>&1 && { echo "Docker is ready."; break; }
        sleep 2
    done
    docker info >/dev/null 2>&1 || { echo "Docker did not start within 90s. Aborting."; exit 1; }
fi
```

**Linux**:

```bash
docker info >/dev/null 2>&1 || sudo systemctl start docker
```

If `open -a Docker` fails because Docker Desktop is not installed, surface that and stop. Do not attempt to install it.

### 2. `.env` pre-flight

The Playwright tests read configuration from `tests/pw/.env` (loaded via `dotenv`). Without it the helpers fall back to `cd undefined && wp ...`, which breaks `site_setup` immediately. Pro runs additionally need `LICENSE_KEY` (license tests) and `GMAP` (geolocation tests, 12 specs under `tests/e2e/geolocation/`).

**Hard gate.** Before invoking `reset:env` or any test command, inspect `.env` and resolve every missing key by asking the user. Do not silently scaffold an empty `.env` and discover the failure mid-run.

| State | Action |
| --- | --- |
| `.env` does not exist | Ask the user for `LICENSE_KEY` (when Pro) and `GMAP` in one bundled `AskUserQuestion`. Frame both as **imperative for a clean suite run** — `LICENSE_KEY` because Pro license tests depend on it, `GMAP` because the 12 `tests/e2e/geolocation/*` specs will fail without it. Then write `.env` from `.env.example` with `CI=true`, `DOKAN_PRO` per user intent, and the supplied keys. |
| `.env` exists, `DOKAN_PRO=true`, `LICENSE_KEY=` empty | Stop and ask for the key. License-related Pro tests will fail without it. |
| `.env` exists, `GMAP=` empty | Tell the user explicitly: *all 12 `tests/e2e/geolocation/*` specs will fail without `GMAP`*. State that pasting a Google Maps API key is **imperative** for a clean suite run. Then ask whether to paste a key now or proceed and accept the geolocation failures. Do not start the run until they answer. |
| `.env` exists, all required keys populated | Pass. |

When the user declines to provide `GMAP`, do not silently swallow it — restate the consequence in your next message ("proceeding without `GMAP`; the 12 `tests/e2e/geolocation/*` specs will fail") so the user has one final chance to redirect before the long-running suite starts.

When several keys are missing, bundle them into a single prompt — do not ask sequentially. Example:

```bash
# Inspect existing .env without printing secret values
grep -E '^(LICENSE_KEY|GMAP|DOKAN_PRO)=' tests/pw/.env
```

After writing or amending `.env`, re-read it to confirm the keys are populated before continuing to step 3.

### 3. Environment setup

Default to a clean reset to guarantee a known baseline:

```bash
cd tests/pw
npm ci                  # install Playwright dependencies
npm run reset:env       # wp-env destroy → start (lite + pro + premium plugins)
npm run docker:setup    # seed site_setup / auth_setup / e2e_setup data
```

`reset:env` takes 3–5 minutes on a cold cache and 1–2 minutes when wp-env images are already pulled. Use it whenever any of the following apply:

- The user requests a fresh, clean, or from-scratch run.
- Tests pass in CI but fail locally (often indicates stale state).
- `.wp-env.json`, `.wp-env.override.json`, or a plugin version has changed.
- The previous run was interrupted by a crash or `Ctrl-C`.

**Fast path — repeat runs in the same session.** If the environment is already up and the user is iterating on a spec, skip the reset and re-seed only:

```bash
cd tests/pw
npm run docker:setup
npm run test:e2e -- tests/e2e/<area>/<spec>.spec.ts
```

If `wp-env start` reports a port conflict, stop the existing instance with `npm run wp-env stop` and retry. If it reports `Cannot connect to the Docker daemon` despite a successful pre-flight, the daemon was terminated mid-run — re-execute the pre-flight block.

### 4. Verify required plugins

The suite requires the following plugins to be installed and active in the wp-env site. The full list is canonical — every entry is referenced by one or more specs.

| Plugin | Source | Acquisition |
| --- | --- | --- |
| `dokan-lite` | This repository. | Already on disk. |
| `dokan-pro` | `getdokan/dokan-pro` (private). | Clone alongside `dokan-lite`, on the matching branch. |
| `dokan-invoice` | `getdokan/dokan-invoice` (public). | Clone alongside `dokan-lite`. |
| `woocommerce` | WordPress.org. | Installed automatically by wp-env (declared in `.wp-env.json`). |
| `woocommerce-bookings` | Premium (WooCommerce.com licence). | Provided by the team. |
| `woocommerce-subscriptions` | Premium (WooCommerce.com licence). | Provided by the team. |
| `woocommerce-product-addons` | Premium (WooCommerce.com licence). | Provided by the team. |
| `woocommerce-simple-auctions` | Premium. | Provided by the team. |
| `woocommerce-pdf-invoices-packing-slips` | Premium. | Provided by the team. |

The expected on-disk layout (siblings of `dokan-lite` under `wp-content/plugins/`):

```
wp-content/plugins/
├── dokan-lite/
├── dokan-pro/
├── dokan-invoice/
├── woocommerce/
├── woocommerce-bookings/
├── woocommerce-pdf-invoices-packing-slips/
├── woocommerce-product-addons/
├── woocommerce-simple-auctions/
└── woocommerce-subscriptions/
```

The active wp-env mapping (`tests/pw/.wp-env.ci.json` or `.wp-env.json` selected by the *Prepare wp-env config* logic) determines where wp-env looks for each plugin source. If a developer keeps the premium WooCommerce plugins as siblings rather than under `dokan-pro/tests/plugins/`, a custom `.wp-env.override.json` is required.

**Verification is a hard gate.** Test execution must not begin until every plugin in the canonical list is both installed and active. After `reset:env` completes, run the verification block below. If any plugin is missing or inactive, halt the procedure, report the gap to the user with concrete remediation steps, and wait for their confirmation that the issue is resolved before continuing.

```bash
# Single-shot check: list installed plugins and their status as JSON.
npm run wp-env run tests-cli wp plugin list \
    --fields=name,status --format=json
```

Compare the output against the required set:

```
dokan-lite, dokan-pro, dokan-invoice, woocommerce,
woocommerce-bookings, woocommerce-pdf-invoices-packing-slips,
woocommerce-product-addons, woocommerce-simple-auctions,
woocommerce-subscriptions
```

For each required plugin, classify the result:

| Observed state | Action |
| --- | --- |
| Active. | Pass. |
| Installed but inactive. | Activate it: `npm run wp-env run tests-cli wp plugin activate <name>`. |
| Not present at all. | **Stop.** Add the plugin to the missing-plugins list (see below). Do not auto-install. |

If at least one plugin is missing, do **not** activate the rest, do **not** continue to test execution, and do **not** speculate about workarounds. Surface a single consolidated message to the user listing every missing plugin with its acquisition path. Template:

> The local wp-env site is missing the following plugins required by the test suite. Install each at `wp-content/plugins/<name>/` (or update `.wp-env.override.json` to point at the location you keep them in), then re-run `npm run reset:env` and re-request the suite run.
>
> - **`dokan-pro`** — clone from `getdokan/dokan-pro` (private repository).
> - **`woocommerce-subscriptions`** — premium plugin, obtain from the team's WooCommerce.com licence.
> - …
>
> I have not started the test run.

After the user confirms the missing plugins are in place and `reset:env` has been re-run, repeat the verification block before proceeding. Do not continue from a remembered state — the wp-env site is rebuilt by the reset, so all plugins must be re-checked.

If verification passes, activate any installed-but-inactive entries individually, then proceed to step 5.

### 5. Enable the React UI

The React tests under `tests/e2e/**/new*.spec.ts` and the merged "NEW REACT UI TEST CASES" sections require the Dokan 5.0.0+ React vendor dashboard and product editor. CI sets this automatically; locally, run it once after `reset:env`:

```bash
npm run wp-env run tests-cli wp eval '
    $appearance = get_option("dokan_appearance", []);
    $appearance["vendor_layout_style"]   = "latest";
    $appearance["vendor_product_editor"] = "latest";
    update_option("dokan_appearance", $appearance);
    echo "Dokan appearance set to latest UI" . PHP_EOL;
'
```

### 6. Test execution

```bash
# Full E2E suite (long-running, single-process)
npm run test:e2e

# Single specification
npx playwright test tests/e2e/abuse-reports/abuseReports.spec.ts

# Filter by tag
npx playwright test --grep @lite       # Lite-compatible tests
npx playwright test --grep @pro        # Pro-only tests
npx playwright test --grep @serial     # tests requiring sequential execution

# Browser-visible run
npm run test:headed

# Interactive UI runner
npm run test:ui

# API suite only
npm run test:api
```

### 7. Tag conventions

| Tag | Meaning |
| --- | --- |
| `@lite` | Compatible with Dokan Lite alone. |
| `@liteOnly` | Must not run when Dokan Pro is active. |
| `@pro` | Requires Dokan Pro. |
| `@serial` | File must execute sequentially (no parallel workers). |

`playwright.config.ts` already applies `grep` and `grepInvert` based on the `DOKAN_PRO` environment variable. Avoid layering manual filters on top unless explicitly requested.

### 8. Inspecting local results

- HTML report: `npx playwright show-report`
- Summary JSON: `tests/pw/playwright-report/e2e/summary-report/results.json`
- Failure traces: `tests/pw/playwright/e2e/test-artifacts/<test-id>/trace.zip` — open with `npx playwright show-trace <trace.zip>`

---

## GitHub Actions execution

Workflow: `.github/workflows/e2e_api_tests.yml`. Triggers on pull requests targeting `develop`, pushes to `develop`, the daily 02:00 UTC schedule, and manual `workflow_dispatch`.

### Workflow architecture

```
build_lite ──┐
             ├──► e2e_tests (matrix shards 1–6, balanced from
             │                tests/pw/utils/shard-durations.json)
build_pro ───┤    api_tests (single shard)
             └──► merge-reports ──► quality-report.html + step summary
```

`build_lite` and `build_pro` execute in parallel. The slower of the two — typically 6–7 minutes — gates the consumer jobs. Each consumer downloads the `dokan-lite-build` and `dokan-pro-build` tar artifacts and bypasses its own build steps. E2E sharding is duration-weighted from the committed baseline, so all six shards complete in roughly five minutes of test time.

### Triggering a run

```bash
# Manual dispatch on a branch
gh workflow run e2e_api_tests.yml --ref <branch>

# Restrict to one suite
gh workflow run e2e_api_tests.yml --ref <branch> -f testsuite=E2E
gh workflow run e2e_api_tests.yml --ref <branch> -f testsuite=API

# Watch the most recent run
gh run watch
```

If the user has just pushed commits to a PR branch, the workflow has already started. Confirm with `gh run list --branch <branch> --limit 5` before dispatching a duplicate.

### Inspecting CI results

- **Job summary (run page).** The `merge-reports` job renders the **Dokan QA Quality Report** inline, with brand-coloured shields, key metrics, a Mermaid pie chart, per-suite statistics, and an artifact list. This is the recommended starting point.
- **Full HTML report.** Download the `quality-report` artifact (30-day retention) for the fully styled view with the purple-gradient header and metric cards.
- **Per-shard artifacts.** `test-artifact-e2e-{1..6}` and `test-artifact-api` contain wp-data snapshots, traces, and shard-level `summary-report/results.json`.
- **Spec-duration baseline.** The `shard-durations-baseline` artifact (14-day retention) is the source for refreshing `tests/pw/utils/shard-durations.json`.

### Investigating a specific run

```bash
gh run view <run-id>                                      # status and per-step timing
gh run view <run-id> --log-failed                         # logs for failed steps only
gh run download <run-id> -n quality-report -D ./out       # full QA report
gh run download <run-id> -n test-artifact-e2e-1 -D ./out  # individual shard
```

---

## Maintenance: refreshing the duration baseline

Sharding accuracy degrades as the suite evolves. Refresh `tests/pw/utils/shard-durations.json` periodically:

1. Confirm the most recent `develop` run is green.
2. `gh run download <run-id> -n shard-durations-baseline -D /tmp/`
3. Replace `tests/pw/utils/shard-durations.json` with the downloaded file.
4. Open a pull request titled `chore(ci): refresh shard duration baseline`.

The `getShardSpecs.js` splitter assigns the global mean to specs introduced after the last baseline refresh, so per-PR refresh is unnecessary. A monthly refresh, or one prompted by visible imbalance in shard timings, is sufficient.

---

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| `Dokan or Dokan Lite not found` during build_pro. | Pro's webpack expects Lite at `../dokan-lite`. | The build_pro job already checks out Lite source and runs `npm ci`. If this regresses, inspect path resolution in `dokan-pro/src/utils/dokan-path.js`. |
| `Cannot find module 'lodash'` during build_pro. | Lite's `node_modules` was not installed in the Pro build job. | Verify the "Install dokan-lite npm deps" step ran successfully. |
| `merge-reports` fails with a missing working directory. | All upstream test jobs were skipped, typically because build_pro failed. | Resolve the upstream build failure; the merge-reports failure is a downstream symptom. |
| `wp-env start` times out. | Ports 9999 or 9998 are in use. | `docker ps` to identify the process; then `npm run wp-env stop` and retry. |
| Vendor `/dashboard` tests block on a modal. | Dokan Pro 5.0.0 announcement modal appears on first load. | Use the `closeAnnouncementModal` helper in `tests/pw/utils/helpers.ts` (auto-dismisses via `page.addLocatorHandler`). |
| Tests pass locally but fail in CI. | The Dokan React UI option may not be enabled. | Set `dokan_appearance.vendor_layout_style = "latest"` and `vendor_product_editor = "latest"`. The CI workflow does this automatically. |
| `site_setup` fails with `cd undefined && wp ...`. | `tests/pw/.env` does not exist. The helpers route wp-cli through `SITE_PATH` when `CI` is unset. | Run the `.env` pre-flight (step 2). Create `.env` from `.env.example`, set `CI=true`, ask the user for `LICENSE_KEY` / `GMAP`. |
| All ~12 `tests/e2e/geolocation/*` specs fail with `locator('input.dokan-range-slider')` or `.dokan-map-container` timeouts. | `GMAP=` empty in `.env`, so the Google Maps widget never loads. | Ask the user for a Google Maps API key, set `GMAP=<key>` in `.env`, re-run only `geolocation.spec.ts`. |
| License-related Pro tests fail with "invalid license" or never reach the dashboard. | `LICENSE_KEY=` empty in `.env`. | Ask the user for the Dokan Pro licence key, set `LICENSE_KEY=<key>` in `.env`, re-run the affected spec(s). |

---

## Operational guidelines

- Trigger CI runs through `gh workflow run` or by opening a pull request. Do not push directly to `develop` to provoke a run.
- Do not modify per-shard `--shard=N/M` flags by hand. The splitter computes the spec list from the duration baseline.
- Do not bypass real failures with `--no-verify`, suppressed retries, or adjusted `maxFailures`. Investigate the captured trace.
- If a test flakes on two or more retries, file a follow-up to stabilise the spec rather than re-running the shard.

---

## Quick reference

| Task | Command |
| --- | --- |
| Recent runs on a branch | `gh run list --branch <branch> --limit 5` |
| Tail failed step logs | `gh run view <id> --log-failed` |
| Re-run only failed jobs | `gh run rerun <id> --failed` |
| Download QA report | `gh run download <id> -n quality-report` |
| Cancel a stuck run | `gh run cancel <id>` |
| Stop wp-env | `npm run wp-env stop` |
| Reset wp-env | `npm run reset:env` |

---

## Reporting back

After execution, report:

1. **Target.** Local or GitHub Actions; tag filters or specs scoped to.
2. **Result summary.** Total / passed / failed / skipped counts, pass rate, wall-clock duration.
3. **Report location.** Local HTML report path, or run page URL plus the `quality-report` artifact link.
4. **On failure.** Failing spec name, first error line, and trace location. Surface evidence; do not speculate on root cause.
