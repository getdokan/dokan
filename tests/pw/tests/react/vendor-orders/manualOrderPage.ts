import { expect, type Locator, type Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exactly = (s: string) => new RegExp(`^\\s*${escape(s)}\\s*$`, 'i');

/** React "Add New Order" (Pro manual orders): /dashboard/new/#/orders/new. Loading the page creates a draft order. */
export class ManualOrderPage {
    orderId = '';

    constructor(readonly page: Page) {}

    get heading(): Locator {
        return this.page.getByText(/Add New Order/i).first();
    }

    get notFound(): Locator {
        return this.page.getByText(/can.t be found|permission denied|don.t have permission/i).first();
    }

    get navLink(): Locator {
        return this.page.getByRole('link', { name: 'Add New Order' });
    }

    private field(name: 'order-statuses' | 'order-customer'): Locator {
        return this.page.locator(`.form-field.${name}`);
    }

    private get options(): Locator {
        return this.page.locator('[class*="-option"]');
    }

    /**
     * Open the form, remember the draft order id the page creates, and wait for the form to load that order.
     * Edits made before the load lands are overwritten by it (FINDINGS.md #1), so tests about other behaviour
     * must not race it.
     */
    async goto(): Promise<void> {
        await this.open();
        await this.page.waitForResponse(r => r.request().method() === 'GET' && this.isOrderLoad(r.url()));
        await this.field('order-statuses').waitFor();
    }

    /** Open the form and remember the draft id, without waiting for the order load (for racing it on purpose). */
    async open(): Promise<void> {
        await closeAnnouncementModal(this.page);
        const draft = this.page.waitForResponse(r => r.request().method() === 'POST' && /\/dokan\/v1\/manual-orders(\?|$)/.test(decodeURIComponent(r.url())));
        await this.page.goto('dashboard/new/#/orders/new');
        this.orderId = String((await (await draft).json()).id);
    }

    private isOrderLoad(url: string): boolean {
        return new RegExp(`/dokan/v1/manual-orders/${this.orderId}(\\?|$)`).test(decodeURIComponent(url));
    }

    /** Hold the form's initial order load for `ms`, as a slow connection would. Call before open(). */
    async delayOrderLoad(ms: number): Promise<void> {
        await this.page.route(/\/dokan\/v1\/manual-orders\/\d+(\?|$)/, async route => {
            if (route.request().method() === 'GET') await new Promise(resolve => setTimeout(resolve, ms));
            await route.continue();
        });
    }

    /** Number of empty customer searches the form fires in `ms` while nobody touches it. */
    async idleCustomerRequests(ms: number): Promise<number> {
        let count = 0;
        this.page.on('request', r => decodeURIComponent(r.url()).includes('/dokan/v1/customers?search=&') && count++);
        await this.page.waitForTimeout(ms);
        return count;
    }

    async gotoExpectingGate(): Promise<void> {
        await closeAnnouncementModal(this.page);
        await this.page.goto('dashboard/new/#/orders/new');
    }

    async status(): Promise<string> {
        return (await this.field('order-statuses').locator('[class*="singleValue"]').innerText()).trim();
    }

    async statusOptions(): Promise<string[]> {
        await this.field('order-statuses').locator('[class*="-control"]').click();
        const labels = (await this.options.allInnerTexts()).map(l => l.trim());
        await this.page.keyboard.press('Escape');
        return labels;
    }

    async setStatus(label: string): Promise<void> {
        await this.field('order-statuses').locator('[class*="-control"]').click();
        await this.options.filter({ hasText: exactly(label) }).click();
    }

    async setCustomer(search: string, label: RegExp): Promise<void> {
        const input = this.field('order-customer').getByRole('combobox');
        const loaded = this.page.waitForResponse(r => decodeURIComponent(r.url()).includes(`/dokan/v1/customers?search=${search}`));
        await input.fill(search);
        await loaded;
        await this.options.filter({ hasText: label }).first().click();
        await expect(this.field('order-customer')).toContainText(label);
    }

    private async openProductModal(): Promise<Locator> {
        await this.page.getByRole('button', { name: 'Add item(s)' }).click();
        await this.page.getByRole('button', { name: 'Add product(s)' }).click();
        const modal = this.page.locator('.components-modal__frame');
        await modal.waitFor();
        return modal;
    }

    /** Search products in the add-products modal; resolves once the debounced product search has answered. */
    async searchProducts(term: string): Promise<Locator> {
        const modal = await this.openProductModal();
        const searched = this.page.waitForResponse(r => /\/dokan\/v\d\/products/.test(r.url()) && decodeURIComponent(r.url()).includes(term));
        // react-select drops a fill() that lands before the input has focus.
        const input = modal.getByRole('combobox');
        await input.click();
        await input.fill(term);
        await searched;
        return this.options;
    }

    async addProduct(term: string, name: RegExp): Promise<void> {
        const options = await this.searchProducts(term);
        await options.filter({ hasText: name }).first().click();
        const saved = this.page.waitForResponse(r => r.request().method() !== 'GET' && decodeURIComponent(r.url()).includes(`/dokan/v1/manual-orders/${this.orderId}`));
        await this.page.locator('.components-modal__frame').getByRole('button', { name: 'Add Products' }).click();
        await saved;
    }

    async addNote(note: string): Promise<void> {
        const saved = this.page.waitForResponse(r => r.request().method() === 'POST' && decodeURIComponent(r.url()).includes(`/manual-orders/${this.orderId}/notes`));
        await this.page.locator('#add_order_note, textarea[name="order_note"]').fill(note);
        await this.page.getByRole('button', { name: 'Add note' }).click();
        await saved;
        // The success notice sits over the Save button until it fades.
        await expect(this.page.getByText('Note added successfully')).toHaveCount(0);
    }

    async save(): Promise<number> {
        const saved = this.page.waitForResponse(r => r.request().method() !== 'GET' && new RegExp(`/dokan/v1/manual-orders/${this.orderId}(\\?|$)`).test(decodeURIComponent(r.url())));
        await this.page.getByRole('button', { name: 'Save', exact: true }).last().click();
        return (await saved).status();
    }
}
