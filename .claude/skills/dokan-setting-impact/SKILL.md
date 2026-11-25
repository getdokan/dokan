---
name: dokan-setting-impact
description: Trace a setting's ripple through the Store Admin, Vendor, and Customer tiers, from plan to test. Use when planning, building, reviewing, or testing a change that adds, changes, removes, or reads configuration a Store Admin sets — admin settings, Menu Manager toggles, module/plan gates, capabilities, Operating Terms.
---

# Dokan Setting Impact

A setting is configuration a Store Admin sets that changes what other actors experience: Canonical settings, Menu Manager toggles, module and plan gates, capabilities, and per-Vendor Operating Terms. It is a contract across three **tiers**, named by actor (terms per `CONTEXT.md`):

- **Store Admin** — the admin settings screens where it is set.
- **Vendor** — the Vendor Dashboard it shapes, for Vendors and Vendor Staff.
- **Customer** — the Store and everything else a Customer or Guest sees.

Each tier has several **surfaces** (renderers, routes, endpoints), and a setting holds only when every surface in every tier honours it — or the exception is a recorded decision.

The **impact map** carries this through the lifecycle. It is written at Plan, kept true at Build, verified at Review, and executed at Test. It lives in the PR description under a `### Setting impact` heading; a tier that deliberately ignores the setting also gets an ADR line (`docs/adr/` in Lite for cross-cutting decisions, in Pro for Pro-only ones).

The map is required when a reader or writer changes behaviour: a default, a value, the stored shape, an enforcement point, or a surface. A label- or help-text-only change is exempt; the reviewer states the exemption in the review.

Covers Lite and Pro: a setting stored in one plugin is often read in the other, so search both. For *how* to add or render a settings field, see `dokan-settings`; this skill covers what the setting must do once it exists.

## Stage gates

Run the gate for the stage you are in. Each ends on its completion criterion.

1. **Plan** — Build the impact map (template below). Grep Lite and Pro for the option key and its helper to find every writer and reader. Walk the rule tables and give every surface a row, or `n/a — <reason>`. Decide the upgrade impact (A4) and data saved before a switch-off (S2).
   *Done when:* every writer and reader found by grep is on the map, every surface row is filled or justified, and each deliberate exception is named for the ADR.
2. **Build** — Route every reader through the one shared helper (X1). Implement each row. Write tests for every state column of the map and for the save round-trip (V4). Update the map when the code reveals a surface the plan missed.
   *Done when:* every row is implemented or recorded as an exception, the tests above are green, and the map in the PR matches the code.
3. **Review** — Apply every rule below to the diff. Re-grep the readers and writers yourself: one missing from the map is a finding, and so is a map row the code does not honour.
   *Done when:* every rule is applied, and each finding names its rule ID (e.g. `V2`).
4. **Test** — Turn the map into the matrix: state column × surface × role (Store Admin, Vendor, Vendor Staff, Customer, Guest). Run the toggle round-trip: off → save vendor settings → on → save → off.
   *Done when:* every matrix cell has evidence (X4).

## Impact map template

```markdown
### Setting impact
- **Setting:** <label> — `<option key>` → `<path inside the stored array>`
- **Stored shape:** <keys and types; how rows are keyed>
- **Writers:** <React admin / legacy admin UI / REST / migration — file:line each>
- **Readers / helper:** <the one helper, then every caller — file:line each>
- **Gates:** <module, plan, capability>
- **Caches:** <static memo, transient, Dokan Cache, page cache>
- **Upgrade impact:** <what changes for sites with the value already saved>

| Tier | Surface | Never saved | Each value class | Legacy writer only | Gate off | Evidence |
|---|---|---|---|---|---|---|
| Store Admin | … | | | | | |
| Vendor | … | | | | | |
| Customer | … | | | | | |
```

State columns:
- **Never saved** — the default path.
- **Each value class** — on/off for a toggle; each choice for an enum; min, max, and empty for a number.
- **Legacy writer only** — the value exists only under its Legacy key, or was saved by the older admin UI (also covers a plugin downgrade).
- **Gate off** — the module or plan is inactive (A5).

## Rules

### Map (before any tier)
- **M1 Stored shape.** Record the exact shape, including how rows are keyed. *(E.g. a new admin UI keyed rows by slug while a reader still looked up a field only the old UI wrote, so the restriction matched nothing.)*
- **M2 Every writer and reader.** Found by grep across Lite and Pro, not from memory.
- **M3 Gates and caches.** Name each, and state how a stale value is cleared.

### Tier 1 — Store Admin
- **A1** Every writer persists the same shape.
- **A2** A never-saved setting behaves exactly as before the change.
- **A3** Saving one tab or section keeps the others' stored values.
- **A4 Upgrade impact.** When values saved earlier start (or stop) being enforced, the changelog says so.
- **A5** With the module or plan off, every tier ignores the setting consistently.

### Tier 2 — Vendor (Vendor Dashboard)
- **V1 Surfaces.** Legacy PHP pages, new React routes, sidebar and collapsed flyout, dashboard cards and widgets, REST and AJAX endpoints, emails.
- **V2 Hidden is not blocked.** The nav item, the direct URL, and the REST/AJAX write each enforce the setting. *(E.g. the legacy PHP URL was blocked while the React route for the same page stayed open.)*
- **V3 Derived values** (progress, counts, completeness) are computed from what is switched on; state whether at read time or save time.
- **V4 Rebuilders keep foreign keys.** Code that rebuilds stored data — configuration or Vendor-owned — carries over every key it does not own. *(E.g. a recalculation on every settings save rebuilt the array and dropped a flag another feature had stored in it.)*
- **V5 Round-trip.** Off → on → off with vendor saves in between leaves the Vendor's own state intact.
- **V6** Capabilities and the setting agree, for Vendors and Vendor Staff.
- **V7 Vendor Scope.** A per-Vendor setting resolves from the acting Vendor; Vendor Staff get their Vendor's value, narrowed by their own permissions; a caller-supplied ID never widens it.

### Tier 3 — Customer (Store)
- **S1 Renderers.** Classic template (and theme overrides of it), block theme, Elementor widgets and dynamic tags, shortcodes and widgets, the store REST API (`dokan/v1/stores`), SEO meta and schema.
- **S2 Data saved before a switch-off.** Decide shown or hidden, and keep whatever stays public manageable by the Vendor. *(E.g. a settings page was switched off, but links saved through it stayed public with nowhere left to edit them.)*
- **S3** Verify with page cache, Dokan Cache, and transients both cold and warm.
- **S4** Follow the ripple into store listing, search, emails, and order pages.

### Cross-tier
- **X1 One source of truth.** Every tier reads through the same helper.
- **X2 Recorded exceptions.** A tier that deliberately ignores the setting has an ADR line.
- **X3 Matrix.** State column × surface × role, as in the Test gate.
- **X4 Evidence per cell.** Screenshot, REST response, or `wp option get` / `wp user meta get` output.
