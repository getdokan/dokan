---
name: dokan-test-revamp
description: >-
  Revamp the Dokan Playwright suite for the new React UI only, risk-first.
  Use when the user asks to revamp, refactor, or rewrite new-UI specs, to find
  coverage gaps by risk, to update the risk register, or to convert form/settings
  specs to dataset-driven (object-based locator) style like
  tests/pw/tests/e2e/adminSettings/aiContentGeneration.spec.ts.
---

# Dokan Test Revamp (new React UI, risk-first)

The goal is a suite where every high-risk failure mode has an assertion that would catch it. Test count and pass percentage are not goals. Report coverage as "risks caught versus risks open".

## Scope

- **In scope:** React surfaces only, meaning specs tagged `@new-ui`, `new*.spec.ts`, `adminSettings/` and `vendorStoreSettings/`, plus their page objects.
- **Out of scope:** Legacy-UI specs and page objects. Don't refactor them, don't extend them, and don't delete them on this branch.
- The `oldDataset` halves of migration and sync specs stay. They check the old/new bridge, which is itself a risk.

Read `tests/pw/setup.md` and the `dokan-automation` skill's non-negotiables first: tags, folder layout, and locators discovered live through Playwright MCP. This skill adds the risk process on top of them.

## Phase 0: risk register (do this first)

```bash
cd tests/pw && node baseline/baseline.mjs [--days 180] [--pro ../dokan-pro]
```

- The script writes `tests/pw/baseline/RISK-REGISTER.md`.
- **Risk = impact × likelihood.**
  - **Impact** is business judgement, set in `SURFACES` inside the script: 5 for money, permissions or marketplace-wide effects; 4 for a vendor revenue flow; 3 for a feature breaking; 2 for informational surfaces.
  - **Likelihood** is ranked from git history: commits on the surface's source plus fix commits matched by keyword.
  - dokan-lite squashes history at each release, so keyword fixes carry the lite signal.
- **Tiers:** P0 is a risk of 16 or more, and P1 is 9 or more. Any surface with impact 5 is at least P1.
- When a new React surface ships, add it to `SURFACES`.
- When impact changes, edit the number and its `why`. Don't tune the formula to get a tier you want.

## Phase 0b: failure-mode map, per P0 surface first

For each surface, write a table in `tests/pw/baseline/failure-modes/<surface>.md`:

| Failure mode | Role | Layer to catch it (API / UI / both) | Existing assertion (file:line) or GAP |
|---|---|---|---|

Failure-mode prompts:
- **Wrong amount:** commission, earning, withdraw, refund, shipping, discount, tax.
- **Wrong permission:** vendor A sees or edits vendor B's data, staff exceeds its caps, a guest calls REST.
- **Lost or partial save:** a field drops on save or reload, or a save fails silently.
- **Broken old/new sync:** data written in one UI is wrong in the other.
- **Broken cross-role flow:** customer buys, vendor fulfils, admin pays out.
- **State gate ignored:** module off, subscription expired, vendor unverified or disabled.
- **Lite vs Pro:** a Pro field leaks into Lite, or a Lite-only path breaks when Pro is on.

An assertion counts only if it would fail when the failure mode happens. "Page renders" never catches a wrong amount.

## Depth by tier

| Tier | Required |
|---|---|
| P0 | Every failure mode has an API assertion (amounts, permissions, persistence), plus one UI happy path per role, plus the cross-role flow end to end. Negative and permission cases are mandatory. Runs on every PR. |
| P1 | API assertions for amounts and permissions, plus a UI happy path, plus key negatives. |
| P2 | One UI smoke per surface. Add more only when a real bug escapes. |

Every escaped bug gets a regression test at the cheapest layer that catches it, and its row in the register.

## Writing and refactoring tests

1. **Seed through the API, assert through the UI.** Use `ApiUtils` and `payloads` for setup. Don't click through setup.
2. **Use web-first assertions only:** `await expect(locator).toHaveText()`, `expect.poll`, and `toHaveCount`. Never use `expect(await x.isVisible())` or `waitForTimeout`. For DataViews lists, see memory `new-dashboard-dataviews-refetch-flake`.
3. **Locators:**
   - Prefer `data-testid`, then role plus accessible name.
   - Don't use XPath. Don't use `.first()` or `.nth()` unless you add a comment saying why the locator is ambiguous.
   - Verify every locator live through Playwright MCP.
   - If a React component has no stable hook, raise adding a `data-testid` in the source as a dev ask. Don't work around it with a brittle selector.
4. **Parallel-safety:**
   - Create unique data with a prefix plus `faker.string.nanoid`, and clean it up by that prefix.
   - Specs that mutate `dokan_*` options call `dbUtils.restoreDokanOptionsAfterAll(test)`.
   - `mode: 'serial'` needs a comment explaining why the state can't be isolated.
5. **Tags:** Each test gets one gate (`@lite`, `@liteOnly` or `@pro`), one role tag, `@new-ui`, and its risk tier (`@p0`, `@p1` or `@p2`).

### Dataset (object-based locator) style: forms and settings only

Use this style when a test only sets fields, saves, and asserts that they persisted. Round-trip and old/new sync tests are the best fit. Model it on `adminSettings/aiContentGeneration.spec.ts`:

```ts
const newDataset = {
    title: 'Admin Setting: AI Assist',
    url: 'wp-admin/admin.php?page=dokan-dashboard#/settings',
    selector: '[data-testid="settings-menu-ai_assist"] >> [data-testid="settings-menu-product_generation"]',
    fields: [
        { selector: '[data-testid="settings-field-text_openai_api_key"] input[type="password"]', type: 'text', value: 'your-openai-api-key' },
        { selector: '[data-testid="settings-field-ai_product_image_enhancement"] [role="switch"]', type: 'switch', value: true },
    ],
};
await adminSettingsPage.updateSettings(newDataset);
await adminSettingsPage.checkSettings(newDataset);
```

- Field types come from the switch in `pages/adminSettingsPageNew.ts` `setFieldValues` / `assertFieldValues`. Reuse an existing type before adding one. A new type needs both a setter and an asserter.
- Datasets live in the spec, next to the steps they drive, as in the reference spec.
- **Don't force this style** onto lists, DataViews, modals, multi-role flows, permission matrices, or anything that interleaves actions and assertions. Keep those procedural, with locators held in the page object.
- `AdminSettingsPageNew` is settings-specific: save button, settings REST matcher, legacy loader. If a non-settings form needs the same engine, extract a shared form engine first. Don't import the settings class into an unrelated spec.

## Refactor order

1. P0 gaps from Phase 0b: write the missing assertions.
2. Flaky or slow specs on P0 and P1 surfaces. Use CI `final-test-artifact`, `merged-summary.json` and `shard-durations.json` as a secondary signal only.
3. P1 gaps.
4. Style-only refactors, such as dataset conversion or moving locators into page objects, and only in files already being touched for 1–3.

## Done criteria (per surface)

- Every P0 or P1 failure mode in its map has an existing assertion, or a linked `test.skip` with an owner and a reason.
- The spec passes 3 times in a row locally with `--repeat-each=3`, and passes in a CI shard.
- The surface's row in `RISK-REGISTER.md` is updated.
