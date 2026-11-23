import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, SKELETON_ANY, PHP_FATAL, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "ShipStation" settings surface (Dokan Pro, module
// shipstation). Surface: /dashboard/new/#/settings/shipstation.
//   dokan-pro/modules/shipstation/src/js/frontend/components/CredentialSettings.tsx
// NOT a DataViews list — a card with a Generate/Revoke button + two DokanModals
// (role=dialog, NOT the DataViews role=alertdialog):
//   - Generate → POST /dokan/v1/shipstation/credentials/create → "Attention!"
//     modal (confirm "Confirm", no cancel), then Authentication/Consumer Key
//     code blocks render (code.dokan-shipstation-code).
//   - Revoke   → "Revoke Credentials" modal (confirm "Yes, Revoke") →
//     DELETE /dokan/v1/shipstation/credentials/{vendorId} → back to no-cred state.
// Behavioral oracle is the REST credential-existence flip (GET returns key_id when
// present, 404 dokan_pro_rest_no_resource when revoked) + the card state flip.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newShipstationSelectors = {
    reactRoot: REACT_ROOT,
    skeleton: SKELETON_ANY,

    generateButton: 'button:has-text("Generate Credentials")',
    revokeButton: 'button:has-text("Revoke Credentials")',
    // Rendered credential code blocks (present only in the has-credential state).
    credentialCode: 'code.dokan-shipstation-code',
    authKeyLabel: 'text=/Authentication Key/i',
    consumerKeyLabel: 'text=/Consumer Key/i',

    // DokanModals (role=dialog).
    attentionModalTitle: 'text=/^Attention!$/',
    attentionConfirm: 'button:has-text("Confirm")',
    revokeModalTitle: 'text=/^Revoke Credentials$/',
    revokeConfirm: 'button:has-text("Yes, Revoke")',

    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    createRest: /dokan\/v[0-9]+\/shipstation\/credentials\/create\b/i,
    credentialRest: /dokan\/v[0-9]+\/shipstation\/credentials\/\d+\b/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor "ShipStation" credential settings (Dokan Pro).
// ============================================
export class NewShipstationPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/settings/shipstation');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get generateButton(): Locator {
        return this.page.locator(newShipstationSelectors.generateButton).first();
    }
    get revokeButton(): Locator {
        return this.page.locator(newShipstationSelectors.revokeButton).first();
    }
    get credentialCodes(): Locator {
        return this.page.locator(newShipstationSelectors.credentialCode);
    }
    get skeletons(): Locator {
        return this.page.locator(newShipstationSelectors.skeleton);
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Ready when the skeleton is gone AND either the Generate or Revoke button is visible. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                const gen = await this.generateButton.isVisible().catch(() => false);
                const rev = await this.revokeButton.isVisible().catch(() => false);
                if (gen || rev) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Reads ----
    async generateVisible(): Promise<boolean> {
        return await this.generateButton.isVisible({ timeout: 10000 }).catch(() => false);
    }

    async revokeVisible(): Promise<boolean> {
        return await this.revokeButton.isVisible({ timeout: 10000 }).catch(() => false);
    }

    async credentialCodeCount(): Promise<number> {
        return await this.credentialCodes.count();
    }

    /** True when the two credential code blocks (Authentication Key + Consumer Key) render with non-empty text. */
    async credentialsRendered(): Promise<boolean> {
        const count = await this.credentialCodeCount();
        if (count < 1) return false;
        const first = (
            await this.credentialCodes
                .first()
                .innerText()
                .catch(() => '')
        ).trim();
        return first.length > 0;
    }

    // ---- Actions ----
    /** Click Generate, gate the create POST, confirm the "Attention!" modal. */
    async generate(): Promise<void> {
        await this.generateButton.waitFor({ state: 'visible', timeout: 15000 });
        await Promise.all([this.page.waitForResponse(r => newShipstationSelectors.createRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.generateButton.click()]);
        // "Attention!" DokanModal — confirm via "Confirm" (no cancel button).
        const confirm = this.page.locator(newShipstationSelectors.attentionConfirm).first();
        await confirm.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        await this.page.waitForTimeout(400); // DokanModal confirm handler settle.
        if (await confirm.isVisible().catch(() => false)) await confirm.click().catch(() => undefined);
        await this.page.waitForTimeout(600);
    }

    /** Click Revoke, confirm the "Revoke Credentials" modal via "Yes, Revoke", gate the DELETE. */
    async revoke(): Promise<void> {
        await this.revokeButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.revokeButton.click();
        const confirm = this.page.locator(newShipstationSelectors.revokeConfirm).first();
        await confirm.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForTimeout(400); // DokanModal confirm handler settle.
        await Promise.all([this.page.waitForResponse(r => newShipstationSelectors.credentialRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 20000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(800);
    }

    async attentionModalVisible(): Promise<boolean> {
        return await this.page
            .locator(newShipstationSelectors.attentionModalTitle)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }
}
