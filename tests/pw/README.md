# Dokan E2E & API Test Suite

End-to-end and API automation for Dokan Lite + Pro, built on Playwright and
TypeScript. The suite covers approximately 1,300 e2e tests and 400 API tests
across the WordPress admin, the Dokan 5.0.0+ React vendor dashboard, the
admin React shell, and all Pro module surfaces.

## Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Suite](#running-the-suite)
- [Test Selection and Filters](#test-selection-and-filters)
- [Environment Variables](#environment-variables)
- [Docker Environment](#docker-environment)
- [Continuous Integration](#continuous-integration)
- [Reports and Artifacts](#reports-and-artifacts)
- [Troubleshooting](#troubleshooting)
- [Project Layout](#project-layout)

## Overview

The suite is organised by feature folder under `tests/e2e/`. Each folder is
self-contained: it owns its spec files, its page object, and its test data,
and does not import from a shared utility tree. This isolation lets a folder
be worked on, shipped, or split out without touching unrelated areas of the
suite.

API coverage lives under `tests/api/` and runs against the same WordPress
container.

Conventions for tagging, test isolation, modal handling, REST authentication,
and DataViews list stability are documented in [`CONVENTIONS.md`](CONVENTIONS.md).
The history and rationale of the 5.0.0 React refactor are in
[`REFACTOR_PLAN.md`](REFACTOR_PLAN.md).

## Prerequisites

| Requirement     | Version           | Notes                                              |
|-----------------|-------------------|----------------------------------------------------|
| Node.js         | 18 LTS or higher  | `node -v`                                          |
| Docker Desktop  | Current stable    | Required by `wp-env`                               |
| Git             | Any modern        | Repository checkout                                |
| Disk            | ~3 GB free        | wp-env containers + Playwright Chromium binary     |

All other dependencies (Playwright, wp-env, premium WooCommerce plugins,
Dokan Pro) are installed or mounted automatically.

## Installation

```bash
cd tests/pw

# Install Node dependencies and the Chromium browser binary
npm install
npm run install:chromium

# Copy the environment template; edit credentials if your setup differs
cp .env.example .env

# Start wp-env (Docker), provision the admin user, and run all setup specs
npm run docker:full
```

The `docker:full` target performs three steps in order:

1. **`wp-env start`** — boots the WordPress container on port `9999` and
   MySQL on port `9998`.
2. **`create:admin`** — provisions the administrator account using the
   credentials in `.env`.
3. **`docker:setup`** — runs `_site.setup.ts`, `_auth.setup.ts`, and
   `_env.setup.ts`, which seed vendors, customers, products, payment
   methods, and write the storage-state JSON files used by every test.

To rebuild the environment from scratch:

```bash
npm run reset:env       # destroys the wp-env stack, then restarts it
npm run docker:setup    # re-seeds the database
```

> `reset:env` deletes the database. The seed step must be re-run before
> any test will pass.

## Running the Suite

| Goal                                | Command                                                                                  |
|-------------------------------------|------------------------------------------------------------------------------------------|
| Full suite (e2e + api + setup)      | `npm test`                                                                               |
| E2E only                            | `npm run test:e2e`                                                                       |
| API only                            | `npm run test:api`                                                                       |
| Single folder                       | `NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/orders`                 |
| Single file                         | `NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/orders/orders.spec.ts`  |
| Single test by name                 | append `-g "<test name>"`                                                                |
| Headed (visible browser)            | `npm run test:headed`                                                                    |
| Playwright UI mode                  | `npm run test:ui`                                                                        |
| Inspector / step-through            | `npm run test:debug`                                                                     |
| Open last HTML report               | `npm run test:report`                                                                    |

Setting `NO_SETUP=true` skips the `_site.setup.ts`, `_auth.setup.ts`, and
`_env.setup.ts` projects. After the initial `docker:full`, all subsequent
runs should use `NO_SETUP=true` — the setup projects re-seed the database
and add several minutes to each run.

## Test Selection and Filters

Every test carries a Lite/Pro gate plus a role tag. Filters use Playwright's
`-g` (grep) flag.

| Tag             | Meaning                                                |
|-----------------|--------------------------------------------------------|
| `@lite`         | Runs in both Lite-only and Lite + Pro environments     |
| `@liteOnly`     | Runs only when Pro is not installed                    |
| `@pro`          | Requires Dokan Pro                                     |
| `@admin`        | Drives the WordPress administrator role                |
| `@vendor`       | `seller` role                                          |
| `@customer`     | Logged-in customer                                     |
| `@guest`        | Unauthenticated                                        |
| `@exploratory`  | Smoke-level coverage with relaxed assertions           |
| `@serial`       | Excluded by `grepInvert`; must be run in isolation     |

Examples:

```bash
# All admin tests
NO_SETUP=true npx playwright test --project=e2e_tests -g "@admin"

# Pro-only tests
NO_SETUP=true npx playwright test --project=e2e_tests -g "@pro"

# Vendor tests in a specific folder
NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/abuse-reports -g "@vendor"
```

## Environment Variables

| Variable      | Default                       | Purpose                                                  |
|---------------|-------------------------------|----------------------------------------------------------|
| `NO_SETUP`    | unset                         | Skip the setup projects (recommended for iteration)      |
| `HEADLESS`    | `true`                        | Set `false` to run with a visible browser                |
| `SLOWMO`      | unset                         | Slow each Playwright action by N milliseconds            |
| `DOKAN_PRO`   | auto-detected                 | Toggle Pro-only test gating                              |
| `BASE_URL`    | `http://localhost:9999`       | Override the WordPress base URL                          |
| `ADMIN`       | `admin`                       | Administrator username                                   |
| `ADMIN_PASSWORD` | `password`                  | Administrator password                                   |

Any of these may be set in `.env` instead of on the command line.

## Docker Environment

The suite uses [`wp-env`](https://www.npmjs.com/package/@wordpress/env) with
a project-local override (`.wp-env.override.json`) that mounts:

- `dokan-lite` (this plugin)
- `dokan-pro` (sibling clone — required for `@pro` tests)
- WooCommerce premium plugins (Bookings, Subscriptions, Product Add-ons,
  Simple Auctions) from `dokan-pro/tests/plugins/`

### Container Layout

| Service             | Port | Purpose                                          |
|---------------------|------|--------------------------------------------------|
| `tests-wordpress`   | 9999 | WordPress (admin)                                |
| `tests-mysql`       | 9998 | MySQL                                            |
| `tests-cli`         | n/a  | wp-cli helper, invoked via `npm run wp-env`      |

The same Compose file also creates `wordpress` / `mysql` / `cli` services on
ports `8889` and `8888`. Those belong to wp-env's "dev" environment and are
not used by the suite.

### Common wp-cli Operations

```bash
npm run wp-env run tests-cli wp option get dokan_appearance --format=json
npm run wp-env run tests-cli wp user list
npm run wp-env run tests-cli wp plugin list --status=active

# Convenience wrappers
npm run check:users
npm run check:plugins
npm run check:modules
```

### Shell Access

```bash
docker exec -it $(docker ps --format '{{.Names}}' | grep tests-wordpress) bash
```

### Required Settings for the React UI

The Dokan 5.0.0+ React vendor dashboard and product editor are gated behind
two options. Without them, the legacy templates render and React-targeting
tests fail at mount.

```
dokan_appearance.vendor_layout_style   = "latest"
dokan_appearance.vendor_product_editor = "latest"
```

CI flips these via `wp eval` after `wp-env` starts. Locally, run the same
command once after `docker:full`:

```bash
npm run wp-env run tests-cli wp eval '
    $a = get_option("dokan_appearance", []);
    $a["vendor_layout_style"]   = "latest";
    $a["vendor_product_editor"] = "latest";
    update_option("dokan_appearance", $a);
'
```

## Continuous Integration

The pipeline is defined in
[`.github/workflows/e2e_api_tests.yml`](../../.github/workflows/e2e_api_tests.yml)
and runs on pull requests and on pushes to default branches.

| Job                  | Description                                                |
|----------------------|------------------------------------------------------------|
| `e2e tests (N, 6)`   | Six parallel shards, 40 minute timeout each                |
| `api tests (1, 1)`   | Single shard, 40 minute timeout                            |
| `merge-reports`      | Aggregates per-shard JSON output into a unified summary    |

Sharding is alphabetical by file name. If a shard exceeds the others
significantly, increase `shardTotal` in the workflow matrix or split the
heaviest spec file into two.

Operational commands:

```bash
gh run list --branch <branch>
gh run watch <RUN_ID>
gh run view <RUN_ID> --log-failed     # log of failing tests only
gh run rerun <RUN_ID> --failed        # rerun only the failed jobs
```

## Reports and Artifacts

Per-run output is written to `playwright-report/` and
`playwright/e2e/test-artifacts/`.

```bash
npm run test:report   # opens the HTML report from the last local run
```

CI uploads each shard's artifact (screenshots, traces, error context) to
the GitHub Actions run. Traces can be opened locally with:

```bash
npx playwright show-trace path/to/trace.zip
```

## Troubleshooting

### `wp-env` fails to start

```
Error: getaddrinfo ENOTFOUND ...
```

Docker is not running. Start Docker Desktop and retry `npm run start:env`.

### Tests pass locally but fail on CI

Common causes, in order of frequency:

1. **The React UI options are not set.** Verify `dokan_appearance.vendor_layout_style`
   and `vendor_product_editor` are both `"latest"`.
2. **Implicit test ordering.** A test depends on state created by an earlier
   test in the same describe. Either move the dependency into `beforeEach`
   via REST seeding, or split the test into its own file.
3. **Vendor announcement modal.** Every vendor `/dashboard` navigation in
   Pro 5.0.0 raises a modal. The page-object constructor registers an
   auto-dismisser via `page.addLocatorHandler`. Vendor flows that bypass
   the page object will be blocked by the modal.

### `Cannot find module 'dotenv/config'` when invoking `npx playwright`

Playwright was resolved from a parent `node_modules`. Use the local binary
via `npm run test:e2e -- tests/e2e/<folder>` or
`node_modules/.bin/playwright test`.

### `Project(s) 'e2e_tests' not found`

The current working directory is not `tests/pw/`. Either `cd tests/pw` or
pass `--config=tests/pw/playwright.config.ts`.

### `Authorization` header dropped on REST requests

The request was issued against `browser.newContext({ storageState }).request`.
Cookies in the storage state cause Playwright to strip the `Authorization`
header. Use `request.newContext()` with explicit Basic authentication. See
`tests/e2e/abuse-reports/abuseReportsPage.ts` for the working pattern.

### Row count reads zero, then reads N a moment later

The count was read before React rendered the rows. Wait for the first row
to be visible before recording a baseline:

```ts
await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 20000 });
const before = await page.locator('table tbody tr').count();
```

### A test passes in isolation but fails in the full suite

The most common cause is state pollution from an earlier test. Confirm by
running the failing test alone:

```bash
NO_SETUP=true npx playwright test --project=e2e_tests <path> -g "<test name>"
```

If the test passes in isolation, decouple its setup from earlier tests or
move it to its own file.

### Chromium binary missing or version mismatch

```
Error: browserType.launch: Executable doesn't exist at ...
```

Run `npm run install:chromium`. Playwright pins a browser version per
package version; after pulling a `package.json` change, the browser must be
re-installed.

## Project Layout

```
tests/pw/
├── README.md                # This document
├── CONVENTIONS.md           # Authoring rules every spec follows
├── REFACTOR_PLAN.md         # History of the 5.0.0 React refactor
├── .env.example             # Template; copy to .env
├── .wp-env.override.json    # Local Docker environment definition
├── playwright.config.ts     # E2E + setup project configuration
├── api.config.ts            # API project configuration
├── package.json
├── tests/
│   ├── e2e/<feature>/       # One folder per feature; see CONVENTIONS.md
│   ├── api/                 # REST API tests
│   ├── _localSite.setup.ts
│   ├── _site.setup.ts
│   ├── _auth.setup.ts
│   ├── _env.setup.ts
│   ├── _coverage.teardown.ts
│   └── global-teardown.ts
├── playwright/.auth/        # Storage-state JSON, generated by _auth.setup.ts
└── utils/                   # Shared helpers (legacy; new folders should not import from here)
```

## Quick Reference

| Action                  | Command                                                                                  |
|-------------------------|------------------------------------------------------------------------------------------|
| First-time setup        | `npm install && cp .env.example .env && npm run docker:full`                             |
| Daily iteration         | `NO_SETUP=true npm run test:e2e -- tests/e2e/<folder>`                                   |
| Debug a failing test    | `NO_SETUP=true npm run test:debug -- tests/e2e/<folder>/<file>.spec.ts -g "<name>"`      |
| Open last report        | `npm run test:report`                                                                    |
| Rebuild the environment | `npm run reset:env && npm run docker:setup`                                              |
| Type-check              | `npm run type:check`                                                                     |
| Lint                    | `npm run lint`                                                                           |
