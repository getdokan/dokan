import type { Browser, BrowserContext, Page } from '@playwright/test';
import { data } from '@utils/testData';

// Selector matching the WordPress theme 404 DOM:
//   <header class="page-header">
//       <h1 class="page-title">Oops! That page can't be found.</h1>
//   </header>
// The curly apostrophe (’) in the live markup means a plain "can't" substring
// match won't hit; we anchor on the unambiguous prefix instead.
const FOUR_OH_FOUR_SELECTOR =
    'header.page-header h1.page-title:has-text("Oops! That page can")';

const INSTALLED_FLAG = Symbol.for('dokan.permalink404Recovery.installed');
const BROWSER_PATCHED_FLAG = Symbol.for('dokan.permalink404Recovery.browserPatched');

type FlaggedPage = Page & { [INSTALLED_FLAG]?: boolean };
type FlaggedBrowser = Browser & { [BROWSER_PATCHED_FLAG]?: boolean };

// Worker-scoped singleton: if multiple pages observe the 404 simultaneously,
// only one re-save runs. Cleared after the in-flight save resolves so a later
// recurrence can trigger a new save.
let inFlightResave: Promise<void> | null = null;

function baseURL(): string {
    return process.env.BASE_URL || 'http://localhost:9999';
}

async function performPermalinkResave(browser: Browser): Promise<void> {
    const ctx: BrowserContext = await browser.newContext({
        storageState: data.auth.adminAuthFile,
        ignoreHTTPSErrors: true,
    });
    try {
        const adminPage = await ctx.newPage();
        await adminPage.goto(`${baseURL()}/${data.subUrls.backend.permalinks}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30_000,
        });
        // The Settings → Permalinks page submit button is id="submit".
        // Clicking it without changing the structure value re-flushes
        // rewrite rules, which is what fixes the intermittent 404.
        await adminPage.locator('#submit').click({ timeout: 15_000 });
        await adminPage
            .locator('#setting-error-settings_updated, .notice-success')
            .first()
            .waitFor({ state: 'visible', timeout: 15_000 })
            .catch(() => undefined);
    } finally {
        await ctx.close().catch(() => undefined);
    }
}

export function resavePermalinks(browser: Browser): Promise<void> {
    if (inFlightResave) return inFlightResave;
    inFlightResave = performPermalinkResave(browser).finally(() => {
        inFlightResave = null;
    });
    return inFlightResave;
}

/**
 * Registers a Playwright locator handler that watches every action on `page`
 * for the WordPress 404 DOM. When seen, it triggers a permalink re-save in
 * the background and reloads the page so the failing action retries against
 * working rewrite rules.
 *
 * Idempotent per page (tracked via Symbol). Safe to call from auto fixtures.
 */
export async function installPermalink404Recovery(
    page: Page,
    browser: Browser,
): Promise<void> {
    const flagged = page as FlaggedPage;
    if (flagged[INSTALLED_FLAG]) return;
    flagged[INSTALLED_FLAG] = true;

    try {
        await page.addLocatorHandler(
            page.locator(FOUR_OH_FOUR_SELECTOR),
            async () => {
                try {
                    await resavePermalinks(browser);
                    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
                } catch (err) {
                    // Recovery failed — log and let the originating action
                    // surface its own assertion failure. We intentionally
                    // swallow here so a recovery bug never replaces the
                    // user-meaningful failure with a handler stack.
                    console.warn(
                        '[permalink404Recovery] re-save failed:',
                        (err as Error).message,
                    );
                }
            },
            // times: cap retries so a stuck environment fails the test cleanly
            // instead of looping forever inside the handler.
            { times: 3 },
        );
    } catch {
        // Page may have closed between fixture setup and handler attach;
        // there's nothing meaningful to recover here.
    }
}

/**
 * Patches `browser.newContext` once per worker so contexts created manually
 * (e.g. `browser.newContext({ storageState }).newPage()` in page-object
 * constructors) auto-install the recovery handler on every page they spawn.
 */
export function patchBrowserForRecovery(browser: Browser): void {
    const flagged = browser as FlaggedBrowser;
    if (flagged[BROWSER_PATCHED_FLAG]) return;
    flagged[BROWSER_PATCHED_FLAG] = true;

    const original = browser.newContext.bind(browser);
    browser.newContext = async (options?: Parameters<Browser['newContext']>[0]) => {
        const ctx = await original(options);
        ctx.on('page', (p) => {
            void installPermalink404Recovery(p, browser);
        });
        for (const p of ctx.pages()) {
            void installPermalink404Recovery(p, browser);
        }
        return ctx;
    };
}
