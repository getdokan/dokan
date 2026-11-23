import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewProductQaPage, newProductQaSelectors } from './newProductQaPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { VENDOR_STORAGE_STATE as v1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Product Q&A feature.
// Surfaces:
//   /dashboard/new/#/product-questions-answers            (DataViews list + tabs)
//   /dashboard/new/#/product-questions-answers/:questionId (question + answer editor)
// Ported from the legacy `product-qa` vendor cases (whose page object + ApiUtils
// are no-op stubs — legacy green is vacuous), driving the React UI, plus a
// customer-asks → vendor-answers business flow. Pro feature (module product_qa).
// ============================================

const { PRODUCT_ID } = process.env;

let apiUtils: ApiUtils;
const seededIds: string[] = [];

const stamp = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

/** Seed a customer-authored question on PRODUCT_ID; returns [id, questionText]. */
async function seedQuestion(marker: string): Promise<[string, string]> {
    const [, id, question] = await apiUtils.createProductQuestion({ ...payloads.createProductQuestion(), question: `PW QA ${marker} ${stamp()}`, product_id: PRODUCT_ID }, payloads.customerAuth);
    seededIds.push(id);
    return [id, question];
}

/** Answer a seeded question as the vendor (product author); returns [answerId, answerText]. */
async function seedAnswer(questionId: string): Promise<[string, string]> {
    const [, answerId, answer] = await apiUtils.createProductQuestionAnswer({ ...payloads.createProductQuestionAnswer(), question_id: questionId }, payloads.vendorAuth);
    return [answerId, answer];
}

test.describe('Product Q&A (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The Q&A REST routes + the vendor route only register while the module is active.
        await apiUtils.activateModules(payloads.moduleIds.productQa, payloads.adminAuth);
    });

    test.afterAll(async () => {
        if (seededIds.length) {
            await apiUtils.put(endPoints.updateBatchProductQuestions, { data: { action: 'delete', ids: seededIds }, headers: payloads.adminAuth }).catch(() => undefined);
        }
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let qa: NewProductQaPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            qa = new NewProductQaPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view the Product Q&A list with status tabs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [, qText] = await seedQuestion('list');
            await qa.gotoList();
            expect(page.url(), 'on the Q&A route').toMatch(/#\/product-questions-answers/);
            expect(await qa.tabsVisible(), 'All / Answered / Unanswered tabs render').toBe(true);
            await expect(qa.rowsWithText(qText).first(), 'seeded question row is listed').toBeVisible({ timeout: 15000 });
            expect(await qa.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor can switch between Answered and Unanswered tabs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [, unansweredText] = await seedQuestion('unans');
            const [ansId, answeredText] = await seedQuestion('ans');
            await seedAnswer(ansId);

            await qa.gotoList();
            await qa.selectTab('answered');
            await expect(qa.rowsWithText(answeredText).first(), 'answered question on Answered tab').toBeVisible({ timeout: 15000 });
            expect(await qa.rowsWithText(unansweredText).count(), 'unanswered question absent from Answered tab').toBe(0);

            await qa.selectTab('unanswered');
            await expect(qa.rowsWithText(unansweredText).first(), 'unanswered question on Unanswered tab').toBeVisible({ timeout: 15000 });
            expect(await qa.rowsWithText(answeredText).count(), 'answered question absent from Unanswered tab').toBe(0);
        });

        test('vendor can open a question details view (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [id, qText] = await seedQuestion('detail');
            await qa.gotoList();
            await qa.openQuestionByText(qText);
            expect(page.url(), 'on the details route').toMatch(new RegExp(`#/product-questions-answers/${id}`));
            await expect(page.locator(newProductQaSelectors.questionDetailsCard).first(), '"Question Details" card renders').toBeVisible({ timeout: 15000 });
            await expect(qa.quillEditor, 'answer editor renders for an unanswered question').toBeVisible({ timeout: 15000 });
        });

        test('vendor can answer a question (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [id] = await seedQuestion('answer');
            const answerText = `PW answer ${stamp()}`;
            await qa.gotoDetails(id);
            await qa.answerQuestion(answerText);
            // Behavioral oracle: REST confirms the answer persisted on the question.
            const [, ticket] = await apiUtils.get(endPoints.getSingleProductQuestion(id), { headers: payloads.vendorAuth });
            const persisted = JSON.stringify(ticket?.answer ?? '');
            expect(persisted, 'answer persisted on the question (REST)').toContain(answerText);
            expect(await qa.isAnswered(), 'details view shows the answered state').toBe(true);
        });

        test('vendor can edit an answer (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [id] = await seedQuestion('edit');
            await seedAnswer(id);
            const updated = `PW edited ${stamp()}`;
            await qa.gotoDetails(id);
            await qa.editAnswer(updated);
            const [, ticket] = await apiUtils.get(endPoints.getSingleProductQuestion(id), { headers: payloads.vendorAuth });
            expect(JSON.stringify(ticket?.answer ?? ''), 'edited answer text persisted (REST)').toContain(updated);
        });

        test('vendor can delete an answer (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [id] = await seedQuestion('delans');
            await seedAnswer(id);
            await qa.gotoDetails(id);
            await qa.deleteAnswer();
            // Oracle: the question no longer carries answer CONTENT. The API models
            // "no answer" as an empty stub ({ id: 0, answer: '', user: 'Deleted User' }),
            // not an absent field — so check the content/id, not object presence.
            const [, ticket] = await apiUtils.get(endPoints.getSingleProductQuestion(id), { headers: payloads.vendorAuth });
            const ans = ticket?.answer;
            const answerContent = ans && typeof ans === 'object' ? String(ans.answer ?? '').trim() : String(ans ?? '').trim();
            const answerId = ans && typeof ans === 'object' ? Number(ans.id ?? 0) : 0;
            expect(answerContent === '' || answerId === 0, 'answer content removed from the question (REST)').toBe(true);
        });

        test('vendor can delete a question from the details view (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [id, qText] = await seedQuestion('delqdetail');
            await qa.gotoDetails(id);
            await qa.deleteQuestionFromDetails();
            // SPA navigates back to the list; the question is gone (REST 404/empty).
            // Pass assert=false so a 4xx doesn't throw inside apiUtils.get.
            const [res] = await apiUtils.get(endPoints.getSingleProductQuestion(id), { headers: payloads.vendorAuth }, false);
            expect(res.status(), 'deleted question no longer resolves (REST)').toBeGreaterThanOrEqual(400);
            await qa.gotoList();
            expect(await qa.rowsWithText(qText).count(), 'deleted question row is gone from the list').toBe(0);
        });

        test('vendor can delete a question from the list row action (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            const [id, qText] = await seedQuestion('delqrow');
            await qa.gotoList();
            await qa.deleteQuestionFromRow(qText);
            const [res] = await apiUtils.get(endPoints.getSingleProductQuestion(id), { headers: payloads.vendorAuth }, false);
            expect(res.status(), 'row-deleted question no longer resolves (REST)').toBeGreaterThanOrEqual(400);
        });

        test('HashRouter survives a reload on the Q&A list (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await qa.gotoList();
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator(newProductQaSelectors.reactRoot).waitFor({ state: 'visible', timeout: 30000 });
            expect(page.url(), 'reload keeps the #/product-questions-answers route').toMatch(/#\/product-questions-answers/);
            expect(await qa.tabsVisible(), 'tabs re-render after reload').toBe(true);
            expect(await qa.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('business flow', () => {
        test('customer asks (REST) then vendor answers (React) and it persists (REST)', { tag: ['@pro', '@vendor', '@customer', '@new-ui'] }, async ({ browser }) => {
            const [id] = await seedQuestion('flow');
            const answerText = `PW flow answer ${stamp()}`;

            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const qa = new NewProductQaPage(page);
            try {
                await qa.gotoDetails(id);
                await qa.answerQuestion(answerText);
                const [, ticket] = await apiUtils.get(endPoints.getSingleProductQuestion(id), { headers: payloads.vendorAuth });
                expect(JSON.stringify(ticket?.answer ?? ''), 'vendor answer to the customer question persisted (REST)').toContain(answerText);
            } finally {
                await page.close();
                await ctx.close();
            }
        });
    });
});
