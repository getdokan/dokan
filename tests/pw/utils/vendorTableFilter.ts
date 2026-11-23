import { Locator, Page } from '@playwright/test';

/**
 * Shared driver for the vendor dashboard DataViews filter UI, reused across
 * every vendor table. Flow: funnel `button[title="Filter"]` → `.bg-popover`
 * dropdown of filter LABELS → click a label → a react-select chip (or date
 * picker) appears → "Reset" clears all; the funnel badge shows the active count.
 * Callers pass the LABEL + value. Pass `resource` ('products' | 'orders') so
 * value changes await the `/dokan/vN/<resource>` refetch instead of a timeout.
 */
export class VendorTableFilter {
    readonly page: Page;
    private readonly resource?: string;

    constructor(page: Page, resource?: string) {
        this.page = page;
        this.resource = resource;
    }

    get funnel(): Locator { return this.page.locator('button[title="Filter"]').first(); }
    get menu(): Locator { return this.page.locator('.bg-popover').first(); }
    get addFilterButton(): Locator { return this.page.getByRole('button', { name: 'Add Filter' }).first(); }
    get resetButton(): Locator { return this.page.getByRole('button', { name: 'Reset' }).first(); }
    // Options of whichever react-select menu is open; role-based so it works for
    // both the prefixed (products) and emotion-default (orders) react-selects.
    private get openOptions(): Locator { return this.page.locator('[role="option"]'); }
    // The chip control for the most-recently-added filter (either react-select shape).
    private get newestSelectControl(): Locator {
        return this.page.locator('.react-select__control, .react-select [class*="-control"]').last();
    }

    private labelButton(label: string): Locator {
        return this.menu.getByRole('button', { name: label, exact: true }).first();
    }

    /**
     * Funnel dropdown → click a filter label; its control then appears. The funnel
     * is a toggle with ambiguous state once a filter is active, so prefer the
     * in-panel "Add Filter" button when present — required to combine 2+ filters.
     */
    async chooseFilter(label: string): Promise<void> {
        if (!(await this.labelButton(label).isVisible().catch(() => false))) {
            if (await this.addFilterButton.isVisible().catch(() => false)) {
                await this.addFilterButton.click();
            } else {
                await this.funnel.click();
            }
            await this.labelButton(label).waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        }
        await this.labelButton(label).waitFor({ state: 'visible', timeout: 5000 });
        await this.labelButton(label).click();
    }

    /** Static select filter (products: Date, Category, Product Type) by option text. */
    async applySelect(label: string, optionText: string): Promise<void> {
        await this.chooseFilter(label);
        await this.newestSelectControl.click();
        await this.openOptions.first().waitFor({ state: 'visible', timeout: 8000 });
        await this.withRefetch(() => this.openOptions.filter({ hasText: optionText }).first().click());
    }

    /** Static select filter by its first option (data-agnostic; returns the applied text). */
    async applyFirstOption(label: string): Promise<string> {
        await this.chooseFilter(label);
        await this.newestSelectControl.click();
        const first = this.openOptions.first();
        await first.waitFor({ state: 'visible', timeout: 8000 });
        const text = (await first.innerText()).trim();
        await this.withRefetch(() => first.click());
        return text;
    }

    /** Open a static select filter and read its available option labels. */
    async optionLabels(label: string): Promise<string[]> {
        await this.chooseFilter(label);
        await this.newestSelectControl.click();
        await this.openOptions.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
        return (await this.openOptions.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
    }

    /** Async search-select filter (orders: Customer): type a query, then pick a match. */
    async searchSelect(label: string, query: string, optionText?: string): Promise<void> {
        await this.chooseFilter(label);
        const control = this.newestSelectControl;
        await control.click();
        await control.locator('input').first().fill(query);
        await this.openOptions.first().waitFor({ state: 'visible', timeout: 10000 });
        await this.withRefetch(() =>
            (optionText ? this.openOptions.filter({ hasText: optionText }).first() : this.openOptions.first()).click(),
        );
    }

    /** Date Range filter (react-dates DateRangePicker): pick start/end day in the shown month, confirm. */
    async applyDateRange(label: string, startDay: number, endDay: number): Promise<void> {
        await this.chooseFilter(label);
        await this.page.locator('input[placeholder="Enter Date"]').first().click();
        // react-dates renders a hidden measurement clone; scope to the visible month.
        const day = (n: number) => this.page.locator('td.CalendarDay:visible').filter({ hasText: new RegExp(`^${n}$`) }).first();
        await day(startDay).click();
        await day(endDay).click();
        await this.withRefetch(() => this.page.getByRole('button', { name: 'Ok', exact: true }).click());
    }

    /** Reset all active filters. */
    async reset(): Promise<void> {
        if (await this.resetButton.isVisible().catch(() => false)) {
            await this.withRefetch(() => this.resetButton.click());
        }
    }

    /** Active-filter count from the funnel badge (0 when none). */
    async activeFilterCount(): Promise<number> {
        const txt = (await this.funnel.innerText().catch(() => '')) ?? '';
        const m = txt.match(/\d+/);
        return m ? Number(m[0]) : 0;
    }

    private async withRefetch(action: () => Promise<void>): Promise<void> {
        const resp = this.resource
            ? this.page
                  .waitForResponse(
                      (r) =>
                          new RegExp(`/dokan/v\\d+/${this.resource}(\\?|$)`).test(r.url()) &&
                          !new RegExp(`/${this.resource}/\\d+`).test(r.url()) &&
                          r.request().method() === 'GET',
                      { timeout: 15000 },
                  )
                  .catch(() => null)
            : null;
        await action();
        await resp;
        await this.page.waitForTimeout(400);
    }
}
