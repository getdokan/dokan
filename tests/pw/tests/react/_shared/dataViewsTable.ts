import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { DATA_ROW_ANY, SKELETON, dataViewsConfirm } from '@utils/dataViews';

/**
 * One @wedevs/plugin-ui DataViews list (vendor dashboard and admin React pages).
 *
 * Every list action waits on the REST call the list makes (`restPath`) and then
 * on the skeleton rows clearing. No fixed waits, so reads always come from the
 * refetched list.
 */
export class DataViewsTable {
    constructor(
        readonly page: Page,
        private readonly restPath: string,
        private readonly searchPlaceholder: string | RegExp = /search/i,
    ) {}

    get rows(): Locator {
        return this.page.locator(`${DATA_ROW_ANY}:not(:has(${SKELETON}))`);
    }

    get emptyState(): Locator {
        return this.page.getByText(/no .* yet|no .* found|nothing to show|no items|no results/i).first();
    }

    /** Row whose cell links to `linkName` exactly (e.g. "#217" for an order). */
    rowByLink(linkName: string): Locator {
        return this.rows.filter({ has: this.page.getByRole('link', { name: linkName, exact: true }) });
    }

    /** Cell of `row` under the column whose header reads `header` (case-insensitive). */
    async cell(row: Locator, header: string): Promise<Locator> {
        const headers = (await this.page.locator('table thead th').allInnerTexts()).map(h => h.trim().toLowerCase());
        const index = headers.indexOf(header.toLowerCase());
        expect(index, `column "${header}" in [${headers.join(', ')}]`).toBeGreaterThanOrEqual(0);
        return row.locator('td').nth(index);
    }

    async settled(): Promise<void> {
        await expect(this.page.locator(`${DATA_ROW_ANY}:has(${SKELETON})`)).toHaveCount(0, { timeout: 30000 });
    }

    /** Run `action`, then wait for the list GET it triggers (optionally matching `query`) and for the list to settle. */
    async refetch(action: () => Promise<unknown>, query?: string): Promise<void> {
        const loaded = this.page.waitForResponse(
            r => r.request().method() === 'GET' && this.isListCall(r) && (!query || decodeURIComponent(r.url()).includes(query)),
        );
        await action();
        await loaded;
        await this.settled();
    }

    private isListCall(r: Response): boolean {
        const url = new URL(r.url());
        const path = url.searchParams.get('rest_route') ?? url.pathname;
        return path.endsWith(this.restPath);
    }

    async search(term: string): Promise<void> {
        const box = this.page.getByPlaceholder(this.searchPlaceholder).first();
        await this.refetch(() => box.fill(term), `search=${term}`);
    }

    async tab(label: string): Promise<void> {
        await this.refetch(() => this.page.getByRole('tab', { name: new RegExp(`^${label}\\b`) }).click());
    }

    /** Open the funnel and pick a filter field by its label; its control renders below the toolbar. */
    async openFilter(label: string): Promise<void> {
        await this.page.locator('button[title="Filter"]').click();
        await this.page.locator('.bg-popover').getByRole('button', { name: label, exact: true }).click();
    }

    async select(row: Locator): Promise<void> {
        await row.getByRole('checkbox').check();
    }

    /** Pick `label` from a row's Actions menu and return the mutation response (destructive actions are confirmed). */
    async rowAction(row: Locator, label: string): Promise<Response> {
        await row.getByRole('button', { name: 'Actions' }).click();
        return this.mutate(() => this.page.getByRole('menuitem', { name: label, exact: true }).click());
    }

    /** Click a bulk toolbar action for the selected rows and return the mutation response. */
    async bulkAction(label: string): Promise<Response> {
        return this.mutate(() => this.page.getByRole('button', { name: label, exact: true }).click());
    }

    // Mutations may hit another API version or a sub-route (e.g. /dokan/v2/orders/bulk-actions), so match on the resource.
    private isMutationCall(r: Response): boolean {
        const resource = this.restPath.split('/').pop();
        return r.request().method() !== 'GET' && new RegExp(`/dokan/v\\d+/${resource}`).test(decodeURIComponent(r.url()));
    }

    private async mutate(trigger: () => Promise<void>): Promise<Response> {
        const response = this.page.waitForResponse(r => this.isMutationCall(r));
        await trigger();
        // Destructive actions open a confirm; its primary button is the one that is not exactly "Cancel".
        const confirm = dataViewsConfirm(this.page);
        if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirm.getByRole('button').filter({ hasNotText: /^Cancel$/ }).last().click();
        }
        const result = await response;
        await this.settled();
        return result;
    }
}

/** Digits only, so "$1.234,50" (UI, any locale) and "1234.50" (REST) compare equal. Assumes both use the store's decimals. */
export const moneyDigits = (value: string): string => value.replace(/\D/g, '');
