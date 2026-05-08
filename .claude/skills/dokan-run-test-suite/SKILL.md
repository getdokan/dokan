---
name: dokan-run-test-suite
description: Run the Dokan Playwright test suite (E2E + API). Trigger when the user says "run the suite", "run e2e tests", "kick off the tests", "trigger CI", "run playwright", "execute the QA suite", or asks to launch / re-run / debug the automated test runs. Covers both local execution (wp-env + npx playwright) and GitHub Actions runs.
---

# Run the Dokan Test Suite

Use this skill when a teammate asks Claude to run the Playwright suite — locally, against CI, or both. The suite lives at `tests/pw/` (Lite-side), runs ~1,400 tests across 6 e2e shards + 1 api shard in CI, and takes ~14–18 min wall clock with the parallel-build workflow.

## Decision: local or CI?

Ask once if it isn't clear from the request:

- **Local** — fast iteration on a few specs, debugging a single failure, no PR yet. ~3–10 min for a single spec, ~35+ min for the whole suite. Needs Docker.
- **CI** — full coverage across all shards, official report, before merge. ~14–18 min wall clock. Uses GitHub Actions runners.

When in doubt: if there's an open PR, prefer CI. If they're mid-coding, prefer local.

## Local run

All commands run from `tests/pw/`.

### Pre-flight: make sure Docker is running

`wp-env` is a Docker wrapper, so the daemon must be up before `npm run start:env`. Always check, and auto-start if needed — don't ask first; the developer's already on their own machine and it's a one-line action. Tell them what you're doing while it happens.

**macOS** (the team's platform):

```bash
# Check daemon
if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon not reachable, opening Docker Desktop..."
    open -a Docker
    # Wait up to 90s for the daemon to come up
    for i in $(seq 1 45); do
        if docker info >/dev/null 2>&1; then
            echo "Docker is ready"
            break
        fi
        sleep 2
    done
    docker info >/dev/null 2>&1 || { echo "Docker still not ready after 90s — bail out"; exit 1; }
fi
```

**Linux** fallback (rarely the team's case):

```bash
docker info >/dev/null 2>&1 || sudo systemctl start docker
```

If `open -a Docker` fails because Docker Desktop isn't installed, surface that and stop — don't try to install it.

### Setup (default flow)

Default to a clean reset — guarantees no stale DB / plugin / option leftovers from a previous run.

```bash
cd tests/pw
npm ci                              # install playwright deps (skip if up to date)
npm run reset:env                   # wp-env destroy → start (lite + pro + premium plugins)
npm run docker:setup                # site_setup + auth_setup + e2e_setup projects (seeds test data)
```

`reset:env` takes ~3–5 min on a cold cache, ~1–2 min when wp-env images are already pulled. Always use this when:
- The user says "fresh run" / "clean run" / "from scratch"
- Tests passed in CI but failed locally (likely stale state)
- `.wp-env.json` / `.wp-env.override.json` / a plugin version changed
- Previous run was interrupted (Ctrl-C, crash, etc.)

### Fast path (only when re-running tests in the same session)

If the env is already up and the user just wants to re-run tests after editing a spec, **skip the env reset** — it's wasteful. Go straight to:

```bash
cd tests/pw
npm run docker:setup     # re-seed test data (still cheap, ~30s)
npm run test:e2e -- ...  # or specific spec
```

If `wp-env start` errors with port-in-use, run `npm run wp-env stop` first. If it errors with "Cannot connect to the Docker daemon" despite the pre-flight, the daemon was killed mid-flight — re-run the pre-flight block.

### Run options

```bash
# Whole e2e suite (slow — ~30+ min single-runner)
npm run test:e2e

# Single spec
npx playwright test tests/e2e/abuse-reports/abuseReports.spec.ts

# Filter by tag
npx playwright test --grep @lite           # lite-only
npx playwright test --grep @pro            # pro-only
npx playwright test --grep @serial         # must-run-sequentially

# Headed (see the browser)
npm run test:headed

# UI mode (interactive)
npm run test:ui

# API tests only
npm run test:api
```

### Tags reference

- `@lite` — works against Lite alone
- `@liteOnly` — must NOT run when Pro is active
- `@pro` — needs Dokan Pro
- `@serial` — file must run sequentially (no parallel workers)

The default `playwright.config.ts` already sets `grep` and `grepInvert` based on `DOKAN_PRO`. Don't fight that with manual filters unless the user asks.

### Reading local results

- HTML report: `npx playwright show-report` (after a non-CI run).
- Summary JSON: `tests/pw/playwright-report/e2e/summary-report/results.json`.
- Failures: traces are at `tests/pw/playwright/e2e/test-artifacts/*/trace.zip` — open with `npx playwright show-trace <file>`.

## CI run

The workflow is `.github/workflows/e2e_api_tests.yml`. It auto-triggers on:
- pull_request to `develop`
- push to `develop`
- daily 02:00 UTC schedule
- manual dispatch (`workflow_dispatch`)

### How the run is shaped (so you can explain it to the user)

```
build_lite ──┐
             ├──► e2e_tests (matrix 1..6, balanced by tests/pw/utils/shard-durations.json)
build_pro ───┤    api_tests (1 shard)
             └──► merge-reports → quality-report.html + step-summary
```

Both build jobs run in parallel (~6–7 min, slowest gates the rest). Each consumer downloads `dokan-lite-build` + `dokan-pro-build` tar artifacts and skips its own build steps. Sharding is duration-weighted from the committed baseline, so all 6 e2e shards finish in ~5 min of test time.

### Triggering a CI run from Claude

```bash
# Manual dispatch on a branch (uses gh CLI)
gh workflow run e2e_api_tests.yml --ref <branch>

# Manual dispatch limited to E2E or API only
gh workflow run e2e_api_tests.yml --ref <branch> -f testsuite=E2E
gh workflow run e2e_api_tests.yml --ref <branch> -f testsuite=API

# Watch the latest run
gh run watch
```

If the user just pushed commits to a PR branch, the workflow already started — don't re-dispatch unless they ask. Use `gh run list --branch <branch> --limit 5` to confirm.

### Reading CI results

- **Job summary** (run page): the `merge-reports` step renders the **Dokan QA Quality Report** inline — branded shields.io badges, key metrics, Mermaid pie of Passed vs Failed, per-suite stats, artifact list. This is the first thing to point users at.
- **Full HTML report**: download the `quality-report` artifact (30-day retention) for the full purple-gradient styled view.
- **Per-shard artifacts**: `test-artifact-e2e-{1..6}` and `test-artifact-api` contain wp-data, traces, and per-shard `summary-report/results.json`.
- **Spec-duration baseline**: the `shard-durations-baseline` artifact (14-day retention) is what to download and commit to `tests/pw/utils/shard-durations.json` to keep balanced sharding accurate over time.

### Inspecting a specific run

```bash
gh run view <run-id>                                    # status + per-step timing
gh run view <run-id> --log-failed                       # tail logs for failed steps only
gh run download <run-id> -n quality-report -D ./out     # grab the QA report
gh run download <run-id> -n test-artifact-e2e-1 -D ./out  # grab a shard's artifacts
```

## Refreshing the duration baseline

When the suite changes substantially, balanced sharding drifts. To refresh:

1. Wait for a green run on `develop`.
2. `gh run download <run-id> -n shard-durations-baseline -D /tmp/`.
3. Replace `tests/pw/utils/shard-durations.json` with the downloaded file.
4. Commit on a branch + open a PR (`chore(ci): refresh shard duration baseline`).

The `getShardSpecs.js` splitter falls back to the global mean for any spec that's new since the baseline, so you don't need to refresh it on every PR — every few weeks or when you notice imbalance.

## Common failures and how to triage

- **`Dokan or Dokan Lite not found` in build_pro**: pro's webpack expects lite as a sibling. The build_pro job already checks out lite source + `npm ci`s it; if this regresses, look at `tests/pw/utils/dokan-path.js` paths in dokan-pro.
- **`Cannot find module 'lodash'`**: lite's `node_modules` wasn't installed in build_pro. Re-check the "Install dokan-lite npm deps" step.
- **`mkdir: working directory tests/pw/all-reports`** in merge-reports: all upstream test jobs were skipped (likely because build_pro failed). Fix the build first — the merge-reports failure is a downstream symptom.
- **wp-env start times out**: usually port 9999/9998 already in use. `docker ps` to confirm, then `npm run wp-env stop`.
- **Vendor /dashboard tests block on a modal**: there's a Dokan Pro 5.0.0 announcement modal; the `closeAnnouncementModal` helper in `tests/pw/utils/helpers.ts` auto-dismisses via `page.addLocatorHandler`. If a new spec hits it, call that helper at the top.
- **Tests pass locally but fail on CI**: check that the React UI option was enabled (`dokan_appearance.vendor_layout_style = "latest"`). The "Enable Dokan New React UI" workflow step does this in CI; locally you may need to run it manually or via `npm run wp-env run tests-cli wp eval ...`.

## What NOT to do

- **Don't** push directly to `develop` to trigger a run. Use `gh workflow run` or open a PR.
- **Don't** edit per-shard `--shard=N/M` flags by hand — the splitter computes the spec list from the baseline.
- **Don't** add `--no-verify`, skip retries, or set `maxFailures` to bypass real failures. Investigate the trace.
- **Don't** rerun a flaky shard repeatedly hoping it passes. If a test flakes ≥2× on retries, file a follow-up to fix the spec, not the runner.

## Quick reference: things you'll often need

| Need | Command |
| --- | --- |
| Last 5 runs on a branch | `gh run list --branch <branch> --limit 5` |
| Tail failures | `gh run view <id> --log-failed` |
| Re-run a single failed job | `gh run rerun <id> --failed` |
| Download QA report | `gh run download <id> -n quality-report` |
| Cancel a stuck run | `gh run cancel <id>` |
| Enable React UI in wp-env | `npm run wp-env run tests-cli wp option set dokan_appearance ...` |
| Stop wp-env | `npm run wp-env stop` |

## Reporting back

When the user asks Claude to "run the suite", the deliverable is:

1. Confirm what was run (local vs CI, shard subset, tag filters).
2. Top-line result (passed / failed / pass rate / duration).
3. Link to: PR run page (CI) or local HTML report path.
4. If anything failed: the spec name + first error line + the trace path. Do **not** speculate on cause — surface evidence and ask.
