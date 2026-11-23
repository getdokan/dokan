// tests/e2e/rank-math/rankMathWizardPage.ts
//
// Drives the Rank Math SEO **setup wizard** through its real admin UI so the
// plugin ends up *configured* before the rank-math suite runs.
//
// Why this exists
// ---------------
// A freshly activated Rank Math has not completed its setup wizard. Until it
// does, `Registration::redirect_to_welcome()` force-redirects every admin page
// load to the wizard (admin.php?page=rank-math-registration → ...?page=
// rank-math-wizard), and `Helper::is_configured()` stays false. That leaves the
// SEO module half-initialised for the rank-math tests.
//
// The UI flow (this Rank Math build shows four visible steps):
//   1. CONNECT screen   (page=rank-math-registration) → "Skip Step"
//        — the native skip; it sets `rank_math_registration_skip` so
//          `is_invalid_registration()` becomes false (no more redirects).
//          We deliberately never click "Connect Your Account" (it reaches
//          rankmath.com, which is wp.org-blocked in CI).
//   2. GETTING STARTED  (page=rank-math-wizard)        → "Start Wizard"
//   3. YOUR SITE        (step=yoursite)                → "Save and Continue"
//   4. ANALYTICS        (step=analytics)               → "Skip Step"
//        — skipped so we never touch the Google connect flow.
//   5. READY            (step=ready)
//        — just reaching this step localises Ready data, which calls
//          `Helper::is_configured( true )`. That is the flag the dashboard /
//          SEO module read to treat the plugin as set up.
//
// The method is intentionally tolerant: if Rank Math is absent or already
// configured the wizard controls never appear, and it no-ops instead of
// failing the whole auth setup.

import { Page, expect } from '@playwright/test';
import { toPath } from '@utils/helpers';

export class RankMathWizardPage {
    constructor(readonly page: Page) {}

    private skipStep() {
        return this.page.getByRole('button', { name: /^Skip Step$/i }).first();
    }
    private startWizard() {
        return this.page.getByRole('button', { name: /Start Wizard/i }).first();
    }
    private saveAndContinue() {
        return this.page.getByRole('button', { name: /^Save and Continue$/i }).first();
    }

    private isVisible(locator: ReturnType<Page['locator']>, timeout = 4000): Promise<boolean> {
        return locator
            .isVisible({ timeout })
            .catch(() => false);
    }

    // Walk the wizard to the READY step. Returns the outcome so the caller can
    // log meaningfully. Never throws on a missing/already-configured wizard.
    async completeSetupWizard(): Promise<'completed' | 'skipped'> {
        const page = this.page;

        // Land on the wizard entry point. When Rank Math is active-but-unconfigured
        // this is the CONNECT screen; otherwise it redirects away / 404s.
        await page.goto(toPath('wp-admin/admin.php?page=rank-math-registration'), { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(2500);

        // CONNECT → Skip (also satisfies the GETTING STARTED screen's own "Skip Step").
        if (await this.isVisible(this.skipStep())) {
            await this.skipStep().click().catch(() => {});
            await page.waitForTimeout(3000);
        }

        // GETTING STARTED → Start Wizard.
        if (await this.isVisible(this.startWizard())) {
            await this.startWizard().click().catch(() => {});
            await page.waitForTimeout(3000);
        }

        // If no wizard chrome ever rendered, Rank Math is absent or already set up.
        const inWizard = (await this.isVisible(this.saveAndContinue(), 2000)) || (await this.isVisible(this.skipStep(), 2000)) || page.url().includes('step=');
        if (!inWizard) {
            return 'skipped';
        }

        // Walk the remaining steps. Prefer "Save and Continue" (persists the
        // step's defaults, mirroring an admin accepting them); fall back to
        // "Skip Step" — which is what we want on ANALYTICS to avoid the Google
        // connect. Bounded loop so a stuck step can never hang the setup.
        for (let i = 0; i < 8; i++) {
            if (page.url().includes('step=ready')) {
                break;
            }
            const onAnalytics = page.url().includes('step=analytics');
            const cont = this.saveAndContinue();
            const skip = this.skipStep();

            if (!onAnalytics && (await this.isVisible(cont, 3000))) {
                await cont.click().catch(() => {});
            } else if (await this.isVisible(skip, 3000)) {
                await skip.click().catch(() => {});
            } else {
                break; // no navigation control on this screen — stop gracefully.
            }
            await page.waitForLoadState('domcontentloaded').catch(() => {});
            await page.waitForTimeout(3000);
        }

        return 'completed';
    }

    // Optional hard assertion for a dedicated UI test: prove the wizard reached
    // READY (the screen renders the "Your site is ready!" celebration).
    async assertReady(): Promise<void> {
        await expect(this.page).toHaveURL(/step=ready/);
        await expect(this.page.locator('text=/Your site is ready/i').first()).toBeVisible({ timeout: 10000 });
    }
}
