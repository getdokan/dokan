import { expect } from '@playwright/test';
import { AdminPage } from './adminPage';

export class AdminSettingsPageNew extends AdminPage {
    saveButtonSelector: string = '#dokan-admin-settings-save-btn button'

    setSaveButtonSelector(selector: string) {
        this.saveButtonSelector = selector;
    }
    async ensureVisibilityFor(selector: string) {
        const locator = this.page.locator(selector);
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
    }

    async updateSettings( dataSet: any ) {
        await this.goIfNotThere(dataSet.url)
        await this.waitForLoadState();
        await this.page.waitForTimeout( 2000 ); // Allow page to stabilize
        const selectors = this.splitSelectors( dataSet.selector || '' );

        for ( const selector of selectors ) {
            await this.ensureVisibilityFor( selector );
            await this.page.click( selector );
        }

        this.setFieldValues( dataSet.fields );
        this.saveSettings();
    }

    async checkSettings( dataSet: any ) {
        await this.goIfNotThere(dataSet.url)
        await this.waitForLoadState();
        await this.page.waitForTimeout( 2000 ); // Allow page to stabilize
        const selectors = this.splitSelectors( dataSet.selector || '' );

        for ( const selector of selectors ) {
            await this.ensureVisibilityFor( selector );
            await this.assertFieldValues( dataSet.fields );
        }
    }

    async saveSettings() {
        const saveBtn = this.page.locator(this.saveButtonSelector);
        try{
            await saveBtn.waitFor({ state: 'visible', timeout: 8000 }); 
            await saveBtn.click();
            await this.waitForLoadState();
        } catch (error) {
            console.log('Save button not visible - may not be needed');
        }
    }

    async setFieldValues(fields: Array<any>) {
        for ( const field of fields ) {
            await this.ensureVisibilityFor( field.selector );
            switch(field.type) {
                case 'text':
                    await this.page.fill( field.selector, field.value );
                    break;
                case 'number':
                    await this.page.fill( field.selector, field.value );
                    break;
                case 'email':
                    await this.page.fill( field.selector, field.value );
                    break;
                case 'switch': {
                    // Only toggle if current state doesn't match desired state
                    const currentState = await this.page.locator( field.selector ).getAttribute('aria-checked') === 'true';
                    if (currentState !== field.value) {
                        await this.page.click( field.selector );
                    }
                    break;
                }
                case 'radio': {
                    // Only click if not already selected
                    const currentState = await this.page.locator( field.selector ).getAttribute('aria-checked');
                    if (currentState !== field.value) {
                        await this.page.click( field.selector );
                    }
                    break;
                }
                case 'select':
                    await this.page.click( field.selector );
                    break;
                case 'textarea':
                    await this.page.fill( field.selector, field.value );
                    break;  
            }
        }
    }

    async assertFieldValues(fields: Array<any>) {
        for ( const field of fields ) {
            await this.ensureVisibilityFor( field.selector );
            switch(field.type) {
                case 'text': {
                    const value = await this.page.inputValue( field.selector );
                    expect(value).toBe(field.value);
                    break;
                }
                case 'number': {
                    const value = await this.page.inputValue( field.selector );
                    expect(value).toBe(field.value);
                    break;
                }
                case 'email': {
                    const value = await this.page.inputValue( field.selector );
                    expect(value).toBe(field.value);
                    break;
                }
                case 'switch': {
                    const ariaChecked = await this.page.locator( field.selector ).getAttribute('aria-checked');
                    const isChecked = ariaChecked === 'true';
                    expect(isChecked).toBe(field.value);
                    break;
                }
                case 'radio': {
                    const ariaChecked = await this.page.locator( field.selector ).getAttribute('aria-checked');
                    expect(ariaChecked).toBe(field.value);
                    break;
                }
                case 'select': {
                    const value = await this.page.inputValue( field.selector );
                    expect(value).toBe(field.value);
                    break;
                }
                case 'textarea': {
                    const value = await this.page.inputValue( field.selector );
                    expect(value).toBe(field.value);
                    break;
                }
            }
        }
    }

    splitSelectors(selector: string): string[] {
        return selector.split('>>').map(s => s.trim());
    }
}