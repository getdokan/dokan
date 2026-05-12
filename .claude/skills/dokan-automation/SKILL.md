---
name: dokan-automation
description: >-
  Build, scaffold, and run the Dokan Lite/Pro Playwright suite. Use when the
  user asks to add tests for a feature, scaffold from test-cases.md, or run
  the automation suite (Lite Only / PR / Full). Knows the folderized format,
  tag system, Docker / wp-env preconditions, and the .env / license-key
  requirements for Pro runs.
---

# Dokan Automation Skill

A QA-facing skill for the Dokan Playwright suite. Three flows:

1. **Author flow** — user wants to add test cases through Claude. Interview the user, write a properly-shaped `## Feature:` block into `tests/pw/test-cases.md`. Never scaffold straight to `tests/e2e/` — always go through `test-cases.md` first.
2. **Build flow** — read `tests/pw/test-cases.md`, scaffold one folder per feature (`tests/e2e/<slug>/<slug>.spec.ts` + `<slug>Page.ts`) matching the existing format.
3. **Run flow** — ask which suite (Lite Only / PR / Full), verify Docker, `.env`, and license preconditions, then invoke the right `npm` script.

The full project reference lives in `tests/pw/setup.md` (relative to the dokan-lite plugin root). **Always read it first** — folder layout, npm scripts, env vars, tag rules, and known sharp edges. This SKILL.md is the playbook; `setup.md` is the data.

---

## Quick orientation

Suite root:

```
SUITE_ROOT = tests/pw          # relative to the dokan-lite plugin root
```

Three files this skill always references:

| File                       | Purpose                                              |
|----------------------------|------------------------------------------------------|
| `$SUITE_ROOT/setup.md`     | Folder layout, scripts, env, tags, templates         |
| `$SUITE_ROOT/test-cases.md`| QA author sheet — input for the build flow           |
| `$SUITE_ROOT/.env.example` | Variable list for the run flow                       |

Before doing anything else, `Read` `setup.md` once. Don't paraphrase from memory — it's the source of truth.

---

## Detecting which flow to run

| User says…                                       | Flow      |
|--------------------------------------------------|-----------|
| "add test cases for X", "write test cases", "I want to add cases through you", "help me draft cases" | **Author** |
| "build the suite", "scaffold tests", "generate from test-cases.md", "create tests for X" | **Build** |
| "run the suite", "run automation", "run e2e", "run the tests", "kick off the run"        | **Run**   |
| Asks something neither authors, builds, nor runs | Answer the question using `setup.md` as the reference |

If the request is ambiguous between Author and Build (e.g. "add tests for X"), ask: "Do you want me to write the test cases into `test-cases.md` first, or are they already in there and you want me to scaffold the spec files?"

---

## AUTHOR FLOW

User wants Claude to add the test cases. The output of this flow is **never** a spec file — it is a new (or updated) `## Feature:` block appended to `$SUITE_ROOT/test-cases.md`.

### Step 1 — confirm intent

If the user said anything that could also mean "scaffold immediately," ask once:

> Got it — I'll write these into `tests/pw/test-cases.md` first. After you review, run "scaffold from test-cases.md" and I'll generate the spec files. Sound right?

### Step 2 — interview

Use `AskUserQuestion` (one question at a time, header in <12 chars):

1. **Feature name** — free text. Derive `Slug` automatically (kebab-case).
2. **Type** — `e2e` / `api`.
3. **Plugin gate** — `lite` / `liteOnly` / `pro`.
4. **Roles** — multiSelect: admin, vendor, customer, guest. Map to storage state automatically (`vendor` → `vendor1`, etc.).
5. **REST seed?** — yes / no.

### Step 3 — collect scenarios, sectioned

Test cases in `test-cases.md` are split into three sections:

| Section            | Required? | What it covers                                                                |
|--------------------|-----------|-------------------------------------------------------------------------------|
| **Happy Paths**    | **Mandatory.** Refuse to write the block without at least one. | Golden, expected flows. |
| **Edge Cases**     | Optional. Skip the section entirely if empty. | Boundary / unusual: empty state, max length, slow network, race conditions. |
| **Negative Cases** | Optional. Skip the section entirely if empty. | User does the wrong thing: validation, permission denied, 4xx/5xx. |

Ask in this order. After Happy Paths, prompt: "Any edge cases? (optional — say 'no' to skip)" — same for Negative.

For every scenario collect: actor role, action, steps, expected outcome, optional tag extras (`@exploratory`, `@visual`).

### Step 4 — write the block

`Read` the current `$SUITE_ROOT/test-cases.md` and append (or replace, if a block with the same slug exists) the new feature using the template from `test-cases.md` "Feature template". Set `Status: build` so the user can immediately move to the Build flow.

Rules:
- Omit empty optional sections — don't leave `### Edge Cases` with nothing under it.
- Preserve every existing block in the file. Never rewrite the whole file.
- If the same slug already has a block, ask before overwriting.

### Step 5 — confirm and hand off

Report back:

```
Added "<feature>" to test-cases.md:
  • Happy Paths:    <n>
  • Edge Cases:     <n or "—">
  • Negative Cases: <n or "—">
  Status: build

Review the block, edit if needed, then say "scaffold from test-cases.md" to generate specs.
```

---

## BUILD FLOW

### Step 1 — read inputs

1. `Read $SUITE_ROOT/test-cases.md` in full.
2. `Read $SUITE_ROOT/setup.md` §3 (spec template) and §4 (page-object template) — quote them verbatim when generating.
3. List existing folders under `$SUITE_ROOT/tests/e2e/` so you don't clobber an existing feature.

### Step 2 — confirm the plan

If `test-cases.md` is still the unedited template (contains `<REPLACE ME>` or only the example block), tell the user to fill it in and stop. Don't scaffold placeholders.

Otherwise, list every feature you'll generate:

```
Found N features in test-cases.md:
  • <slug>  (type=e2e, gate=lite, roles=vendor) — M test cases
  • <slug>  (type=api, gate=pro,  roles=admin)  — M test cases
Skipping: <slug> (Status: skip)

Proceed?
```

Only continue after the user confirms.

### Step 3 — validate sections

Each `## Feature:` block in `test-cases.md` is split into `### Happy Paths`, `### Edge Cases`, and `### Negative Cases`.

- **Happy Paths is mandatory.** If a block has zero Happy Path cases, refuse to scaffold it and tell the user which feature is missing them. Skip that block, continue with the rest.
- **Edge Cases / Negative Cases are optional.** If a section is missing or empty, just skip it — do not generate an empty `test.describe`.

### Step 4 — scaffold per feature

For each feature with `Status: build` (and at least one Happy Path):

**E2E features** (`Type: e2e`):
- Create `$SUITE_ROOT/tests/e2e/<slug>/<slug>.spec.ts` from setup.md §3.
- Inside the outer `test.describe('<feature> functionality', ...)`, create one nested `test.describe('happy paths', ...)` and (only if the section exists with at least one case) `test.describe('edge cases', ...)` and `test.describe('negative cases', ...)`. This keeps the section structure visible in the report.
- Create `$SUITE_ROOT/tests/e2e/<slug>/<slug>Page.ts` from setup.md §4.
- If `REST seed: yes`, include the `api` object (init/dispose) in the page file.
- If the role list includes `vendor` or `vendor2`, register the announcement-modal handler in the page-object constructor (setup.md §10).

**API features** (`Type: api`):
- Create `$SUITE_ROOT/tests/api/<slug>.spec.ts` only — no page object.
- Use `ApiUtils` from `@utils/apiUtils`, `payloads`, and `schemas`. Mirror an existing API spec like `tests/api/products.spec.ts`.
- Lead the file with `//COVERAGE_TAG: <METHOD> <route>` lines for every route the spec hits.
- Same nested `describe` grouping by section as E2E.

**Tags** (every test):
- Always include the gate tag: `@lite`, `@liteOnly`, or `@pro` from `Plugin gate`.
- Always include a role tag for each acting role: `@admin`, `@vendor`, `@customer`, `@guest`.
- Append any `Tag extras` from the test-case bullet.

**Storage state**:
- Map the `Storage state` field to files under `playwright/.auth/`:
  - `admin → adminStorageState.json`
  - `vendor → vendorStorageState.json`, `vendor2 → vendor2StorageState.json`
  - `customer → customerStorageState.json`, `customer2 → customer2StorageState.json`
  - `guest → guestStorageState.json`

### Step 5 — verify the scaffold

After writing files for a feature:

```bash
cd $SUITE_ROOT
npx tsc --noEmit            # type-check
npx eslint tests/e2e/<slug> # lint
```

Fix any errors before moving to the next feature. Don't run the test itself — that's the run flow.

### Step 6 — report

Summarise: `N features scaffolded, M skipped (missing Happy Paths or Status=skip). Type-check + lint passed. Run npm run test:e2e -- tests/e2e/<slug> to execute.`

---

## RUN FLOW

### Step 1 — ask which suite

Use `AskUserQuestion`. Exactly these three options (label + description from setup.md §8):

| Label        | Description                                                   |
|--------------|---------------------------------------------------------------|
| Lite Only    | DOKAN_PRO=false, runs @lite + @liteOnly. No license needed.   |
| PR           | DOKAN_PRO=true, fast PR-gate run (e2e_tests, no @serial/@exploratory). |
| Full Suite   | DOKAN_PRO=true, full bootstrap — E2E + API. Needs license.    |

Header: `Suite mode`. Single-select. Don't proceed until the user picks one.

### Step 2 — Docker check

```bash
docker info >/dev/null 2>&1 && echo OK || echo MISSING
```

If `MISSING`, tell the user:

> Docker isn't running. Start Docker Desktop, then re-run.

Stop here. Do not try to start Docker yourself.

### Step 3 — `.env` check

Path: `$SUITE_ROOT/.env`.

If the file doesn't exist:
1. `Read $SUITE_ROOT/.env.example` to get the variable list.
2. Tell the user `.env is missing. I'll create it from .env.example.`
3. Use `AskUserQuestion` to collect (only what's needed for the chosen mode):

| Mode       | Variables to collect                                                          |
|------------|-------------------------------------------------------------------------------|
| Lite Only  | `USER_PASSWORD`, `HEADLESS` (true/false)                                      |
| PR         | `USER_PASSWORD`, `LICENSE_KEY`, `HEADLESS`                                    |
| Full Suite | `USER_PASSWORD`, `LICENSE_KEY`, `GMAP` (optional), `HEADLESS`                 |

Set `DOKAN_PRO` based on mode. Leave `ADMIN`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, vendor/customer usernames, and DB vars at the wp-env defaults (`admin`/`password`/`wordpress@example.com`, `vendor1`/`vendor2`, `customer1`/`customer2`, etc. — see setup.md §6).

Set `NO_SETUP=false` (first run); the npm script flips it to `true` for `test:e2e`.

`Write` the file. Do not commit it — `.env` is gitignored.

If the file already exists, parse it and only ask for missing values that the chosen mode requires.

### Step 4 — license-key check (Pro modes only)

If mode is `PR` or `Full Suite`:

1. Grep `LICENSE_KEY=` in `$SUITE_ROOT/.env`. If empty or set to the placeholder `your_dokan_pro_license_key`, ask:

> Pro mode needs a Dokan Pro license key. Paste it now (or "skip" to run without license activation — Pro tests that depend on license-gated features may fail).

2. If the user provides a key, write it back into `.env` via `Edit`.
3. Also verify `wp-content/plugins/dokan-pro/` exists. If not:

> dokan-pro/ isn't cloned next to dokan-lite. Pro tests will skip activation. Clone the repo into wp-content/plugins/dokan-pro/ first.

### Step 5 — run

From `$SUITE_ROOT`, run the right command for the chosen mode. **Always `cd $SUITE_ROOT` first** (npm scripts assume that cwd):

| Mode        | Command                                                                                                |
|-------------|--------------------------------------------------------------------------------------------------------|
| Lite Only   | `npm run docker:full && npm run test:e2e`                                                              |
| PR          | `npm run docker:full && NO_SETUP=true npx playwright test --project=e2e_tests --grep-invert "@exploratory\|@serial"` |
| Full Suite  | `npm run docker:full && npm run test:e2e && npm run test:api`                                          |

If the user's `.env` already has `NO_SETUP=true` AND they confirm the environment is already seeded, you may skip `docker:full` and run the test command directly. When in doubt, run `docker:full` — it's idempotent.

Run with `run_in_background: true` and stream output via `Monitor`. The full e2e run takes ~12 min; the API run ~3 min.

### Step 6 — report

When the run finishes:

```
<mode> run complete.
  Passed:  <n>
  Failed:  <n>
  Skipped: <n>
  Report:  cd $SUITE_ROOT && npm run test:report
```

If anything failed, point at `$SUITE_ROOT/wp-data/debug.log` (truncated per run by `global-setup.ts`) and the HTML report.

---

## When the user asks a question instead

Examples: "what does NO_SETUP do?", "where do auctions tests live?", "what tags should this test have?".

1. `Read $SUITE_ROOT/setup.md`.
2. Answer from it directly. Cite the section (`setup.md §7` etc.).
3. If the answer requires reading the actual code (e.g. "what does the products page object do?"), grep under `$SUITE_ROOT/tests/e2e/` and read the specific file.

Don't invent. If `setup.md` doesn't cover it and the code doesn't either, say so.

---

## Hard rules

1. **Never edit a file under `tests/e2e/<existing-slug>/` without explicit user permission.** Existing folders are owned by their original authors.
2. **Never commit `.env`.** It's gitignored. Writing it locally is fine; committing it is not.
3. **Never run `npm run reset:env` without confirmation** — it deletes the database and forces a re-seed.
4. **Never skip the Docker check.** Every other failure mode downstream is harder to diagnose than "Docker isn't running."
5. **Never bypass the page-object pattern.** A spec that calls `page.locator(...)` directly is a bug, not a shortcut.
6. **Every new test gets one Lite/Pro gate tag and at least one role tag.** No exceptions.
7. **Every vendor-facing page object registers the announcement-modal handler** in its constructor (setup.md §10). Forgetting this is the #1 cause of flake.
8. **For Pro-only features, verify `dokan-pro/` is cloned as a sibling under `wp-content/plugins/`** before running `@pro` tests.

---

## Common one-liners

```bash
# Single folder
cd $SUITE_ROOT && NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/<slug>

# Single file
cd $SUITE_ROOT && NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/<slug>/<slug>.spec.ts

# Single test by name
cd $SUITE_ROOT && NO_SETUP=true npx playwright test --project=e2e_tests -g "<test name>"

# Headed (watch the browser)
cd $SUITE_ROOT && npm run test:headed

# Open last report
cd $SUITE_ROOT && npm run test:report

# Tail WP debug log while a test runs
tail -f $SUITE_ROOT/wp-data/debug.log

# Type-check and lint a freshly-scaffolded folder
cd $SUITE_ROOT && npx tsc --noEmit && npx eslint tests/e2e/<slug>
```
