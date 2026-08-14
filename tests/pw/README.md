# Dokan E2E & API Test Suite

End-to-end and REST API automation for **Dokan Lite** and **Dokan Pro**, built
on [Playwright](https://playwright.dev) and TypeScript. The suite covers
~1,300 e2e tests and ~400 API tests across the WordPress admin, the Dokan
5.0.0+ React vendor dashboard, the admin React shell, and every Pro module.

The test environment runs in Docker (via `@wordpress/env`), so contributors do
not need a local PHP, MySQL, or WordPress installation.

---

## Table of Contents

1. [About This Suite](#about-this-suite)
2. [How It Works](#how-it-works)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Step-by-Step Local Setup with Docker](#step-by-step-local-setup-with-docker)
6. [Required Plugins](#required-plugins)
7. [`.env` Reference](#env-reference)
8. [Running Tests](#running-tests)
9. [Tags and Filters](#tags-and-filters)
10. [Debug Logs and Reports](#debug-logs-and-reports)
11. [Continuous Integration](#continuous-integration)
12. [Project Layout](#project-layout)
13. [Troubleshooting](#troubleshooting)
14. [Authoring New Tests](#authoring-new-tests)

---

## About This Suite

This suite is the official quality gate for Dokan Lite and Dokan Pro. It
exercises the marketplace end-to-end against a real WordPress installation,
real WooCommerce, real Dokan Lite, real Dokan Pro, and the four premium
WooCommerce extensions Dokan integrates with (Bookings, Subscriptions,
Product Add-ons, Simple Auctions).

### Coverage

| Surface                                | Approximate Tests | Project       |
|----------------------------------------|-------------------|---------------|
| Vendor dashboard (React, Dokan 5.0.0+) | 480               | `e2e_tests`   |
| Admin React shell                      | 220               | `e2e_tests`   |
| Pro module front-end and admin flows   | 540               | `e2e_tests`   |
| Lite-only WordPress admin and storefront | 60              | `e2e_tests`   |
| REST API (`/dokan/v1`, `/dokan/v2`, `/dokan/v3`) | 400     | `api_tests`   |

### Design Principles

- **Black-box.** Tests drive the product through its public surfaces — the
  WordPress admin, the storefront, the vendor dashboard, and the public
  REST API. Internal PHP classes are never imported or mocked.
- **Real environment.** Every test runs against a live WordPress, MySQL,
  WooCommerce, and Dokan stack inside Docker. There are no in-memory stubs
  or fakes.
- **Deterministic seeding.** All required state — vendors, customers,
  products, payment methods, modules — is created by setup projects before
  the test phase begins. Tests never depend on data created by an earlier
  test in the same run.
- **Folder-isolated.** Each feature lives in its own folder under
  `tests/e2e/<feature>/` with its own spec file, page object, and test
  data. Folders do not import from one another, so a folder can be removed,
  rewritten, or extracted without breaking unrelated areas.
- **Lite/Pro gated.** Every test carries a `@lite`, `@liteOnly`, or `@pro`
  tag. The runner uses these tags to skip Pro tests when Dokan Pro is not
  present (for example, on fork pull requests in CI).

### What This Suite Is Not

- Not a unit test runner. PHP unit tests live elsewhere and are run by
  PHPUnit, not Playwright.
- Not a load test. Performance and concurrency are out of scope.
- Not a visual regression suite for default styling. A small number of
  `@visual` snapshot tests exist but are excluded from the standard run.

---

## How It Works

### Test Environment

The suite uses [`@wordpress/env`](https://www.npmjs.com/package/@wordpress/env)
to provision Docker containers:

| Service             | Port  | Purpose                                          |
|---------------------|-------|--------------------------------------------------|
| `tests-wordpress`   | 9999  | WordPress (admin and storefront)                 |
| `tests-mysql`       | 9998  | MySQL                                            |
| `tests-cli`         | n/a   | wp-cli helper, invoked via `npm run wp-env`      |

`wp-env` mounts the `dokan-lite` checkout into `wp-content/plugins/` inside
the container. The local override at
`tests/pw/.wp-env.override.json` adds Dokan Pro and the premium WooCommerce
plugins from sibling clones on the host. CI generates its own override at
runtime from `.wp-env.ci.json` or `.wp-env.json`, depending on whether the
job has access to the Pro repository (Pro tests are skipped on fork PRs).

### Test Lifecycle

Playwright projects run in this order on a full bootstrap (`docker:full`):

1. **`site_setup`** (`tests/e2e/_site.setup.ts`) — configures
   `wp-config.php` debug constants, sets the permalink structure, activates
   plugins (Basic Auth, WooCommerce, Dokan Lite, Dokan Pro), activates the
   Storefront theme, applies the Dokan Pro license, and activates every
   Dokan module via the REST `/admin/modules/activate` endpoint.
2. **`auth_setup`** (`tests/e2e/_auth.setup.ts`) — logs into the admin,
   each seeded vendor, and each seeded customer; captures their cookies
   and writes them to JSON files under `playwright/.auth/`. Tests reuse
   these files via `browser.newContext({ storageState })`, eliminating the
   per-test login cost.
3. **`e2e_setup`** (`tests/e2e/_env.setup.ts`) — seeds vendors, customers,
   products, payment methods, store categories, abuse reasons, and any
   other shared fixtures. Generated IDs are written back into `.env` so
   subsequent runs (with `NO_SETUP=true`) can reference them without
   re-creating.
4. **`e2e_tests`** — the actual test phase. Reads storage state and
   fixture IDs; never depends on the setup projects running on the same
   invocation.

API tests follow the same pattern but run under `api.config.ts` with the
projects `api_setup` and `api_tests`.

### Per-Run Hooks

`global-setup.ts` runs before any project starts. It truncates
`wp-data/debug.log` so that file reflects only the current run's events.
The log is bind-mounted from the host into the container at
`/var/www/html/wp-data/debug.log`, so contributors can `tail -f` it from
the host while a test is executing.

### Test Authoring Pattern

A typical feature folder looks like this:

```
tests/e2e/abuse-reports/
├── abuseReports.spec.ts        # the test cases
├── abuseReportsPage.ts         # page object + REST client
└── abuseReportsTestData.ts     # selectors, fixtures, generators
```

Specs are thin: each `test()` instantiates the page object, invokes a
high-level method, and asserts on the resulting UI or REST response. The
page object owns selectors, navigation, REST seeding, and any retry
logic. Tests do not call `page.locator(...)` against raw selectors.

### Authentication

The suite authenticates browser sessions via storage-state JSON files
written by `_auth.setup.ts`:

| File                                   | Role           |
|----------------------------------------|----------------|
| `playwright/.auth/adminStorageState.json`   | WordPress administrator |
| `playwright/.auth/vendorStorageState.json`  | Primary vendor (`vendor1`) |
| `playwright/.auth/vendor2StorageState.json` | Secondary vendor (`vendor2`) |
| `playwright/.auth/customerStorageState.json`  | Primary customer (`customer1`) |
| `playwright/.auth/customer2StorageState.json` | Secondary customer (`customer2`) |
| `playwright/.auth/guestStorageState.json`     | Unauthenticated baseline |

REST requests use HTTP Basic Authentication via the Basic Auth plugin
(activated in `site_setup`). The `payloads.adminAuth` helper packages the
admin credentials from `.env` for `request.newContext()` calls.

### Modal Handling

Dokan Pro 5.0.0 displays an announcement modal on every vendor `/dashboard`
load. Each vendor-facing page object registers an auto-dismiss handler in
its constructor via `page.addLocatorHandler`. Tests that bypass the page
object hit the modal and time out — this is the single most common cause
of flakes for new contributors.

### Tag-Driven Filtering

Every test carries at least two tags: a Lite/Pro gate and a role tag.
Playwright's `grep` and `grepInvert` are configured in
`playwright.config.ts` to honour these:

```ts
grep:       [/@lite/, /@liteOnly/, /@pro/],
grepInvert: parseBoolean(DOKAN_PRO) ? [/@liteOnly/, /@serial/] : [/@pro/, /@serial/],
```

When `DOKAN_PRO=true` (Pro present), `@liteOnly` and `@serial` are
excluded. When `DOKAN_PRO=false` or unset, `@pro` and `@serial` are
excluded. This is what lets the suite run cleanly on fork pull requests
without the Pro repository.

### CI Sharding

CI splits `e2e_tests` across six parallel shards, alphabetically by spec
file name. Each shard has a 40-minute timeout. After all shards complete,
a `merge-reports` job aggregates per-shard JSON output into a unified HTML
report uploaded as a workflow artifact.

---

## Prerequisites

| Requirement      | Minimum Version        | How to Verify         |
|------------------|------------------------|-----------------------|
| Node.js          | 18 LTS                 | `node -v`             |
| npm              | 8                      | `npm -v`              |
| Docker Desktop   | Current stable         | `docker info`         |
| Git              | Any modern release     | `git --version`       |
| Free disk space  | ~3 GB                  | wp-env images + Chromium binary |

> Playwright, wp-env, and the WooCommerce premium plugins ship through the
> repository — there is nothing else to install by hand.

---

## Quick Start

If you already have Docker and Node ready and you have cloned `dokan-pro`
next to `dokan-lite`, the full bootstrap is four commands:

```bash
cd tests/pw
npm install
cp .env.example .env          # then edit credentials and LICENSE_KEY
npm run docker:full           # Docker + admin user + seed data
```

After it finishes, run the tests:

```bash
npm run test:e2e              # ~12 minutes on a typical laptop
```

For a fully annotated walkthrough see
[Step-by-Step Local Setup with Docker](#step-by-step-local-setup-with-docker).

---

## Step-by-Step Local Setup with Docker

### 1. Install the host-level prerequisites

| Tool             | macOS                                | Windows / Linux                         |
|------------------|--------------------------------------|-----------------------------------------|
| Docker Desktop   | <https://docs.docker.com/desktop/>   | <https://docs.docker.com/desktop/>      |
| Node.js 18+      | `brew install node` or nvm           | nvm / official installer                |
| Git              | bundled with Xcode CLT               | <https://git-scm.com/downloads>         |

Start Docker Desktop and confirm `docker info` returns successfully before
continuing.

### 2. Clone the required repositories

The suite expects this directory layout — `dokan-pro` must be a **sibling
folder** of `dokan-lite`, both inside `wp-content/plugins/`:

```
wp-content/plugins/
├── dokan-lite/                 # this repository
├── dokan-pro/                  # required for @pro tests
├── woocommerce/                # auto-installed by wp-env
├── woocommerce-bookings/       # required for booking tests
├── woocommerce-subscriptions/  # required for subscription tests
├── woocommerce-product-addons/ # required for addons tests
└── woocommerce-simple-auctions/# required for auction tests
```

`dokan-lite/tests/pw/.wp-env.override.json` mounts these folders into the
WordPress container automatically. If a folder is missing, the matching
`@pro` tests fail at activation time — the rest of the suite still runs.

### 3. Move into the suite directory

Every command in this README is intended to be run from `tests/pw/`:

```bash
cd dokan-lite/tests/pw
```

### 4. Install Node dependencies and the Chromium browser

```bash
npm install
npm run install:chromium
```

`install:chromium` downloads the Chromium build that matches the Playwright
version pinned in `package.json`. Repeat after any future `npm install` that
upgrades Playwright.

### 5. Create your `.env`

```bash
cp .env.example .env
```

Open `.env` in your editor and set:

- `ADMIN_PASSWORD` — leave as `password` for wp-env, or change if you want.
- `USER_PASSWORD` — password for the seeded vendors and customers.
- `LICENSE_KEY` — your Dokan Pro license. Required for Pro tests; leave blank
  to skip license activation.
- `GMAP` — Google Maps key. Optional; only needed for geolocation tests.

The full reference for every variable is in
[the `.env` reference section](#env-reference).

### 6. Boot the environment and seed the database

```bash
npm run docker:full
```

This single command does three things, in order:

1. **`npm run start:env`** — starts the wp-env containers (WordPress on
   `http://localhost:9999`, MySQL on `9998`). wp-env automatically creates
   a default admin (`admin` / `password`).
2. **`npm run create:admin`** — applies the `ADMIN`, `ADMIN_PASSWORD`, and
   `ADMIN_EMAIL` values from `.env` to the WordPress admin account. If you
   leave the defaults, this step is a no-op (the wp-env-created `admin`
   already matches). If you customise the admin credentials in `.env`, this
   is what propagates them into WordPress.
3. **`npm run docker:setup`** — runs `_site.setup.ts`, `_auth.setup.ts`, and
   `_env.setup.ts`. These activate plugins, configure Dokan, create vendors
   and customers, seed products and payment methods, and write storage-state
   JSON files used by every test.

The first run takes 5–10 minutes because wp-env is downloading WordPress and
WooCommerce images. Subsequent runs are much faster.

### 7. Verify the environment

```bash
npm run check:plugins   # lists active plugins
npm run check:users     # lists test users
npm run check:modules   # counts active Dokan modules
```

A healthy install reports the eight plugins listed in the
[Required Plugins](#required-plugins) table as `active`.

### 8. Run the tests

```bash
npm run test:e2e        # all e2e tests (~12 minutes)
npm run test:api        # REST API tests (~3 minutes)
```

`test:e2e` automatically sets `NO_SETUP=true`, so it skips the setup
projects and runs only the test files.

### 9. Open the report

```bash
npm run test:report
```

The HTML report opens in your browser with traces, screenshots, and the
network log for every test.

### Stopping and resetting

```bash
npm run stop:env        # stop the containers (preserves the database)
npm run reset:env       # destroy and recreate the wp-env stack
npm run docker:setup    # required after reset:env to re-seed the DB
```

> `reset:env` deletes the WordPress database. You must re-run `docker:setup`
> before any test will pass.

---

## Required Plugins

The suite drives a real WordPress install — every plugin below must be
**installed and activated** for its corresponding tests to pass. Plugins
marked **mounted by wp-env** are pulled from sibling folders inside
`wp-content/plugins/` automatically; you do not run `wp plugin install` on
them.

| Plugin                       | Slug                          | Source                | Required For    |
|------------------------------|-------------------------------|-----------------------|-----------------|
| Basic Auth                   | `basic-auth` (folder: `master`) | mounted by wp-env   | REST API auth   |
| WooCommerce                  | `woocommerce`                 | downloaded by wp-env  | All tests       |
| Storefront theme             | `storefront`                  | downloaded by wp-env  | All tests       |
| Dokan Lite                   | `dokan-lite`                  | this repository       | All tests       |
| Dokan Pro                    | `dokan-pro`                   | sibling clone         | `@pro` tests    |
| WooCommerce Bookings         | `woocommerce-bookings`        | sibling clone         | Booking tests   |
| WooCommerce Subscriptions    | `woocommerce-subscriptions`   | sibling clone         | Subscription tests |
| WooCommerce Product Add-ons  | `woocommerce-product-addons`  | sibling clone         | Add-on tests    |
| WooCommerce Simple Auctions  | `woocommerce-simple-auctions` | sibling clone         | Auction tests   |

### Required Dokan options

The 5.0.0+ React UI (vendor dashboard, product editor, setup wizard) is gated
behind three options. Without them the legacy templates render and
React-targeting tests fail at mount.

```bash
npm run wp-env run tests-cli wp eval '
    $a = get_option("dokan_appearance", []);
    $a["vendor_layout_style"]   = "latest";
    $a["vendor_product_editor"] = "latest";
    $a["vendor_setup_wizard"]   = "latest";
    update_option("dokan_appearance", $a);
'
```

`docker:setup` flips these flags automatically. Run the snippet only if you
have a partially-seeded environment.

---

## `.env` Reference

Copy `.env.example` to `.env` and edit. Variables fall into four groups.

### Admin and test users

| Variable           | Default                       | Notes                                                       |
|--------------------|-------------------------------|-------------------------------------------------------------|
| `ADMIN`            | `admin`                       | wp-env's default admin username                             |
| `ADMIN_PASSWORD`   | `password`                    | wp-env's default admin password                             |
| `ADMIN_EMAIL`      | `wordpress@example.com`       | Admin email                                                 |
| `VENDOR`           | `vendor1`                     | Primary seeded vendor                                       |
| `VENDOR2`          | `vendor2`                     | Secondary seeded vendor                                     |
| `CUSTOMER`         | `customer1`                   | Primary seeded customer                                     |
| `CUSTOMER2`        | `customer2`                   | Secondary seeded customer                                   |
| `USER_PASSWORD`    | _(set this)_                  | Password used for every seeded user                         |

### Dokan configuration

| Variable           | Required for           | Recommended Value          | Notes                                            |
|--------------------|------------------------|----------------------------|--------------------------------------------------|
| `DOKAN_PRO`        | Pro test gating        | `true` (with Pro)          | `false` runs only Lite tests                     |
| `LICENSE_KEY`      | Pro license activation | _your key_                 | Leave blank to skip license setup                |
| `GMAP`             | Geolocation tests      | _your key_                 | Optional                                         |

### Playwright runtime

| Variable           | Recommended Value                          | Notes                                                   |
|--------------------|--------------------------------------------|---------------------------------------------------------|
| `BASE_URL`         | `http://localhost:9999`                    | wp-env's WordPress port                                 |
| `HEADLESS`         | `true` for normal runs, `false` to watch   | Browser visibility                                      |
| `CI`               | `true`                                     | Activates retries (2x) and CI-friendly timeouts         |
| `NO_SETUP`         | `false` for first-time setup, `true` after | Skips `_site.setup.ts` / `_auth.setup.ts` / `_env.setup.ts` |

> Keep `NO_SETUP=false` until `docker:full` has completed successfully
> once. After the initial seed, set it to `true` so subsequent runs do not
> re-seed the database. The `npm run test:e2e` script sets `NO_SETUP=true`
> automatically.

### Database (do not change)

These match the wp-env defaults. Override them only if you are running
against an external database.

| Variable             | Value                |
|----------------------|----------------------|
| `DB_HOST_NAME`       | `localhost`          |
| `DB_USER_NAME`       | `root`               |
| `DB_USER_PASSWORD`   | `password`           |
| `DATABASE`           | `tests-wordpress`    |
| `DB_PORT`            | `9998`               |
| `DB_PREFIX`          | `wp`                 |

### REST API endpoint

| Variable      | Value                                          |
|---------------|------------------------------------------------|
| `SERVER_URL`  | `http://localhost:9999/?rest_route=`           |

> Use the `?rest_route=` query-string form for Docker. The pretty-permalink
> form (`/wp-json`) is set automatically by `_site.setup.ts` after the
> permalink structure is configured.

### Auto-populated values

`_env.setup.ts` writes user IDs, nonces, and other test data back into the
file after seeding. Leave these blank in `.env.example`; they are filled in
automatically.

```
CUSTOMER_ID=
VENDOR_ID=
CUSTOMER2_ID=
VENDOR2_ID=
PRODUCT_EDIT_NONCE=
CATEGORY_ID=
```

---

## Running Tests

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

---

## Tags and Filters

Every test carries a Lite/Pro gate plus a role tag. Filters use Playwright's
`-g` (grep) flag.

| Tag             | Meaning                                              |
|-----------------|------------------------------------------------------|
| `@lite`         | Runs in both Lite-only and Lite + Pro environments   |
| `@liteOnly`     | Runs only when Pro is not installed                  |
| `@pro`          | Requires Dokan Pro                                   |
| `@admin`        | Drives the WordPress administrator role              |
| `@vendor`       | `seller` role                                        |
| `@customer`     | Logged-in customer                                   |
| `@guest`        | Unauthenticated                                      |
| `@exploratory`  | Smoke-level coverage with relaxed assertions         |
| `@serial`       | Excluded by default; must be run in isolation        |

```bash
NO_SETUP=true npx playwright test --project=e2e_tests -g "@admin"
NO_SETUP=true npx playwright test --project=e2e_tests -g "@pro"
NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/orders -g "@vendor"
```

---

## Debug Logs and Reports

### WordPress debug log

WordPress writes its debug log to `tests/pw/wp-data/debug.log`. The file is
bind-mounted into the WordPress container, so writes appear on the host
immediately.

Tail it live while a test runs:

```bash
tail -f wp-data/debug.log
```

The log is **truncated automatically at the start of every test invocation**
by `global-setup.ts`, so the contents reflect only the current run.

### Playwright report

```bash
npm run test:report
```

Opens the HTML report from the most recent local run with traces,
screenshots, and the network log for each test.

### Test artifacts

Failed tests dump screenshots, traces, and `error-context.md` files to
`playwright/e2e/test-artifacts/`. Open a trace with:

```bash
npx playwright show-trace path/to/trace.zip
```

---

## Continuous Integration

The pipeline is defined in
[`.github/workflows/e2e_api_tests.yml`](../../.github/workflows/e2e_api_tests.yml)
and runs on pull requests and pushes to default branches.

| Job                    | Description                                                |
|------------------------|------------------------------------------------------------|
| `e2e tests (N, 6)`     | Six parallel shards, 40-minute timeout each                |
| `api tests (1, 1)`     | Single shard, 40-minute timeout                            |
| `merge-reports`        | Aggregates per-shard JSON output into a unified summary    |

CI generates `.wp-env.override.json` at runtime (copying either
`.wp-env.ci.json` for full Pro runs or `.wp-env.json` for Lite-only fork
PRs), so the committed local override does not leak into CI execution.

Useful operational commands:

```bash
gh run list --branch <branch>
gh run watch <RUN_ID>
gh run view <RUN_ID> --log-failed
gh run rerun <RUN_ID> --failed
```

---

## Project Layout

```
tests/pw/
├── README.md                    # this document
├── .env.example                 # template; copy to .env
├── .wp-env.json                 # base wp-env definition
├── .wp-env.override.json        # local override with Pro plugin mappings
├── .wp-env.ci.json              # CI-only wp-env definition
├── playwright.config.ts         # E2E + setup project configuration
├── api.config.ts                # API project configuration
├── e2e.config.ts                # shared e2e options
├── global-setup.ts              # truncates wp-data/debug.log per run
├── package.json
├── tests/
│   ├── e2e/<feature>/           # one folder per feature
│   ├── api/                     # REST API tests
│   ├── _site.setup.ts           # WP/Dokan configuration
│   ├── _auth.setup.ts           # storage-state JSON
│   ├── _env.setup.ts            # seed users, products, write back to .env
│   └── _coverage.teardown.ts
├── playwright/.auth/            # storage-state JSON (generated)
├── wp-data/                     # bind-mounted into the container
│   └── debug.log                # WordPress debug log (gitignored)
└── utils/                       # shared helpers
```

---

## Troubleshooting

### `wp-env` fails to start with `getaddrinfo ENOTFOUND`

Docker is not running. Start Docker Desktop and retry `npm run start:env`.

### `Plugin 'dokan-pro' could not be found`

The `dokan-pro` repository is not cloned next to `dokan-lite`. See
[Step 2](#2-clone-the-required-repositories) for the expected layout. The
suite still runs `@lite` tests with Pro plugins missing; only `@pro` tests
fail.

### Tests pass locally but fail on CI

In order of frequency:

1. **The React UI options are not set.** Verify
   `dokan_appearance.vendor_layout_style` and `vendor_product_editor` are
   both `"latest"` on the container.
2. **Implicit test ordering.** A test depends on state created by an earlier
   test in the same describe. Either move the dependency into `beforeEach`
   via REST seeding, or split the test into its own file.
3. **Vendor announcement modal.** Every vendor `/dashboard` navigation in
   Pro 5.0.0 raises a modal. The page-object constructor registers an
   auto-dismisser via `page.addLocatorHandler`. Vendor flows that bypass the
   page object are blocked by the modal.

### `Cannot find module 'dotenv/config'` when invoking `npx playwright`

Playwright was resolved from a parent `node_modules`. Use the local binary
via `npm run test:e2e -- tests/e2e/<folder>` or
`node_modules/.bin/playwright test`.

### `Project(s) 'e2e_tests' not found`

The current working directory is not `tests/pw/`. Either `cd tests/pw` or
pass `--config=tests/pw/playwright.config.ts`.

### `Authorization` header dropped on REST requests

The request was issued against
`browser.newContext({ storageState }).request`. Cookies in the storage
state cause Playwright to strip the `Authorization` header. Use
`request.newContext()` with explicit Basic authentication. See
`tests/e2e/abuse-reports/abuseReportsPage.ts` for the working pattern.

### A test passes in isolation but fails in the full suite

State pollution from an earlier test. Confirm by running the failing test
alone:

```bash
NO_SETUP=true npx playwright test --project=e2e_tests <path> -g "<test name>"
```

If it passes alone, decouple its setup from earlier tests or move it to its
own file.

### Chromium binary missing or version mismatch

```
Error: browserType.launch: Executable doesn't exist at ...
```

Run `npm run install:chromium`. Playwright pins a browser version per
package version; after pulling a `package.json` change, the browser must be
re-installed.

### Deleted `wp-data/` while wp-env is running

The bind mount stales on macOS. Recreate the directory and restart wp-env:

```bash
mkdir -p wp-data
npm run wp-env -- stop
npm run wp-env -- start
```

---

## Authoring New Tests

When adding new specs, follow the conventions already in place:

- One folder per feature under `tests/e2e/`. Each folder owns its spec file,
  page object, and test data, and does not import from a shared utility tree.
- Tag every test with a Lite/Pro gate (`@lite` or `@pro`) and a role tag
  (`@admin`, `@vendor`, `@customer`, or `@guest`).
- Use REST seeding in `beforeAll` / `beforeEach` rather than relying on state
  produced by an earlier test in the same describe.
- Vendor flows on Pro 5.0.0 must dismiss the welcome modal — instantiate the
  feature's page object so `page.addLocatorHandler` is registered.

Existing folders (e.g. `tests/e2e/abuse-reports/`, `tests/e2e/announcements/`)
are good references for the page object pattern, REST authentication, and
DataViews list stability.

---

## Quick Reference

| Action                  | Command                                                                                  |
|-------------------------|------------------------------------------------------------------------------------------|
| First-time setup        | `npm install && cp .env.example .env && npm run docker:full`                             |
| Daily iteration         | `NO_SETUP=true npm run test:e2e -- tests/e2e/<folder>`                                   |
| Debug a failing test    | `NO_SETUP=true npm run test:debug -- tests/e2e/<folder>/<file>.spec.ts -g "<name>"`      |
| Open last report        | `npm run test:report`                                                                    |
| Tail WordPress log      | `tail -f wp-data/debug.log`                                                              |
| Rebuild the environment | `npm run reset:env && npm run docker:setup`                                              |
| Type-check              | `npm run type:check`                                                                     |
| Lint                    | `npm run lint`                                                                           |
