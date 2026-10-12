import { expect, type Locator, type Response } from '@playwright/test';
import { AdminPage } from './adminPage';

export class AdminSettingsPageNew extends AdminPage {
    // The new settings UI renders one save control per visible scope, tagged
    // `settings-save-{scopeId}` (settings-content.tsx). The old
    // `#dokan-admin-settings-save-btn` id no longer exists, and `saveSettings()`
    // skips silently when the selector misses — so a stale value here means
    // "update" steps quietly never persist.
    saveButtonSelector: string = '[data-testid^="settings-save-"] button'
    oldSaveButtonSelector: string = '#submit'

    setSaveButtonSelector(selector: string) {
        this.saveButtonSelector = selector;
    }

    async reloadUrl(url: string) {
        await this.goIfNotThere(url);
        await this.waitForLoadState();
        await this.reload();
        await this.waitForLoadState();
    }
    async ensureVisibilityFor(selector: string) {
        const locator = this.page.locator(selector);
        await locator.waitFor({ state: 'attached', timeout: 15000 });
        //await locator.scrollIntoViewIfNeeded({ timeout: 15000 });
        await locator.waitFor({ state: 'visible', timeout: 15000 });
    }

    async navigateThroughSelectors(selector: string) {
        const selectors = this.splitSelectors(selector);
        for (const sel of selectors) {
            if (sel) {
                await this.ensureVisibilityFor(sel);
                // Click the selector to navigate (e.g., tabs, accordions, sections)
                await this.page.click(sel);
            }
        }
    }

    // The legacy app renders its fields only once `dokan_get_setting_values`
    // resolves (`v-if="isLoaded"`), showing a `.loading` overlay until then.
    // No-ops on the new settings app, which has no such element.
    async waitForLegacyLoader() {
        await this.page
            .locator('.dokan-settings-wrap > .loading')
            .waitFor({ state: 'detached', timeout: 60000 })
            .catch(() => null);
    }

    async updateSettings( dataSet: any ) {
        await this.goIfNotThere(dataSet.url)
        await this.waitForLoadState();
        await this.navigateThroughSelectors(dataSet.selector || '');
        await this.waitForLegacyLoader();

        await this.setFieldValues( dataSet.fields );
        await this.saveSettings();
    }

    async checkSettings( dataSet: any ) {
        await this.goIfNotThere(dataSet.url)
        await this.waitForLoadState();

        // Navigate through selectors if provided
        if (dataSet.selector) {
            await this.navigateThroughSelectors(dataSet.selector);
        }
        await this.waitForLegacyLoader();

        await this.assertFieldValues( dataSet.fields );
    }

    async saveSettings() {
        const saveBtn = this.page.locator(this.saveButtonSelector).first();
        if (!(await saveBtn.isVisible())) {
            console.log('Save button not visible. Skipping save.');
            return;
        }
        // The new UI disables "Save Changes" until a field is dirty. When the
        // desired values already match what is stored, `setFieldValues` makes
        // no change and the button stays disabled — there is nothing to
        // persist, so treat it as a no-op instead of waiting out the timeout.
        if (await saveBtn.isDisabled()) {
            return;
        }
        // Both UIs persist over XHR without blocking on it, so returning on the
        // click alone lets the next step navigate away mid-flight and abort the
        // save. Match on "not a GET" rather than on PUT: `apiFetch` ships the
        // update as a POST carrying `X-HTTP-Method-Override: PUT`.
        const persisted = this.page
            .waitForResponse(
                res => {
                    const request = res.request();
                    if (request.method() !== 'GET' && /\/dokan\/v\d+\/admin\/settings\//.test(res.url())) {
                        return true;
                    }
                    return (
                        res.url().includes('admin-ajax.php') &&
                        (request.postData() ?? '').includes('action=dokan_save_settings')
                    );
                },
                { timeout: 30000 },
            )
            .catch(() => null);

        await saveBtn.click();
        const response = await persisted;
        // A rejected save used to pass silently here, hiding values that never persisted.
        if (response && /\/admin\/settings\//.test(response.url())) {
            expect(response.status(), `settings save rejected: ${await response.text()}`).toBeLessThan(400);
        }
        await this.waitForLoadState();
    }

    async setFieldValues(fields: Array<any>) {
        for ( const field of fields ) {
            await this.ensureVisibilityFor( field.selector );
            switch (field.type) {
                case 'text':
                    await this.page.fill(field.selector, field.value);
                    break;
                case 'number':
                    await this.page.fill(field.selector, field.value);
                    break;
                case 'dropdown': {
                    const trigger = this.page.locator(field.selector);
                    await trigger.waitFor({ state: 'visible' });
                    await trigger.click();

                    const option = this.page.locator(`role=option[name="${field.value}"]`);
                    await option.waitFor({ state: 'visible' });
                    await option.click();

                    // Ensure value is updated in trigger
                    await expect(trigger.locator('span')).toHaveText(field.value);
                    break;
                }
                case 'radix-dropdown': {
                    // Base UI Select: field.selector is the combobox trigger.
                    // Open it, pick the option by its visible label (rendered
                    // in a portal as role="option"), then confirm the trigger
                    // reflects the chosen label.
                    const trigger = this.page.locator(field.selector);
                    await trigger.waitFor({ state: 'visible' });

                    // Nothing to change when the trigger already shows the wanted
                    // option. Opening the popup anyway is not harmless: Base UI
                    // scroll-aligns the list to the selected item, so the option
                    // never settles and `click()` times out on "not stable".
                    if ((await trigger.textContent())?.includes(field.value)) {
                        break;
                    }

                    await trigger.click();

                    const option = this.page.getByRole('option', { name: field.value, exact: true });
                    await option.waitFor({ state: 'visible', timeout: 15000 });
                    await option.click();

                    await expect(trigger).toContainText(field.value);
                    break;
                }
                case 'email':
                    await this.page.fill(field.selector, field.value);
                    break;
                case 'switch': {
                    // Only toggle if current state doesn't match desired state
                    const currentState = await this.page.locator( field.selector ).getAttribute('aria-checked') === 'true';
                    if (currentState !== field.value) {
                        await this.page.click(field.selector);
                    }
                    break;
                }
                case 'radio-capsule': {
                    // Toggle group: `field.selector` is the field wrapper and
                    // `field.value` the option's visible label. The selected
                    // button carries aria-pressed="true".
                    const option = this.radioCapsuleOption(field);
                    await option.waitFor({ state: 'visible', timeout: 15000 });
                    if (await option.getAttribute('aria-pressed') !== 'true') {
                        await option.click();
                    }
                    break;
                }
                case 'customize-radio': {
                    // Card-style radio group: each option renders a visible
                    // `span[role="radio"]` next to a hidden radio input that
                    // carries the stored option value.
                    const input = this.customizeRadioInput(field);
                    await input.waitFor({ state: 'attached', timeout: 15000 });
                    if (!(await input.isChecked())) {
                        await input.locator('xpath=preceding-sibling::span[@role="radio"][1]').click();
                    }
                    break;
                }
                case 'multicheck': {
                    // `field.value` is the list of option labels that must end up checked.
                    for (const label of field.value as string[]) {
                        const box = this.multicheckOption(field, label);
                        await box.waitFor({ state: 'visible', timeout: 15000 });
                        if (await box.getAttribute('aria-checked') !== 'true') {
                            await box.click();
                        }
                    }
                    break;
                }
                case 'richtext': {
                    const editor = this.page.locator(field.selector).first();
                    await editor.waitFor({ state: 'visible' });
                    await editor.fill(field.value);
                    break;
                }
                case 'labeled-switch': {
                    // Repeater rows (menu manager, verification methods) render a
                    // switch per row with no id of its own, so the row is found by
                    // its visible label and the switch taken from within it.
                    const sw = this.labeledSwitch(field);
                    await sw.waitFor({ state: 'visible', timeout: 15000 });
                    if ((await sw.getAttribute('aria-checked') === 'true') !== field.value) {
                        await sw.click();
                    }
                    break;
                }
                case 'radio-input': {
                    // Plain `input[type="radio"]` (legacy settings markup).
                    await this.page.locator(field.selector).first().check();
                    break;
                }
                case 'visible':
                    // Presence-only field: nothing to set.
                    break;
                case 'checkbox': {
                    // Handle checkbox with "enabled" class - Check input element state but click on label
                    const inputElement = this.page.locator(field.selector).locator('input[type="checkbox"]');
                    const hasEnabledClass = await inputElement.evaluate(el => el.classList.contains('enabled'));
                    if (hasEnabledClass !== field.value) {
                        await this.page.click(field.selector);
                    }
                    break;
                }
                case 'radioOld': {
                    // Old style: label wrapping an input. Selector should point to the label.
                    const label = this.page.locator(field.selector);
                    const desiredSelected = field.value === true || field.value === 'true';

                    // Check if label has 'checked' class
                    let isSelected = await label.evaluate(el => el.classList.contains('checked')).catch(() => false);
                    if (!isSelected) {
                        // fallback: if label has a 'for' attribute, check the associated input
                        const forAttr = await label.getAttribute('for').catch(() => null);
                        if (forAttr) {
                            const inputLocator = this.page.locator(`#${forAttr}`);
                            isSelected = await inputLocator.isChecked().catch(() => false);
                        }
                    }

                    if (isSelected !== desiredSelected) {
                        await label.click();
                    }
                    break;
                }
                case 'radio': {
                    const locator = this.page.locator(field.selector);
                    const ariaChecked = await locator.getAttribute('aria-checked').catch(() => null);
                    const isChecked = ariaChecked === 'true';
                    const desired = field.value === true || field.value === 'true';
                    if (isChecked !== desired) {
                        await locator.click();
                    }
                    break;
                }
                case 'select':
                    // Legacy native <select>. Datasets identify the option by
                    // its stored value in some specs and by its visible label in
                    // others (page pickers), so accept either. Clicking alone
                    // never changed the selection.
                    await this.selectNativeOption(field);
                    break;
                case 'toggle':
                    await this.page.click(field.selector);
                    break;
                case 'textarea':
                    await this.page.fill(field.selector, field.value);
                    break;
                case 'textareaOld': {
                    const frameHandle = this.page.frameLocator(field.selector);
                    await frameHandle.locator('body').fill(field.value);
                    break;
                }
                case 'radioLabel': {
                    const optionLocator = this.page.locator(
                        `${field.selector} div[role="radio"]`,
                        { hasText: field.value }
                    );
                    await optionLocator.waitFor({ state: 'visible', timeout: 15000 });
                    await optionLocator.click();
                    break;
                }
                case 'checkbox-switch': {
                    const locator = this.page.locator(field.selector);
                    const isChecked = await locator.isChecked(); // get current state
                    if (isChecked !== field.value) {            // only toggle if different
                        await locator.click();
                    }
                    break;
                }
                case 'color-picker': {
                    // The field renders a popover trigger whose swatch shows the
                    // current colour; the popover itself is a WP ColorPicker with
                    // a hex text input. `field.value` is a hex string.
                    const wrapper = this.page.locator(field.selector);
                    await wrapper.locator('button').first().click();
                    const hex = this.page.locator('[role="dialog"] input.components-input-control__input').last();
                    await hex.waitFor({ state: 'visible', timeout: 15000 });
                    await hex.fill(field.value.replace('#', ''));
                    await hex.press('Enter');
                    await this.page.keyboard.press('Escape');
                    break;
                }
                case 'readOnly': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value, field.selector).toBe(field.value);
                    break;
                }
            }
        }
    }

    async assertFieldValues(fields: Array<any>) {
        for ( const field of fields ) {
            await this.ensureVisibilityFor( field.selector );
            switch (field.type) {
                case 'text': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value, field.selector).toBe(field.value);
                    break;
                }
                case 'number': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value, field.selector).toBe(field.value);
                    break;
                }
                case 'email': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value, field.selector).toBe(field.value);
                    break;
                }
                case 'switch': {
                    const ariaChecked = await this.page.locator(field.selector).getAttribute('aria-checked');
                    const isChecked = ariaChecked === 'true';
                    expect(isChecked, field.selector).toBe(field.value);
                    break;
                }
                case 'checkbox': {
                    const inputElement = this.page.locator(field.selector).locator('input[type="checkbox"]');
                    const hasEnabledClass = await inputElement.evaluate(el => el.classList.contains('enabled'));
                    expect(hasEnabledClass, field.selector).toBe(field.value);
                    break;
                }
                case 'radio': {
                    const ariaChecked = await this.page.locator(field.selector).getAttribute('aria-checked');
                    expect(ariaChecked, field.selector).toBe(field.value);
                    break;
                }
                case 'radioOld': {
                    // Old style: label wrapping an input. Selector should point to the label.
                    const label = this.page.locator(field.selector);
                    const desiredSelected = field.value === true || field.value === 'true';
                    let isSelected = await label.evaluate(el => el.classList.contains('checked')).catch(() => false);
                    if (!isSelected) {
                        const forAttr = await label.getAttribute('for').catch(() => null);
                        if (forAttr) {
                            const inputLocator = this.page.locator(`#${forAttr}`);
                            isSelected = await inputLocator.isChecked().catch(() => false);
                        }
                    }
                    expect(isSelected, field.selector).toBe(desiredSelected);
                    break;
                }
                case 'select': {
                    const { value, label } = await this.nativeSelection(field.selector);
                    expect([value, label], field.selector).toContain(field.value);
                    break;
                }
                case 'radix-dropdown': {
                    // Base UI Select trigger reflects the selected option's
                    // label as its text content.
                    const trigger = this.page.locator(field.selector);
                    await expect(trigger).toContainText(field.value);
                    break;
                }
                case 'textarea': {
                    const editor = this.page.locator(field.selector).first();
                    await editor.waitFor({ state: 'visible' });
                    const value = await editor.innerText(); // use innerText for Quill editor
                    expect(value, field.selector).toBe(field.value);
                    break;
                }
                case 'color-picker': {
                    const swatch = this.page.locator(field.selector).locator('button div').first();
                    const color = await swatch.evaluate(el => getComputedStyle(el).backgroundColor);
                    expect(color, field.selector).toBe(this.hexToRgb(field.value));
                    break;
                }
                case 'textareaOld': {
                    const frameHandle = this.page.frameLocator(field.selector);
                    const textValue = await frameHandle.locator('body').innerText();
                    expect(textValue.trim(), field.selector).toBe(field.value);
                    return;
                }
                case 'radioLabel': {
                    // Locate the checked radio button within the container
                    const selectedLocator = this.page.locator(
                        `${field.selector} div[role="radio"][aria-checked="true"] h3`
                    );
                    await selectedLocator.waitFor({ state: 'visible', timeout: 15000 });

                    const labelText = (await selectedLocator.innerText()).trim();
                    expect(labelText, field.selector).toBe(field.value);
                    break;
                }
                case 'checkbox-switch': {
                    const locator = this.page.locator(field.selector);
                    const isChecked = await locator.isChecked();
                    expect(isChecked, field.selector).toBe(field.value);
                    break;
                }
                case 'radio-capsule': {
                    await expect(this.radioCapsuleOption(field)).toHaveAttribute('aria-pressed', 'true');
                    break;
                }
                case 'customize-radio': {
                    await expect(this.customizeRadioInput(field)).toBeChecked();
                    break;
                }
                case 'visible': {
                    // For legacy widgets that expose no input and mark the
                    // selected item with a class: the selector encodes the
                    // expected state, so resolving it is the assertion.
                    // `setFieldValues` has no matching case — these fields are
                    // read-only, as they were before.
                    await expect(this.page.locator(field.selector)).toBeVisible();
                    break;
                }
                case 'multicheck': {
                    for (const label of field.value as string[]) {
                        await expect(this.multicheckOption(field, label)).toHaveAttribute('aria-checked', 'true');
                    }
                    break;
                }
                case 'richtext': {
                    const editor = this.page.locator(field.selector).first();
                    await editor.waitFor({ state: 'visible' });
                    expect((await editor.innerText()).trim(), field.selector).toBe(field.value);
                    break;
                }
                case 'labeled-switch': {
                    await expect(this.labeledSwitch(field), `${field.selector} [${field.label}]`)
                        .toHaveAttribute('aria-checked', String(field.value));
                    break;
                }
                case 'radio-input': {
                    await expect(this.page.locator(field.selector).first()).toBeChecked();
                    break;
                }
                case 'visible': {
                    await expect(this.page.locator(field.selector).first()).toBeVisible();
                    break;
                }
            }
        }
    }

    splitSelectors(selector: string): string[] {
        return selector.split('>>').map(s => s.trim());
    }

    // ---- control helpers shared by set/assert -------------------------------

    labeledSwitch(field: any) {
        // Climb from the row's label text to the nearest ancestor that owns a
        // switch, then take that switch.
        const xpath =
            `xpath=.//*[normalize-space(text())=${JSON.stringify(field.label)}]` +
            `/ancestor::*[.//*[@role="switch"]][1]//*[@role="switch"]`;
        return this.page.locator(field.selector).locator(xpath).first();
    }

    hexToRgb(hex: string): string {
        const h = hex.replace('#', '');
        const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
        return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    }

    async selectNativeOption(field: any) {
        const select = this.page.locator(field.selector).first();
        try {
            await select.selectOption(field.value);
        } catch {
            await select.selectOption({ label: field.value });
        }
    }

    async nativeSelection(selector: string): Promise<{ value: string; label: string }> {
        return this.page.locator(selector).first().evaluate(el => {
            const select = el as HTMLSelectElement;
            return { value: select.value, label: select.selectedOptions[0]?.text.trim() ?? '' };
        });
    }

    radioCapsuleOption(field: any) {
        return this.page.locator(field.selector).getByRole('button', { name: field.value, exact: true });
    }

    customizeRadioInput(field: any) {
        return this.page.locator(`${field.selector} input[type="radio"][value="${field.value}"]`);
    }

    multicheckOption(field: any, label: string) {
        return this.page
            .locator(`${field.selector} div[role="group"]`)
            .filter({ hasText: label })
            .locator('[role="checkbox"]')
            .first();
    }

    // ---- input value round trip ---------------------------------------------

    async openSubpage(menu: string, subpage: string) {
        const parent = this.page.locator(`[data-testid="settings-menu-${menu}"] > button`);
        const item = this.page.locator(`[data-testid="settings-menu-${menu}"] [data-testid="settings-menu-${subpage}"]`);
        // The parent toggles, and the sidebar auto-expands the active page after
        // load, so a blind click can collapse it. Settle on expanded first.
        await expect(async () => {
            if ((await parent.getAttribute('aria-expanded')) !== 'true') {
                await parent.click();
            }
            await expect(parent).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
        }).toPass();
        await item.click();
        await expect(this.page).toHaveURL(new RegExp(`subpage_id=${subpage}(&|$)`));
    }

    inputFor(id: string): Locator {
        return this.page.locator(`[data-testid="settings-field-${id}"]`).locator('input, textarea').first();
    }

    // combine_input renders no settings-field testid; its wrapper carries the
    // field id and holds exactly two textboxes: percentage, then flat fee.
    combineInputsFor(id: string): { percentage: Locator; fixed: Locator } {
        const inputs = this.page.locator(`#${id}`).getByRole('textbox');
        return { percentage: inputs.nth(0), fixed: inputs.nth(1) };
    }

    switchFor(id: string): Locator {
        return this.page.locator(`[data-testid="settings-field-${id}"]`).getByRole('switch');
    }

    async ensureSwitchOn(id: string) {
        const control = this.switchFor(id);
        if ((await control.getAttribute('aria-checked')) !== 'true') {
            await control.click();
        }
        await expect(control).toHaveAttribute('aria-checked', 'true');
    }

    // Real keystrokes, not `fill`: the commission/charge inputs are masked and
    // debounced, and the lost-value bug lives in those per-keystroke handlers.
    async typeValue(input: Locator, value: string) {
        await input.click();
        await input.press('ControlOrMeta+a');
        await input.press('Backspace');
        if (value !== '') {
            await input.pressSequentially(value);
        }
    }

    // Commission/charge inputs debounce 500ms before reaching form state.
    // Fast-forwards the fake clock (the spec installs it) instead of sleeping.
    async flushDebounce() {
        await this.page.clock.runFor(1000);
    }

    // saveSettings() no-ops on a disabled button; after typing, a disabled Save
    // means the edit never reached the form state (or is still debouncing).
    async saveChanges() {
        await expect(this.page.locator(this.saveButtonSelector).first(), 'typed change should enable Save').toBeEnabled();
        await this.saveSettings();
    }

    // Clicks save and hands back the settings response (null when the UI
    // blocked the save client-side), without judging it.
    async clickSaveAndCapture(): Promise<Response | null> {
        const saveBtn = this.page.locator(this.saveButtonSelector).first();
        if (!(await saveBtn.isVisible()) || (await saveBtn.isDisabled())) {
            return null;
        }
        const response = this.page
            .waitForResponse(res => res.request().method() !== 'GET' && /\/dokan\/v\d+\/admin\/settings\//.test(res.url()), { timeout: 30000 })
            .catch(() => null);
        await saveBtn.click();
        return response;
    }

    async reloadSettings() {
        await this.page.reload();
        await this.page.locator(this.saveButtonSelector).first().waitFor({ state: 'visible' });
    }
}
