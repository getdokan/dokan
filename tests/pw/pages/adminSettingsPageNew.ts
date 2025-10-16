import { test, expect } from '@playwright/test';
import { data } from '@utils/testData';
import { AdminSettingsPage } from './adminSettingsPage';

export class AdminSettingsPageNew extends AdminSettingsPage {
    saveButton: string = '#dokan-admin-settings-save-btn button'

    async ensureVisibilityFor(selector: string) {
        const locator = this.page.locator(selector);
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
    }

    async testData( dataSet: any ) {
        console.log( 'DataSet: ', dataSet );
        await test.step( 'Go to New Settings to update settings', async () => {
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
        });

        // await test.step( 'Go to New Settings to check the settings', async () => {
        //     await this.goIfNotThere(dataSet.url)
        //     await this.waitForLoadState();
        //     await this.page.waitForTimeout( 2000 ); // Allow page to stabilize
        //     const selectors = this.splitSelectors( dataSet.selector || '' );

        //     for ( const selector of selectors ) {
        //         await this.ensureVisibilityFor( selector );
        //         await this.assertFieldValues( dataSet.fields );
        //     }
        // });
    }

    async saveSettings() {
        const saveBtn = this.page.locator(this.saveButton);
        if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await this.waitForLoadState();
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
                case 'switch':
                    await this.page.click( field.selector );
                    break;
                case 'radio':
                    await this.page.click( field.selector );
                    break;
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
                    const isChecked = await this.page.locator( field.selector ).isChecked();
                    expect(isChecked).toBe(field.value);
                    break;
                }
                case 'radio': {
                    const isChecked = await this.page.locator( field.selector ).isChecked();
                    expect(isChecked).toBe(field.value);
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