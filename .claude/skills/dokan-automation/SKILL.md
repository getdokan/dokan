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

## Non-negotiables (apply to every flow)

These four rules override convenience. A scaffold that breaks any of them is wrong, not "good enough."

1. **Folderized structure, exactly.** One feature = one folder under `tests/e2e/<slug>/` holding `<slug>.spec.ts` + `<slug>Page.ts` (+ optional `<slug>TestData.ts`). Folders never import from each other. Specs never touch `page.locator(...)` — every selector lives in the page object. No new top-level layout, no shared "helpers" folder inside `e2e/`. Match `setup.md` §2/§3 to the character.
2. **Locators come from the Playwright MCP plugin — mandatory and verified.** Never hand-write or guess a selector. Discover it live via `mcp__plugin_playwright_playwright__*` against a running site, then keep the exact locator the snapshot proves resolves to one element. See "LOCATORS" below.
3. **Minimal comments.** Code reads itself. A comment earns its place only when it explains *why* (a non-obvious workaround, a Dokan sharp edge from `setup.md` §10). No banner comments, no restating what the line does, no `// click button`. Delete the template's teaching comments when you scaffold real specs.
4. **CI/CD-oriented, deterministic.** Web-first assertions only, zero fixed waits, parallel-safe, tagged. See "CI/CD best practices" below.
5. **Maximum coverage.** Every scaffold exhausts the feature — all happy paths, plus every edge and negative case the surface allows: each role that can act, each field's validation, empty/boundary/permission-denied states, and every REST route the flow hits (`//COVERAGE_TAG`). Partial coverage is a gap, not a smaller task. See "COVERAGE" below.

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
- **Source every selector via the Playwright MCP plugin before writing the page object** (see "LOCATORS"). Do not scaffold `<slug>Page.ts` with placeholder/guessed selectors and fix them later — capture real, verified locators first.
- Create `$SUITE_ROOT/tests/e2e/<slug>/<slug>Page.ts` from setup.md §4, using the verified locators.
- If `REST seed: yes`, include the `api` object (init/dispose) in the page file.
- If the role list includes `vendor` or `vendor2`, register the announcement-modal handler in the page-object constructor (setup.md §10).
- Strip the template's teaching comments — keep only *why* comments (Non-negotiable #3).

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

## COVERAGE — exhaust the feature

Goal: a passing folder means the feature is proven, not sampled. Author and scaffold for the widest coverage the surface supports.

### What "maximum" means

- **Every role that can act** gets its own test — admin, vendor, vendor2, customer, guest. If a role is blocked from an action, that block is itself a negative test (permission denied / redirect / 4xx).
- **Every happy path** in the feature, not just the primary one — create, read, edit, delete, bulk, filter, search, pagination, empty-state.
- **Edge cases**: boundary values (min/max length, 0, negative, huge), empty/whitespace, duplicate, special chars/emoji/RTL, slow network, concurrent edit, re-submit.
- **Negative cases**: each required field missing, each validation rule, unauthorized access, invalid IDs, expired nonce, 4xx/5xx handling.
- **Every REST route the flow touches** is asserted — lead API specs and REST-seeding page objects with `//COVERAGE_TAG: <METHOD> <route>` for each, so the coverage crawler counts it.
- **Both gates where relevant**: if a feature exists in Lite and behaves differently under Pro, cover both (`@lite` path + `@pro` path), don't assume one implies the other.

### How to hit it

- **Author flow:** after the user's cases, probe for the gaps above one round — "roles X and Y can also do this — cover them? Any validation on field Z?" Fill obvious holes; don't invent scenarios the feature can't reach.
- **Build flow:** derive one `test()` per distinct (role × path × outcome). Group by section (`happy paths` / `edge cases` / `negative cases`) so the report shows the shape. Parametrize repetitive validation with a data-driven loop rather than copy-paste.
- **Live discovery:** while capturing locators via MCP (below), note every interactive control the snapshot exposes — each is a candidate path. A control with no test is a coverage gap to flag.
- **Report the gaps.** If a case is known but not covered (env can't reach it, out of scope), list it explicitly: `Uncovered: <case> — <reason>`. Silent omission reads as "covered."

Balance against determinism — a flaky "extra" test is negative coverage. Every added case still obeys Non-negotiables #2–#4.

---

## LOCATORS — Playwright MCP plugin (mandatory, verified)

Every selector that lands in a `<slug>Page.ts` MUST be discovered and proven live through the `mcp__plugin_playwright_playwright__*` tools. Guessing a selector from memory or by reading JSX is not allowed — Dokan's markup drifts across Lite/Pro and versions, and a guessed CSS/XPath is the #1 source of flake.

### The loop

1. **Load MCP tools once.** One `ToolSearch` call:
   `select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_find,mcp__plugin_playwright_playwright__browser_click,mcp__plugin_playwright_playwright__browser_type,mcp__plugin_playwright_playwright__browser_wait_for`
2. **Navigate** to the page under test (`browser_navigate` to `BASE_URL` + the vendor/admin route). The env must be up (Docker + `docker:full`); if it isn't, run the Run-flow preconditions first or ask the user to boot it.
3. **Snapshot** the page (`browser_snapshot`) to read the accessibility tree — roles, names, labels. Use `browser_find` to resolve a specific element.
4. **Pick the most robust locator** in this priority order (Playwright's own guidance):
   1. `getByRole(role, { name })` — accessible, survives restyles
   2. `getByLabel` / `getByPlaceholder` — form fields
   3. `getByText` — non-interactive copy
   4. `getByTestId('[data-test=…]')` — when Dokan ships a stable hook
   5. CSS **only** as a last resort, and only for a structural container with no accessible handle. Never XPath. Never nth-index chains. Never text that is a translatable string unless the test is locale-pinned.
5. **Verify uniqueness live.** The chosen locator must resolve to exactly one element on the real page (`browser_find` / a `browser_click` that succeeds without a strict-mode violation). If it matches zero or many, refine and re-snapshot — do not ship it.
6. **Record it in the page object**, grouped in the `<slug>Selectors` map (or inline `getByRole` calls). Keep the exact form you verified.

### Rules

- No selector enters a page object without step 5 passing against a running site.
- Prefer Playwright's `getBy*` engine over raw `page.locator('css')`. `<slug>Selectors` may hold role/name pairs or `data-test` strings; the page object turns them into `getByRole`/`getByTestId`.
- If the live env is genuinely unavailable and the user waives verification, say so explicitly in the report (`Locators UNVERIFIED — env down`) so the gap is visible. Default is: don't scaffold selectors you couldn't verify.
- Re-verify when a spec starts failing on locators — markup drift, not test logic, is usually the cause.

---

## CI/CD best practices (every scaffolded test)

Tests run headless, sharded, and in parallel on CI. Author them so a green run means the feature works and a red run means the feature broke — nothing else.

- **Web-first assertions only.** `await expect(locator).toBeVisible()` / `toContainText()` / `toHaveCount()`. These auto-retry. Never assert on a value you read once.
- **Zero fixed waits.** No `waitForTimeout`, no `sleep`, no arbitrary `setTimeout`. Wait on state: `browser_wait_for` while authoring, `expect(...).toBeVisible()` / `waitForResponse` in the spec.
- **Deterministic data.** Generate unique fixtures with `faker` per run so parallel workers never collide on names/slugs. Never depend on data a previous test left behind.
- **Parallel- and shard-safe.** No test depends on another's side effects or execution order. Cross-cutting stateful flows get `@serial` and are excluded from the default run (setup.md §7).
- **Isolated auth.** Use the right `storageState` per role; don't log in through the UI inside a test when a stored state exists.
- **Tagged for filtering.** Exactly one Lite/Pro gate (`@lite`/`@liteOnly`/`@pro`) + one role tag per test. This is what makes Lite-Only vs PR vs Full selection work in CI.
- **Fast negative paths.** For `@negative` cases prefer asserting the guard (validation message / 4xx) over driving a long UI flow.
- **Clean teardown.** Close contexts/pages in `afterAll`; dispose the `api` client. Leaked contexts slow the shard and mask leaks.
- **Green on `type:check` + `lint` before it's done** (Build Step 5). CI runs both as gates.

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
6. **Never hand-write or guess a selector.** Every locator is discovered and verified live via the Playwright MCP plugin (see "LOCATORS"). Prefer `getByRole`/`getByLabel`/`getByTestId`; XPath and nth-index chains are banned.
7. **Minimal comments.** Only *why* comments survive. Strip the templates' teaching comments from real scaffolds.
8. **Every new test gets one Lite/Pro gate tag and at least one role tag.** No exceptions.
9. **Every vendor-facing page object registers the announcement-modal handler** in its constructor (setup.md §10). Forgetting this is the #1 cause of flake.
10. **For Pro-only features, verify `dokan-pro/` is cloned as a sibling under `wp-content/plugins/`** before running `@pro` tests.
11. **No fixed waits.** `waitForTimeout`/`sleep` in a spec is a bug — wait on state with web-first assertions.
12. **Maximum coverage or a stated gap.** Exhaust roles × paths × outcomes and every REST route (see "COVERAGE"). Anything left uncovered is reported as `Uncovered: <case> — <reason>`, never dropped silently.

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
