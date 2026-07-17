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
    key: string;
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

    // Re-open the new page and activate a tab so its fields mount.
    private async openNewTab(tab: string): Promise<void> {
        await this.page.goto(urls.newStoreSettings, { waitUntil: 'domcontentloaded' });
        await this.page.locator(newUI.panel).waitFor({ state: 'visible', timeout: 30000 });

        const tabButton = this.page.locator(newUI.tabButton(tab));
        await tabButton.waitFor({ state: 'visible', timeout: 15000 });
        if ((await tabButton.getAttribute('aria-selected')) !== 'true') {
            await tabButton.click();
        }
        await expect(tabButton).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
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

    private async getNewSwitch(field: SyncField): Promise<boolean> {
        const toggle = await this.revealNewControl(field);
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    private async setNewSwitch(field: SyncField, enabled: boolean): Promise<void> {
        const toggle = await this.revealNewControl(field);
        if (((await toggle.getAttribute('aria-checked')) === 'true') === enabled) {
            return;
        }
        // A switch click can silently miss under load; retry until aria-checked flips.
        await expect(async () => {
            if (((await toggle.getAttribute('aria-checked')) === 'true') !== enabled) {
                await toggle.click();
            }
            expect((await toggle.getAttribute('aria-checked')) === 'true').toBe(enabled);
        }).toPass({ timeout: 10000 });
        await this.saveNew();
    }

    // Persist a parent switch to on once (idempotent) so its dependent fields mount.
    private async ensureNewSwitchOn(id: string): Promise<void> {
        const parent = syncFieldById(id);
        await this.openNewSection(parent?.tab ?? 'general', parent?.section ?? id);
        const toggle = this.page.locator(newUI.fieldSwitch(id)).first();
        await toggle.waitFor({ state: 'visible', timeout: 15000 });
        if ((await toggle.getAttribute('aria-checked')) === 'true') {
            return;
        }
        // Retry the click until it registers (a single click can miss under load).
        await expect(async () => {
            if ((await toggle.getAttribute('aria-checked')) !== 'true') {
                await toggle.click();
            }
            expect(await toggle.getAttribute('aria-checked')).toBe('true');
        }).toPass({ timeout: 10000 });
        await this.saveNew();
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
        await save.click();
        await this.page
            .getByText(legacyUI.saveSuccessMessage, { exact: false })
            .first()
            .waitFor({ state: 'visible', timeout: 15000 })
            .catch(() => undefined);
        await this.page.waitForTimeout(1500);
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

    // ---- Tabs + sections render ----------------------------------------------

    async assertTabsAndSections(): Promise<void> {
        const proActive = parseBoolean(process.env.DOKAN_PRO);
        for (const [tab, config] of Object.entries(migration.layout)) {
            await this.openNewTab(tab);
            for (const section of config.sections) {
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
