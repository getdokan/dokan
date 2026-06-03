import { expect } from '@playwright/test';
import { AdminPage } from './adminPage';

export class AdminSettingsPageNew extends AdminPage {
    saveButtonSelector: string = '#dokan-admin-settings-save-btn button'
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

    async updateSettings( dataSet: any ) {
        await this.goIfNotThere(dataSet.url)
        await this.waitForLoadState();
        await this.navigateThroughSelectors(dataSet.selector || '');

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

        await this.assertFieldValues( dataSet.fields );
    }

    async saveSettings() {
        const saveBtn = this.page.locator(this.saveButtonSelector);
        if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await this.waitForLoadState();
        } else {
            console.log('Save button not visible. Skipping save.');
        }
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
                    await this.page.click(field.selector);
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
                    const picker = this.page.locator(field.selector);
                    await picker.click();
                    const input = picker.locator('input[type="text"]');
                    if (await input.count() > 0) {
                        await input.fill(field.value);
                        await input.press('Enter');
                    }
                    break;
                }
                case 'readOnly': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value).toBe(field.value);
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
                    expect(value).toBe(field.value);
                    break;
                }
                case 'number': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value).toBe(field.value);
                    break;
                }
                case 'email': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value).toBe(field.value);
                    break;
                }
                case 'switch': {
                    const ariaChecked = await this.page.locator(field.selector).getAttribute('aria-checked');
                    const isChecked = ariaChecked === 'true';
                    expect(isChecked).toBe(field.value);
                    break;
                }
                case 'checkbox': {
                    const inputElement = this.page.locator(field.selector).locator('input[type="checkbox"]');
                    const hasEnabledClass = await inputElement.evaluate(el => el.classList.contains('enabled'));
                    console.log('hasEnabledClass', hasEnabledClass);
                    console.log('field.value', field.value);
                    expect(hasEnabledClass).toBe(field.value);
                    break;
                }
                case 'radio': {
                    const ariaChecked = await this.page.locator(field.selector).getAttribute('aria-checked');
                    expect(ariaChecked).toBe(field.value);
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
                    expect(isSelected).toBe(desiredSelected);
                    break;
                }
                case 'select': {
                    const value = await this.page.inputValue(field.selector);
                    expect(value).toBe(field.value);
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
                    expect(value).toBe(field.value);
                    break;
                }
                case 'color-picker': {
                    const color = await this.page.locator(field.selector).evaluate(el => {
                        return getComputedStyle(el).backgroundColor;
                    });
                    expect(color).toBe(field.value);
                    break;
                }
                case 'textareaOld': {
                    const frameHandle = this.page.frameLocator(field.selector);
                    const textValue = await frameHandle.locator('body').innerText();
                    expect(textValue.trim()).toBe(field.value);
                    return;
                }
                case 'radioLabel': {
                    // Locate the checked radio button within the container
                    const selectedLocator = this.page.locator(
                        `${field.selector} div[role="radio"][aria-checked="true"] h3`
                    );
                    await selectedLocator.waitFor({ state: 'visible', timeout: 15000 });

                    const labelText = (await selectedLocator.innerText()).trim();
                    expect(labelText).toBe(field.value);
                    break;
                }
                case 'checkbox-switch': {
                    const locator = this.page.locator(field.selector);
                    const isChecked = await locator.isChecked();
                    expect(isChecked).toBe(field.value);
                    break;
                }
                case 'customize-radio': {
                    const locator = this.page.locator(field.selector);
                    await expect(locator).toBeVisible();
                    break;
                }
            }
        }
    }

    splitSelectors(selector: string): string[] {
        return selector.split('>>').map(s => s.trim());
    }
}
