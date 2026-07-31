# Dokan Playwright Suite — Setup Reference

This file is the single source of truth the Claude skill consults when scaffolding new tests or running the suite. Keep it accurate — every change here should reflect a real change in the suite.

---

## 1. Where everything lives

```
wp-content/plugins/dokan-lite/tests/pw/
├── .env                          # local credentials (gitignored)
├── .env.example                  # canonical variable list
├── .wp-env.json                  # default wp-env config
├── .wp-env.override.json         # local override (mounts dokan-pro etc.)
├── .wp-env.ci.json               # CI override
├── api.config.ts                 # Playwright config for REST tests
├── playwright.config.ts          # Playwright config for E2E tests
├── global-setup.ts               # truncates wp-data/debug.log per run
├── package.json                  # all npm scripts (see §5)
├── setup.md                      # THIS FILE — skill reference
├── test-cases.md                 # QA-authored input the skill reads
├── feature-map/feature-map.yml   # feature → folder mapping
├── tests/
│   ├── e2e/<feature-slug>/       # one folder per feature (see §3)
│   └── api/<feature>.spec.ts     # one spec per REST resource
├── utils/                        # apiUtils, payloads, schemas, helpers
└── playwright/                   # auth state, artifacts, reports
```

Sibling plugin clones (required for `@pro` tests) live in:

```
wp-content/plugins/
├── dokan-lite/                   # this repo
├── dokan-pro/                    # required for @pro
├── woocommerce-bookings/
├── woocommerce-subscriptions/
├── woocommerce-product-addons/
└── woocommerce-simple-auctions/
```

---

## 2. The golden rule for new tests

**One feature = one folder under `tests/e2e/<slug>/`.** Folders never import from each other. A folder owns:

| File                       | Responsibility                                                |
|----------------------------|---------------------------------------------------------------|
| `<slug>.spec.ts`           | Test cases only — thin `test()` blocks calling page methods   |
| `<slug>Page.ts`            | Selectors, navigation, REST seeding, page actions             |
| `<slug>TestData.ts` (opt.) | Fixture generators / payloads if more than ~30 lines          |

A spec NEVER calls `page.locator(...)` directly. It always goes through the page object.

---

## 3. Spec template (folderized format)

```ts
// tests/e2e/<slug>/<slug>.spec.ts
import { test, Page } from '@playwright/test';
import { <Slug>Page, api, <slug>Data } from './<slug>Page';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('<feature> functionality', () => {
    let admin: <Slug>Page;
    let vendor: <Slug>Page;
    let aPage: Page, vPage: Page;

    test.beforeAll(async ({ browser }) => {
        await api.init();
        const adminContext  = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new <Slug>Page(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new <Slug>Page(vPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await api.dispose();
    });

    test('admin can <action>', { tag: ['@lite', '@admin'] }, async () => {
        await admin.<action>(<slug>Data.<fixture>);
    });

    test('vendor can <action>', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.<action>(<slug>Data.<fixture>);
    });
});
```

## 4. Page-object template

```ts
// tests/e2e/<slug>/<slug>Page.ts
import { Page, expect, request } from '@playwright/test';
import { faker } from '@faker-js/faker';

const { ADMIN, ADMIN_PASSWORD, VENDOR, USER_PASSWORD, BASE_URL } = process.env;

// SELECTORS — discover + verify live via the Playwright MCP plugin (SKILL "LOCATORS").
// Prefer role/name or data-test; no guessed CSS, no XPath.
export const <slug>Selectors = {
    addBtn: { role: 'button', name: /add/i } as const,
    listItem: '[data-test="<slug>-list"]',
};

// TEST DATA ------------------------------------------------------
export const <slug>Data = {
    sample: () => ({ name: faker.commerce.productName() }),
};

// API CLIENT (used by spec.beforeAll) ----------------------------
export const api = {
    ctx: null as any,
    async init() { this.ctx = await request.newContext(); },
    async dispose() { await this.ctx?.dispose(); },
    // helpers...
};

// PAGE OBJECT ----------------------------------------------------
export class <Slug>Page {
    constructor(private page: Page) {
        // auto-dismiss the Dokan Pro vendor announcement modal
        this.page.addLocatorHandler(
            this.page.getByRole('dialog'),
            async (modal) => modal.getByRole('button', { name: /close|dismiss/i }).click(),
        );
    }

    async goto() {
        await this.page.goto('/dashboard/<slug>');
    }

    async <action>(data: any) {
        await this.goto();
        await this.page.getByRole('button', { name: /add/i }).click();
        await expect(this.page.locator(<slug>Selectors.listItem)).toContainText(data.name);
    }
}
```

---

## 5. npm scripts (run from `tests/pw/`)

| Script                  | What it does                                                              |
|-------------------------|---------------------------------------------------------------------------|
| `npm install`           | Installs Node deps                                                        |
| `npm run install:chromium` | Downloads pinned Chromium build                                        |
| `npm run start:env`     | Boots wp-env Docker containers                                            |
| `npm run stop:env`      | Stops containers (keeps DB)                                               |
| `npm run reset:env`     | Destroys + recreates the wp-env stack (DB lost — re-seed required)        |
| `npm run create:admin`  | Applies `.env` ADMIN_* values to the WP admin user                        |
| `npm run docker:setup`  | Runs `_site.setup.ts` → `_auth.setup.ts` → `_env.setup.ts`                |
| `npm run docker:full`   | `start:env` + `create:admin` + `docker:setup` (use this on first boot)    |
| `npm run test`          | Full Playwright run (E2E + setup projects)                                |
| `npm run test:e2e`      | E2E only, `NO_SETUP=true`                                                 |
| `npm run test:api`      | API tests via `api.config.ts`                                             |
| `npm run test:headed`   | E2E with a visible browser                                                |
| `npm run test:ui`       | Playwright UI mode                                                        |
| `npm run test:debug`    | Inspector / step-through                                                  |
| `npm run test:report`   | Opens last HTML report                                                    |
| `npm run check:plugins` | Lists active plugins                                                      |
| `npm run check:users`   | Lists test users                                                          |
| `npm run check:modules` | Counts active Dokan modules                                               |
| `npm run lint` / `lint:fix` | ESLint                                                                |
| `npm run format` / `format:fix` | Prettier                                                          |
| `npm run type:check`    | `tsc --noEmit`                                                            |

---

## 6. `.env` reference (mirrors `.env.example`)

| Group           | Variables                                                                   | Notes                                                |
|-----------------|-----------------------------------------------------------------------------|------------------------------------------------------|
| Admin / users   | `ADMIN`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `VENDOR`, `VENDOR2`, `CUSTOMER`, `CUSTOMER2`, `USER_PASSWORD` | wp-env defaults: `admin / password / wordpress@example.com` |
| Dokan           | `DOKAN_PRO`, `LICENSE_KEY`, `GMAP`                                          | `LICENSE_KEY` required for Pro license activation; `GMAP` optional |
| Playwright      | `BASE_URL`, `HEADLESS`, `CI`, `NO_SETUP`                                    | `NO_SETUP=true` after first `docker:full` succeeds   |
| Database        | `DB_HOST_NAME`, `DB_USER_NAME`, `DB_USER_PASSWORD`, `DATABASE`, `DB_PORT`, `DB_PREFIX` | wp-env defaults — do not change                  |
| REST            | `SERVER_URL=http://localhost:9999/?rest_route=`                             | Query-string form is required for Docker             |
| Auto-populated  | `CUSTOMER_ID`, `VENDOR_ID`, `CUSTOMER2_ID`, `VENDOR2_ID`, `PRODUCT_EDIT_NONCE`, `CATEGORY_ID` | Filled in by `_env.setup.ts` — leave blank initially |

---

## 7. Tag system (drives Lite/Pro filtering)

| Tag             | Meaning                                               |
|-----------------|-------------------------------------------------------|
| `@lite`         | Runs in Lite-only **and** Lite + Pro environments     |
| `@liteOnly`     | Runs ONLY when Pro is absent (`DOKAN_PRO=false`)      |
| `@pro`          | Requires Dokan Pro                                    |
| `@admin`        | Drives the WordPress administrator                    |
| `@vendor`       | `seller` role (vendor dashboard)                      |
| `@customer`     | Logged-in customer                                    |
| `@guest`        | Unauthenticated                                       |
| `@exploratory`  | Smoke-level coverage                                  |
| `@serial`       | Excluded by default — must be run in isolation        |

`playwright.config.ts` enforces:
- `grep:       [/@lite/, /@liteOnly/, /@pro/]`
- `grepInvert: DOKAN_PRO ? [/@liteOnly/, /@serial/] : [/@pro/, /@serial/]`

Every new test MUST carry one Lite/Pro gate (`@lite`, `@liteOnly`, or `@pro`) and one role tag.

---

## 8. Run modes the skill recognises

| Mode          | Definition                                                                                         |
|---------------|----------------------------------------------------------------------------------------------------|
| **Lite Only** | `DOKAN_PRO=false`, `LICENSE_KEY` not required. Runs `@lite + @liteOnly`. Command: `npm run test:e2e` |
| **PR**        | `DOKAN_PRO=true`, fast PR-gate run — `e2e_tests` only, skips `@serial`/`@exploratory`. Command: `NO_SETUP=true npx playwright test --project=e2e_tests --grep-invert "@exploratory\|@serial"` |
| **Full Suite**| `DOKAN_PRO=true`, full bootstrap if needed. E2E + API. Commands: `npm run docker:full && npm run test:e2e && npm run test:api` |

---

## 9. Hard preconditions (skill checks these before running)

1. **Docker Desktop running** — `docker info` must succeed.
2. **`.env` present at `tests/pw/.env`** — copy from `.env.example` if missing.
3. **`USER_PASSWORD` set** — required for seeded vendor/customer login.
4. **Pro modes only:** `LICENSE_KEY` non-empty AND `dokan-pro` cloned as a sibling under `wp-content/plugins/`.
5. **Modules + appearance flags applied** — handled by `docker:setup`. If running with `NO_SETUP=true` against a fresh DB, the skill MUST run `docker:setup` first.

---

## 10. Known sharp edges

- **Vendor announcement modal (Dokan Pro 5.0.0+).** Every vendor-facing page object MUST register an auto-dismiss handler in its constructor via `page.addLocatorHandler`. Tests that bypass the page object will time out on the modal.
- **My-Account role input (Dokan Lite 5.0.0+).** The customer/vendor radios were converted to a hidden input — selectors must guard with `isVisible()`.
- **`v1/products` requires `categories[]`.** `POST /dokan/v1/products` returns 404 "Category must be required" without it. REST seeders must include a category.
- **`SERVER_URL` must use the `?rest_route=` form for Docker.** Pretty permalinks aren't active until `_site.setup.ts` runs.
- **`reset:env` deletes the database.** `docker:setup` must follow it before any test will pass.
