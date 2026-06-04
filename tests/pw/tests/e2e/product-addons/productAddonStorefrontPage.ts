import { Page, expect, request, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { serialize } from 'php-serialize';
import { toPath, SERVER_URL } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';

const { DB_PREFIX } = process.env;

// ============================================
// ENVIRONMENT
// ============================================
const { ADMIN, ADMIN_PASSWORD, VENDOR_ID } = process.env;

function basicAuth(username: string, password: string): string {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

// Parse a WooCommerce-formatted price string into a number, tolerant of the store's
// decimal/thousands separators. This store renders "$110,00" (comma decimal), so a
// naive digit+dot strip turns "110,00" into 11000 — we must detect which separator
// is the decimal one (the right-most of '.' / ',') before normalizing.
export function parsePrice(text: string): number {
    const cleaned = text.replace(/[^0-9.,]/g, '');
    if (!cleaned) return NaN;
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    let normalized: string;
    if (lastComma > lastDot) {
        // comma is the decimal separator: dots are thousands separators.
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
        // dot is the decimal separator: commas are thousands separators.
        normalized = cleaned.replace(/,/g, '');
    } else {
        normalized = cleaned;
    }
    return Number(normalized);
}

// ============================================
// TYPES
// ============================================
export type AddonPriceType = 'flat_fee' | 'quantity_based' | 'percentage_based';

// One product-level add-on field, in the persisted `_product_addons` shape that the
// WooCommerce Product Add-ons frontend renders on the single-product page.
export interface StorefrontAddonField {
    name: string;
    type: 'multiple_choice' | 'checkbox' | 'custom_text' | 'custom_price' | 'input_multiplier';
    required?: 0 | 1;
    price_type?: AddonPriceType;
    price?: string;
    adjust_price?: 0 | 1;
    min?: number;
    max?: number;
    options?: Array<{ label: string; price: string; price_type: AddonPriceType; image?: string }>;
}

function field(partial: StorefrontAddonField): Record<string, unknown> {
    return {
        name: partial.name,
        title_format: 'label',
        description_enable: 0,
        description: '',
        type: partial.type,
        display: 'select',
        position: 0,
        required: partial.required ?? 0,
        restrictions: partial.min || partial.max ? 1 : 0,
        restrictions_type: 'any_text',
        adjust_price: partial.adjust_price ?? (partial.price ? 1 : 0),
        price_type: partial.price_type ?? 'flat_fee',
        price: partial.price ?? '',
        min: partial.min ?? 0,
        max: partial.max ?? 0,
        options: partial.options ?? [],
    };
}

// ============================================
// SELECTORS (WooCommerce Product Add-ons frontend)
// ============================================
export const storefrontSelectors = {
    addonsContainer: '.wc-pao-addons-container, #product-addons-total',
    addonWrap: '.wc-pao-addon',
    grandTotal: '.wc-pao-subtotal-line .amount, #product-addons-total .price .amount',
    addToCart: '.single_add_to_cart_button',
    cartTotal: '.order-total .amount, .cart-subtotal .amount',
    cartItemMeta: '.wc-pao-addon-container, .variation, .wc-item-meta',
    wooNotice: '.woocommerce-error, .wc-block-components-validation-error, .woocommerce-NoticeGroup',
};

// ============================================
// REST SEEDING
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
    async post(endpoint: string, data: any): Promise<any> {
        const r = await this._context!.post(`${SERVER_URL}${endpoint}`, { headers: this.adminAuth(), data });
        return r.json();
    },
    async get(endpoint: string): Promise<any> {
        const r = await this._context!.get(`${SERVER_URL}${endpoint}`, { headers: this.adminAuth() });
        return r.json();
    },
    async del(endpoint: string): Promise<void> {
        await this._context!.delete(`${SERVER_URL}${endpoint}`, { headers: this.adminAuth() });
    },

    async getProductCategoryId(): Promise<number> {
        const cats = await this.get('/wc/v3/products/categories?per_page=1');
        if (Array.isArray(cats) && cats[0]?.id) return Number(cats[0].id);
        const created = await this.post('/wc/v3/products/categories', { name: `pw_cat_${faker.string.nanoid(6)}` });
        return Number(created.id);
    },

    // Seed a published vendor product carrying `_product_addons` + an optional
    // exclude-global flag. WC REST silently drops a `_product_addons` meta write
    // (the WC Product Add-ons plugin protects that key — it persists as `a:0:{}`),
    // so the add-on array is written straight to wp_postmeta, PHP-serialized.
    async seedProductWithAddons(
        fields: StorefrontAddonField[],
        opts: { basePrice?: string; excludeGlobal?: boolean; categoryId?: number } = {}
    ): Promise<{ id: string; slug: string; name: string; base: number }> {
        const name = `PW Addon Product ${faker.string.nanoid(6)}`;
        const base = opts.basePrice ?? '100';
        const product = await this.post('/wc/v3/products', {
            name,
            type: 'simple',
            regular_price: base,
            status: 'publish',
            categories: opts.categoryId ? [{ id: opts.categoryId }] : [],
        });
        const id = String(product.id);
        await dbUtils.updateCell(id, VENDOR_ID); // vendor ownership

        if (fields.length) {
            await this.setPostMeta(id, '_product_addons', serialize(fields.map(field)));
        }
        if (opts.excludeGlobal) {
            await this.setPostMeta(id, '_product_addons_exclude_global', '1');
        }
        return { id, slug: product.slug, name, base: Number(base) };
    },

    // Upsert a single post meta row with an already-serialized value.
    async setPostMeta(postId: string, key: string, value: string): Promise<void> {
        const prefix = DB_PREFIX;
        const exists = await dbUtils.dbQuery(
            `SELECT meta_id FROM ${prefix}_postmeta WHERE post_id = ? AND meta_key = ?;`,
            [postId, key]
        );
        if (Array.isArray(exists) && exists.length) {
            await dbUtils.dbQuery(`UPDATE ${prefix}_postmeta SET meta_value = ? WHERE post_id = ? AND meta_key = ?;`, [value, postId, key]);
        } else {
            await dbUtils.dbQuery(`INSERT INTO ${prefix}_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?);`, [postId, key, value]);
        }
    },

    // Seed a global add-on restricted to a category, owned by the vendor.
    // Dokan's storefront scopes global add-ons by post_author (it only loads
    // add-ons authored by the product's vendor), so the add-on must be re-assigned
    // to the vendor or it never renders on the vendor's product page.
    async seedGlobalAddon(categoryId: number): Promise<string> {
        const body = await this.post('/wc-product-add-ons/v1/product-add-ons', {
            name: `PW Global SF ${faker.string.nanoid(6)}`,
            priority: 10,
            restrict_to_categories: [categoryId],
            fields: [field({ name: `Gift wrap ${faker.string.nanoid(4)}`, type: 'checkbox', options: [{ label: 'Yes', price: '5', price_type: 'flat_fee' }] })],
        });
        // Fail loudly on a bad/non-object response so a retrying caller re-attempts
        // instead of proceeding with an "undefined" id that can never render.
        if (!body?.id) {
            throw new Error(`seedGlobalAddon: create returned no id — ${JSON.stringify(body).slice(0, 200)}`);
        }
        const id = String(body.id);
        await dbUtils.updateCell(id, VENDOR_ID); // vendor ownership (storefront author scoping)
        return id;
    },

    async deleteProduct(id: string): Promise<void> {
        await this.del(`/wc/v3/products/${id}?force=true`);
    },
    async deleteAddon(id: string): Promise<void> {
        await this.del(`/wc-product-add-ons/v1/product-add-ons/${id}?force=true`);
    },
};

// ============================================
// PAGE OBJECT
// ============================================
export class ProductAddonStorefrontPage {
    constructor(readonly page: Page) {}

    async gotoProduct(slug: string): Promise<void> {
        await this.page.goto(toPath(`product/${slug}/`));
        await this.page.waitForLoadState('domcontentloaded');
    }

    // The WC Product Add-ons fields render inside the add-to-cart form. Assert the
    // field's visible label (option text lives inside a <select> and is "hidden").
    async assertAddonRenders(label: string): Promise<void> {
        await expect(this.page.locator('label, .wc-pao-addon-name').filter({ hasText: label }).first()).toBeVisible({ timeout: 20_000 });
    }

    async assertAddonHidden(label: string): Promise<void> {
        await expect(this.page.locator('label, .wc-pao-addon-name').filter({ hasText: label })).toHaveCount(0);
    }

    // An option exists in the rendered field (it lives inside a <select>, so assert
    // presence in the DOM rather than visibility).
    async assertOptionAvailable(optionLabel: string): Promise<void> {
        await expect(this.page.locator(`option[data-label="${optionLabel}"], .wc-pao-addon label:has-text("${optionLabel}")`).first()).toHaveCount(1);
    }

    // Pick an option. Select-display addons render a <select> (option carries
    // data-label); radio/image displays render clickable inputs.
    async selectOption(optionLabel: string): Promise<void> {
        const option = this.page.locator(`option[data-label="${optionLabel}"]`).first();
        if (await option.count()) {
            const value = await option.getAttribute('value');
            const select = this.page.locator('select.wc-pao-addon-select, .wc-pao-addon select').filter({ has: this.page.locator(`option[data-label="${optionLabel}"]`) }).first();
            await select.selectOption(value!);
        } else {
            const input = this.page.getByText(optionLabel, { exact: false }).first();
            await input.scrollIntoViewIfNeeded();
            await input.click();
        }
    }

    async setQuantity(qty: number): Promise<void> {
        const q = this.page.locator('input.qty, input[name="quantity"]').first();
        await q.fill(String(qty));
    }

    async fillCustomPrice(value: string): Promise<void> {
        const input = this.page.locator('.wc-pao-addon input[type="text"], .wc-pao-addon input[type="number"]').first();
        await input.fill(value);
        await input.blur();
    }

    // Read the live "grand total" the add-ons script renders under the form.
    async readGrandTotal(): Promise<number> {
        const total = this.page.locator(storefrontSelectors.grandTotal).first();
        await total.waitFor({ state: 'visible', timeout: 10_000 });
        return parsePrice(await total.innerText());
    }

    async addToCart(): Promise<void> {
        await this.page.locator(storefrontSelectors.addToCart).click();
        await this.page.waitForLoadState('networkidle');
    }

    async gotoCart(): Promise<void> {
        await this.page.goto(toPath('cart/'));
        await this.page.waitForLoadState('domcontentloaded');
    }

    async assertInCart(label: string): Promise<void> {
        await this.gotoCart();
        await expect(this.page.getByText(label, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
    }

    async readCartTotal(): Promise<number> {
        const total = this.page.locator(storefrontSelectors.cartTotal).last();
        return parsePrice(await total.innerText());
    }

    // A required/invalid add-on field must prevent the product from being added.
    // WC Product Add-ons enforces required fields and min/max with its own client-side
    // validation (no server-rendered .woocommerce-error and no HTML5 form invalidity),
    // so the only reliable, mechanism-agnostic signal is the outcome: the (uniquely
    // named) product never makes it into the cart. Assert that directly.
    async assertAddToCartBlocked(productName: string): Promise<void> {
        await this.page.locator(storefrontSelectors.addToCart).click();
        await this.page.waitForTimeout(2000); // allow a submit/AJAX attempt to settle
        await this.gotoCart();
        await expect(this.page.getByText(productName, { exact: false })).toHaveCount(0);
    }
}
