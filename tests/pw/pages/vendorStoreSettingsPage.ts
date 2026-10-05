import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { data } from '@utils/testData';
import { closeAnnouncementModal, parseBoolean } from '@utils/helpers';

const migration = data.vendorStoreSettingsMigration;
const { urls, selectors } = migration;
const newUI = selectors.newUI;
const legacyUI = selectors.legacyUI;

// A standalone vice-versa field driven from the syncFields registry.
export interface SyncField {
    label: string;
    tab: string;
    section: string;
    gate: string;
    kind: 'text' | 'switch' | 'textarea' | 'richtext';
    id: string;
    legacy: string;
    legacyKind: 'text' | 'checkbox' | 'textarea' | 'tinymce';
    legacyEditor?: string;
    requires?: string;
    values?: { fromNew: string; fromLegacy: string; final: string };
}

const syncFieldById = (id: string): SyncField | undefined =>
    (migration.syncFields as unknown as SyncField[]).find(field => field.id === id);

/**
 * Vendor Store Settings migration page object.
 *
 * Drives both surfaces that persist to the same `dokan_profile_settings` meta —
 * the new React page (`dashboard/new/#settings/store`) and the legacy vendor
 * dashboard form (`dashboard/settings/store`) — and asserts every edit round-trips
 * either direction. Every read re-navigates so it reflects persisted state, never
 * stale in-memory React/DOM state, which is what makes the assertions a real
 * backend round-trip rather than a UI echo.
 */
export class VendorStoreSettingsPage extends BasePage {
    private originalValues: Record<string, unknown> | null = null;

    constructor(page: Page) {
        super(page);
        void closeAnnouncementModal(page);
    }

    // ---- New React page: navigation + primitives -----------------------------

    private async gotoNewPage(): Promise<void> {
        // A goto that only changes the #hash doesn't reload — force one so reads see persisted state.
        const onNewDashboard = this.page.url().includes('/dashboard/new/');
        await this.page.goto(urls.newStoreSettings, { waitUntil: 'domcontentloaded' });
        if (onNewDashboard) {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
        }
        await this.page.locator(newUI.panel).waitFor({ state: 'visible', timeout: 30000 });
    }

    // Client-side tab activation on an already-loaded page.
    private async activateTab(tab: string): Promise<void> {
        const tabButton = this.page.locator(newUI.tabButton(tab));
        await tabButton.waitFor({ state: 'visible', timeout: 15000 });
        if ((await tabButton.getAttribute('aria-selected')) !== 'true') {
            await tabButton.click();
        }
        await expect(tabButton).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
    }

    // Re-open the new page and activate a tab — the full reload is deliberate so reads see PERSISTED state.
    private async openNewTab(tab: string): Promise<void> {
        await this.gotoNewPage();
        await this.activateTab(tab);
    }

    // Open a field's tab and expand its (collapsible) section so the field is interactable.
    private async openNewSection(tab: string, section: string): Promise<void> {
        await this.openNewTab(tab);
        const content = this.page.locator(newUI.sectionContent(section));
        await content.waitFor({ state: 'attached', timeout: 15000 });
        if (await content.isVisible()) {
            return;
        }
        // The card header (a direct child of the card carrying aria-expanded) toggles it.
        await content.locator('xpath=../*[@aria-expanded]').first().click();
        await content.waitFor({ state: 'visible', timeout: 10000 });
    }

    private newControl(field: SyncField): Locator {
        switch (field.kind) {
            case 'switch':
                return this.page.locator(newUI.fieldSwitch(field.id)).first();
            case 'textarea':
                return this.page.locator(newUI.fieldTextarea(field.id)).first();
            case 'richtext':
                return this.page.locator(newUI.fieldRichText(field.id)).first();
            default:
                return this.page.locator(newUI.fieldInput(field.id)).first();
        }
    }

    // Persist any required parent switch, open the field's tab + section, and return
    // the field's control once it's visible and ready to read/write.
    private async revealNewControl(field: SyncField): Promise<Locator> {
        if (field.requires) {
            await this.ensureNewSwitchOn(field.requires);
        }
        await this.openNewSection(field.tab, field.section);
        const control = this.newControl(field);
        await control.waitFor({ state: 'visible', timeout: 15000 });
        return control;
    }

    private async getNewValue(field: SyncField): Promise<string> {
        const control = await this.revealNewControl(field);
        return field.kind === 'richtext' ? (await control.innerText()).trim() : (await control.inputValue()).trim();
    }

    private async setNewValue(field: SyncField, value: string): Promise<void> {
        const control = await this.revealNewControl(field);
        await control.fill(value);
        await this.saveNew();
    }

    private async isSwitchOn(toggle: Locator): Promise<boolean> {
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    // Shared primitive: flip a toggle to the target state (retrying missed clicks) and save.
    private async applySwitchState(toggle: Locator, enabled: boolean): Promise<void> {
        if ((await this.isSwitchOn(toggle)) === enabled) {
            return;
        }
        await expect(async () => {
            if ((await this.isSwitchOn(toggle)) !== enabled) {
                await toggle.click();
            }
            expect(await this.isSwitchOn(toggle)).toBe(enabled);
        }).toPass({ timeout: 10000 });
        await this.saveNew();
    }

    private async getNewSwitch(field: SyncField): Promise<boolean> {
        return this.isSwitchOn(await this.revealNewControl(field));
    }

    private async setNewSwitch(field: SyncField, enabled: boolean): Promise<void> {
        await this.applySwitchState(await this.revealNewControl(field), enabled);
    }

    // Persist a parent switch to on once (idempotent) so its dependent fields mount.
    private async ensureNewSwitchOn(id: string): Promise<void> {
        const parent = syncFieldById(id);
        await this.openNewSection(parent?.tab ?? 'general', parent?.section ?? id);
        const toggle = this.page.locator(newUI.fieldSwitch(id)).first();
        await toggle.waitFor({ state: 'visible', timeout: 15000 });
        await this.applySwitchState(toggle, true);
    }

    // The Save button enables only on change; click it and await the settings PUT.
    // If the submitted value already matched what was stored, no change registers and
    // the button stays disabled — there's nothing to persist, so treat that as done.
    private async saveNew(): Promise<void> {
        const save = this.page.getByRole('button', { name: newUI.saveButtonName });
        try {
            await expect(save).toBeEnabled({ timeout: 8000 });
        } catch {
            // No change registered — the value already matched, nothing to persist.
            return;
        }
        await Promise.all([
            this.page.waitForResponse(
                response =>
                    response.url().includes(urls.schemaEndpoint) &&
                    response.request().method() !== 'GET' &&
                    response.ok(),
                { timeout: 20000 },
            ),
            save.click(),
        ]);
    }

    // ---- Legacy dashboard form: navigation + primitives ----------------------

    private async openLegacy(): Promise<void> {
        await this.page.goto(urls.legacyStoreSettings, { waitUntil: 'domcontentloaded' });
        await this.page.locator('#dokan_store_name').waitFor({ state: 'visible', timeout: 30000 });
    }

    private legacyBody(field: { legacy: string; legacyKind: string; legacyEditor?: string }): Locator {
        if (field.legacyKind === 'tinymce') {
            return this.page.frameLocator(legacyUI.tinymceBody(field.legacyEditor as string)).locator('body');
        }
        return this.page.locator(field.legacy);
    }

    private async getLegacyValue(field: SyncField): Promise<string> {
        await this.openLegacy();
        const control = this.legacyBody(field);
        if (field.legacyKind === 'tinymce') {
            return (await control.innerText()).trim();
        }
        return (await control.inputValue()).trim();
    }

    private async setLegacyValue(field: SyncField, value: string): Promise<void> {
        await this.openLegacy();
        await this.legacyBody(field).fill(value);
        await this.saveLegacy();
    }

    private async getLegacyBool(field: SyncField): Promise<boolean> {
        await this.openLegacy();
        return this.page.locator(field.legacy).isChecked();
    }

    private async setLegacyBool(field: SyncField, enabled: boolean): Promise<void> {
        await this.openLegacy();
        await this.page.locator(field.legacy).setChecked(enabled);
        await this.saveLegacy();
    }

    // Legacy form saves over AJAX; the success toast marks completion.
    private async saveLegacy(): Promise<void> {
        const save = this.page.locator(legacyUI.saveButton).first();
        await save.scrollIntoViewIfNeeded();
        // The legacy form saves through one deterministic admin-ajax call — wait on it, not on a sleep.
        const saved = this.page.waitForResponse(
            resp => resp.url().includes('admin-ajax.php') && (resp.request().postData() ?? '').includes('dokan_settings'),
            { timeout: 15000 }
        );
        await save.click();
        await saved;
        await this.page
            .getByText(legacyUI.saveSuccessMessage, { exact: false })
            .first()
            .waitFor({ state: 'visible', timeout: 15000 });
    }

    // ---- Generic vice-versa assertion (one syncFields entry) -----------------

    async assertFieldSync(field: SyncField): Promise<void> {
        if (field.kind === 'switch') {
            await this.assertSwitchSync(field);
            return;
        }
        await this.assertValueSync(field);
    }

    private async assertValueSync(field: SyncField): Promise<void> {
        const values = field.values as NonNullable<SyncField['values']>;

        // Baseline: both surfaces already agree on the stored value.
        expect(await this.getLegacyValue(field)).toBe(await this.getNewValue(field));

        // New -> legacy.
        await this.setNewValue(field, values.fromNew);
        expect(await this.getLegacyValue(field)).toBe(values.fromNew);

        // Legacy -> new (and legacy self-persists across reload).
        await this.setLegacyValue(field, values.fromLegacy);
        expect(await this.getLegacyValue(field)).toBe(values.fromLegacy);
        expect(await this.getNewValue(field)).toBe(values.fromLegacy);

        // New again, survives a reload.
        await this.setNewValue(field, values.final);
        expect(await this.getNewValue(field)).toBe(values.final);
    }

    private async assertSwitchSync(field: SyncField): Promise<void> {
        const initial = await this.getNewSwitch(field);
        // Baseline: both surfaces agree on the stored state.
        expect(await this.getLegacyBool(field)).toBe(initial);

        // New -> legacy: the new save persists and the legacy checkbox reflects it.
        await this.setNewSwitch(field, !initial);
        expect(await this.getLegacyBool(field)).toBe(!initial);

        // Legacy -> new: the legacy save persists and the new switch reflects it.
        // Ends on the initial state, leaving toggles like store-time as we found them
        // (so a left-on store-time can't block later legacy-form saves).
        await this.setLegacyBool(field, initial);
        expect(await this.getLegacyBool(field)).toBe(initial);
        expect(await this.getNewSwitch(field)).toBe(initial);
    }

    // ---- Bespoke: min/max cart amount (custom vendor_number, one section) -----

    private minMaxInputs(): { min: Locator; max: Locator } {
        const inputs = this.page.locator(`${newUI.sectionContent(migration.combined.minMax.section)} input`);
        return { min: inputs.nth(0), max: inputs.nth(1) };
    }

    private async setNewMinMax(min: string, max: string): Promise<void> {
        await this.openNewSection(migration.combined.minMax.tab, migration.combined.minMax.section);
        const { min: minInput, max: maxInput } = this.minMaxInputs();
        await minInput.waitFor({ state: 'visible', timeout: 15000 });
        await minInput.fill(min);
        await maxInput.fill(max);
    }

    async assertMinMaxSync(): Promise<void> {
        const cfg = migration.combined.minMax;

        // New -> legacy: both amounts persist from the one save, read after a reload.
        await this.setNewMinMax(cfg.fromNew.min, cfg.fromNew.max);
        await this.saveNew();
        await this.openLegacy();
        expect((await this.page.locator(cfg.legacyMin).inputValue()).trim()).toBe(cfg.fromNew.min);
        expect((await this.page.locator(cfg.legacyMax).inputValue()).trim()).toBe(cfg.fromNew.max);

        // Legacy -> new: edit on the legacy form, confirm it persists, then the new page reflects it.
        await this.page.locator(cfg.legacyMin).fill(cfg.fromLegacy.min);
        await this.page.locator(cfg.legacyMax).fill(cfg.fromLegacy.max);
        await this.saveLegacy();
        await this.openLegacy();
        expect((await this.page.locator(cfg.legacyMin).inputValue()).trim()).toBe(cfg.fromLegacy.min);

        await this.openNewSection(cfg.tab, cfg.section);
        const { min, max } = this.minMaxInputs();
        expect((await min.inputValue()).trim()).toBe(cfg.fromLegacy.min);
        expect((await max.inputValue()).trim()).toBe(cfg.fromLegacy.max);
    }

    // Min greater than max must surface the inline error and block the save.
    async assertMinMaxValidation(): Promise<void> {
        const cfg = migration.combined.minMax;
        await this.setNewMinMax(cfg.invalid.min, cfg.invalid.max);
        await expect(this.page.getByText(cfg.invalidMessage).first()).toBeVisible({ timeout: 10000 });
    }

    // ---- Bespoke: required Store Title -----------------------------------------

    async assertStoreNameRequired(): Promise<void> {
        const cfg = migration.requiredField;
        await this.openNewSection(cfg.tab, cfg.section);
        const input = this.page.locator(newUI.fieldInput(cfg.id)).first();
        await input.waitFor({ state: 'visible', timeout: 15000 });
        await input.fill('');
        const save = this.page.getByRole('button', { name: newUI.saveButtonName });
        if (await save.isEnabled().catch(() => false)) {
            await save.click();
        }
        await expect(this.page.getByText(cfg.message).first()).toBeVisible({ timeout: 10000 });
    }

    // ---- Save/cancel mechanics + dependent fields ------------------------------

    private saveButton(): Locator {
        return this.page.getByRole('button', { name: newUI.saveButtonName });
    }

    // Console errors, failed requests and schema GETs fired by one cold load of the new page.
    async loadNewPageAndCollect(): Promise<{ consoleErrors: string[]; failedRequests: string[]; schemaGets: number }> {
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];
        let schemaGets = 0;
        const onConsole = (msg: { type(): string; text(): string }) => {
            // Resource failures are reported by URL via failedRequests instead.
            if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) consoleErrors.push(msg.text());
        };
        const onResponse = (res: { url(): string; status(): number; request(): { method(): string } }) => {
            // Scoped to this page's own code + REST; other plugins' asset 404s are env noise.
            const ownRequest = /\/plugins\/dokan-lite\/|dokan\/v\d\//.test(decodeURIComponent(res.url()));
            if (ownRequest && res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
            if (decodeURIComponent(res.url()).includes(urls.schemaEndpoint) && res.request().method() === 'GET') schemaGets++;
        };
        this.page.on('console', onConsole);
        this.page.on('response', onResponse);
        await this.gotoNewPage();
        await expect(this.page.locator(newUI.tabButton('general'))).toBeVisible();
        this.page.off('console', onConsole);
        this.page.off('response', onResponse);
        return { consoleErrors, failedRequests, schemaGets };
    }

    // Double-click Save and count the PUTs that reach the endpoint.
    async doubleClickSaveCount(phone: string): Promise<number> {
        const field = syncFieldById('phone') as SyncField;
        const control = await this.revealNewControl(field);
        await control.fill(phone);
        let puts = 0;
        const onRequest = (req: { url(): string; method(): string }) => {
            if (req.url().includes(urls.schemaEndpoint) && req.method() !== 'GET') puts++;
        };
        this.page.on('request', onRequest);
        const saved = this.page.waitForResponse(r => r.url().includes(urls.schemaEndpoint) && r.request().method() !== 'GET');
        await this.saveButton().dblclick();
        await saved;
        await expect(this.page.getByText(newUI.savedToast).first()).toBeVisible();
        this.page.off('request', onRequest);
        return puts;
    }

    // Edit, Cancel, and return what the field shows after the reset and after a reload.
    async cancelEdit(phone: string): Promise<{ afterCancel: string; afterReload: string }> {
        const field = syncFieldById('phone') as SyncField;
        const control = await this.revealNewControl(field);
        await control.fill(phone);
        await this.page.getByRole('button', { name: newUI.cancelButtonName }).click();
        await expect(this.saveButton()).toBeDisabled();
        const afterCancel = await this.getNewValue(field);
        const afterReload = await this.getNewValue(field);
        return { afterCancel, afterReload };
    }

    async assertDeepLinkOpensTab(tab: string): Promise<void> {
        await this.page.goto(`${urls.newStoreSettings}?tab=tab_${tab}`, { waitUntil: 'domcontentloaded' });
        await this.page.locator(newUI.panel).waitFor({ state: 'visible', timeout: 30000 });
        await expect(this.page.locator(newUI.tabButton(tab))).toHaveAttribute('aria-selected', 'true');
    }

    // Flip a parent switch (unsaved) and assert its dependent control shows/hides with it.
    async assertDependentField(tab: string, section: string, parentId: string, dependent: string): Promise<void> {
        await this.openNewSection(tab, section);
        const toggle = this.page.locator(newUI.fieldSwitch(parentId)).first();
        const child = this.page.locator(dependent).first();
        for (let i = 0; i < 2; i++) {
            const on = await this.isSwitchOn(toggle);
            await (on ? expect(child).toBeVisible() : expect(child).toBeHidden());
            await toggle.click();
            await expect(toggle).toHaveAttribute('aria-checked', String(!on));
        }
    }

    async discardChanges(): Promise<void> {
        const cancel = this.page.getByRole('button', { name: newUI.cancelButtonName });
        if (await cancel.isEnabled()) await cancel.click();
    }

    // Save one field; the PUT itself must succeed (a lingering toast from an earlier save can't vouch for it).
    async saveFieldOnNewPage(id: string, value: string): Promise<void> {
        const control = await this.revealNewControl(syncFieldById(id) as SyncField);
        await control.fill(value);
        const [response] = await Promise.all([
            this.page.waitForResponse(r => r.url().includes(urls.schemaEndpoint) && r.request().method() !== 'GET'),
            this.saveButton().click(),
        ]);
        expect(response.status(), await response.text()).toBe(200);
        await expect(this.page.getByText(newUI.savedToast).first()).toBeVisible();
    }

    // ---- Composite fields (custom variants, anchored by their section card) --------

    private section(id: string): Locator {
        return this.page.locator(newUI.sectionContent(id));
    }

    // Persisted schema value for one field id, read through the REST endpoint.
    async getStoredValue(id: string): Promise<unknown> {
        return (await this.fetchFieldMap('value'))[id];
    }

    private async pickTime(input: Locator, label: string): Promise<void> {
        await input.click();
        await this.page.getByRole('listbox').getByRole('option', { name: label, exact: true }).click();
    }

    // Set Monday's ranges on the new page and save; extra ranges are added via "Add time slot".
    async setMondayHours(ranges: Array<[string, string]>): Promise<void> {
        await this.openNewSection('schedule', 'store_schedule');
        await this.applySwitchState(this.page.locator(newUI.fieldSwitch('dokan_store_time_enabled')).first(), true);
        await this.openNewSection('schedule', 'store_schedule');
        const field = this.page.locator(newUI.scheduleField);
        // Monday's inputs come first in DOM order: open/close per range.
        for (const [i, [open, close]] of ranges.entries()) {
            if (i > 0) await field.getByRole('button', { name: newUI.addTimeSlot }).first().click();
            await this.pickTime(field.getByRole('textbox').nth(i * 2), open);
            await this.pickTime(field.getByRole('textbox').nth(i * 2 + 1), close);
        }
        await this.saveNew();
    }

    async getLegacyMondayHours(): Promise<{ opening: string[]; closing: string[] }> {
        await this.openLegacy();
        const read = (kind: 'opening' | 'closing') => this.page.locator(legacyUI.timeInput(kind, 'monday')).evaluateAll(els => els.map(el => (el as HTMLInputElement).value));
        return { opening: await read('opening'), closing: await read('closing') };
    }

    // Option labels the Monday "Opens at" dropdown offers (reflects the site time format).
    async getTimeOptionLabels(): Promise<string[]> {
        await this.openNewSection('schedule', 'store_schedule');
        await this.page.locator(newUI.scheduleField).getByPlaceholder(newUI.opensAtPlaceholder).first().click();
        const labels = await this.page.getByRole('listbox').getByRole('option').allInnerTexts();
        await this.page.keyboard.press('Escape');
        return labels.map(label => label.trim());
    }

    private dayButton(date: Date): Locator {
        const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        return this.page.getByRole('button', { name: label, exact: true });
    }

    // Add one date-wise vacation range from the new page and save.
    async addVacation(from: Date, to: Date, message: string): Promise<void> {
        await this.openNewSection('schedule', 'store_vacation');
        // Not saved on its own: vacation on + instant style + no message is rejected server-side.
        const goVacation = this.page.locator(newUI.fieldSwitch('setting_go_vacation')).first();
        if (!(await this.isSwitchOn(goVacation))) await goVacation.click();
        await expect(goVacation).toHaveAttribute('aria-checked', 'true');
        await this.section('store_vacation').locator(newUI.vacationStyle('datewise')).check();
        await this.page.getByRole('button', { name: newUI.addVacation }).click();
        const dialog = this.page.getByRole('dialog').filter({ hasText: newUI.vacationDialogTitle });
        await dialog.getByRole('button', { name: newUI.selectDateRange }).click();
        const next = this.page.getByRole('button', { name: 'Go to the Next Month' });
        while (!(await this.dayButton(from).isVisible())) await next.click();
        await this.dayButton(from).click();
        await this.dayButton(to).click();
        await this.page.getByRole('button', { name: newUI.applyRange }).click();
        await dialog.getByRole('textbox', { name: newUI.vacationMessage }).fill(message);
        await dialog.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(dialog).toBeHidden();
        await this.saveNew();
    }

    async deleteVacation(message: string): Promise<void> {
        await this.openNewSection('schedule', 'store_vacation');
        const row = this.section('store_vacation').getByRole('row').filter({ hasText: message });
        await row.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: newUI.deleteConfirm }).click();
        await this.saveNew();
    }

    // Upload through the WP media frame, crop, and save; returns the stored attachment id.
    async uploadImage(index: number, file: string): Promise<number> {
        await this.openNewSection('general', 'company_banner');
        await this.page.locator(newUI.imageField).nth(index).getByRole('button', { name: /upload|change/i }).click();
        await this.page.locator(newUI.mediaFileInput).first().setInputFiles(file);
        const select = this.page.getByRole('button', { name: newUI.selectAndCrop });
        await expect(select).toBeEnabled({ timeout: 30000 });
        await select.click();
        await this.page.getByRole('button', { name: newUI.cropImage }).click();
        await expect(this.page.locator(newUI.mediaModal).first()).toBeHidden({ timeout: 30000 });
        await this.saveNew();
        return Number(await this.getStoredValue(index === 0 ? 'banner' : 'gravatar'));
    }

    async removeImage(index: number): Promise<void> {
        await this.openNewSection('general', 'company_banner');
        await this.page.locator(newUI.imageField).nth(index).getByRole('button', { name: newUI.removeImage }).click();
        await this.saveNew();
    }

    async getLegacyImageId(input: string): Promise<number> {
        await this.openLegacy();
        return Number(await this.page.locator(legacyUI.imageInput(input)).inputValue());
    }

    // Map address on the new page; undefined when the map card is gated off (no API key).
    async getNewMapAddress(): Promise<string | undefined> {
        await this.openNewTab('location');
        if ((await this.section('store_map_section').count()) === 0) return undefined;
        await this.openNewSection('location', 'store_map_section');
        return (await this.page.getByRole('textbox', { name: newUI.mapSearch }).inputValue()).trim();
    }

    async getLegacyMapAddress(): Promise<string> {
        await this.openLegacy();
        return (await this.page.locator(legacyUI.mapAddress).inputValue()).trim();
    }

    // Save while the PUT is forced to fail; returns the toast shown and whether the form stayed dirty.
    async saveWithServerError(phone: string, message: string): Promise<{ toastVisible: boolean; stillDirty: boolean }> {
        const control = await this.revealNewControl(syncFieldById('phone') as SyncField);
        await control.fill(phone);
        await this.page.route(`**/*${urls.schemaEndpoint.split('/').pop()}*`, route =>
            route.request().method() === 'GET' ? route.continue() : route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'test_failure', message }) }),
        );
        try {
            await this.saveButton().click();
            await expect(this.page.getByText(message).first()).toBeVisible();
            return { toastVisible: true, stillDirty: await this.saveButton().isEnabled() };
        } finally {
            await this.page.unrouteAll({ behavior: 'ignoreErrors' });
        }
    }

    async getStoredPhone(): Promise<string> {
        return this.getNewValue(syncFieldById('phone') as SyncField);
    }

    async legacyMenuLinkCount(): Promise<{ legacy: number; react: number }> {
        await this.page.goto('dashboard/', { waitUntil: 'domcontentloaded' });
        return {
            legacy: await this.page.locator(legacyUI.storeSettingsMenuLink).count(),
            react: await this.page.locator('a[href*="#settings/store"]').count(),
        };
    }

    async getNewStoreName(): Promise<string> {
        return this.getNewValue(syncFieldById('store_name') as SyncField);
    }

    // ---- Tabs + sections render ----------------------------------------------

    async assertTabsAndSections(): Promise<void> {
        const proActive = parseBoolean(process.env.DOKAN_PRO);
        // Render-only assertions — one page load, then client-side tab clicks.
        await this.gotoNewPage();
        for (const [tab, sections] of Object.entries(migration.layout)) {
            await this.activateTab(tab);
            for (const section of sections) {
                if (!proActive && migration.proSections.includes(section)) continue;
                // Collapsible sections render collapsed (attached but hidden), so assert
                // the section card is present on its tab rather than expanded.
                await expect(this.page.locator(newUI.sectionContent(section))).toBeAttached({ timeout: 15000 });
            }
        }
    }

    // ---- Schema defaults (read straight from the endpoint) -------------------

    async getSchemaDefaults(): Promise<Record<string, unknown>> {
        return this.fetchFieldMap('default');
    }

    // ---- Housekeeping (leave the store as we found it) -----------------------

    async captureOriginals(): Promise<void> {
        this.originalValues = await this.fetchFieldMap('value');
    }

    // One authenticated PUT restores every captured field at once.
    async restoreOriginals(): Promise<void> {
        if (!this.originalValues) {
            return;
        }
        await this.page.goto(urls.newStoreSettings, { waitUntil: 'domcontentloaded' });
        await this.page.locator(newUI.panel).waitFor({ state: 'visible', timeout: 30000 });
        const values = this.originalValues;
        await this.page.evaluate(
            async ({ endpoint, payload }) => {
                const wp = (window as unknown as { wpApiSettings?: { root?: string; nonce?: string } }).wpApiSettings;
                const root = wp?.root ?? '/wp-json/';
                const nonce = wp?.nonce ?? '';
                await fetch(root + endpoint, {
                    method: 'PUT',
                    headers: { 'X-WP-Nonce': nonce, 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ values: payload }),
                });
            },
            { endpoint: urls.schemaEndpoint, payload: values },
        );
    }

    private async fetchSchema(): Promise<Array<{ type?: string; id?: string; value?: unknown; default?: unknown }>> {
        return this.page.evaluate(async (endpoint: string) => {
            const wp = (window as unknown as { wpApiSettings?: { root?: string; nonce?: string } }).wpApiSettings;
            const root = wp?.root ?? '/wp-json/';
            const nonce = wp?.nonce ?? '';
            const response = await fetch(root + endpoint, {
                headers: { 'X-WP-Nonce': nonce },
                credentials: 'same-origin',
            });
            const body = await response.json();
            return Array.isArray(body) ? body : [];
        }, urls.schemaEndpoint);
    }

    // Load the store page and build a { fieldId: <picked property> } map from the schema.
    private async fetchFieldMap(pick: 'default' | 'value'): Promise<Record<string, unknown>> {
        await this.page.goto(urls.newStoreSettings, { waitUntil: 'domcontentloaded' });
        await this.page.locator(newUI.panel).waitFor({ state: 'visible', timeout: 30000 });
        const map: Record<string, unknown> = {};
        for (const element of await this.fetchSchema()) {
            if (element && element.type === 'field' && typeof element.id === 'string') {
                map[element.id] = element[pick];
            }
        }
        return map;
    }
}
