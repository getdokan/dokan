import { Page, Locator, expect, request, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { toPath, SERVER_URL } from '@utils/helpers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const { ADMIN, ADMIN_PASSWORD, VENDOR, USER_PASSWORD } = process.env;

// ============================================
// HELPER FUNCTIONS
// ============================================
function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

// ============================================
// ADD-ON TYPE MATRIX
// ============================================
// Mirrors the Product Add-ons module data model
// (dokan-pro/modules/product-addon/src/js/product-editor):
//   - ADDON_TYPES   → the field type
//   - RULES         → which sub-controls each type exposes
//   - PRICE_TYPES / DISPLAY_FORMATS / RESTRICTION_TYPES / TITLE_FORMATS → enums
// and the persisted shape produced by ProductEditorFields::sanitize_addons()
// (includes/ProductEditorFields.php), which is what `_product_addons` meta holds.
export type AddonType =
    | 'multiple_choice'
    | 'checkbox'
    | 'custom_text'
    | 'custom_textarea'
    | 'file_upload'
    | 'custom_price'
    | 'input_multiplier'
    | 'heading';

export type AddonPriceType = 'flat_fee' | 'quantity_based' | 'percentage_based';
export type AddonDisplay = 'select' | 'radiobutton' | 'images';
export type AddonTitleFormat = 'label' | 'heading' | 'hide';
export type AddonRestriction =
    | 'any_text'
    | 'only_letters'
    | 'only_numbers'
    | 'only_letters_numbers'
    | 'email';

// A single priced option row (multiple_choice / checkbox).
export interface AddonOptionSpec {
    label: string;
    price: string;
    priceType?: AddonPriceType;
    image?: string; // only persisted/visible when display === 'images'
}

// One add-on, with every sub-control the type supports. Optional props are only
// filled (and only asserted) when present, so each spec stays type-appropriate.
export interface AddonSpec {
    type: AddonType;
    name: string;
    display?: AddonDisplay; // multiple_choice only
    titleFormat?: AddonTitleFormat; // every type except heading
    required?: boolean; // every type except heading
    description?: string; // enables "Add description" + fills the text
    restrictionsType?: AddonRestriction; // header dropdown, custom_text only
    restrictions?: { min: number; max: number }; // char/price/quantity range
    adjustPrice?: { priceType: AddonPriceType; value: string };
    options?: AddonOptionSpec[];
}

// Full-coverage matrix: one add-on of every type, each configured with all of the
// sub-controls its RULES entry exposes — multiple priced options across all three
// price types, display/title-format variants, description, required, restrictions
// with a min/max range, and price adjustment with a type + value.
export const addonMatrix = (suffix: string): AddonSpec[] => [
    {
        type: 'multiple_choice',
        name: `Choice ${suffix}`,
        display: 'radiobutton',
        titleFormat: 'heading',
        required: true,
        description: `Pick a colour ${suffix}`,
        options: [
            { label: 'Red', price: '5', priceType: 'flat_fee' },
            { label: 'Blue', price: '3.5', priceType: 'quantity_based' },
            { label: 'Gold', price: '10', priceType: 'percentage_based' },
        ],
    },
    {
        type: 'checkbox',
        name: `Checkboxes ${suffix}`,
        required: true,
        options: [
            { label: 'Gift wrap', price: '2.5', priceType: 'flat_fee' },
            { label: 'Greeting card', price: '1', priceType: 'flat_fee' },
        ],
    },
    {
        type: 'custom_text',
        name: `Short Text ${suffix}`,
        titleFormat: 'label',
        restrictionsType: 'only_letters',
        restrictions: { min: 2, max: 20 },
        adjustPrice: { priceType: 'flat_fee', value: '4' },
        required: true,
        description: `Your name ${suffix}`,
    },
    {
        type: 'custom_textarea',
        name: `Long Text ${suffix}`,
        restrictions: { min: 10, max: 200 },
        adjustPrice: { priceType: 'quantity_based', value: '6' },
    },
    {
        type: 'file_upload',
        name: `File Upload ${suffix}`,
        adjustPrice: { priceType: 'percentage_based', value: '15' },
        required: true,
    },
    {
        type: 'custom_price',
        name: `Customer Price ${suffix}`,
        restrictions: { min: 5, max: 500 },
    },
    {
        type: 'input_multiplier',
        name: `Quantity ${suffix}`,
        restrictions: { min: 1, max: 99 },
        adjustPrice: { priceType: 'flat_fee', value: '2' },
    },
    {
        type: 'heading',
        name: `Heading ${suffix}`,
    },
];

// Focused matrix: a single multiple_choice add-on shown as images, with one
// option per price type — proves option ordering, every price_type, and the
// images-only image field all persist.
export const imageOptionAddon = (suffix: string): AddonSpec => ({
    type: 'multiple_choice',
    name: `Image Choice ${suffix}`,
    display: 'images',
    options: [
        { label: 'Small', price: '0', priceType: 'flat_fee', image: '101' },
        { label: 'Medium', price: '4.25', priceType: 'quantity_based', image: '102' },
        { label: 'Large', price: '12', priceType: 'percentage_based', image: '103' },
    ],
});

// ============================================
// SELECTORS
// ============================================
export const addonsSelectors = {
    dashboardRoot: '#dokan-vendor-dashboard-root',
    nameInput:
        'input[name="name"], input[placeholder*="title" i], input[placeholder*="name" i]',
    saveButton: 'button:has-text("Update Product"), button:has-text("Save Changes")',
    successToast: 'text=/Product saved successfully/i',
    // The Add-ons section is registered as a card with header, label "Add-ons".
    addonsSectionHeader: 'text=/^Add-ons$/',
    addonsEditor: '.dokan-product-addons-editor',
    addField: 'button:has-text("Add Field")',
};

// ============================================
// API CLIENT
// ============================================
export const api = {
    _context: null as APIRequestContext | null,

    async init() {
        this._context = await request.newContext();
    },
    async dispose() {
        await this._context?.dispose();
    },
    adminAuth() {
        return { Authorization: basicAuth(ADMIN!, ADMIN_PASSWORD!) };
    },
    vendorAuth() {
        return { Authorization: basicAuth(VENDOR!, USER_PASSWORD!) };
    },
    async get(endpoint: string, headers?: Record<string, string>): Promise<any> {
        const r = await this._context!.get(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
        });
        return r.json();
    },
    async post(endpoint: string, data: any, headers?: Record<string, string>): Promise<any> {
        const r = await this._context!.post(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
            data,
        });
        return r.json();
    },
    async del(endpoint: string, headers?: Record<string, string>): Promise<void> {
        await this._context!.delete(`${SERVER_URL}${endpoint}`, {
            headers: headers ?? this.adminAuth(),
        });
    },

    async getProductCategoryId(): Promise<number> {
        const cats = await this.get('/wc/v3/products/categories?per_page=1');
        if (Array.isArray(cats) && cats[0]?.id) {
            return Number(cats[0].id);
        }
        const created = await this.post('/wc/v3/products/categories', {
            name: `pw_cat_${faker.string.nanoid(6)}`,
        });
        return Number(created.id);
    },

    // Seed a saveable, vendor-owned product so the editor opens in EDIT mode.
    async createVendorProduct(categoryId: number): Promise<[string, string]> {
        const name = `PW Addons ${faker.string.nanoid(6)}`;
        const json = await this.post(
            '/dokan/v1/products',
            {
                name,
                type: 'simple',
                regular_price: '20',
                status: 'publish',
                categories: [{ id: categoryId }],
                description: '<p>product add-ons test</p>',
                short_description: '<p>add-ons</p>',
            },
            this.vendorAuth()
        );
        return [String(json.id), name];
    },

    async deleteProduct(productId: string): Promise<void> {
        await this.del(`/dokan/v1/products/${productId}?force=true`, this.vendorAuth());
    },

    // Read the persisted _product_addons meta straight from the product.
    async getProductAddons(productId: string): Promise<any[]> {
        const product = await this.get(`/dokan/v1/products/${productId}`, this.vendorAuth());
        const meta = Array.isArray(product?.meta_data) ? product.meta_data : [];
        const entry = meta.find((m: any) => m.key === '_product_addons');
        return Array.isArray(entry?.value) ? entry.value : [];
    },
};

// ============================================
// PAGE OBJECT
// ============================================
export class ProductFormManagerAddonsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void this.installAnnouncementModalHandler();
    }

    private async installAnnouncementModalHandler(): Promise<void> {
        const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
        const pwf = this.page as Page & { [installed]?: boolean };
        if (pwf[installed]) return;
        pwf[installed] = true;
        const modal = this.page.locator('.vendor-announcement-modal');
        await this.page
            .addLocatorHandler(
                modal,
                async () => {
                    const btn = modal.locator('button[aria-label="Close"]').first();
                    if (await btn.isVisible().catch(() => false)) {
                        await btn.click({ timeout: 2000 }).catch(() => undefined);
                    } else {
                        await this.page.keyboard.press('Escape').catch(() => undefined);
                    }
                },
                { noWaitAfter: true }
            )
            .catch(() => undefined);
    }

    // ----------------------------------------------------------------
    // NAVIGATION
    // ----------------------------------------------------------------
    async gotoEditor(productId: string): Promise<void> {
        await this.page.goto(toPath(`dashboard/new/#/products/${productId}/edit`));
        await this.page.waitForLoadState('domcontentloaded');
        await this.page
            .locator(addonsSelectors.dashboardRoot)
            .waitFor({ state: 'visible', timeout: 30000 });
        await this.page
            .locator(addonsSelectors.nameInput)
            .first()
            .waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForFunction(
            () => Boolean((window as any).dokanProductEditor?.product_id),
            undefined,
            { timeout: 30000 }
        );
    }

    // Expand the collapsible "Add-ons" card so the repeater is interactive.
    async openAddonsSection(): Promise<void> {
        const header = this.page.locator(addonsSelectors.addonsSectionHeader).first();
        await header.waitFor({ state: 'visible', timeout: 20000 });
        await header.scrollIntoViewIfNeeded();
        const addField = this.page.locator(addonsSelectors.addField).first();
        if (!(await addField.isVisible().catch(() => false))) {
            await header.click();
        }
        await addField.waitFor({ state: 'visible', timeout: 20000 });
    }

    // ----------------------------------------------------------------
    // CARD-SCOPED LOCATORS
    // ----------------------------------------------------------------
    // Every locator below is resolved by the value/option-text it is unique for,
    // so it stays correct regardless of how many other selects/inputs the card
    // renders for the chosen type (see AddonBody.tsx and its sub-components).
    private addonCards(): Locator {
        return this.page.locator(`${addonsSelectors.addonsEditor} > div.shadow-sm`);
    }
    private typeSelect(card: Locator): Locator {
        return card.locator('select').first();
    }
    private titleInput(card: Locator): Locator {
        return card.locator('input[required]').first();
    }
    // "Display as" (multiple_choice): the only select carrying a radiobutton option.
    private displaySelect(card: Locator): Locator {
        return card.locator('select:has(option[value="radiobutton"])');
    }
    // Header "Restriction" dropdown (custom_text): the only select with text restrictions.
    private restrictionTypeSelect(card: Locator): Locator {
        return card.locator('select:has(option[value="only_letters"])');
    }
    // "Format title": the only select that offers a "hide" option.
    private formatTitleSelect(card: Locator): Locator {
        return card.locator('select:has(option[value="hide"])');
    }
    // Toggle labels come from the Form Manager admin sub-field config
    // (ProductEditorFields), not the module's code defaults, so match the
    // configured accessible names: "Add description", "Required field",
    // "Restrictions", "Adjust price".
    private descriptionToggle(card: Locator): Locator {
        return card.getByRole('checkbox', { name: 'Add description' });
    }
    private descriptionTextarea(card: Locator): Locator {
        return card.locator('textarea').first();
    }
    private requiredToggle(card: Locator): Locator {
        return card.getByRole('checkbox', { name: 'Required field', exact: true });
    }
    // Option rows: label inputs, price inputs (step="0.01"), price-type selects and
    // image inputs are index-aligned arrays — one entry per option row.
    private optionLabels(card: Locator): Locator {
        return card.getByPlaceholder('Enter an option');
    }
    private optionPrices(card: Locator): Locator {
        return card.locator('input[type="number"][step="0.01"]');
    }
    private optionPriceTypes(card: Locator): Locator {
        return card.locator('select:has(option[value="quantity_based"])');
    }
    private optionImages(card: Locator): Locator {
        return card.getByPlaceholder('Image URL or attachment ID');
    }
    private addOptionBtn(card: Locator): Locator {
        return card.locator('button:has-text("Add Option")');
    }
    private restrictionsToggle(card: Locator): Locator {
        return card.getByRole('checkbox', { name: 'Restrictions', exact: true });
    }
    // Restriction min/max are the card's only number inputs that are NOT option prices.
    private rangeInputs(card: Locator): Locator {
        return card.locator('input[type="number"]:not([step="0.01"])');
    }
    private adjustPriceToggle(card: Locator): Locator {
        return card.getByRole('checkbox', { name: 'Adjust price', exact: true });
    }
    private adjustPriceTypeSelect(card: Locator): Locator {
        // Same enum as an option price_type, but adjust-price types never render
        // options, so this select is unambiguous within the card.
        return card.locator('select:has(option[value="percentage_based"])').first();
    }
    private adjustPriceValueInput(card: Locator): Locator {
        return card.locator('input[inputmode="decimal"]').first();
    }

    // ----------------------------------------------------------------
    // ADD-ON AUTHORING
    // ----------------------------------------------------------------
    private async ensureOptionRows(card: Locator, count: number): Promise<void> {
        let existing = await this.optionLabels(card).count();
        while (existing < count) {
            await this.addOptionBtn(card).click();
            existing += 1;
            await expect(this.optionLabels(card)).toHaveCount(existing);
        }
    }

    private async fillOptions(card: Locator, spec: AddonSpec): Promise<void> {
        const options = spec.options ?? [];
        await this.ensureOptionRows(card, options.length);

        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            if (!opt) continue;
            await this.optionLabels(card).nth(i).fill(opt.label);
            await this.optionPrices(card).nth(i).fill(opt.price);
            if (opt.priceType) {
                await this.optionPriceTypes(card).nth(i).selectOption(opt.priceType);
            }
            if ('images' === spec.display && opt.image !== undefined) {
                await this.optionImages(card).nth(i).fill(opt.image);
            }
        }
    }

    /**
     * Click "Add Field" and fully configure the freshly-appended card for the
     * given spec. A new card is appended last and auto-expanded, so the last
     * card is unambiguously the new one at the moment it is added. Each optional
     * sub-control is only touched when the spec provides it.
     */
    async addAddonField(spec: AddonSpec): Promise<void> {
        const before = await this.addonCards().count();

        // The first click right after the section renders can be lost before the
        // repeater's onClick is wired, so retry until a new card actually appears.
        const addBtn = this.page.locator(addonsSelectors.addField).first();
        await expect(async () => {
            await addBtn.click();
            await expect(this.addonCards()).toHaveCount(before + 1, { timeout: 2000 });
        }).toPass({ timeout: 15000 });

        const card = this.addonCards().nth(before);

        // Type first — it re-renders the body with the type's sub-controls.
        await this.typeSelect(card).selectOption(spec.type);

        // Title (the only required text input in the card body).
        const title = this.titleInput(card);
        await title.fill(spec.name);
        await title.blur();

        if (spec.display) {
            await this.displaySelect(card).selectOption(spec.display);
        }
        if (spec.restrictionsType) {
            await this.restrictionTypeSelect(card).selectOption(spec.restrictionsType);
        }
        if (spec.titleFormat) {
            await this.formatTitleSelect(card).selectOption(spec.titleFormat);
        }
        if (spec.description) {
            await this.descriptionToggle(card).check();
            await this.descriptionTextarea(card).fill(spec.description);
        }
        if (spec.required) {
            await this.requiredToggle(card).check();
        }
        if (spec.options?.length) {
            await this.fillOptions(card, spec);
        }
        if (spec.restrictions) {
            await this.restrictionsToggle(card).check();
            await this.rangeInputs(card).nth(0).fill(String(spec.restrictions.min));
            await this.rangeInputs(card).nth(1).fill(String(spec.restrictions.max));
        }
        if (spec.adjustPrice) {
            await this.adjustPriceToggle(card).check();
            await this.adjustPriceTypeSelect(card).selectOption(spec.adjustPrice.priceType);
            await this.adjustPriceValueInput(card).fill(spec.adjustPrice.value);
        }
    }

    async addAddonFields(specs: AddonSpec[]): Promise<void> {
        await this.openAddonsSection();
        for (const spec of specs) {
            await this.addAddonField(spec);
        }
    }

    // ----------------------------------------------------------------
    // EDIT / REMOVE (operates on already-saved, hydrated cards)
    // ----------------------------------------------------------------
    // Hydrated cards render collapsed (expanded state starts empty in
    // ProductAddonsEdit), so find them by the title shown in their header.
    private cardByTitle(title: string): Locator {
        return this.addonCards().filter({ hasText: title });
    }

    // Reopen the editor for an existing product and expand the Add-ons section.
    async reopen(productId: string): Promise<void> {
        await this.gotoEditor(productId);
        await this.openAddonsSection();
    }

    // Proof the saved add-on hydrated back into the editor.
    async assertCardVisible(title: string): Promise<void> {
        await expect(this.cardByTitle(title).first()).toBeVisible({ timeout: 20000 });
    }

    // Expand a collapsed card so its body (options, toggles) is interactive.
    private async expandCard(card: Locator): Promise<void> {
        const expand = card.locator('button[aria-label="Expand"]').first();
        if (await expand.isVisible().catch(() => false)) {
            await expand.click();
        }
        await this.typeSelect(card).first().waitFor({ state: 'visible', timeout: 10000 });
    }

    // Delete one option row from a card by index, confirming the row count drops.
    async removeOption(title: string, index: number): Promise<void> {
        const card = this.cardByTitle(title).first();
        await this.expandCard(card);
        const before = await this.optionLabels(card).count();
        await card.locator('button[aria-label="Remove option"]').nth(index).click();
        await expect(this.optionLabels(card)).toHaveCount(before - 1);
    }

    // Remove an entire add-on via the header button + the "Remove Add-on?" modal.
    async removeAddon(title: string): Promise<void> {
        const card = this.cardByTitle(title).first();
        await card.getByRole('button', { name: 'Remove', exact: true }).click();
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: 'Remove', exact: true }).click();
        await expect(this.cardByTitle(title)).toHaveCount(0);
    }

    // ----------------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------------
    async save(): Promise<void> {
        await this.page.locator(addonsSelectors.saveButton).first().click();
        await expect(this.page.locator(addonsSelectors.successToast).first()).toBeVisible({
            timeout: 20000,
        });
    }

    // ----------------------------------------------------------------
    // ASSERTIONS
    // ----------------------------------------------------------------
    // Asserts every sub-control the spec set round-tripped into the persisted
    // _product_addons entry with the value/type sanitize_addons() writes.
    private assertAddonMatches(saved: any, spec: AddonSpec): void {
        const match = saved.find((a: any) => a.name === spec.name);
        expect(match, `missing add-on "${spec.name}" (${spec.type})`).toBeTruthy();
        expect(match.type).toBe(spec.type);

        if (spec.display) {
            expect(match.display, `display for "${spec.name}"`).toBe(spec.display);
        }
        if (spec.titleFormat) {
            expect(match.title_format, `title_format for "${spec.name}"`).toBe(spec.titleFormat);
        }
        if (spec.required !== undefined) {
            expect(Number(match.required), `required for "${spec.name}"`).toBe(spec.required ? 1 : 0);
        }
        if (spec.description) {
            expect(Number(match.description_enable), `description_enable for "${spec.name}"`).toBe(1);
            expect(match.description, `description for "${spec.name}"`).toBe(spec.description);
        }
        if (spec.restrictionsType) {
            expect(match.restrictions_type, `restrictions_type for "${spec.name}"`).toBe(
                spec.restrictionsType
            );
        }
        if (spec.restrictions) {
            expect(Number(match.restrictions), `restrictions for "${spec.name}"`).toBe(1);
            expect(Number(match.min), `min for "${spec.name}"`).toBe(spec.restrictions.min);
            expect(Number(match.max), `max for "${spec.name}"`).toBe(spec.restrictions.max);
        }
        if (spec.adjustPrice) {
            expect(Number(match.adjust_price), `adjust_price for "${spec.name}"`).toBe(1);
            expect(match.price_type, `price_type for "${spec.name}"`).toBe(spec.adjustPrice.priceType);
            expect(Number(match.price), `price for "${spec.name}"`).toBe(Number(spec.adjustPrice.value));
        }
        if (spec.options?.length) {
            const savedOpts = Array.isArray(match.options) ? match.options : [];
            expect(savedOpts.length, `option count for "${spec.name}"`).toBe(spec.options.length);
            spec.options.forEach((opt, i) => {
                const so = savedOpts[i];
                expect(so?.label, `option ${i} label for "${spec.name}"`).toBe(opt.label);
                expect(Number(so?.price), `option ${i} price for "${spec.name}"`).toBe(Number(opt.price));
                if (opt.priceType) {
                    expect(so?.price_type, `option ${i} price_type for "${spec.name}"`).toBe(opt.priceType);
                }
                if ('images' === spec.display && opt.image !== undefined) {
                    expect(String(so?.image), `option ${i} image for "${spec.name}"`).toBe(opt.image);
                }
            });
        }
    }

    // ----------------------------------------------------------------
    // SCENARIO
    // ----------------------------------------------------------------
    /**
     * Adds every supplied add-on through the real editor UI, saves, and asserts
     * each one round-tripped — with all of its configured sub-controls — into the
     * product's `_product_addons` meta. Proof that the product is created/updated
     * with every option the add-ons feature offers.
     */
    async assertAddonsPersist(productId: string, specs: AddonSpec[]): Promise<void> {
        await this.gotoEditor(productId);
        await this.addAddonFields(specs);
        await this.save();

        // Pull the persisted meta straight from REST.
        const saved = await api.getProductAddons(productId);

        expect(
            saved.length,
            `saved add-ons: ${JSON.stringify(saved.map((a: any) => a.type))}`
        ).toBe(specs.length);

        for (const spec of specs) {
            this.assertAddonMatches(saved, spec);
        }
    }
}
