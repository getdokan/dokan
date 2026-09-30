import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { REACT_ROOT, PHP_FATAL, hasNoPhpFatal as dvHasNoPhpFatal, waitForRootReady as dvWaitForRootReady } from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Announcements" surface (Dokan Pro core Pro,
// no module toggle). Surface: /dashboard/new/#/announcement.
//   dokan-pro/src/features/announcement/AnnouncementList.tsx
// NOT a DataViews table — a two-pane CARD list: left pane = article cards
// (article.announcement-list-item, each with a SimpleCheckbox + a role=button
// title), right pane = AnnouncementDetails. Selecting >=1 card swaps the header
// into a bulk-action bar with "Mark as Read" / "Mark as Unread" / "Delete".
// "Delete" opens a DokanModal ("Delete Announcement", role=dialog, default
// confirm "Yes, Delete") → DELETE /dokan/v1/announcement/notice/{id} → the card
// drops out. The vendor has NO create/edit form (announcements are admin
// authored). Search input is a 500ms DebouncedInput (fill() bypasses it — use
// real key events). Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newAnnouncementsSelectors = {
    reactRoot: REACT_ROOT,
    searchInput: 'input[placeholder="Search Announcement"]',
    articleRow: 'article.announcement-list-item',
    selectAllCheckbox: '#check-all-announcement',
    // Bulk-action bar (appears after a card is selected).
    bulkDeleteButton: 'button:has-text("Delete")',
    // DokanModal (role=dialog).
    deleteModalTitle: 'text=/^Delete Announcement$/',
    deleteConfirm: 'button:has-text("Yes, Delete")',
    deleteCancel: 'button:has-text("Cancel")',
    successToast: 'div[role="status"]',
    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    listRest: /dokan\/v[0-9]+\/announcement(\?|$|&)/i,
    deleteNoticeRest: /dokan\/v[0-9]+\/announcement\/notice\/\d+/i,
} as const;

// ============================================
// PAGE OBJECT — new React vendor "Announcements" (Dokan Pro).
// ============================================
export class NewAnnouncementsPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/announcement');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get articles(): Locator {
        return this.page.locator(newAnnouncementsSelectors.articleRow);
    }

    cardWithText(text: string): Locator {
        return this.articles.filter({ hasText: text }).first();
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

    /** Ready when at least one announcement card OR the search input is present. */
    async waitForReady(timeoutMs = 20000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.articles.count()) > 0) return;
            if (
                await this.page
                    .locator(newAnnouncementsSelectors.searchInput)
                    .first()
                    .isVisible()
                    .catch(() => false)
            )
                return;
            await this.page.waitForTimeout(250);
        }
    }

    /** Type into the debounced search input using real key events (fill() bypasses it). */
    async search(text: string): Promise<void> {
        const input = this.page.locator(newAnnouncementsSelectors.searchInput).first();
        await input.click();
        const current = await input.inputValue();
        if (current.length > 0) {
            await input.evaluate((el: HTMLInputElement) => {
                el.focus();
                el.setSelectionRange(0, el.value.length);
            });
            await input.press('Backspace');
        }
        if (text) await input.pressSequentially(text, { delay: 60 });
        await this.page.waitForTimeout(1000);
    }

    async cardVisible(text: string): Promise<boolean> {
        return await this.cardWithText(text)
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    /**
     * Search for the card and, if not yet present, reload + re-search — the per
     * vendor announcement NOTICE row is created by a WP background process after
     * the admin publish, so a fresh notice can lag the REST announcement. Polls the
     * live UI until the notice materializes (does not weaken the assertion).
     */
    async findCard(text: string, attempts = 6): Promise<boolean> {
        for (let i = 0; i < attempts; i++) {
            await this.search(text);
            if (await this.cardVisible(text)) return true;
            if (i < attempts - 1) {
                await this.page.reload();
                await this.page.waitForLoadState('domcontentloaded');
                await this.waitForReady();
            }
        }
        return await this.cardVisible(text);
    }

    async cardCount(text: string): Promise<number> {
        return await this.articles.filter({ hasText: text }).count();
    }

    /** Select the checkbox inside the card matching text (reveals the bulk bar). */
    async selectCard(text: string): Promise<void> {
        const card = this.cardWithText(text);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        const checkbox = card.locator('input[type="checkbox"]').first();
        await checkbox.waitFor({ state: 'visible', timeout: 8000 });
        await checkbox.check();
        await this.page.waitForTimeout(300);
    }

    /** Open the bulk Delete DokanModal (after selecting >=1 card). */
    async openDeleteModal(): Promise<void> {
        const del = this.page.locator(newAnnouncementsSelectors.bulkDeleteButton).first();
        await del.waitFor({ state: 'visible', timeout: 8000 });
        await del.click();
        await this.page.locator(newAnnouncementsSelectors.deleteModalTitle).first().waitFor({ state: 'visible', timeout: 8000 });
    }

    async deleteModalButtons(): Promise<{ confirm: boolean; cancel: boolean }> {
        return {
            confirm: await this.page
                .locator(newAnnouncementsSelectors.deleteConfirm)
                .first()
                .isVisible({ timeout: 5000 })
                .catch(() => false),
            cancel: await this.page
                .locator(newAnnouncementsSelectors.deleteCancel)
                .first()
                .isVisible({ timeout: 5000 })
                .catch(() => false),
        };
    }

    /** Confirm the delete ("Yes, Delete"); gate the DELETE notice mutation. */
    async confirmDelete(): Promise<void> {
        const confirm = this.page.locator(newAnnouncementsSelectors.deleteConfirm).first();
        await confirm.waitFor({ state: 'visible', timeout: 8000 });
        await this.page.waitForTimeout(300);
        await Promise.all([this.page.waitForResponse(r => newAnnouncementsSelectors.deleteNoticeRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(1000);
    }

    /** Dismiss the delete modal via Cancel (no mutation). */
    async cancelDelete(): Promise<void> {
        const cancel = this.page.locator(newAnnouncementsSelectors.deleteCancel).first();
        await cancel.waitFor({ state: 'visible', timeout: 8000 });
        await cancel.click();
        await this.page.waitForTimeout(500);
    }

    async successToastVisible(): Promise<boolean> {
        return await this.page
            .locator(newAnnouncementsSelectors.successToast)
            .filter({ hasText: /removed successfully/i })
            .first()
            .isVisible({ timeout: 6000 })
            .catch(() => false);
    }
}
