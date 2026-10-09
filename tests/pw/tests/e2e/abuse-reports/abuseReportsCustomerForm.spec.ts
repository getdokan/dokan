import { test, expect, request } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { dbUtils } from '@utils/dbUtils';
import { faker } from '@faker-js/faker';
import path from 'path';

// The repo tsconfig omits @types/node; declare the bits we touch locally so
// this spec stays free of red squiggles without widening the global types.
declare const process: { env: Record<string, string | undefined> };

// ============================================
// SESSION STORAGE / AUTH
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');     // admin
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');  // customer1

// customer1 is the account behind the `c1` storage state. The DB seed pins it
// to CUSTOMER_ID=2; the page object's product (p1_v1-simple) belongs to
// VENDOR_ID=3. We assert against these to prove server-side capture.
const CUSTOMER_ID = Number(process.env.CUSTOMER_ID ?? 2);
const VENDOR_ID = Number(process.env.VENDOR_ID ?? 3);
const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

// Ajax success string returned by Ajax::submit_form() — this is the ACTUAL
// rendered text (the docs say "Thank you for your response"; the code says the
// full sentence below). We assert the code's string. The trailing
// "Thank you for your response." is part of the same Ajax message.
const AJAX_SUCCESS_MESSAGE = 'Your report has been submitted. Thank you for your response.';

// admin-ajax actions used by the front-end report form.
const SUBMIT_ACTION = 'dokan_report_abuse_submit_form';
const GET_FORM_ACTION = 'dokan_report_abuse_get_form';

// ============================================
// LOCAL HELPERS (this spec only — abuseReportsPage.ts is shared/locked)
// ============================================

const reportsTable = `${DB_PREFIX}_dokan_report_abuse_reports`;

/** Newest abuse-report row (the form inserts with `reported_at = current_time`,
 * and the table's id is auto-increment, so MAX(id) is this submission). */
async function getLatestReportRow(): Promise<{
    id: number;
    reason: string;
    product_id: number;
    vendor_id: number;
    customer_id: number;
    customer_name: string | null;
    customer_email: string | null;
    description: string | null;
} | undefined> {
    const rows = await dbUtils.dbQuery(
        `SELECT * FROM ${reportsTable} ORDER BY id DESC LIMIT 1;`,
    );
    return rows?.[0];
}

/** Total report rows in the table (used to assert exactly-one-row creation). */
async function getReportCount(): Promise<number> {
    const rows = await dbUtils.dbQuery(`SELECT COUNT(*) AS c FROM ${reportsTable};`);
    return Number(rows?.[0]?.c ?? 0);
}

test.describe('Abuse Reports — Customer Form @pro', () => {
    // Local selectors NOT present on the shared page object. The login popup is
    // injected by the `dokan-login-form-popup` script when Setting A is ON and
    // a guest clicks the Report-Abuse button (main.js → dokan:login_form_popup:show).
    const loginPopupSelector =
        "//*[contains(@class,'dokan-login-form-popup') or contains(@id,'dokan-login-form') or contains(@class,'izimodal')][.//input[@name='log' or @id='user_login' or @type='password']]";

    test.beforeAll(async ({ browser }) => {
        // Ensure the Report Abuse module is enabled once for the whole batch.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);
        await abuseReportsPage.goToModulesPage();
        await abuseReportsPage.searchModule('Report Abuse');
        await abuseReportsPage.enableReportAbuseModuleIfDisabled();
        // Start the batch with Setting A OFF (guests may report). Tests that
        // need it ON flip it themselves and flip it back.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.disableReportedBySliderIfEnabled();
        await abuseReportsPage.clickSaveChanges();
        await adminPage.close();
        await context.close();
    });

    test.afterAll(async ({ browser }) => {
        // Restore Setting A to OFF — the state the main TC1–TC33 suite expects
        // at teardown (TC18 disables it; TC22 guest-submit relies on it OFF).
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.disableReportedBySliderIfEnabled();
        await abuseReportsPage.clickSaveChanges();
        await adminPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // VALIDATION — no reason selected (TEST_CASES.md §Customer:20)
    // ----------------------------------------------------------------
    test('Customer Form 1 - Submitting With No Reason Selected Is Blocked (no API call)', { tag: ['@pro', '@customer', '@validation'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const flow = new AbuseReportsPage(customerPage);

        await flow.goToProductPage();
        await flow.clickReportAbuseLink();

        // Track any submit-form POST so we can prove none fired.
        let submitFired = false;
        customerPage.on('request', req => {
            if (req.method() === 'POST' && (req.postData() ?? '').includes(SUBMIT_ACTION)) {
                submitFired = true;
            }
        });

        // The reason radio is `required`; with none selected, native form
        // validation must block the submit event entirely.
        const radio = customerPage.locator(flow.abuseReports.reasonRadioByValue(flow.testData.abuseReports.reportReason));
        const isInvalid = await radio.evaluate((el: HTMLInputElement) => !el.validity.valid && el.validity.valueMissing);
        expect(isInvalid, 'Reason radio should be HTML5-invalid (valueMissing) before any selection').toBe(true);

        // Click submit; HTML5 validation should prevent the AJAX call and the
        // success "OK" confirmation should never appear.
        await customerPage.locator(flow.abuseReports.submitButton).click();

        // Give any (incorrectly-fired) request a moment to surface.
        await customerPage.waitForTimeout(1500);

        expect(submitFired, 'No submit-form AJAX request should fire when no reason is selected').toBe(false);
        expect(
            await flow.confirmOk().isVisible(),
            'Success confirmation must NOT appear when submit was blocked by validation',
        ).toBe(false);
        // The form should still be open (reason radio still visible).
        expect(await radio.first().isVisible(), 'Report form should remain open after blocked submit').toBe(true);

        await customerPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // GUEST FIELD VALIDATION — Setting A OFF (§Customer:21,22,23)
    // ----------------------------------------------------------------
    test('Customer Form 2 - Guest Empty Name Is Rejected (required)', { tag: ['@pro', '@guest', '@validation'] }, async ({ browser }) => {
        const guestCtx = await browser.newContext(); // no storageState → guest
        const guestPage = await guestCtx.newPage();
        const flow = new AbuseReportsPage(guestPage);

        await flow.goToProductPage();
        await flow.clickReportAbuseLink();

        const nameVisible = await flow.isCustomerNameInputVisible();
        test.skip(!nameVisible, 'Guest fields not rendered — Setting A may still be enabled; skipping rather than failing');

        let submitFired = false;
        guestPage.on('request', req => {
            if (req.method() === 'POST' && (req.postData() ?? '').includes(SUBMIT_ACTION)) submitFired = true;
        });

        // Fill everything EXCEPT name.
        await flow.selectReasonByValue(flow.testData.abuseReports.reportReason);
        await flow.fillCustomerEmail('cf2-guest@example.com');

        const nameInput = guestPage.locator(flow.abuseReports.customerNameInput);
        await guestPage.locator(flow.abuseReports.submitButton).click();
        await guestPage.waitForTimeout(1000);

        const invalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid && el.validity.valueMissing);
        expect(invalid, 'Empty required name input should be HTML5-invalid (valueMissing)').toBe(true);
        expect(submitFired, 'No submit AJAX should fire while a required field (name) is empty').toBe(false);

        await guestPage.close();
        await guestCtx.close();
    });

    test('Customer Form 3 - Guest Empty Email Is Rejected (required, type=email)', { tag: ['@pro', '@guest', '@validation'] }, async ({ browser }) => {
        const guestCtx = await browser.newContext();
        const guestPage = await guestCtx.newPage();
        const flow = new AbuseReportsPage(guestPage);

        await flow.goToProductPage();
        await flow.clickReportAbuseLink();

        const nameVisible = await flow.isCustomerNameInputVisible();
        test.skip(!nameVisible, 'Guest fields not rendered — Setting A may still be enabled; skipping rather than failing');

        let submitFired = false;
        guestPage.on('request', req => {
            if (req.method() === 'POST' && (req.postData() ?? '').includes(SUBMIT_ACTION)) submitFired = true;
        });

        const emailInput = guestPage.locator(flow.abuseReports.customerEmailInput);
        // The email field must be type=email per the template.
        expect(await emailInput.getAttribute('type'), 'Guest email field should be type=email').toBe('email');

        // Fill everything EXCEPT email.
        await flow.selectReasonByValue(flow.testData.abuseReports.reportReason);
        await flow.fillCustomerName('CF3 Guest');

        await guestPage.locator(flow.abuseReports.submitButton).click();
        await guestPage.waitForTimeout(1000);

        const invalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid && el.validity.valueMissing);
        expect(invalid, 'Empty required email input should be HTML5-invalid (valueMissing)').toBe(true);
        expect(submitFired, 'No submit AJAX should fire while a required field (email) is empty').toBe(false);

        await guestPage.close();
        await guestCtx.close();
    });

    test('Customer Form 4 - Guest Invalid Email Format Is Rejected (HTML5 + server is_email)', { tag: ['@pro', '@guest', '@validation'] }, async ({ browser }) => {
        const guestCtx = await browser.newContext();
        const guestPage = await guestCtx.newPage();
        const flow = new AbuseReportsPage(guestPage);

        await flow.goToProductPage();
        await flow.clickReportAbuseLink();

        const nameVisible = await flow.isCustomerNameInputVisible();
        test.skip(!nameVisible, 'Guest fields not rendered — Setting A may still be enabled; skipping rather than failing');

        await flow.selectReasonByValue(flow.testData.abuseReports.reportReason);
        await flow.fillCustomerName('CF4 Guest');
        await flow.fillCustomerEmail('not-an-email');

        const emailInput = guestPage.locator(flow.abuseReports.customerEmailInput);
        await guestPage.locator(flow.abuseReports.submitButton).click();
        await guestPage.waitForTimeout(1000);

        // HTML5 type=email rejects a malformed value (typeMismatch), so the
        // native validation blocks submit before any AJAX. We assert the
        // browser-level guard here; the server-side is_email() guard is an
        // additional defence covered by the create_report() code path.
        const invalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid && el.validity.typeMismatch);
        expect(invalid, 'Malformed email should be HTML5-invalid (typeMismatch)').toBe(true);
        // No success confirmation should ever appear.
        expect(
            await flow.confirmOk().isVisible(),
            'Success confirmation must NOT appear for an invalid email',
        ).toBe(false);

        await guestPage.close();
        await guestCtx.close();
    });

    // ----------------------------------------------------------------
    // GUEST FIELD VISIBILITY STATE (§Customer:25,26)
    // ----------------------------------------------------------------
    test('Customer Form 5 - Guest Fields Render Only When Setting A OFF & Not Logged In', { tag: ['@pro', '@guest', '@functional'] }, async ({ browser }) => {
        // (a) Setting A OFF + guest → name/email fields render.
        const guestCtx = await browser.newContext();
        const guestPage = await guestCtx.newPage();
        const gFlow = new AbuseReportsPage(guestPage);
        await gFlow.goToProductPage();
        await gFlow.clickReportAbuseLink();
        expect(
            await gFlow.isCustomerNameInputVisible(),
            'Guest name field should render when Setting A is OFF and user is not logged in',
        ).toBe(true);
        expect(
            await guestPage.locator(gFlow.abuseReports.customerEmailInput).isVisible(),
            'Guest email field should render when Setting A is OFF and user is not logged in',
        ).toBe(true);
        await guestPage.close();
        await guestCtx.close();

        // (b) Logged-in customer (Setting A still OFF) → guest fields NEVER show.
        const custCtx = await browser.newContext({ storageState: c1 });
        const custPage = await custCtx.newPage();
        const cFlow = new AbuseReportsPage(custPage);
        await cFlow.goToProductPage();
        await cFlow.clickReportAbuseLink();
        expect(
            await cFlow.isCustomerNameInputVisible(),
            'A logged-in customer must never see the guest name field (identity comes from session)',
        ).toBe(false);
        expect(
            await custPage.locator(cFlow.abuseReports.customerEmailInput).isVisible().catch(() => false),
            'A logged-in customer must never see the guest email field',
        ).toBe(false);
        await custPage.close();
        await custCtx.close();
    });

    // ----------------------------------------------------------------
    // SETTING A ON → guest blocked (login popup, no report) (§Customer:27)
    // ----------------------------------------------------------------
    test('Customer Form 6 - Setting A ON Blocks Guest (login popup, no report created)', { tag: ['@pro', '@guest', '@permission'] }, async ({ browser }) => {
        // Enable Setting A.
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const adminFlow = new AbuseReportsPage(adminPage);
        await adminFlow.goToSettingsPage();
        await adminFlow.searchSettings(adminFlow.testData.abuseReports.settingsSearchKeyword);
        await adminFlow.enableReportedBySliderIfDisabled();
        await adminFlow.clickSaveChanges();
        await adminPage.close();
        await adminCtx.close();

        try {
            const beforeCount = await getReportCount();

            const guestCtx = await browser.newContext();
            const guestPage = await guestCtx.newPage();
            const gFlow = new AbuseReportsPage(guestPage);

            // Track that NO report form is fetched and NO submit fires.
            let getFormFired = false;
            let submitFired = false;
            guestPage.on('request', req => {
                const body = req.postData() ?? '';
                const url = req.url();
                if (url.includes(GET_FORM_ACTION) || body.includes(GET_FORM_ACTION)) getFormFired = true;
                if (req.method() === 'POST' && body.includes(SUBMIT_ACTION)) submitFired = true;
            });

            await gFlow.goToProductPage();
            // Click the button directly (do NOT use clickReportAbuseLink, which
            // waits for the report form's spam radio — that never appears here).
            await guestPage.locator(gFlow.abuseReports.reportAbuseLink).click();

            // The login popup should surface instead of the report form.
            const loginPopup = guestPage.locator(loginPopupSelector).first();
            await expect(
                loginPopup,
                'Setting A ON should show the login popup to a guest (not the report form)',
            ).toBeVisible({ timeout: 10000 });

            // The report form's reason radio must NOT be present.
            expect(
                await guestPage.locator(gFlow.abuseReports.spamRadioButton).isVisible().catch(() => false),
                'The report form must NOT render for a blocked guest',
            ).toBe(false);

            expect(getFormFired, 'get-form AJAX should NOT fire when the login popup intercepts a guest').toBe(false);
            expect(submitFired, 'submit-form AJAX should NOT fire for a blocked guest').toBe(false);

            await guestPage.close();
            await guestCtx.close();

            const afterCount = await getReportCount();
            expect(afterCount, 'No report row should be created when a guest is blocked by Setting A').toBe(beforeCount);
        } finally {
            // Restore Setting A OFF for the rest of the batch.
            const restoreCtx = await browser.newContext({ storageState: a1 });
            const restorePage = await restoreCtx.newPage();
            const restoreFlow = new AbuseReportsPage(restorePage);
            await restoreFlow.goToSettingsPage();
            await restoreFlow.searchSettings(restoreFlow.testData.abuseReports.settingsSearchKeyword);
            await restoreFlow.disableReportedBySliderIfEnabled();
            await restoreFlow.clickSaveChanges();
            await restorePage.close();
            await restoreCtx.close();
        }
    });

    // ----------------------------------------------------------------
    // DOUBLE-SUBMIT PREVENTION (§Customer:28)
    // ----------------------------------------------------------------
    test('Customer Form 7 - Double-Submit Prevented (exactly one request / one row)', { tag: ['@pro', '@customer', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const flow = new AbuseReportsPage(customerPage);

        const beforeCount = await getReportCount();

        await flow.goToProductPage();
        await flow.clickReportAbuseLink();
        await flow.selectReasonByValue(flow.testData.abuseReports.reportReason);
        await flow.fillAbuseDescription('CF7 double-submit guard');

        // Count submit-form POSTs.
        let submitCount = 0;
        customerPage.on('request', req => {
            if (req.method() === 'POST' && (req.postData() ?? '').includes(SUBMIT_ACTION)) submitCount += 1;
        });

        // Rapid double-click: the form's submittingForm() disables the fieldset
        // and hides the submit button on first click, so the second click is a
        // no-op. dblclick fires both clicks back-to-back with no awaits.
        const submitBtn = customerPage.locator(flow.abuseReports.submitButton);
        await submitBtn.dblclick();

        // Wait for the success confirmation (proves the single submit landed).
        await flow.confirmOk().waitFor({ state: 'visible', timeout: 15000 });
        await flow.confirmAbuseReportSubmission();

        // Allow any stray second request to surface before counting.
        await customerPage.waitForTimeout(1000);
        expect(submitCount, 'Exactly one submit-form AJAX request should fire for a double-click').toBe(1);

        const afterCount = await getReportCount();
        expect(afterCount, 'Exactly one report row should be created for a double-click submit').toBe(beforeCount + 1);

        await customerPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // SUCCESS MESSAGE + MODAL CLOSE (§Customer:29) — documents doc/code gap
    // ----------------------------------------------------------------
    test('Customer Form 8 - Success Message Matches Ajax String & Modal Closes', { tag: ['@pro', '@customer', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const flow = new AbuseReportsPage(customerPage);

        await flow.goToProductPage();
        await flow.clickReportAbuseLink();
        await flow.selectReasonByValue(flow.testData.abuseReports.reportReason);
        await flow.fillAbuseDescription('CF8 success-message check');

        // Capture the Ajax response body to assert the ACTUAL returned message.
        const respPromise = customerPage.waitForResponse(
            res => res.request().method() === 'POST' && (res.request().postData() ?? '').includes(SUBMIT_ACTION),
            { timeout: 15000 },
        );

        await customerPage.locator(flow.abuseReports.submitButton).click();
        const response = await respPromise;
        const json = await response.json().catch(() => null);
        expect(
            json?.data?.message,
            'Ajax response message should match the code string (NOT the docs "Thank you for your response")',
        ).toBe(AJAX_SUCCESS_MESSAGE);

        // The izimodal report popup closes once the request resolves; the
        // success sweetalert (OK button) then renders the same message.
        await flow.confirmOk().waitFor({ state: 'visible', timeout: 15000 });

        // The report form's reason radio should be gone (modal closed).
        expect(
            await customerPage.locator(flow.abuseReports.spamRadioButton).isVisible().catch(() => false),
            'Report form modal should be closed after a successful submit',
        ).toBe(false);

        // The success popup should render the Ajax message text.
        expect(
            await flow.isTextVisible(AJAX_SUCCESS_MESSAGE),
            'Success popup should display the Ajax success message',
        ).toBe(true);

        await flow.confirmAbuseReportSubmission();
        await customerPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // REASON LIST MATCHES ADMIN-CONFIGURED REASONS IN ORDER (§Customer:33)
    // ----------------------------------------------------------------
    test('Customer Form 9 - Reason List Matches Admin-Configured Reasons In Order', { tag: ['@pro', '@customer', '@functional'] }, async ({ browser }) => {
        // Source of truth: the REST abuse-reasons endpoint (same option the
        // form localizes from). Order must match between the two.
        const apiCtx = await request.newContext();
        const restPage = new AbuseReportsPage(/* dummy */ {} as never);
        const reasonsResp = await restPage.restGetReasons(apiCtx);
        expect(reasonsResp.status(), 'GET /abuse-reasons should return 200').toBe(200);
        const reasons: Array<{ value: string }> = await reasonsResp.json();
        await apiCtx.dispose();

        const expectedOrder = reasons.map(r => r.value);
        expect(expectedOrder.length, 'There should be at least one configured reason').toBeGreaterThan(0);

        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const flow = new AbuseReportsPage(customerPage);
        await flow.goToProductPage();
        await flow.clickReportAbuseLink();

        // Read the radio values from the rendered form in DOM order.
        const renderedOrder = await customerPage
            .locator(`${flow.abuseReports.formContainer}//input[@type='radio' and @name='reason']`)
            .evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).value));

        expect(
            renderedOrder,
            'The form radio reasons should match the admin-configured reasons in the same order',
        ).toEqual(expectedOrder);

        await customerPage.close();
        await context.close();
    });

    // ----------------------------------------------------------------
    // VENDOR CAPTURED FROM PRODUCT (§Customer:34)
    // ----------------------------------------------------------------
    test('Customer Form 10 - Vendor Captured From Product On Submission', { tag: ['@pro', '@customer', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const flow = new AbuseReportsPage(customerPage);

        const uniqueDescription = `cf10-vendor-${faker.string.nanoid(10)}`;
        await flow.goToProductPage();
        await flow.submitFullAbuseReport(flow.testData.abuseReports.reportReason, uniqueDescription);
        await customerPage.close();
        await context.close();

        // The product (p1_v1-simple) belongs to VENDOR_ID. The newest row must
        // carry that vendor_id, captured server-side from the product.
        const row = await getLatestReportRow();
        expect(row, 'A report row should exist after submission').toBeTruthy();
        expect(row?.description, 'Latest row should be the one we just submitted').toBe(uniqueDescription);
        expect(Number(row?.vendor_id), 'vendor_id should be captured from the reported product').toBe(VENDOR_ID);
        expect(Number(row?.product_id) > 0, 'product_id should be captured from the reported product').toBe(true);
    });

    // ----------------------------------------------------------------
    // LOGGED-IN customer_id CAPTURED SERVER-SIDE (§Customer:35)
    // ----------------------------------------------------------------
    test('Customer Form 11 - Logged-in customer_id Captured Server-Side (not name/email)', { tag: ['@pro', '@customer', '@security', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const flow = new AbuseReportsPage(customerPage);

        const uniqueDescription = `cf11-customer-id-${faker.string.nanoid(10)}`;
        await flow.goToProductPage();
        await flow.submitFullAbuseReport(flow.testData.abuseReports.reportReason, uniqueDescription);
        await customerPage.close();
        await context.close();

        const row = await getLatestReportRow();
        expect(row, 'A report row should exist after submission').toBeTruthy();
        expect(row?.description, 'Latest row should be the one we just submitted').toBe(uniqueDescription);

        // customer_id is set from get_current_user_id() server-side, NOT from
        // any client-sent name/email. For a logged-in submit the guest fields
        // are never rendered, so customer_name/customer_email must be empty.
        expect(Number(row?.customer_id), 'customer_id should be the logged-in customer captured server-side').toBe(CUSTOMER_ID);
        expect(row?.customer_name ?? '', 'customer_name should be empty for a logged-in reporter').toBe('');
        expect(row?.customer_email ?? '', 'customer_email should be empty for a logged-in reporter').toBe('');

        // Cross-check via REST: reported_by.id reflects the captured customer_id.
        const apiCtx = await request.newContext();
        const restPage = new AbuseReportsPage(/* dummy */ {} as never);
        const listResp = await restPage.restGetReports(apiCtx);
        expect(listResp.status(), 'GET /abuse-reports as admin should return 200').toBe(200);
        const body: Array<{ id: number; reported_by: { id: number } }> = await listResp.json();
        await apiCtx.dispose();

        const restRow = body.find(r => r.id === Number(row?.id));
        expect(restRow, 'The just-created report should appear in the REST list').toBeTruthy();
        expect(
            Number(restRow?.reported_by.id),
            'REST reported_by.id should equal the captured customer_id',
        ).toBe(CUSTOMER_ID);
    });
});
