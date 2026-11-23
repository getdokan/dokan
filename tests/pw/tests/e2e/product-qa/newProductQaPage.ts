import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    PHP_FATAL,
    DATA_ROW_SETTLED,
    SKELETON_ANY,
    actionMenuItem as dvActionMenuItem,
    statusTab as dvStatusTab,
    waitForRootReady as dvWaitForRootReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    parseTabCount,
    openFilterPanel as dvOpenFilterPanel,
    dataViewsConfirm,
    isDataViewsConfirmOpen,
    confirmDataViewsAction,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React Product Q&A surface (Dokan Pro 5.0.0+).
// Surfaces:
//   /dashboard/new/#/product-questions-answers            → DataViews list + tabs
//                                                            (dokan-pro/modules/product-qa/src/
//                                                             components/ProductQAList.tsx)
//   /dashboard/new/#/product-questions-answers/:questionId → question + answer editor
//                                                            (.../components/QuestionView.tsx)
// DataViews namespace="dokan-product-qa-data-view" → id "#dokan-product-qa-data-view".
// Tabs All/Answered/Unanswered carry counts from X-Status-* headers. The Answer editor
// is a Quill RichText (.ql-editor contenteditable). Two component bugs constrain oracles:
//   - edit-answer success toast fires in a finally (even on PUT failure) → gate on the PUT.
//   - delete-answer mutates state without re-render → assert via REST/reload, not instant UI.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (shared DataViews primitives from @utils/dataViews).
// ============================================
export const newProductQaSelectors = {
    reactRoot: REACT_ROOT,

    // ---- List ----
    listContainer: '#dokan-product-qa-data-view',
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    tab: dvStatusTab,
    tabAll: dvStatusTab('All'),
    tabAnswered: dvStatusTab('Answered'),
    tabUnanswered: dvStatusTab('Unanswered'),
    // The Question cell is a bold role=button div that navigates to details.
    questionCellButton: 'tbody tr [role="button"]',
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    statusBadge: '.dokan-badge, [class*="badge"]',
    // Product filter (AsyncSearchableSelect inside the funnel panel).
    productFilterInput: '.react-select__input input, input[placeholder="Search"]',
    emptyState: 'text=/no data found/i',
    successToast: 'div[role="status"]',

    // ---- Details ----
    questionDetailsCard: 'text=/Question Details/i',
    answerCardHeading: 'text=/^Answer$/',
    quillEditor: '.ql-editor',
    saveAnswerButton: 'button:has-text("Save")',
    editAnswerButton: 'button:has-text("Edit")',
    deleteAnswerButton: 'button:has-text("Delete")',
    deleteQuestionButton: 'button:has-text("Delete Question")',
    answeredByText: 'text=/Answered by/i',
    notFoundBackButton: 'button:has-text("Back to List"), a:has-text("Back to List")',

    phpFatal: PHP_FATAL,

    // REST endpoints used to gate on refetches / mutations.
    listRest: /dokan\/v[0-9]+\/product-questions\b/i,
    answersRest: /dokan\/v[0-9]+\/product-answers\b/i,
    questionSingleRest: /dokan\/v[0-9]+\/product-questions\/\d+/i,
} as const;

export type QaTab = 'all' | 'answered' | 'unanswered';

// ============================================
// PAGE OBJECT — new React Product Q&A (Dokan 5.0.0+, Pro).
// ============================================
export class NewProductQaPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/product-questions-answers');
    detailUrl(id: string | number): string {
        return toPath(`dashboard/new/#/product-questions-answers/${id}`);
    }

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get allTab(): Locator {
        return this.page.locator(newProductQaSelectors.tabAll).first();
    }
    get answeredTab(): Locator {
        return this.page.locator(newProductQaSelectors.tabAnswered).first();
    }
    get unansweredTab(): Locator {
        return this.page.locator(newProductQaSelectors.tabUnanswered).first();
    }
    get settledRows(): Locator {
        return this.page.locator(newProductQaSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newProductQaSelectors.skeleton);
    }
    get quillEditor(): Locator {
        return this.page.locator(newProductQaSelectors.quillEditor).first();
    }
    get saveAnswerButton(): Locator {
        return this.page.locator(newProductQaSelectors.saveAnswerButton).first();
    }
    get deleteQuestionButton(): Locator {
        return this.page.locator(newProductQaSelectors.deleteQuestionButton).first();
    }

    // ---- Navigation ----
    async gotoList(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async gotoDetails(id: string | number): Promise<void> {
        await this.page.goto(this.detailUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Wait until the skeleton clears AND settled rows OR empty state OR the tab strip is present. */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const skeletons = await this.skeletons.count();
            if (skeletons === 0) {
                const rows = await this.settledRows.count();
                if (rows > 0) return;
                if (
                    await this.page
                        .locator(newProductQaSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if (await this.allTab.isVisible().catch(() => false)) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- List reads ----
    async getRowCount(): Promise<number> {
        await this.waitForSettle();
        return await this.settledRows.count();
    }

    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.answeredTab, this.unansweredTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 8000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }

    async getTabCount(tab: QaTab): Promise<number> {
        const locator = tab === 'all' ? this.allTab : tab === 'answered' ? this.answeredTab : this.unansweredTab;
        return parseTabCount(await locator.textContent().catch(() => ''));
    }

    /** Click a status tab, gate on the ?answered= refetch (except All), then settle. */
    async selectTab(tab: QaTab): Promise<void> {
        const locator = tab === 'all' ? this.allTab : tab === 'answered' ? this.answeredTab : this.unansweredTab;
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        const refetch = this.page.waitForResponse(r => newProductQaSelectors.listRest.test(r.url()) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await locator.click();
        await refetch;
        await this.waitForSettle();
    }

    rowsWithText(text: string): Locator {
        return this.settledRows.filter({ hasText: text });
    }

    /** Open a question's details by clicking its Question cell. */
    async openQuestionByText(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const btn = row.locator('[role="button"]').first();
        await Promise.all([this.page.waitForURL(/#\/product-questions-answers\/\d+/, { timeout: 15000 }).catch(() => undefined), btn.click()]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async filterByProduct(productName: string): Promise<void> {
        await dvOpenFilterPanel(this.page);
        const productFieldBtn = this.page.getByRole('button', { name: /product/i }).first();
        if (await productFieldBtn.isVisible().catch(() => false)) {
            await productFieldBtn.click().catch(() => undefined);
        }
        const refetch = this.page.waitForResponse(r => newProductQaSelectors.listRest.test(r.url()) && r.url().includes('product_id=') && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        const input = this.page.locator(newProductQaSelectors.productFilterInput).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(productName.slice(0, Math.max(3, productName.length)));
        const option = this.page.locator('.react-select__option, [role="option"]').filter({ hasText: productName }).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await refetch;
        await this.waitForSettle();
    }

    // ---- Details actions ----
    /** Fill the Quill answer editor and Save; gate on the POST /product-answers. */
    async answerQuestion(answerText: string): Promise<void> {
        await this.quillEditor.waitFor({ state: 'visible', timeout: 15000 });
        await this.quillEditor.click();
        await this.quillEditor.fill(answerText);
        await Promise.all([this.page.waitForResponse(r => newProductQaSelectors.answersRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.saveAnswerButton.click()]);
        await this.page.waitForTimeout(600);
    }

    /** Enter edit mode, replace the answer, and Save; gate on the PUT /product-answers/{id}. */
    async editAnswer(answerText: string): Promise<void> {
        const editBtn = this.page.locator(newProductQaSelectors.editAnswerButton).first();
        await editBtn.waitFor({ state: 'visible', timeout: 15000 });
        await editBtn.click();
        await this.quillEditor.waitFor({ state: 'visible', timeout: 10000 });
        await this.quillEditor.click();
        await this.quillEditor.fill(answerText);
        await Promise.all([this.page.waitForResponse(r => newProductQaSelectors.answersRest.test(r.url()) && r.request().method() === 'PUT', { timeout: 20000 }).catch(() => undefined), this.saveAnswerButton.click()]);
        await this.page.waitForTimeout(600);
    }

    /**
     * Delete the answer via its card Delete button + DokanModal "Yes, Delete".
     * The confirm modal is role="dialog" (not alertdialog). The delete request is
     * a POST with a REST method-override (NOT a literal DELETE verb), so gate on
     * any non-GET call to /product-answers rather than the DELETE method.
     */
    async deleteAnswer(): Promise<void> {
        // The Answer-card Delete button (distinct from the question's "Delete Question").
        const del = this.page.getByRole('button', { name: 'Delete', exact: true }).last();
        await del.waitFor({ state: 'visible', timeout: 15000 });
        await del.click();
        const yes = this.page.getByRole('button', { name: /^Yes, Delete$/i }).first();
        await yes.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([this.page.waitForResponse(r => newProductQaSelectors.answersRest.test(r.url()) && r.request().method() !== 'GET', { timeout: 20000 }).catch(() => undefined), yes.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Delete the question from details; gate on DELETE /product-questions/{id}. */
    async deleteQuestionFromDetails(): Promise<void> {
        await this.deleteQuestionButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.deleteQuestionButton.click();
        await Promise.all([this.page.waitForResponse(r => newProductQaSelectors.questionSingleRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 20000 }).catch(() => undefined), this.confirmModal()]);
        await this.page.waitForTimeout(600);
    }

    /** Delete a question from the list row action; gate on the bulk_action PUT. */
    async deleteQuestionFromRow(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const del = this.page.locator(newProductQaSelectors.actionMenuItem('Delete')).first();
        await del.waitFor({ state: 'visible', timeout: 8000 });
        await del.click();
        // plugin-ui may wrap the destructive action in an alertdialog confirm.
        await Promise.all([this.page.waitForResponse(r => (newProductQaSelectors.listRest.test(r.url()) || newProductQaSelectors.questionSingleRest.test(r.url())) && r.request().method() !== 'GET', { timeout: 20000 }).catch(() => undefined), this.confirmModalIfPresent()]);
        await this.page.waitForTimeout(600);
        await this.waitForSettle();
    }

    /** Click the DokanModal / alertdialog confirm ("Yes, Delete"). */
    private async confirmModal(): Promise<void> {
        const dialog = dataViewsConfirm(this.page);
        if (await dialog.isVisible({ timeout: 5000 }).catch(() => false)) {
            const yes = dialog
                .getByRole('button', { name: /yes,?\s*delete|delete|confirm/i })
                .filter({ hasNotText: /^Cancel$/ })
                .last();
            await yes.click();
            return;
        }
        // Fallback: a DokanModal without role=alertdialog.
        const yes = this.page.getByRole('button', { name: /^Yes, Delete$/i }).first();
        if (await yes.isVisible({ timeout: 5000 }).catch(() => false)) await yes.click();
    }

    private async confirmModalIfPresent(): Promise<void> {
        if (await isDataViewsConfirmOpen(this.page, 3000)) {
            await confirmDataViewsAction(this.page);
        }
    }

    async isAnswered(): Promise<boolean> {
        return await this.page
            .locator(newProductQaSelectors.answeredByText)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }
}
