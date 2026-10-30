# Dokan Lite architecture documentation

This directory is the architecture reference for Dokan Lite. Each document describes one subsystem as it exists in the source code at a pinned revision, and every factual statement in it is backed by a citation to the code that implements it. Start with [overview.md](./overview.md) for the one-page picture of the system and the end-to-end workflow. Then open the subsystem document you need.

The documents describe how the code works. They do not propose changes. Where a behavior looks surprising, the documents link the Architecture Decision Record (ADR) that explains it, instead of calling it a defect.

---

## Audience

The documents serve two kinds of reader.

| Reader | What they need | Where to start |
|---|---|---|
| **Engineers onboarding** to Dokan Lite | A mental model of the bootstrap, the domain objects (Vendor, Store, Suborder, Commission, Balance, Withdraw) and where each one lives in code and in the database | [overview.md](./overview.md), then [bootstrap-and-container.md](./bootstrap-and-container.md), then the domain documents in the order of the end-to-end workflow |
| **Engineers doing change-impact analysis** before a code change | The exact hooks a subsystem fires and consumes, the tables and meta keys it writes, its permission checks, and the seams that other plugins (including Dokan Pro) rely on | The subsystem document's Hooks, Data storage, Permissions & capabilities and Extension points sections (numbered 5, 6, 8 and 11 in most documents; see [Document structure](#document-structure) for exceptions), plus [extension-seams.md](./extension-seams.md) and [decisions-index.md](../decisions-index.md) |

---

## Pinned revisions

Every document was verified against the following source revisions. A statement may be out of date for any later revision.

| Codebase | Revision | Prefix used in citations |
|---|---|---|
| Dokan Lite (this repository) | `e1ce7fc81` | `lite:` |
| Dokan Pro | `65975a952` | `pro:` (not used in this public repository; see below) |
| WooCommerce | `11.2.1` | `wc:` |

Other third-party plugins are named in ownership labels, for example **[Third-party: User Switching]**, and are cited by plugin name.

**Dokan Pro.** Dokan Lite and Dokan Pro form one bounded context, and Pro depends on Lite, never the reverse ([ADR-0001](../0001-single-bounded-context-across-lite-and-pro.md)). These public documents describe only the Lite side. Where Dokan Pro uses a Lite hook, filter or class map, the documents say that the seam is "consumed by Dokan Pro" and give no further detail. Dokan Pro has its own architecture documentation in its private repository.

---

## How to read citations

### File and line citations

Entry points, key classes and key methods are cited as `prefix:path/relative/to/repo/File.php:LINE`. The path is relative to the root of the repository the prefix names.

| Example | Meaning |
|---|---|
| `lite:includes/Order/Manager.php:896` | Line 896 of `includes/Order/Manager.php` in the Dokan Lite repository |
| `lite:dokan-class.php:276-279` | Lines 276 to 279 of `dokan-class.php` in Dokan Lite |
| `wc:includes/class-wc-checkout.php:514` | Line 514 of `includes/class-wc-checkout.php` in the WooCommerce plugin (11.2.1); used to show where WooCommerce fires a hook Dokan consumes |

### Symbol citations

Everything else is cited by symbol: `Class::method` (for example `Order\Manager::maybe_split_orders`), a procedural function name (for example `dokan_sync_insert_order()`), or an exact hook string (for example `woocommerce_order_status_changed`). Class names are given relative to the `WeDevs\Dokan` namespace unless a full name is needed. Use your editor's symbol search to locate them; line numbers are given only where the precise location matters.

### Hooks: fired versus consumed

Each document separates the hooks Dokan **fires** (it calls `do_action()` or `apply_filters()`) from the hooks it **consumes** (it calls `add_action()` or `add_filter()`). For a WooCommerce hook that Dokan consumes, the document cites the `wc:` location where WooCommerce fires it.

### Ownership labels

| Label | Meaning |
|---|---|
| **[Lite]** | Implemented in this repository |
| **[WooCommerce]** | Implemented by WooCommerce; Dokan reacts to it or calls it |
| **[Third-party: name]** | Implemented by another plugin or a bundled library, for example **[Third-party: League Container]** |
| "consumed by Dokan Pro" | A Lite seam that Dokan Pro attaches to; Pro's behavior is out of scope here |

### Terminology

All documents use the canonical terms from [`CONTEXT.md`](../../../CONTEXT.md): **Vendor** (not "seller"), **Store**, **Order**, **Suborder**, **Vendor order**, **Commission** (always the admin's share), **Earning** (the Vendor's share), **Balance**, **Withdraw** and **Reverse withdrawal**. The legacy word "seller" appears only when quoting code identifiers such as `seller_id` or `dokan_get_seller_id_by_order()`.

---

## Document structure

Most subsystem documents follow the same eleven numbered sections, so the same question has the same answer location in every file:

1. Purpose & ownership
2. Entry points & bootstrap
3. Key classes
4. Execution flow (with Mermaid diagrams)
5. Hooks (fired and consumed)
6. Data storage
7. REST / AJAX endpoints
8. Permissions & capabilities
9. WooCommerce touchpoints
10. Dependencies
11. Extension points

Every document ends with a **Known gaps** section that lists what could not be determined from source, followed by a verification footer naming the revisions above. Some documents vary the layout:

- [admin-dashboard-and-settings.md](./admin-dashboard-and-settings.md) repeats the eleven sections once per subsystem it covers.
- [withdraw-and-reverse-withdrawal.md](./withdraw-and-reverse-withdrawal.md) has a Part A (Withdraw) and a Part B (Reverse withdrawal), each with its own numbered sections.
- [database.md](./database.md) has twelve sections: 4 Custom tables, 5 Execution flow, 6 Data storage (non-table), 7 Hooks, 8 REST/AJAX endpoints, 9 Permissions & capabilities, 10 WooCommerce touchpoints, 11 Dependencies and 12 Extension points.
- [security-model-and-testing.md](./security-model-and-testing.md) appends unnumbered "Testing inventory" and "Compatibility" sections after section 11.

---

## Table of contents

### Entry and cross-cutting

| Document | What it covers |
|---|---|
| [README.md](./README.md) | This page: purpose, audience, revisions, citation conventions and the table of contents |
| [overview.md](./overview.md) | Component diagram, one-page system narrative, and the end-to-end workflow from product creation to Withdraw |
| [decisions-index.md](../decisions-index.md) | Index of every ADR in [`../adr/`](../), with the trade-off and the risk of ignoring each one, a [Business rules by domain](../decisions-index.md#business-rules-by-domain) section that answers "how does X work?" for commission, fees, order status, refunds, withdraws, Vendors, products, coupons, shipping and reports, and a diagram of how the decisions relate |

### Subsystem documents

| Document | What it covers |
|---|---|
| [bootstrap-and-container.md](./bootstrap-and-container.md) | Plugin entry file, the `WeDevs_Dokan` singleton, the League dependency-injection container and its service providers, installation, database upgrades, rewrites, the assets pipeline, background processes, cache, the `wp dokan` CLI registry and the tracker |
| [vendor-and-store.md](./vendor-and-store.md) | The Vendor object and Store profile, the four paths to becoming a Vendor, Selling Activation, store URLs and store page rendering, store listing, setup wizard, shortcodes, widgets and privacy |
| [products.md](./products.md) | Product Ownership through `post_author`, the legacy and React product editors, status and Direct Publishing rules, chosen categories, store product sections and catalog mode |
| [woocommerce-integration-orders.md](./woocommerce-integration-orders.md) | Cart rules, classic and Block (Store API) checkout, Suborder creation, parent and Suborder status sync, HPOS compatibility, order emails and My Account |
| [orders-commission-fees.md](./orders-commission-fees.md) | Checkout to Suborders to Commission to Balance, the Commission strategy chain and calculator, Fee recipients and gateway fees, Lite refunds, order edits and cleanup, the `dokan_orders` and `dokan_vendor_balance` tables |
| [woocommerce-integration-catalog-refund-shipping.md](./woocommerce-integration-catalog-refund-shipping.md) | WooCommerce touchpoints for products, refunds, shipping, coupons, taxes, payments, stock and the Withdraw ledger |
| [withdraw-and-reverse-withdrawal.md](./withdraw-and-reverse-withdrawal.md) | Part A: Withdraw requests, validation, approval and Balance calculation. Part B: the Reverse withdrawal receivable ledger, payment through a hidden product, and failed actions |
| [database.md](./database.md) | The seven custom tables, an entity-relationship diagram, how a Vendor order populates the tables, options, transients and meta keys, and the version-named schema upgraders |
| [rest-api-and-permissions.md](./rest-api-and-permissions.md) | The `dokan/v1`, `dokan/v2`, `dokan/v3` and `dokan/v1/admin` REST namespaces, AJAX actions, the Abilities layer (Ability Context and the Ownership gate), roles and capabilities |
| [security-model-and-testing.md](./security-model-and-testing.md) | The security model (actor resolution, nonces, REST and AJAX patterns, Vendor data isolation, sanitization conventions), the PHPUnit and Playwright suites, CI workflows and compatibility requirements |
| [admin-dashboard-and-settings.md](./admin-dashboard-and-settings.md) | WP-admin area, the flat admin settings store and its legacy bridge and mirror, setup wizard and onboarding, the vendor dashboard, vendor analytics, Dokan Intelligence, emails, captcha, the dummy-data importer and the Models layer |
| [frontend-architecture.md](./frontend-architecture.md) | The `src/` tree (React, Vue 2 and jQuery generations), webpack entry points, script registration and localization, the `window.dokan` globals, `@wordpress/data` stores and JavaScript hooks |
| [extension-seams.md](./extension-seams.md) | Every Lite-owned contract for add-ons: load ordering, Pro detection, container seams, class-map filters, template overrides, settings and navigation filters, REST and admin page registration, and JavaScript seams |

### Decisions

- [decisions-index.md](../decisions-index.md) summarizes every ADR in one table.
- [`../adr/`](../) holds the ADRs themselves; each ADR is the authority for its decision and cites the code it describes.

---

## Suggested reading paths

| Task | Read, in this order |
|---|---|
| First week on the codebase | [overview.md](./overview.md) → [bootstrap-and-container.md](./bootstrap-and-container.md) → [vendor-and-store.md](./vendor-and-store.md) → [products.md](./products.md) → [woocommerce-integration-orders.md](./woocommerce-integration-orders.md) → [orders-commission-fees.md](./orders-commission-fees.md) → [withdraw-and-reverse-withdrawal.md](./withdraw-and-reverse-withdrawal.md) |
| Changing checkout, Suborders, Commission or refunds | [ADR-0004](../0004-vendor-order-is-authoritative-parent-is-mirror.md), [ADR-0011](../0011-suborders-are-created-synchronously-at-checkout.md), [ADR-0012](../0012-commission-terms-are-frozen-onto-the-order-at-first-calculation.md) → [orders-commission-fees.md](./orders-commission-fees.md) → [woocommerce-integration-catalog-refund-shipping.md](./woocommerce-integration-catalog-refund-shipping.md) → [database.md](./database.md) |
| Adding or changing a REST route, AJAX action or ability | [rest-api-and-permissions.md](./rest-api-and-permissions.md) → [security-model-and-testing.md](./security-model-and-testing.md) → [ADR-0005](../0005-canonical-admin-capability.md), [ADR-0006](../0006-ownership-enforced-in-abilities-layer.md), [ADR-0016](../0016-rest-versions-are-additive-controller-subclasses.md) |
| Renaming or removing any hook, filter, template or JS global | [extension-seams.md](./extension-seams.md) first: the seam may be consumed by Dokan Pro or third-party plugins |
| Adding a table column or migrating data | [database.md](./database.md) → [ADR-0013](../0013-marketplace-money-lives-in-custom-tables-not-post-types.md), [ADR-0018](../0018-schema-migrations-are-version-named-upgrader-classes.md) |
| Adding an admin setting | [admin-dashboard-and-settings.md](./admin-dashboard-and-settings.md) section 3 → [ADR-0002](../0002-flat-dokan-admin-settings-as-canonical-store.md), [ADR-0003](../0003-settings-legacy-mirror-mode.md) |

---

## Known gaps

- This README is a navigation page. It makes no claims about runtime behavior of its own; each behavioral statement lives, with its citation, in the linked subsystem document.
- Line numbers are accurate only at the pinned revisions. The documents are not regenerated automatically, so a citation can drift after later commits. Symbol citations (`Class::method`, hook names) are more durable than line numbers.
- The `pro:` prefix is part of the shared citation convention, but this public repository deliberately contains no Dokan Pro paths. How Dokan Pro uses the seams named here is documented only in Dokan Pro's private repository.
- Release tooling (translation `.pot` generation, release packaging, `.distignore`) is not covered by any document in this directory. Its absence here does not mean the tooling is unimportant.
- Each subsystem document keeps its own Known gaps list. Those lists are not aggregated here, so check the relevant document before relying on a behavior it marks as unconfirmed.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
