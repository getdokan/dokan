import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, PHP_FATAL, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React Verification settings surface (Dokan Pro, module
// vendor_verification). Surface: /dashboard/new/#/settings/verification.
// This is a CARD LIST (NOT DataViews): one VerificationCard per enabled method
// (dokan-pro/modules/vendor-verification/src/components/frontend/VerificationCard.tsx),
// then a "Social Profiles" card (the always-present post-fetch readiness signal).
// The page fetches GET /dokan/v1/vendor-verification ONCE on mount and never
// refetches — mid-test REST changes require a page reload before asserting.
// Submit posts /verification-requests; Cancel PUTs /verification-requests/<id>
// through a DokanModal ("Yes, Cancel"). Upload goes through the classic wp.media
// frame. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newVendorVerificationsSelectors = {
    reactRoot: REACT_ROOT,
    // A dokan-ui Card root. Method cards are scoped by their (nanoid-unique) h4 title.
    card: 'div.w-full.rounded.border',
    socialProfilesHeading: 'h4:has-text("Social Profiles")',
    skeleton: '.animate-pulse',

    startVerificationButton: 'button:has-text("Start Verification")',
    uploadFilesButton: 'button:has-text("Upload Files")',
    submitButton: 'button:has-text("Submit")',
    resubmitButton: 'button:has-text("Resubmit")',
    // Status-block texts.
    statusIntro: 'text=/Your verification request is/i',
    noteLabel: 'text=/^Note:/',
    filesLabel: 'text=/^Files:/',

    // Cancel DokanModal.
    cancelActionButton: 'button:has-text("Cancel")', // scope to the card
    cancelModalConfirm: 'button:has-text("Yes, Cancel")',

    // wp.media classic frame.
    mediaModal: '.media-modal:visible',
    mediaBrowseTab: 'button#menu-item-browse',
    mediaUploadTab: 'button#menu-item-upload',
    mediaFileInput: '.media-modal input[type="file"]',
    mediaAttachment: '.media-modal .attachment',
    mediaSelectButton: '.media-modal .media-toolbar-primary button.media-button-select, .media-modal button:has-text("Use this media")',

    errorToast: 'div[role="status"]',
    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    requestsRest: /dokan\/v[0-9]+\/verification-requests\b/i,
    requestItemRest: /dokan\/v[0-9]+\/verification-requests\/\d+/i,
    pageRest: /dokan\/v[0-9]+\/vendor-verification\b/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor Verification settings (Dokan Pro).
// ============================================
export class NewVendorVerificationsPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/settings/verification');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    get socialProfilesHeading(): Locator {
        return this.page.locator(newVendorVerificationsSelectors.socialProfilesHeading).first();
    }

    /** The Card whose header h4 contains the given method title. */
    card(title: string): Locator {
        return this.page
            .locator(newVendorVerificationsSelectors.card)
            .filter({ has: this.page.locator('h4', { hasText: title }) })
            .first();
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForReady();
    }

    /** Ready when the skeleton is gone AND the Social Profiles card (always present after the one-shot fetch) is visible. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const skeleton = await this.page.locator(newVendorVerificationsSelectors.skeleton).count();
            if (skeleton === 0 && (await this.socialProfilesHeading.isVisible().catch(() => false))) return;
            await this.page.waitForTimeout(250);
        }
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    // ---- Card reads ----
    async cardVisible(title: string): Promise<boolean> {
        return await this.card(title)
            .isVisible({ timeout: 15000 })
            .catch(() => false);
    }

    async cardHasText(title: string, text: string | RegExp): Promise<boolean> {
        const card = this.card(title);
        await card.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
        const locator = typeof text === 'string' ? card.getByText(text, { exact: false }) : card.getByText(text);
        return await locator
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    async cardBadgeText(title: string): Promise<string> {
        const card = this.card(title);
        const badge = card.locator('[class*="badge"], .dokan-badge').first();
        return (await badge.textContent({ timeout: 8000 }).catch(() => '')) ?? '';
    }

    async cardHasButton(title: string, name: RegExp): Promise<boolean> {
        return await this.card(title)
            .getByRole('button', { name })
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    // ---- Actions ----
    /** Open the upload panel via "Start Verification" on a method card. */
    async startVerification(title: string): Promise<void> {
        const btn = this.card(title).locator(newVendorVerificationsSelectors.startVerificationButton).first();
        await btn.waitFor({ state: 'visible', timeout: 15000 });
        await btn.click();
    }

    /**
     * Upload a document through the classic wp.media modal. A vendor's media modal
     * shows only the vendor's OWN media, so an admin-seeded attachment is invisible
     * here and a clean env (CI) has an empty Library. We therefore UPLOAD a fixture
     * through the "Upload Files" tab (uploaded as the current vendor session → always
     * appears + auto-selects), then confirm — instead of relying on an existing
     * Library attachment.
     */
    async uploadFromMediaLibrary(title: string, filePath = 'utils/sampleData/avatar.png'): Promise<void> {
        const uploadBtn = this.card(title).locator(newVendorVerificationsSelectors.uploadFilesButton).first();
        await uploadBtn.waitFor({ state: 'visible', timeout: 15000 });
        await uploadBtn.click();
        const modal = this.page.locator(newVendorVerificationsSelectors.mediaModal).first();
        await modal.waitFor({ state: 'visible', timeout: 15000 });

        // Try to use an existing Library attachment first (fast path when media exists).
        const browseTab = this.page.locator(newVendorVerificationsSelectors.mediaBrowseTab).first();
        if (await browseTab.isVisible().catch(() => false)) await browseTab.click().catch(() => undefined);
        const attachment = this.page.locator(newVendorVerificationsSelectors.mediaAttachment).first();
        let ready = await attachment
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => true)
            .catch(() => false);

        // Otherwise upload the fixture via the "Upload Files" tab (robust in a clean env).
        if (!ready) {
            const uploadTab = this.page.locator(newVendorVerificationsSelectors.mediaUploadTab).first();
            if (await uploadTab.isVisible().catch(() => false)) await uploadTab.click().catch(() => undefined);
            await this.page
                .locator(newVendorVerificationsSelectors.mediaFileInput)
                .first()
                .setInputFiles(filePath)
                .catch(() => undefined);
            ready = await attachment
                .waitFor({ state: 'visible', timeout: 30000 })
                .then(() => true)
                .catch(() => false);
        }

        // Ensure the attachment is selected — but do NOT re-click an already-selected
        // one (a freshly uploaded item auto-selects; clicking again would deselect it).
        if (await attachment.isVisible().catch(() => false)) {
            const alreadySelected = await attachment.evaluate(el => el.classList.contains('selected') || el.getAttribute('aria-checked') === 'true').catch(() => false);
            if (!alreadySelected) await attachment.click().catch(() => undefined);
        }
        const useBtn = this.page.locator(newVendorVerificationsSelectors.mediaSelectButton).first();
        await useBtn.waitFor({ state: 'visible', timeout: 10000 });
        await useBtn.click();
        await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
    }

    /** Click Submit inside a card's upload panel; gate on the POST /verification-requests. */
    async submit(title: string): Promise<void> {
        const submit = this.card(title).locator(newVendorVerificationsSelectors.submitButton).first();
        await submit.waitFor({ state: 'visible', timeout: 10000 });
        await Promise.all([this.page.waitForResponse(r => newVendorVerificationsSelectors.requestsRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), submit.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Click Submit expecting NO request (validation blocks it). */
    async submitExpectingNoPost(title: string): Promise<boolean> {
        const submit = this.card(title).locator(newVendorVerificationsSelectors.submitButton).first();
        await submit.waitFor({ state: 'visible', timeout: 10000 });
        const post = this.page
            .waitForResponse(r => newVendorVerificationsSelectors.requestsRest.test(r.url()) && r.request().method() === 'POST', { timeout: 4000 })
            .then(() => true)
            .catch(() => false);
        await submit.click();
        return !(await post); // true when NO post fired
    }

    async resubmit(title: string): Promise<void> {
        const btn = this.card(title).locator(newVendorVerificationsSelectors.resubmitButton).first();
        await btn.waitFor({ state: 'visible', timeout: 15000 });
        await btn.click();
    }

    /** Cancel a pending request via the card Cancel button + DokanModal "Yes, Cancel". */
    async cancelRequest(title: string): Promise<void> {
        const card = this.card(title);
        const cancelBtn = card.getByRole('button', { name: /^Cancel$/ }).first();
        await cancelBtn.waitFor({ state: 'visible', timeout: 15000 });
        await cancelBtn.click();
        const confirm = this.page.locator(newVendorVerificationsSelectors.cancelModalConfirm).first();
        await confirm.waitFor({ state: 'visible', timeout: 8000 });
        // DokanModal confirm handler is debounced ~300ms.
        await this.page.waitForTimeout(400);
        await Promise.all([this.page.waitForResponse(r => newVendorVerificationsSelectors.requestItemRest.test(r.url()) && r.request().method() === 'PUT', { timeout: 20000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(800);
    }

    async errorToastVisible(text: RegExp): Promise<boolean> {
        return await this.page
            .locator(newVendorVerificationsSelectors.errorToast)
            .filter({ hasText: text })
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }
}
