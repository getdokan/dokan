import { Page, expect } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { data } from '@utils/testData';

/**
 * Admin settings page object for the legacy (Vue) settings screen and the new
 * (React) settings app, exposing one generic reader/writer per field type
 * instead of a bespoke method pair per setting.
 *
 * Both screens persist through a single request, so every write waits on that
 * request rather than on a fixed delay:
 *   - legacy: POST admin-ajax.php?action=dokan_save_settings
 *   - new:    POST /dokan/v1/admin/settings/<page_id>
 */

export type LegacyTab = 'General' | 'Selling Options' | 'Live Search';

/**
 * Sidebar coordinates of a settings subpage, by schema id — the sidebar renders
 * `data-testid="settings-menu-<id>"` for every page and subpage, which beats
 * matching accessible names (several subpages share a title, e.g. "Store").
 */
export interface NewNav {
    page: string;
    subpage: string;
}

export class AdminSettingsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // ------------------------------------------------------------------ //
    // Legacy settings UI                                                  //
    // ------------------------------------------------------------------ //

    /**
     * Navigate to a settings screen, tolerating a navigation race.
     *
     * After saving a `refreshable_props` field the legacy app calls
     * `window.location.reload()` from its ajax callback (see Settings.vue). That
     * reload aborts a navigation issued right after the save response lands, so
     * retry until the screen stops moving underneath us.
     */
    private async navigateTo(url: string): Promise<void> {
        await expect
            .poll(async () => {
                try {
                    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
                    return true;
                } catch (error) {
                    const message = String(error);
                    if (message.includes('net::ERR_ABORTED') || message.includes('interrupted by another navigation')) {
                        return false;
                    }
                    throw error;
                }
            }, { message: `navigating to ${url}` })
            .toBe(true);
    }

    private async ensureOn(url: string): Promise<void> {
        if (this.page.url().includes(url)) {
            return;
        }
        await this.navigateTo(url);
    }

    async openLegacyTab(tab: LegacyTab): Promise<void> {
        await this.ensureOn(data.adminSettingsMigration.urls.legacyAdminSettings);
        const nav = this.page.locator('.nav-title').filter({ hasText: new RegExp(`^${tab}$`) }).first();
        await expect(nav).toBeVisible();
        await nav.click();
        await expect(this.page.locator(data.adminSettingsMigration.selectors.legacy.saveChanges)).toBeVisible();
    }

    // Persist the legacy form and wait for the ajax round trip to succeed.
    private async saveLegacy(): Promise<void> {
        const save = this.page.locator(data.adminSettingsMigration.selectors.legacy.saveChanges);
        await expect(save).toBeVisible();
        const saved = this.page.waitForResponse(
            response => response.url().includes('admin-ajax.php') && response.request().method() === 'POST' && (response.request().postData() ?? '').includes('dokan_save_settings') && response.ok(),
        );
        await save.click();
        await saved;
    }

    // Legacy switches render a visible `.switch` label in front of a hidden
    // checkbox that carries the real state; both live under `.<field_key>`.
    private legacySwitch(key: string) {
        return {
            toggle: this.page.locator(`.${key} .switch`).first(),
            checkbox: this.page.locator(`.${key} input[type="checkbox"]`).first(),
        };
    }

    async getLegacySwitch(tab: LegacyTab, key: string): Promise<boolean> {
        await this.openLegacyTab(tab);
        const { checkbox } = this.legacySwitch(key);
        await checkbox.waitFor({ state: 'attached' });
        return await checkbox.isChecked();
    }

    async setLegacySwitch(tab: LegacyTab, key: string, enabled: boolean): Promise<void> {
        await this.openLegacyTab(tab);
        const { toggle, checkbox } = this.legacySwitch(key);
        await expect(toggle).toBeVisible();
        if ((await checkbox.isChecked()) !== enabled) {
            await toggle.click();
            await expect(checkbox).toBeChecked({ checked: enabled });
        }
        await this.saveLegacy();
    }

    async getLegacyText(tab: LegacyTab, group: string, key: string): Promise<string> {
        await this.openLegacyTab(tab);
        const field = this.page.locator(`#${CSS.escape(`${group}[${key}]`)}`);
        await expect(field).toBeVisible();
        return await field.inputValue();
    }

    async setLegacyText(tab: LegacyTab, group: string, key: string, value: string): Promise<void> {
        await this.openLegacyTab(tab);
        const field = this.page.locator(`#${CSS.escape(`${group}[${key}]`)}`);
        await expect(field).toBeVisible();
        await field.fill(value);
        await this.saveLegacy();
    }

    async getLegacySelect(tab: LegacyTab, group: string, key: string): Promise<string> {
        await this.openLegacyTab(tab);
        const field = this.page.locator(`select#${CSS.escape(`${group}[${key}]`)}`);
        await expect(field).toBeVisible();
        return await field.inputValue();
    }

    async setLegacySelect(tab: LegacyTab, group: string, key: string, value: string): Promise<void> {
        await this.openLegacyTab(tab);
        const field = this.page.locator(`select#${CSS.escape(`${group}[${key}]`)}`);
        await expect(field).toBeVisible();
        await field.selectOption(value);
        await this.saveLegacy();
    }

    // Legacy radio groups render one `<label for="<index>-<value>-<key>">` per
    // option; the selected one carries the `checked` class.
    async getLegacyRadio(tab: LegacyTab, key: string): Promise<string> {
        await this.openLegacyTab(tab);
        const selected = this.page.locator(`label.checked input[type="radio"][id$="-${key}"]`).first();
        await selected.waitFor({ state: 'attached' });
        return (await selected.getAttribute('value')) ?? '';
    }

    async setLegacyRadio(tab: LegacyTab, key: string, value: string): Promise<void> {
        await this.openLegacyTab(tab);
        const option = this.page.locator(`label:has(input[type="radio"][id$="-${key}"][value="${value}"])`).first();
        await expect(option).toBeVisible();
        await option.click();
        await this.saveLegacy();
    }

    // The legacy rich-text fields are TinyMCE instances inside an iframe.
    private legacyEditorBody(key: string) {
        return this.page.frameLocator(`.${key} iframe[id*="dokan-tinymce"][id$="_ifr"]`).locator('body');
    }

    async getLegacyRichText(tab: LegacyTab, key: string): Promise<string> {
        await this.openLegacyTab(tab);
        const body = this.legacyEditorBody(key);
        await expect(body).toBeVisible();
        return (await body.innerText()).trim();
    }

    async setLegacyRichText(tab: LegacyTab, key: string, value: string): Promise<void> {
        await this.openLegacyTab(tab);
        const body = this.legacyEditorBody(key);
        await expect(body).toBeVisible();
        await body.fill(value);
        await this.saveLegacy();
    }

    // ------------------------------------------------------------------ //
    // New settings UI (React)                                             //
    // ------------------------------------------------------------------ //

    private field(id: string) {
        return this.page.locator(`[data-testid="settings-field-${id}"]`);
    }

    /**
     * Open a settings subpage by its sidebar section + subpage accessible names.
     * The section is expanded only when the subpage is not already showing, so
     * an already-expanded section is never collapsed by accident.
     */
    async openNewSubpage({ page, subpage }: NewNav): Promise<void> {
        await this.ensureOn(data.adminSettingsMigration.urls.newAdminSettings);

        // Each menu entry is an <li> wrapping the button that actually handles the
        // click; the <li> for a page also wraps its subpage entries, so clicking it
        // lands on a child instead. Always target the direct button.
        const pageButton = this.page.locator(`[data-testid="settings-menu-${page}"] > button`);
        const subpageButton = this.page.locator(`[data-testid="settings-menu-${subpage}"] > button`);

        await expect(pageButton).toBeVisible();
        if ((await pageButton.getAttribute('aria-expanded')) !== 'true') {
            await pageButton.click();
            await expect(pageButton).toHaveAttribute('aria-expanded', 'true');
        }
        await expect(subpageButton).toBeVisible();
        await subpageButton.click();

        // The app is hash-routed; the subpage is mounted once the route names it.
        await expect.poll(() => this.page.url(), { message: `opening subpage ${subpage}` }).toContain(`subpage_id=${subpage}`);
        await expect(this.page.locator('[data-testid="settings-root"]').getByRole('heading').last()).toBeVisible();
    }

    /**
     * Re-mount the settings app from scratch so the next read reflects what the
     * server returned rather than the client state the previous write left behind.
     */
    async reloadNewSettings(nav: NewNav): Promise<void> {
        const url = data.adminSettingsMigration.urls.newAdminSettings;
        // The settings app is hash-routed, so a goto() to the same document is a
        // same-page navigation the browser aborts; reload when already there.
        if (this.page.url().includes(url)) {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
        } else {
            await this.navigateTo(url);
        }
        await this.openNewSubpage(nav);
    }

    /**
     * Persist the new settings form. Save is disabled until the form is dirty,
     * so a disabled button here means the preceding interaction never registered
     * — that is a failure, not a no-op.
     */
    async saveNewSettings(): Promise<void> {
        const save = this.page.getByRole('button', { name: data.adminSettingsMigration.selectors.newUI.saveButtonName });
        await expect(save, 'Save Changes should be enabled after changing a setting').toBeEnabled();
        const saved = this.page.waitForResponse(
            response => response.url().includes('/settings') && response.request().method() === 'POST' && response.ok(),
        );
        await save.click();
        await saved;
    }

    async getNewSwitch(nav: NewNav, id: string): Promise<boolean> {
        await this.openNewSubpage(nav);
        const toggle = this.field(id).getByRole('switch');
        await expect(toggle).toBeVisible();
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    async setNewSwitch(nav: NewNav, id: string, enabled: boolean): Promise<void> {
        await this.openNewSubpage(nav);
        const toggle = this.field(id).getByRole('switch');
        await expect(toggle).toBeVisible();
        if ((await toggle.getAttribute('aria-checked')) === String(enabled)) {
            return;
        }
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-checked', String(enabled));
        await this.saveNewSettings();
    }

    // Button groups expose the selected option through aria-pressed and label text.
    async getNewButtonGroup(nav: NewNav, id: string): Promise<string> {
        await this.openNewSubpage(nav);
        const selected = this.field(id).locator('button[aria-pressed="true"]').first();
        await expect(selected).toBeVisible();
        return (await selected.textContent() ?? '').trim().toLowerCase();
    }

    async setNewButtonGroup(nav: NewNav, id: string, value: string): Promise<void> {
        await this.openNewSubpage(nav);
        const target = this.field(id).getByRole('button', { name: new RegExp(`^${value}$`, 'i') });
        await expect(target).toBeVisible();
        if ((await target.getAttribute('aria-pressed')) === 'true') {
            return;
        }
        await target.click();
        await expect(target).toHaveAttribute('aria-pressed', 'true');
        await this.saveNewSettings();
    }

    // Radio groups hide the <input> (aria-hidden, sr-only); the label is the target.
    async getNewRadio(nav: NewNav, id: string): Promise<string> {
        await this.openNewSubpage(nav);
        const selected = this.field(id).locator('input[type="radio"]:checked').first();
        await selected.waitFor({ state: 'attached' });
        return (await selected.getAttribute('value')) ?? '';
    }

    async setNewRadio(nav: NewNav, id: string, value: string): Promise<void> {
        await this.openNewSubpage(nav);
        const input = this.field(id).locator(`input[type="radio"][value="${value}"]`);
        if (await input.isChecked()) {
            return;
        }
        const label = this.field(id).locator(`label:has(input[type="radio"][value="${value}"])`);
        await expect(label).toBeVisible();
        await label.click();
        await expect(input).toBeChecked();
        await this.saveNewSettings();
    }

    async getNewText(nav: NewNav, id: string): Promise<string> {
        await this.openNewSubpage(nav);
        const input = this.field(id).locator('input').first();
        await expect(input).toBeVisible();
        return await input.inputValue();
    }

    async setNewText(nav: NewNav, id: string, value: string): Promise<void> {
        await this.openNewSubpage(nav);
        const input = this.field(id).locator('input').first();
        await expect(input).toBeVisible();
        await input.fill(value);
        await this.saveNewSettings();
    }

    // The new rich-text fields are contenteditable divs, not textareas.
    async getNewRichText(nav: NewNav, id: string): Promise<string> {
        await this.openNewSubpage(nav);
        const editor = this.field(id).locator('[contenteditable="true"]').first();
        await expect(editor).toBeVisible();
        return (await editor.innerText()).trim();
    }

    async setNewRichText(nav: NewNav, id: string, value: string): Promise<void> {
        await this.openNewSubpage(nav);
        const editor = this.field(id).locator('[contenteditable="true"]').first();
        await expect(editor).toBeVisible();
        await editor.click();
        await editor.fill(value);
        await this.saveNewSettings();
    }
}
