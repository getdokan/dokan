// Drop-in replacement for `@playwright/test` that auto-installs the
// "Oops! That page can't be found." recovery on every page Playwright hands a
// spec, including pages created from manual `browser.newContext()` calls.
//
// Usage:
//   import { test, expect } from '@utils/test';
//
// Re-exports the full surface of `@playwright/test` so the swap is a no-op
// for everything except the recovery wiring.

import { test as base } from '@playwright/test';
import {
    installPermalink404Recovery,
    patchBrowserForRecovery,
} from '@utils/permalink404Recovery';

type RecoveryFixture = {
    _permalink404Recovery: void;
};

export const test = base.extend<RecoveryFixture>({
    _permalink404Recovery: [
        async ({ context, browser }, use) => {
            // 1. Patch this worker's shared Browser so manual contexts
            //    (e.g. `browser.newContext({ storageState }).newPage()` in
            //    page-object constructors) also pick up the handler.
            patchBrowserForRecovery(browser);

            // 2. Wire the default `context` fixture: any page Playwright
            //    creates here (including the default `page` fixture) gets
            //    the handler before its first navigation.
            context.on('page', (p) => {
                void installPermalink404Recovery(p, browser);
            });
            for (const p of context.pages()) {
                void installPermalink404Recovery(p, browser);
            }

            await use();
        },
        { auto: true },
    ],
});

export {
    expect,
    request,
    chromium,
    firefox,
    webkit,
    devices,
    selectors,
} from '@playwright/test';

export type {
    Page,
    Browser,
    BrowserContext,
    BrowserContextOptions,
    APIRequestContext,
    APIResponse,
    Locator,
    Request,
    Response,
    Route,
    Frame,
    ConsoleMessage,
    Dialog,
    Download,
    FileChooser,
    JSHandle,
    ElementHandle,
    Worker,
    TestInfo,
    PlaywrightTestConfig,
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
} from '@playwright/test';
