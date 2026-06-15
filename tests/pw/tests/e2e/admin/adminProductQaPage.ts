import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { waitForDataViewsSettle } from './adminDataViews';

export const adminProductQaData = {
    // The vendor store that owns the product the questions target.
    vendor: { storeName: 'AQA QA Vendor Store', userLogin: 'aqa_qa_vendor', email: 'aqa_qa_vendor@example.test' },
    // A second store, so the Vendor async-select filter has something to narrow by.
    vendor2: { storeName: 'AQA QA Vendor Two Store', userLogin: 'aqa_qa_vendor2', email: 'aqa_qa_vendor2@example.test' },
    // Product titles (used both as the seed product name AND to match the row by
    // its product-cell avatar alt — the question cell itself has no avatar).
    product: 'AQA QA Product',
    product2: 'AQA QA Product Two',
    // Distinctive, searchable question texts. The prefix keeps them unique and
    // lets the search box isolate exactly one row.
    answerTarget: 'AQA answer target question needs a reply',
    deleteTarget: 'AQA delete target question to remove',
    readTarget: 'AQA mark read target question',
    answered: 'AQA already answered question text',
    bulk: ['AQA bulk one question text', 'AQA bulk two question text'],
    // A search term guaranteed to match no question, for the empty-state edge.
    searchMiss: 'zzz_no_such_question_zzz',
} as const;

export const adminProductQaSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to a row — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    emptyState: 'text=/no data found|no items|no results|nothing to show/i',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// PAGE OBJECT — admin Product Q&A list + single. Surface: admin.php?page=dokan-dashboard#/product-qa.
// Admin-facing, so it deliberately does NOT register closeAnnouncementModal — a
// generic role=dialog handler would race the Delete / visibility confirm modals.
export class AdminProductQaPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/product-qa');

    constructor(page: Page) {
        this.page = page;
    }

    get reactRoot(): Locator {
        return this.page.locator(adminProductQaSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminProductQaSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminProductQaSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminProductQaSelectors.emptyState).first();
    }
    /** List heading: <h2>Product Q&A</h2>. */
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Product Q&A' }).first();
    }
    /** Single (detail) page heading. */
    get detailHeading(): Locator {
        return this.page.getByRole('heading', { name: /Product Question & Answer Details/i }).first();
    }

    /** A status tab — All / Unread / Read / Unanswered / Answered. The count
     * badge is appended to the accessible name, so match by a leading RegExp. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by the PRODUCT-cell avatar alt (the full product
     * title). The question cell has no avatar and the question text is truncated
     * past 40 chars, so isolate the row via search first then use rows.first()
     * for question-keyed actions; this helper is for product-keyed lookups. */
    rowByProduct(productTitle: string): Locator {
        return this.rows.filter({ has: this.page.locator(`img[alt="${productTitle}"]`) }).first();
    }

    /** A list row matched by visible question text. The question column renders
     * the (possibly truncated) text in a <strong> (unread) or <span> (read);
     * after a search that returns one row, prefer rowAfterSearch(). */
    rowByQuestion(questionText: string): Locator {
        return this.rows.filter({ hasText: questionText }).first();
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    /** Ready when the React root is visible AND either ≥1 row OR the empty-state has painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            if ((await this.rows.count()) > 0) return;
            if ((await this.emptyState.count()) > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminProductQaSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** 'Answered' | 'Unanswered' | '' for the (single) currently-visible row. */
    async statusOfFirstRow(): Promise<string> {
        const row = this.rows.first();
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = await row.innerText();
        if (/Unanswered/.test(text)) return 'Unanswered';
        if (/Answered/.test(text)) return 'Answered';
        return '';
    }

    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(900); // DataViews refetch + repaint.
    }

    /** Click a status tab and capture the backing product-questions request URL. */
    async clickTabAndCaptureQuery(name: RegExp): Promise<string> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        const [req] = await Promise.all([this.page.waitForRequest(/\/dokan\/v1\/product-questions/, { timeout: 15000 }), tab.click()]);
        await this.page.waitForTimeout(700);
        return req.url();
    }

    async search(query: string): Promise<void> {
        // The admin Product Q&A list renders NO search input (unlike the Vendors
        // page), so when absent we no-op and let row-by-text matching filter the
        // already-loaded, tab-filtered page.
        const input = this.searchBox;
        const hasSearch = await input.isVisible({ timeout: 2000 }).catch(() => false);
        if (!hasSearch) {
            void query;
            await this.waitForReady();
            return;
        }
        await input.fill(query);
        await this.page.waitForTimeout(1000); // debounced search.
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(700);
        }
    }

    /** Open the detail route by clicking the (single visible) question cell. */
    async openFirstQuestionDetail(): Promise<void> {
        const cell = this.rows.first().locator('td').first();
        await cell.waitFor({ state: 'visible', timeout: 10000 });
        await cell.click();
        await this.page.waitForURL(/#\/product-qa\/\d+/, { timeout: 15000 }).catch(() => undefined);
        await this.detailHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    }

    /** Navigate straight to a question's detail route by id.
     * After the React root is visible we also wait for the question-fetch
     * response so that the status pill reflects the real DB value, not the
     * component's initial empty-string state (which renders "Hidden"). */
    async gotoDetail(questionId: string): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(
                r => r.url().includes(`/dokan/v1/product-questions/${questionId}`) && r.request().method() === 'GET',
                { timeout: 20000 }
            ).catch(() => undefined),
            this.page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/product-qa/${questionId}`)),
        ]);
        await this.page.waitForLoadState('domcontentloaded');
        await this.reactRoot.waitFor({ state: 'visible', timeout: 30000 });
        // Small buffer for React to paint the fetched data.
        await this.page.waitForTimeout(600);
    }

    get answerEditor(): Locator {
        // RichText renders a contenteditable region; fall back to any editor box.
        return this.page.locator('[contenteditable="true"], .dokan-rich-text [role="textbox"]').first();
    }
    get saveButton(): Locator {
        return this.page.getByRole('button', { name: 'Save' }).first();
    }

    /** Type an answer into the RichText (Quill) editor and Save.
     * Quill's contenteditable is not React-controlled, so .fill() does not
     * trigger Quill's text-change listener. We must click to focus, then use
     * .pressSequentially() (key events) so Quill registers every character and
     * updates editedAnswer state before the Save button is enabled. */
    async answerQuestion(answerText: string): Promise<void> {
        const editor = this.answerEditor;
        await editor.waitFor({ state: 'visible', timeout: 15000 });
        await editor.click();
        // Clear any existing placeholder content first.
        await this.page.keyboard.press('Control+a');
        await editor.pressSequentially(answerText, { delay: 30 });
        // Give React a moment to propagate the Quill text-change event into editedAnswer state.
        await this.page.waitForTimeout(500);
        // Wait for Save button to be enabled (it is disabled while isAnswerUpdating OR editedAnswer is empty).
        const saveBtn = this.saveButton;
        await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
        // Poll until the Save button is not disabled.
        await this.page.waitForFunction(
            () => {
                const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
                const save = btns.find(b => b.textContent?.trim() === 'Save');
                return save && !save.disabled;
            },
            undefined,
            { timeout: 8000 }
        ).catch(() => undefined);
        await Promise.all([
            this.page.waitForResponse(r => /\/dokan\/v1\/product-answers/.test(r.url()) && r.request().method() === 'POST', { timeout: 15000 }).catch(() => null),
            saveBtn.click(),
        ]);
        await this.page.waitForTimeout(1200);
    }

    /** Click "Hide from product page" / "Show in product page" then confirm. */
    async toggleVisibility(): Promise<void> {
        const toggle = this.page.getByRole('button', { name: /Hide from product page|Show in product page/i }).first();
        await toggle.waitFor({ state: 'visible', timeout: 15000 });
        await toggle.click();
        const proceed = this.page.getByRole('button', { name: 'Proceed' }).first();
        await proceed.waitFor({ state: 'visible', timeout: 10000 });
        await proceed.click();
        await this.page.waitForTimeout(1200);
    }

    /** 'Visible' | 'Hidden' | '' as shown by the detail status pill.
     * The pill is rendered by ProductQASingle only after the async question
     * fetch completes. The component's initial state (status='') renders
     * "Hidden". gotoDetail() already waits for the GET response before
     * returning, so by the time this helper is called the React state should
     * have the real DB value — but we still give React a 2 s window to paint
     * "Visible" before falling back to "Hidden". This keeps the method fast
     * enough for expect.poll() callers (e.g. after toggleVisibility). */
    async detailVisibilityStatus(): Promise<string> {
        // Try "Visible" first with a short timeout so we don't stall expect.poll.
        const isVisible = await this.page
            .getByText('Visible', { exact: true })
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        if (isVisible) return 'Visible';
        const isHidden = await this.page
            .getByText('Hidden', { exact: true })
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        return isHidden ? 'Hidden' : '';
    }

    /** Click "Delete Entire Q&A" and confirm the DokanModal ("Yes, Delete"). */
    async deleteQuestion(): Promise<void> {
        const del = this.page.getByRole('button', { name: /Delete Entire Q&A/i }).first();
        await del.waitFor({ state: 'visible', timeout: 15000 });
        await del.click();
        const confirm = this.page.getByRole('button', { name: /Yes, Delete/i }).first();
        await confirm.waitFor({ state: 'visible', timeout: 10000 });
        await confirm.click();
        await this.page.waitForURL(/#\/product-qa(?!\/)/, { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForTimeout(800);
    }

    /** Open the 3-dot actions menu for the (single visible) first row. */
    async openFirstRowActionMenu(): Promise<void> {
        const row = this.rows.first();
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminProductQaSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Whether a given action menu item is present (eligibility gating check). */
    async actionMenuItemVisible(label: RegExp): Promise<boolean> {
        return await this.page
            .getByRole('menuitem', { name: label })
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    /** Click an item in the open actions menu, e.g. 'Mark as Read', 'Delete'. */
    async clickActionMenuItem(label: RegExp): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: label }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
        await this.page.waitForTimeout(1000); // PUT bulk_action + list refetch.
    }

    /** Tick every currently-visible row checkbox. Use after narrowing via tab/search. */
    async selectAllVisibleRows(): Promise<void> {
        const count = await this.rows.count();
        for (let i = 0; i < count; i++) {
            const cb = this.rows.nth(i).locator('input[type="checkbox"]').first();
            if (await cb.isVisible().catch(() => false)) {
                await cb.check();
            }
        }
    }

    /** Run a bulk action. Selecting rows reveals a selection toolbar with a
     * DIRECT action button (e.g. "Mark as Read" / "Delete"); clicking it fires
     * the PUT /product-questions/bulk_action. */
    async bulkAction(actionLabel: RegExp): Promise<void> {
        const action = this.page.getByRole('button', { name: actionLabel }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        await this.page.waitForTimeout(1300);
    }

    /** Success toast shown after a bulk action ("Action completed successfully"). */
    async successToastVisible(): Promise<boolean> {
        return await this.page
            .getByText(/Action completed successfully/i)
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    /** True when the admin Product Q&A UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
