import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA — Admin Setup Guide wizard (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/setup
//
// ADMIN-ONLY area. There is NO vendor/customer precondition: the wizard reads
// admin marketplace settings (dokan_selling / dokan_withdraw / dokan_appearance)
// and per-step completion options (dokan_admin_onboarding_setup_step_{id}_completed).
// All seeded names are namespaced with the "ASG" prefix per the task contract.
//
// SELECTORS verified against src/admin/dashboard/pages/setup-guide/:
//   - StepComponent.tsx  -> "Setup Guide" h3 + <ol> stepper (step titles in <h4>)
//   - StepSettings.tsx   -> Next/Back/Skip buttons, "Saving…" in-flight label,
//                            "Failed to load settings" + "Retry Loading" error UI
//   - CompletedStep.tsx  -> "Your Marketplace is  ready to explore" (literal double
//                            space in source), "N of N tasks completed",
//                            "Visit Dokan Dashboard" link
//   - Fields/RadioBox.tsx (radio_box) -> SelectorCard <button> per option
//   - Fields/Radio.tsx (radio)        -> <button aria-pressed> per option
//   - Fields/Select.tsx (select)      -> @getdokan/dokan-ui FormSelect
//   - Fields/Currency.tsx (currency)  -> <input id="withdraw_limit"> + "Invalid value"
//
// The 4 Lite steps (priority order): Basic (10, NOT skippable), Commission (20),
// Withdraw (30), Appearance (40). No Pro plugin injects extra steps.
// ============================================
export const adminSetupGuideData = {
    // Step identity (id + visible title) in priority order.
    steps: [
        { id: 'basic', title: 'Basic', skippable: false },
        { id: 'commission', title: 'Commission', skippable: true },
        { id: 'withdraw', title: 'Withdraw', skippable: true },
        { id: 'appearance', title: 'Appearance', skippable: true },
    ],

    // Per-step completion options. Falsy => step renders as pending; the wizard
    // lands on the first uncompleted step. Naming = storage_key + '_completed'
    // (AbstractStep::is_completed). Reset these before tests for a deterministic
    // "fresh wizard at Basic" state.
    completionOptions: ['dokan_admin_onboarding_setup_step_basic_completed', 'dokan_admin_onboarding_setup_step_commission_completed', 'dokan_admin_onboarding_setup_step_withdraw_completed', 'dokan_admin_onboarding_setup_step_appearance_completed'],

    // Option that backs the Basic + Commission steps.
    sellingOption: 'dokan_selling',

    // REST base used by the wizard for each step + the completion endpoint.
    restStepPath: (id: string) => `/dokan/v1/admin/setup-guide/${id}`,

    // A namespaced sentinel value we save into the Basic radio_box to prove
    // persistence survives reload. radio_box option values are admin|seller.
    basic: {
        recipientField: 'Shipping Fee Recipient',
        recipientValue: 'Admin', // visible SelectorCard label -> persists 'admin'
        persistedKey: 'shipping_fee_recipient',
        persistedValue: 'admin',
    },
} as const;

// ============================================
// SELECTORS
// ============================================
export const adminSetupGuideSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    // StepComponent left panel heading.
    stepperHeading: 'text="Setup Guide"',
    // Stepper list + items (StepComponent renders <ol> -> <li><h4>title</h4>).
    stepperList: 'ol',
    stepTitle: 'ol li h4',
    // Error / loading states.
    failedToLoad: 'text=/Failed to load settings/i',
    retryButton: 'role=button[name="Retry Loading"]',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Permission wall for non-admins (the React root never mounts for them).
    permissionDenied: 'text=/you are not allowed|do not have permission|cheatin/i',
} as const;

// ============================================
// PAGE OBJECT — Admin Setup Guide wizard
// Surface: wp-admin/admin.php?page=dokan-dashboard#/setup (HashRouter).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in wp-admin,
// so this page object deliberately does NOT register the closeAnnouncementModal
// handler (a generic role=dialog handler would race the wizard's own states).
// ============================================
export class AdminSetupGuidePage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/setup');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminSetupGuideSelectors.reactRoot).first();
    }

    get stepperHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Setup Guide' }).first();
    }

    get stepTitles(): Locator {
        return this.page.locator(adminSetupGuideSelectors.stepTitle);
    }

    get nextButton(): Locator {
        // Label is "Next" or "Saving…" while a save is in flight.
        return this.page.getByRole('button', { name: /^(Next|Saving)/ }).first();
    }

    get backButton(): Locator {
        return this.page.getByRole('button', { name: 'Back', exact: true }).first();
    }

    get skipButton(): Locator {
        return this.page.getByRole('button', { name: 'Skip', exact: true }).first();
    }

    get retryButton(): Locator {
        return this.page.getByRole('button', { name: 'Retry Loading' }).first();
    }

    get failedToLoad(): Locator {
        return this.page.locator(adminSetupGuideSelectors.failedToLoad).first();
    }

    get completedHeading(): Locator {
        // CompletedStep source has a literal double space; match loosely.
        return this.page.getByText(/Your Marketplace is\s+ready to explore/i).first();
    }

    get visitDashboardButton(): Locator {
        return this.page.getByRole('link', { name: 'Visit Dokan Dashboard' }).first();
    }

    /** A stepper item by its visible title (Basic / Commission / Withdraw / Appearance). */
    stepTitle(name: string): Locator {
        return this.page.locator(adminSetupGuideSelectors.stepTitle, { hasText: new RegExp(`^${escapeRegExp(name)}$`) }).first();
    }

    /** A radio_box (SelectorCard) option button by its visible label, e.g. Admin / Vendor. */
    selectorCard(label: string): Locator {
        return this.page.getByRole('button', { name: new RegExp(`^${escapeRegExp(label)}$`) }).first();
    }

    /** A radio (segmented) option button by visible label, e.g. Show / Hide. */
    radioOption(label: string): Locator {
        return this.page.getByRole('button', { name: label, exact: true }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root is visible AND either the stepper heading or the
     * first step body has painted (or the completed screen, if all steps done). */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 20000) {
            if (await this.stepperHeading.isVisible().catch(() => false)) return;
            if (await this.completedHeading.isVisible().catch(() => false)) return;
            if (await this.failedToLoad.isVisible().catch(() => false)) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminSetupGuideSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    /** Visible stepper titles in DOM (priority) order. */
    async getStepTitles(): Promise<string[]> {
        await this.stepperHeading.waitFor({ state: 'visible', timeout: 15000 });
        return (await this.stepTitles.allInnerTexts()).map(t => t.trim()).filter(Boolean);
    }

    /** The title of the currently-active step — its <h4> is coloured purple
     * (#7047EB). We read it by the inline style/class the active item carries. */
    async getActiveStepTitle(): Promise<string> {
        const active = this.page.locator('ol li h4.text-\\[\\#7047EB\\]').first();
        await active.waitFor({ state: 'visible', timeout: 15000 });
        return (await active.innerText()).trim();
    }

    /** True when a field with the given title is currently rendered in the body.
     * Two gotchas handled here:
     *  - Field titles render as <h2><div>{title}</div></h2> — the nested <div>
     *    defeats getByRole('heading', { name }) accessible-name matching, so we
     *    match the visible text directly.
     *  - The step body loads via a REST GET that resolves AFTER the stepper
     *    paints, so we must WAIT for the field. locator.isVisible() does NOT
     *    retry (it ignores its timeout and snapshots the current state), which
     *    is why a plain isVisible() loses the REST-load race; waitFor() retries. */
    async isFieldVisible(title: string): Promise<boolean> {
        const field = this.page.getByText(new RegExp('^\\s*' + escapeRegExp(title) + '\\s*$', 'i')).first();
        try {
            await field.waitFor({ state: 'visible', timeout: 12000 });
            return true;
        } catch {
            return false;
        }
    }

    // ---- Field interactions ----
    /** Pick a radio_box (SelectorCard) option by label, e.g. selectRadioBox('Admin'). */
    async selectRadioBox(label: string): Promise<void> {
        const card = this.selectorCard(label);
        await card.waitFor({ state: 'visible', timeout: 10000 });
        await card.click();
    }

    /** Pick a radio (segmented button) option by label, e.g. selectRadio('Show'). */
    async selectRadio(label: string): Promise<void> {
        const opt = this.radioOption(label);
        await opt.waitFor({ state: 'visible', timeout: 10000 });
        await opt.click();
    }

    /** Choose a value in the Commission Type select dropdown. */
    async selectCommissionType(optionLabel: string): Promise<void> {
        // The Commission Type control is a dokan-ui/Radix Select rendered as a
        // <button role="combobox"> — NOT a native <select> nor an
        // #commission_type input. Click the trigger to open the portalled
        // listbox, then pick the option (role=option, portalled to <body>).
        // The commission step has exactly one combobox, so .first() is the
        // Commission Type trigger.
        const trigger = this.page.locator('button[role="combobox"]').first();
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        const option = this.page.getByRole('option', { name: optionLabel, exact: true }).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await this.page.waitForTimeout(500); // dependency engine re-evaluates show/hide.
    }

    /** Set the Minimum Withdraw Limit currency input. */
    async setWithdrawLimit(value: string): Promise<void> {
        const input = this.page.locator('input#withdraw_limit, input[name="withdraw_limit"]').first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(value);
        await input.blur();
    }

    /** True when the Currency field is showing its inline "Invalid value" error. */
    async hasCurrencyError(): Promise<boolean> {
        return await this.page
            .getByText('Invalid value', { exact: false })
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    // ---- Wizard navigation ----
    /** Click Next (saves the current step then advances). Waits for the save POST. */
    async clickNext(): Promise<void> {
        const btn = this.nextButton;
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
        // Allow the POST save + advance to settle.
        await this.page.waitForTimeout(1500);
    }

    /** Click Next AND capture the save request URL (asserts the right endpoint fired). */
    async clickNextAndCaptureSave(stepId: string): Promise<string> {
        const btn = this.nextButton;
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        const [req] = await Promise.all([this.page.waitForRequest(r => r.url().includes(`/dokan/v1/admin/setup-guide/${stepId}`) && r.method() === 'POST', { timeout: 15000 }), btn.click()]);
        await this.page.waitForTimeout(1200);
        return req.url();
    }

    async clickBack(): Promise<void> {
        const btn = this.backButton;
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.page.waitForTimeout(1000);
    }

    async clickSkip(): Promise<void> {
        const btn = this.skipButton;
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.page.waitForTimeout(1000);
    }

    async isBackVisible(): Promise<boolean> {
        return await this.backButton.isVisible({ timeout: 3000 }).catch(() => false);
    }

    async isSkipVisible(): Promise<boolean> {
        return await this.skipButton.isVisible({ timeout: 3000 }).catch(() => false);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Setup Guide UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const stepperVisible = await this.stepperHeading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !stepperVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
