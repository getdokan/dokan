import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminProductQaPage, adminProductQaData } from './adminProductQaPage';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import path from 'path';

// Read a single question via REST (admin auth, no assertion) and report whether
// it currently carries an answer. Returns false when the question 404s.
async function questionIsAnswered(questionId: string): Promise<boolean> {
    const [res, body] = await apiUtils.get(endPoints.getSingleProductQuestion(questionId), { headers: payloads.adminAuth }, false);
    if (!res.ok()) {
        return false;
    }
    return Boolean(body?.answer?.id);
}

// Whether a question still resolves via REST (used to confirm a delete).
async function questionExists(questionId: string): Promise<boolean> {
    const [res] = await apiUtils.get(endPoints.getSingleProductQuestion(questionId), { headers: payloads.adminAuth }, false);
    return res.ok();
}

// ============================================
// ADMIN PRODUCT Q&A — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/product-qa (AdminDataViews,
// module-gated by the `product_qa` Pro module).
//
// ADMIN-ONLY spec. The admin #/product-qa DataView only MODERATES pre-existing
// customer questions (status tabs All/Unread/Read/Unanswered/Answered, vendor +
// product filters, bulk read/unread/delete, plus a single-question detail page
// for answer/visibility/delete). This spec never drives the storefront question
// form: the full chain (vendor store -> vendor product -> customer -> question
// -> optional answer) is seeded programmatically via the REST API.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Product Q&A).
// All seeded names are namespaced with the "AQA" prefix.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

const ids: {
    sellerId?: string;
    seller2Id?: string;
    productId?: string;
    product2Id?: string;
    customerId?: string;
    answerTarget?: string;
    deleteTarget?: string;
    readTarget?: string;
    answered?: string;
    bulk: string[];
} = { bulk: [] };

// Seed a vendor store (idempotent + re-runnable). Look up the store first so we
// never take createStore's "already exists -> updateStore" path, which 400s on
// the non-boolean `show_email: 'yes'` field in payloads.createStore() (the v1
// stores PUT validates show_email as boolean; the POST is lenient).
async function seedVendor(v: { storeName: string; userLogin: string; email: string }): Promise<string> {
    let sellerId = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!sellerId) {
        const [, id] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        sellerId = id;
    }
    if (sellerId) {
        await apiUtils.updateStoreStatus(sellerId, { status: 'active' }, payloads.adminAuth);
    }
    return sellerId;
}

// Seed a vendor-owned product. payloads.createProduct() already carries the
// required categories[] (POST /dokan/v1/products 404s "Category must be
// required" without it). post_author makes the seeded vendor the owner.
async function seedProduct(name: string, sellerId: string): Promise<string> {
    const [, id] = await apiUtils.createProduct({ ...payloads.createProduct(), name, post_author: sellerId }, payloads.adminAuth);
    return id;
}

// Seed a customer question against a product. The admin can override `user_id`
// on POST /dokan/v1/product-questions (QuestionsApi::create_item honors it for
// administrators), so we author the question as the seeded customer while using
// admin auth — no separate customer REST context needed.
async function seedQuestion(question: string, productId: string, customerId?: string): Promise<string> {
    const payload: Record<string, unknown> = { ...payloads.createProductQuestion(), question, product_id: productId, status: 'visible' };
    if (customerId) {
        payload.user_id = customerId;
    }
    const [, questionId] = await apiUtils.createProductQuestion(payload, payloads.adminAuth);
    return questionId;
}

// Seed an answer for a question, authored by the owning vendor. AnswersApi
// create_item lets an administrator override `user_id`, so the answer is
// attributed to the seller while keeping admin auth.
async function seedAnswer(questionId: string, sellerId: string): Promise<void> {
    await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId, user_id: sellerId }, payloads.adminAuth);
}

test.describe('Admin Product Q&A moderation', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());

        ids.sellerId = await seedVendor(adminProductQaData.vendor);
        ids.seller2Id = await seedVendor(adminProductQaData.vendor2);
        ids.productId = await seedProduct(adminProductQaData.product, ids.sellerId);
        ids.product2Id = await seedProduct(adminProductQaData.product2, ids.seller2Id);

        const [, customerId] = await apiUtils.createCustomer({ ...payloads.createCustomer(), username: 'aqa_qa_customer', email: 'aqa_qa_customer@example.test' }, payloads.adminAuth);
        ids.customerId = customerId;

        // Unanswered questions (populate All / Unanswered / Unread tabs).
        ids.answerTarget = await seedQuestion(adminProductQaData.answerTarget, ids.productId, ids.customerId);
        ids.deleteTarget = await seedQuestion(adminProductQaData.deleteTarget, ids.productId, ids.customerId);
        ids.readTarget = await seedQuestion(adminProductQaData.readTarget, ids.productId, ids.customerId);

        // One already-answered question (populates the Answered tab).
        ids.answered = await seedQuestion(adminProductQaData.answered, ids.productId, ids.customerId);
        await seedAnswer(ids.answered, ids.sellerId!);

        // Bulk targets.
        ids.bulk = [];
        for (const q of adminProductQaData.bulk) {
            ids.bulk.push(await seedQuestion(q, ids.productId, ids.customerId));
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let qa: AdminProductQaPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            qa = new AdminProductQaPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Product Q&A DataView with columns and seeded rows', { tag: ['@pro', '@admin'] }, async () => {
            await qa.goto();
            await expect(qa.reactRoot).toBeVisible();
            await expect(qa.heading).toBeVisible();
            await expect(qa.columnHeader('Question')).toBeVisible();
            await expect(qa.columnHeader('Product')).toBeVisible();
            await expect(qa.columnHeader('Vendor')).toBeVisible();
            await expect(qa.columnHeader('Status')).toBeVisible();
            expect(await qa.getRowCount(), 'seeded question rows render').toBeGreaterThan(0);
            expect(await qa.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        // QUARANTINED @exploratory: the admin Product Q&A DataViews page renders NO
        // free-text search input (ProductQAList.tsx mounts no <SearchInput>; the
        // component tracks searchValue state but never renders a box, and
        // fetchQuestions sends no `search` param). Only the Vendors page has search.
        // This asserts search-driven filtering the UI cannot perform. Documented
        // product gap — re-enable when admin search lands.
        test.fixme('searching by question text filters the list to the matching question', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await qa.goto();
            await qa.search(adminProductQaData.answerTarget);
            await expect(qa.rowByQuestion(adminProductQaData.answerTarget)).toBeVisible();
            await expect(page.getByText(adminProductQaData.answered, { exact: false })).toHaveCount(0);
        });

        test('Unanswered tab requests answered=false and shows an Unanswered question', { tag: ['@pro', '@admin'] }, async () => {
            await qa.goto();
            const url = await qa.clickTabAndCaptureQuery(/^Unanswered/);
            expect(decodeURIComponent(url)).toMatch(/answered=false/);
            await qa.search(adminProductQaData.answerTarget);
            await expect(qa.rowByQuestion(adminProductQaData.answerTarget)).toBeVisible();
            expect(await qa.statusOfFirstRow()).toBe('Unanswered');
        });

        test('Answered tab requests answered=true and shows an Answered question', { tag: ['@pro', '@admin'] }, async () => {
            await qa.goto();
            const url = await qa.clickTabAndCaptureQuery(/^Answered/);
            expect(decodeURIComponent(url)).toMatch(/answered=true/);
            await qa.search(adminProductQaData.answered);
            await expect(qa.rowByQuestion(adminProductQaData.answered)).toBeVisible();
            expect(await qa.statusOfFirstRow()).toBe('Answered');
        });

        test('Read tab requests read=true from the API', { tag: ['@pro', '@admin'] }, async () => {
            await qa.goto();
            const url = await qa.clickTabAndCaptureQuery(/^Read/);
            expect(decodeURIComponent(url)).toMatch(/read=true/);
        });

        test('admin can open a question and post an answer (status flips to Answered)', { tag: ['@pro', '@admin'] }, async () => {
            // Own a fresh unanswered question so other tests never race the answer state.
            const qid = await seedQuestion(`AQA inline answer ${Date.now()}`, ids.productId!, ids.customerId);
            await qa.gotoDetail(qid);
            await expect(qa.detailHeading).toBeVisible();
            await qa.answerQuestion('AQA this is the admin reply to the customer question.');
            // Re-fetch the question via API: it must now carry an answer.
            await expect.poll(async () => questionIsAnswered(qid), { timeout: 15000 }).toBe(true);
        });

        test('admin can hide a visible question from the product page (status pill flips)', { tag: ['@pro', '@admin'] }, async () => {
            const qid = await seedQuestion(`AQA visibility toggle ${Date.now()}`, ids.productId!, ids.customerId);
            await qa.gotoDetail(qid);
            await expect(qa.detailHeading).toBeVisible();
            expect(await qa.detailVisibilityStatus(), 'seeded visible').toBe('Visible');
            await qa.toggleVisibility();
            await expect.poll(async () => qa.detailVisibilityStatus(), { timeout: 15000 }).toBe('Hidden');
        });

        test('admin can delete an entire Q&A from the detail page (returns to the list)', { tag: ['@pro', '@admin'] }, async () => {
            const qid = await seedQuestion(`AQA detail delete ${Date.now()}`, ids.productId!, ids.customerId);
            await qa.gotoDetail(qid);
            await expect(qa.detailHeading).toBeVisible();
            await qa.deleteQuestion();
            await expect(page).toHaveURL(/#\/product-qa(?!\/\d)/);
            // The deleted question must no longer resolve via the REST API.
            await expect.poll(async () => questionExists(qid), { timeout: 15000 }).toBe(false);
        });

        test('admin can bulk Mark-as-Read questions and sees the success toast', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            // Reset the bulk targets to unread so the read action is eligible on the All tab.
            for (const id of ids.bulk) {
                await apiUtils.updateProductQuestion(id, { read: false }, payloads.adminAuth);
            }
            await qa.goto();
            await qa.clickTab(/^All/);
            await qa.search('AQA bulk');
            await qa.selectAllVisibleRows();
            await qa.bulkAction(/Mark as Read/i);
            const toast = await qa.successToastVisible();
            expect(toast, 'success toast after bulk read').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let qa: AdminProductQaPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            qa = new AdminProductQaPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // QUARANTINED @exploratory: no free-text search input on the admin Product
        // Q&A page (see the "searching by question text" test above) — a
        // search-driven empty state is unreachable via the UI. Documented product gap.
        test.fixme('search with no match shows the empty state', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await qa.goto();
            await qa.search(adminProductQaData.searchMiss);
            const empty = (await qa.isEmptyStateVisible()) || (await qa.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/product-qa preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await qa.goto();
            await qa.reload();
            await expect(page).toHaveURL(/#\/product-qa/);
            await expect(qa.reactRoot).toBeVisible();
            await expect(qa.heading).toBeVisible();
        });

        test('deep-linking #/product-qa/<bad-id> degrades gracefully (no SPA white-screen)', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await qa.gotoDetail('99999999');
            // The React host must still be mounted and free of a PHP fatal — the
            // detail page handles the load error with a toast rather than crashing.
            await expect(qa.reactRoot).toBeVisible();
            expect(await qa.hasNoPhpFatal(), 'no PHP fatal on a bad id').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Product Q&A page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const qa = new AdminProductQaPage(page);
            await page.goto(qa.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await qa.isAccessDenied(), 'a vendor must not see the admin Product Q&A UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Product Q&A page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const qa = new AdminProductQaPage(page);
            await page.goto(qa.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await qa.isAccessDenied(), 'a customer must not see the admin Product Q&A UI').toBe(true);
            await ctx.close();
        });

        // QUARANTINED @exploratory — SECURITY OBSERVATION, not a flaky test.
        // Confirmed live: GET /dokan/v1/product-questions returns HTTP 200 to an
        // ANONYMOUS caller, leaking every question with internal fields (user_id,
        // read flag, status) and with no product scoping. The server does this by
        // design: QuestionsApi::get_items_permissions_check() returns true
        // unconditionally (product questions render on the storefront product page).
        // The assertion below (must be 401/403) therefore fails against current
        // product behavior. Left strict + quarantined so the gate stays honest;
        // surfaced to the team as a potential information-exposure concern to review
        // (the list endpoint exposes more than the storefront needs).
        test.fixme('an unauthenticated request to /dokan/v1/product-questions is rejected', { tag: ['@pro', '@customer', '@exploratory'] }, async () => {
            const anonCtx = await request.newContext();
            const res = await anonCtx.get(endPoints.getAllProductQuestions);
            expect([401, 403], 'unauthenticated REST read must be denied').toContain(res.status());
            await anonCtx.dispose();
        });
    });
});
