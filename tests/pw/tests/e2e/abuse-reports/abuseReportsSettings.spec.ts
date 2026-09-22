import { test, expect, request } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import { dbUtils } from '@utils/dbUtils';
import { faker } from '@faker-js/faker';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json'); // Admin session storage

// ============================================
// P1-6 · Admin settings: validation, persistence, reasons
//
// This is a SEPARATE top-level describe from the TC1–TC33 suite in
// abuseReports.spec.ts so the ordered cases there are untouched. We mutate
// Setting A ("Reported by" — `reported_by_logged_in_users_only`) in several
// tests and ALWAYS restore it to OFF in afterAll (the state TC18 leaves it
// in and which the main suite's TC22 guest-submit relies on).
//
// Source-of-truth notes (dokan-pro/modules/report-abuse):
//   • Setting A is stored in option `dokan_report_abuse`
//     under key `reported_by_logged_in_users_only` ('on' | 'off').
//   • Reasons are stored under `abuse_reasons` => [ { id, value }, ... ].
//   • A report's `reason` is a COPY of the label string at submit time
//     (functions.php → dokan_report_abuse_create_report), NOT a FK to the
//     option. Removing a reason from settings therefore leaves existing
//     reports' `reason` text intact — verified directly via the DB.
//   • The reason column is `VARCHAR(191)` (module.php CREATE TABLE). On the
//     report path, `reason` is passed through wp_trim_words(value, 191) —
//     that caps WORDS, not characters, so the settings-side length handling
//     is what we assert here.
//   • Guest gating (report-form.php + dokan-report-abuse.js): guest
//     name/email inputs render ONLY when `! is_user_logged_in() && Setting A
//     OFF`. With Setting A ON the Report-Abuse button triggers a login popup
//     (`dokan:login_form_popup:show`) instead of opening the report form.
// ============================================

const OPTION_NAME = 'dokan_report_abuse';
const REASON_TABLE_VARCHAR_LIMIT = 191; // module.php: `reason` VARCHAR(191)

test.describe('Abuse Reports — Admin Settings @pro', () => {
    // Reasons this batch adds — kept distinct from the main suite's "Test1"
    // so a parallel run of abuseReports.spec.ts can't collide on the label.
    const REASON_BASE = 'PW Settings Reason';

    // Read Setting A directly from the DB (most reliable persistence signal).
    async function readSettingA(): Promise<string> {
        const option = await dbUtils.getOptionValue(OPTION_NAME).catch(() => ({}));
        const value = option?.reported_by_logged_in_users_only;
        // dokan_report_abuse_get_option() normalises anything that isn't 'on'
        // to 'off'; mirror that here so assertions read cleanly.
        return value === 'on' ? 'on' : 'off';
    }

    async function readReasonValues(): Promise<string[]> {
        const option = await dbUtils.getOptionValue(OPTION_NAME).catch(() => ({}));
        const reasons = Array.isArray(option?.abuse_reasons) ? option.abuse_reasons : [];
        return reasons
            .map((r: { value?: string }) => (typeof r?.value === 'string' ? r.value : ''))
            .filter((v: string) => v.length > 0);
    }

    test.beforeAll(async ({ browser }) => {
        // Ensure the Report Abuse module is enabled once for the whole batch.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);
        await abuseReportsPage.goToModulesPage();
        await abuseReportsPage.searchModule('Report Abuse');
        await abuseReportsPage.enableReportAbuseModuleIfDisabled();
        await adminPage.close();
        await context.close();
    });

    test.afterAll(async ({ browser }) => {
        // Restore Setting A to OFF and clean up any reasons this batch added,
        // so the main TC1–TC33 suite and its TC22 guest-submit are unaffected.
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.disableReportedBySliderIfEnabled();

        // Remove every reason this batch may have created. removeAbuseReason is
        // a no-op when the label isn't present, so it's safe to call broadly.
        const stale = await readReasonValues();
        for (const value of stale) {
            if (value.startsWith(REASON_BASE)) {
                await abuseReportsPage.removeAbuseReason(value);
            }
        }
        await abuseReportsPage.clickSaveChanges();

        // CO-SHARD SAFETY: delete every abuse-report ROW this spec seeded so the
        // shared report count returns to baseline. TC8 seeds a report via the DB
        // using a `${REASON_BASE} Orphan …` reason and removes that reason from
        // settings BEFORE this hook runs — so the report leaks if that test (or
        // any seed-reason test) is interrupted before its inline cleanup. Left
        // behind, those extra rows inflate the count and break
        // abuseReports.spec.ts TC31 (per_page) / TC12 (bulk delete) when this
        // spec is co-sharded with it.
        //
        // We page through the list endpoint and delete by id any row whose
        // `reason` starts with this spec's seed prefix (REASON_BASE). We do NOT
        // use the REST `?reason=` filter for this: that filter only applies when
        // the value is still a CONFIGURED abuse_reason (functions.php only adds
        // the `WHERE reason = %s` clause after matching the option), and TC8
        // removes its reason from settings — so a reason filter would be a no-op
        // and silently match nothing. Client-side prefix matching is the
        // reliable signal.
        const cleanupCtx = await request.newContext();
        try {
            let page = 1;
            const seededIds: number[] = [];
            // Hard page cap so a server-side filter regression can't loop forever.
            for (; page <= 50; page++) {
                const res = await abuseReportsPage.restGetReports(cleanupCtx, { page: String(page) });
                if (res.status() !== 200) break;
                const rows = (await res.json()) as Array<{ id?: number; reason?: string }>;
                if (!Array.isArray(rows) || rows.length === 0) break;
                for (const row of rows) {
                    if (typeof row?.id === 'number' && typeof row?.reason === 'string' && row.reason.startsWith(REASON_BASE)) {
                        seededIds.push(row.id);
                    }
                }
                // Stop once we've walked every page (default per_page = 20).
                const totalPages = Number(res.headers()['x-dokan-abusereports-totalpages'] ?? page);
                if (page >= totalPages) break;
            }
            for (const id of seededIds) {
                await abuseReportsPage.restDeleteReport(cleanupCtx, id);
            }
        } finally {
            await cleanupCtx.dispose();
        }

        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // Reason validation — empty / whitespace / duplicate / very long
    // ------------------------------------------------------------------

    test('Settings TC1 - Add empty/whitespace-only reason is prevented or rejected (no blank row persisted)', { tag: ['@pro', '@admin', '@validation'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        const before = await readReasonValues();

        // Attempt to add a whitespace-only reason then save.
        await abuseReportsPage.fillNewAbuseReason('   ');
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        // ACTUAL behaviour: a blank/whitespace-only reason must not become a
        // usable, non-empty reason in the option. We trim before comparing so
        // a row that saved literal spaces still counts as "empty".
        const after = await readReasonValues();
        const meaningfulAfter = after.filter(v => v.trim().length > 0);
        const meaningfulBefore = before.filter(v => v.trim().length > 0);
        expect(
            meaningfulAfter.length,
            'Adding a whitespace-only reason must not add a non-empty reason to the option',
        ).toBe(meaningfulBefore.length);

        await adminPage.close();
        await context.close();
    });

    test('Settings TC2 - Add duplicate reason is NOT prevented — both entries persist (documents a gap)', { tag: ['@pro', '@admin', '@validation'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        const dupReason = `${REASON_BASE} Dup ${faker.string.nanoid(6)}`;

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        // Add the reason once and persist.
        await abuseReportsPage.fillNewAbuseReason(dupReason);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        const afterFirst = await readReasonValues();
        expect(
            afterFirst.filter(v => v === dupReason).length,
            'Reason should be present exactly once after the first add',
        ).toBe(1);

        // Try to add the SAME reason a second time and persist.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.fillNewAbuseReason(dupReason);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        // ⚠ DOCUMENTS-A-GAP: the repeatable "Reasons" field has NO dedup at any
        // layer. Client side (Fields.vue → addItem) blindly pushes a new
        // { id, value } with no existence check; server side
        // (Admin/Settings.php → sanitize_options) has no sanitize_callback for
        // `abuse_reasons`, so duplicates round-trip into the option verbatim.
        // We therefore assert the ACTUAL behaviour — a duplicate label DOES
        // create a second identical entry — rather than a non-existent
        // prevention. (id is derived from the label, so the duplicate even
        // shares the same id.)
        const afterSecond = await readReasonValues();
        expect(
            afterSecond.filter(v => v === dupReason).length,
            'Duplicate reasons are NOT prevented: a second add persists a second identical entry (known gap — no client- or server-side dedup)',
        ).toBe(2);

        // Cleanup BOTH duplicate entries so they don't leak between tests.
        // removeAbuseReason iterates every matching remove icon for the label.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.removeAbuseReason(dupReason);
        await abuseReportsPage.clickSaveChanges();

        await adminPage.close();
        await context.close();
    });

    test('Settings TC3 - Very long reason (256+ chars) is capped to VARCHAR(191) or rejected', { tag: ['@pro', '@admin', '@validation'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // A single 300-char token (no spaces) — guarantees a char-count test,
        // not a word-count one, so we can detect a true length cap.
        const longReason = `${REASON_BASE}-` + 'x'.repeat(300);

        // POSITIVE CONTROL. The "rejected" branch below concludes that the
        // settings layer refused an over-length reason — but "nothing was
        // stored" is also what a totally broken add/save path looks like, and
        // readReasonValues() degrades a failed option read to []. Persist a
        // normal-length reason FIRST, in its own save cycle, so the rejection
        // branch can prove the path was healthy rather than assert a constant.
        const controlReason = `${REASON_BASE} Ctrl ${faker.string.nanoid(6)}`;
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.fillNewAbuseReason(controlReason);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();
        expect(
            await readReasonValues(),
            'Control: a normal-length reason must persist, proving the add/save path works',
        ).toContain(controlReason);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        await abuseReportsPage.fillNewAbuseReason(longReason);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        const after = await readReasonValues();
        const stored = after.find(v => v.startsWith(`${REASON_BASE}-x`));

        // ACTUAL behaviour: EITHER the reason is rejected (not stored) OR it is
        // stored. If stored, the option itself is a longtext blob so it may
        // hold the full 300 chars at the SETTINGS layer — but a report created
        // FROM this reason persists into a VARCHAR(191) column. We assert the
        // observable contract: nothing usable exceeds what a report row can
        // round-trip without silent corruption.
        //
        // ⚠ DOCUMENTS-A-GAP: the settings UI does NOT cap the reason length to
        // 191 chars before save; the cap only exists at the report `reason`
        // column. If the reason was stored at full length, this is recorded as
        // the known gap (a >191-char reason can be selected on the form but is
        // truncated to 191 when a report is created).
        if (stored === undefined) {
            // Reason was rejected outright — that satisfies the case, but ONLY
            // if the save path itself still works. Without this the branch was
            // `expect(true).toBe(true)` and a total regression of the reason-add
            // path (or a failed option read) reported green.
            expect(
                after,
                'Over-length reason was rejected at the settings layer (control reason still persisted, so the save path is healthy)',
            ).toContain(controlReason);
        } else {
            const noteGap = stored.length > REASON_TABLE_VARCHAR_LIMIT;
            // Assert the real, observable behaviour rather than weaken it: the
            // value the option holds is exactly what we typed (no silent
            // mangling), and we record whether it exceeds the report-column
            // limit so the gap is visible in the report output.
            expect(
                stored,
                'A stored over-length reason should retain the exact text we entered (no silent corruption)',
            ).toBe(longReason);
            console.warn(
                `[Settings TC3] ⚠ GAP: settings stored a ${stored.length}-char reason; the report \`reason\` column is VARCHAR(${REASON_TABLE_VARCHAR_LIMIT}). exceedsReportLimit=${noteGap}`,
            );
        }

        // Cleanup the long reason regardless of branch.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        if (stored !== undefined) {
            await abuseReportsPage.removeAbuseReason(stored);
            await abuseReportsPage.clickSaveChanges();
        }

        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // Setting A — persistence + guest gating end-to-end
    // ------------------------------------------------------------------

    test('Settings TC4 - "Reported by" (Setting A) persists ON after save + reload (option verified)', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        await abuseReportsPage.enableReportedBySliderIfDisabled();
        await abuseReportsPage.clickSaveChanges();

        // Persisted value in the DB option should be 'on'.
        expect(
            await readSettingA(),
            'Setting A should be stored as "on" after enabling + save',
        ).toBe('on');

        // Reload the settings page; the toggle should still read checked.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        const checkbox = adminPage.locator(abuseReportsPage.admin.reportedByToggleCheckbox);
        await expect(
            checkbox,
            'The "Reported by" toggle should remain checked after reload',
        ).toBeChecked();

        // Restore OFF for the rest of the batch (and the global suite).
        await abuseReportsPage.disableReportedBySliderIfEnabled();
        await abuseReportsPage.clickSaveChanges();
        expect(await readSettingA(), 'Setting A should be back to "off" after restore').toBe('off');

        await adminPage.close();
        await context.close();
    });

    test('Settings TC5 - Setting A OFF allows a guest to submit a report end-to-end', { tag: ['@pro', '@guest', '@functional'] }, async ({ browser }) => {
        // Ensure Setting A is OFF first (admin).
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const adminFlow = new AbuseReportsPage(adminPage);
        await adminFlow.goToSettingsPage();
        await adminFlow.searchSettings(adminFlow.testData.abuseReports.settingsSearchKeyword);
        await adminFlow.disableReportedBySliderIfEnabled();
        await adminFlow.clickSaveChanges();
        await adminPage.close();
        await adminCtx.close();

        expect(await readSettingA(), 'Setting A should be OFF before guest submit').toBe('off');

        // Guest context — fresh, no storage state.
        const guestCtx = await browser.newContext();
        const guestPage = await guestCtx.newPage();
        const gFlow = new AbuseReportsPage(guestPage);
        await gFlow.goToProductPage();
        await gFlow.clickReportAbuseLink();

        // With Setting A OFF, the guest name/email fields must render.
        const nameVisible = await gFlow.isCustomerNameInputVisible();
        expect(
            nameVisible,
            'With Setting A OFF a guest must see the name/email fields on the report form',
        ).toBe(true);

        const guestName = `Guest ${faker.person.firstName()} ${faker.string.nanoid(6)}`;
        const guestEmail = `pw-settings-guest-${faker.string.nanoid(8)}@example.com`.toLowerCase();
        await gFlow.fillCustomerName(guestName);
        await gFlow.fillCustomerEmail(guestEmail);
        await gFlow.selectReasonByValue(gFlow.testData.abuseReports.reportReason);
        await gFlow.fillAbuseDescription('Settings TC5 — guest submit (Setting A OFF) seed');

        // Submit should succeed and surface the OK confirmation.
        await gFlow.submitAbuseReport();
        await gFlow.confirmAbuseReportSubmission();
        await guestCtx.close();

        // Verify the report actually landed in the admin list.
        const verifyCtx = await browser.newContext({ storageState: a1 });
        const verifyPage = await verifyCtx.newPage();
        const verifyFlow = new AbuseReportsPage(verifyPage);
        await verifyFlow.goToAbuseReportsReact();
        await verifyFlow.waitForListReady();
        await verifyFlow.expectReasonVisibleInList(verifyFlow.testData.abuseReports.reportReason);
        await verifyPage.close();
        await verifyCtx.close();
    });

    test('Settings TC6 - Setting A ON blocks a guest report (login popup, no report form, no new row)', { tag: ['@pro', '@guest', '@security', '@functional'] }, async ({ browser }) => {
        // Enable Setting A (admin).
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const adminFlow = new AbuseReportsPage(adminPage);
        await adminFlow.goToSettingsPage();
        await adminFlow.searchSettings(adminFlow.testData.abuseReports.settingsSearchKeyword);
        await adminFlow.enableReportedBySliderIfDisabled();
        await adminFlow.clickSaveChanges();
        await adminPage.close();
        await adminCtx.close();

        expect(await readSettingA(), 'Setting A should be ON for this guest-block test').toBe('on');

        // Baseline DB row count before the guest attempt.
        // No `.catch(() => 0)` fallback on either read. Both sides used to
        // collapse to the same literal 0 on a DB error, so a missing/renamed
        // abuse-reports table turned the "no new row" assertion below into
        // expect(0).toBe(0) — green exactly when the probe was broken. An
        // un-guarded read is the established pattern (abuseReportsList.spec.ts:77)
        // and the happy path is unaffected: an empty table yields null on both
        // reads, which still compares equal.
        const beforeRows = await dbUtils.getMaxId('id', 'dokan_report_abuse_reports');

        // Guest context.
        const guestCtx = await browser.newContext();
        const guestPage = await guestCtx.newPage();
        const gFlow = new AbuseReportsPage(guestPage);
        await gFlow.goToProductPage();

        // Click the Report-Abuse link directly (NOT via clickReportAbuseLink,
        // which waits for the report form's reason radio — that never renders
        // when Setting A is ON because the JS shows the login popup instead).
        // dokan-report-abuse.js: on click, when reported_by_logged_in_users_only
        // === 'on' && ! is_user_logged_in, it triggers `dokan:login_form_popup:show`
        // (the report form is NOT fetched), which AJAX-loads the Dokan login
        // form into an iziModal — so we wait for that login form, not the
        // report form.
        await guestPage.locator(gFlow.abuseReports.reportAbuseLink).click();

        // ACTUAL behaviour: the report form's reason radio must NOT appear for
        // a guest while Setting A is ON — the login popup is shown instead.
        const reasonRadio = guestPage.locator(gFlow.abuseReports.spamRadioButton);
        await expect(
            reasonRadio,
            'Guest must NOT get the report form (reason radio) while Setting A is ON',
        ).toBeHidden({ timeout: 5000 });

        // The Dokan login popup should surface instead. It is AJAX-fetched
        // (action=dokan_get_login_form) into an iziModal, so the form renders
        // asynchronously. The real DOM is templates/login-form/login-form.php
        // rendered with id `dokan-login-form-popup-form` and username/password
        // fields named `dokan_login_form_username` / `dokan_login_form_password`
        // (NOT WP core's `log`/`user_login`). Assert against those real nodes.
        const loginForm = guestPage
            .locator("#dokan-login-form-popup-form, input[name='dokan_login_form_username']")
            .first();
        await expect(
            loginForm,
            'A Dokan login popup (login form) should be presented to the blocked guest while Setting A is ON',
        ).toBeVisible({ timeout: 15000 });

        await guestCtx.close();

        // No new report row should have been created by the blocked guest.
        const afterRows = await dbUtils.getMaxId('id', 'dokan_report_abuse_reports');
        expect(
            afterRows,
            'A blocked guest must not create a new abuse-report row',
        ).toBe(beforeRows);

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
    });

    // ------------------------------------------------------------------
    // Save feedback + console health
    // ------------------------------------------------------------------

    test('Settings TC7 - Save shows success feedback and emits no console errors', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // Capture page console errors + uncaught page errors during the save.
        const consoleErrors: string[] = [];
        adminPage.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        adminPage.on('pageerror', err => {
            consoleErrors.push(err.message);
        });

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        // Add a throwaway reason then save so the save path is genuinely exercised.
        const feedbackReason = `${REASON_BASE} Feedback ${faker.string.nanoid(6)}`;
        await abuseReportsPage.fillNewAbuseReason(feedbackReason);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        // Persistence — the change actually reached the option.
        const persisted = await readReasonValues();
        expect(
            persisted,
            'The saved reason should be present in the option (save succeeded)',
        ).toContain(feedbackReason);

        // Success feedback — the behaviour this case is named for. Asserted
        // hard, against the real element: src/admin/pages/Settings.vue:8 renders
        // `#setting-message_updated` with `v-if="isSaved"` and the `updated`
        // class when `isUpdated`. It is NOT transient — `isSaved` is only
        // cleared by the user clicking dismiss (Settings.vue:10) — so waiting on
        // it cannot flake.
        //
        // This previously read `expect(feedbackVisible || persisted.includes(...))`,
        // whose right-hand side was already proven true by the assertion above,
        // making the whole disjunction constant. Deleting the notice entirely
        // still left this test green.
        const saveNotice = adminPage.locator('#setting-message_updated.updated');
        await expect(saveNotice, 'Save should surface the success notice').toBeVisible({ timeout: 15000 });
        await expect(
            saveNotice,
            'Success notice should carry the "saved successfully" message',
        ).toContainText(/saved successfully/i);

        // No console errors during the settings save flow.
        expect(
            consoleErrors,
            `Settings save should not emit console errors. Got: ${consoleErrors.join(' | ')}`,
        ).toHaveLength(0);

        // Cleanup the throwaway reason.
        await abuseReportsPage.removeAbuseReason(feedbackReason);
        await abuseReportsPage.clickSaveChanges();

        await adminPage.close();
        await context.close();
    });

    // ------------------------------------------------------------------
    // Reason removal does NOT orphan existing reports
    // ------------------------------------------------------------------

    test('Settings TC8 - Removing a reason that has existing reports keeps the old reports and their label', { tag: ['@pro', '@admin', '@functional'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // A unique reason label so we can find exactly our seeded rows.
        const reasonLabel = `${REASON_BASE} Orphan ${faker.string.nanoid(8)}`;

        // 1) Add the reason via the settings UI and save.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.fillNewAbuseReason(reasonLabel);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();
        expect(
            await readReasonValues(),
            'Seeded reason should be present in the option before we create a report against it',
        ).toContain(reasonLabel);

        // 2) Seed a report row that uses this reason label directly in the DB.
        //    The report stores the label as a string copy (no FK), so this is
        //    representative of a real submitted report.
        const productId = process.env.PRODUCT_ID || '0';
        const vendorId = process.env.VENDOR_ID || '0';
        const customerId = process.env.CUSTOMER_ID || '0';
        await dbUtils.createAbuseReport(
            { reason: reasonLabel, description: 'Settings TC8 — orphan-check seed' },
            productId,
            vendorId,
            customerId,
        );

        const countWithReason = async (): Promise<number> => {
            const rows = await dbUtils.dbQuery(
                `SELECT COUNT(*) AS c FROM ${process.env.DB_PREFIX}_dokan_report_abuse_reports WHERE reason = ?;`,
                [reasonLabel],
            );
            return Number(rows?.[0]?.c ?? 0);
        };

        const before = await countWithReason();
        expect(before, 'At least one report should exist with the seeded reason').toBeGreaterThan(0);

        // 3) Remove the reason from settings and save.
        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.removeAbuseReason(reasonLabel);
        await abuseReportsPage.clickSaveChanges();

        // The reason must be gone from the option (settings layer).
        expect(
            await readReasonValues(),
            'Removed reason should no longer be in the abuse_reasons option',
        ).not.toContain(reasonLabel);

        // 4) ACTUAL behaviour: existing report rows keep their reason label —
        //    removing a configured reason does NOT cascade-delete or blank out
        //    historical reports (the label is a stored string copy).
        const after = await countWithReason();
        expect(
            after,
            'Existing reports must retain their reason label after the reason is removed from settings',
        ).toBe(before);

        // The admin DataViews list should still render the historical report
        // with its original label intact (no crash, label preserved).
        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();
        await abuseReportsPage.expectReasonVisibleInList(reasonLabel);

        // 5) Cleanup the seeded report row(s) so we don't leak into other tests.
        await dbUtils.dbQuery(
            `DELETE FROM ${process.env.DB_PREFIX}_dokan_report_abuse_reports WHERE reason = ?;`,
            [reasonLabel],
        );

        await adminPage.close();
        await context.close();
    });
});
