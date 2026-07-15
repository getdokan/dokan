import { Page, expect, request as pwRequest, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers, parseBoolean } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { customer, product } from '@utils/interfaces';

// Re-export the REAL utilities under the names the spec imports from this module.
// The spec does: import { WholesalePage, CustomerPage, ProductsPage, ApiUtils, dbUtils, dbData, data, payloads } from './wholesalePage';
export { dbUtils, dbData, data, payloads };

/**
 * Null-tolerant ApiUtils wrapper (mirrors the sibling legacy page objects).
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real call.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async createWholesaleCustomer(...args: Parameters<RealApiUtils['createWholesaleCustomer']>): ReturnType<RealApiUtils['createWholesaleCustomer']> {
        await this.ready();
        return super.createWholesaleCustomer(...args);
    }

    override async createProduct(...args: Parameters<RealApiUtils['createProduct']>): ReturnType<RealApiUtils['createProduct']> {
        await this.ready();
        return super.createProduct(...args);
    }

    override async createOrder(...args: Parameters<RealApiUtils['createOrder']>): ReturnType<RealApiUtils['createOrder']> {
        await this.ready();
        return super.createOrder(...args);
    }

    override async activateModules(...args: Parameters<RealApiUtils['activateModules']>): ReturnType<RealApiUtils['activateModules']> {
        await this.ready();
        return super.activateModules(...args);
    }

    override async deactivateModules(...args: Parameters<RealApiUtils['deactivateModules']>): ReturnType<RealApiUtils['deactivateModules']> {
        await this.ready();
        return super.deactivateModules(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

const DOKAN_PRO = parseBoolean(process.env.DOKAN_PRO);
const PRODUCT_EDIT_NONCE = process.env.PRODUCT_EDIT_NONCE ?? '';

// ---------------------------------------------------------------------------
// Co-located selectors (ported from the pre-refactor pages/selectors.ts groups
// used by the wholesale flow: admin.dokan.wholesaleCustomer, admin.dokan.menus,
// admin.dokan.settings.menus, admin.users.userInfo, admin.wooCommerce.orders,
// vendor.product(.wholesale), customer.cDashboard, customer.cWholesale,
// customer.cWooSelector, customer.cCart, customer.cShop, customer.cSingleProduct,
// customer.cCheckout, customer.cOrderReceived, frontend/backend auth).
// ---------------------------------------------------------------------------
export const selectors = {
    admin: {
        // Dokan admin menus
        menus: {
            wholesaleCustomer: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Wholesale Customer"]',
        },
        // Dokan settings nav
        settingsMenu: {
            wholesale: '//div[@class="nav-title" and contains(text(),"Wholesale")]',
        },
        // Wholesale customer list page
        wholesaleCustomer: {
            wholesaleCustomerDiv: 'div.wholesale-customer-list',
            wholesaleCustomerText: '.wholesale-customer-list h1',
            navTabs: {
                all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                active: '//ul[@class="subsubsub"]//li//a[contains(text(),"Active")]',
                deActive: '//ul[@class="subsubsub"]//li//a[contains(text(),"Deactive")]',
            },
            bulkActions: {
                selectAll: 'thead .manage-column input',
                selectAction: '.tablenav.top #bulk-action-selector-top',
                applyAction: '.tablenav.top .button.action',
            },
            search: '#post-search-input',
            table: {
                wholesaleCustomerTable: '.wholesale-customer-list table',
                nameColumn: 'thead th.full_name',
                emailColumn: 'thead th.email',
                usernameColumn: 'thead th.username',
                rolesColumn: 'thead th.role',
                registeredColumn: 'thead th.registered',
                statusColumn: 'thead th.wholesale_status',
            },
            numberOfRows: 'div.wholesale-customer-list table tbody tr',
            noRowsFound: '//td[normalize-space()="No customers found."]',
            wholesaleCustomerCell: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']`,
            wholesaleCustomerEdit: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']//span[@class='edit']//a`,
            wholesaleCustomerOrders: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']//span[@class='orders']//a`,
            wholesaleCustomerRemove: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']//span[@class='delete']//a`,
            statusSlider: (username: string) => `//td[contains(text(), '${username}')]/..//label[@class='switch tips']`,
        },
        // wp-admin user edit form
        userInfo: {
            role: '#role',
            firstName: '#first_name',
            lastName: '#last_name',
            nickname: '#nickname',
            email: '#email',
            biographicalInfo: '#description',
            billingAddress: {
                firstName: '#billing_first_name',
                lastName: '#billing_last_name',
                company: '#billing_company',
                address1: '#billing_address_1',
                address2: '#billing_address_2',
                city: '#billing_city',
                postcode: '#billing_postcode',
                country: '//select[@id="billing_country"]/..//span[@class="select2-selection__arrow"]',
                countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
                state: '//select[@id="billing_state"]/..//span[@class="select2-selection__arrow"]',
                stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
                phone: '#billing_phone',
                email: '#billing_email',
            },
            shippingAddress: {
                firstName: '#shipping_first_name',
                lastName: '#shipping_last_name',
                company: '#shipping_company',
                address1: '#shipping_address_1',
                address2: '#shipping_address_2',
                city: '#shipping_city',
                postcode: '#shipping_postcode',
                country: '//select[@id="shipping_country"]/..//span[@class="select2-selection__arrow"]',
                countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
                state: '//select[@id="shipping_state"]/..//span[@class="select2-selection__arrow"]',
                stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
                phone: '#shipping_phone',
            },
        },
        users: {
            updateUser: 'input#submit',
            updateSuccessMessage: '//strong[normalize-space()="User updated."]',
        },
        wooCommerceOrders: {
            noRowsFound: '//td[normalize-space(text())="No items found."]',
        },
    },
    vendor: {
        product: {
            addNewProduct: 'span.dokan-add-product-link .dokan-btn.dokan-btn-theme:first-child',
            search: {
                searchInput: 'input[placeholder="Search Products"]',
                searchBtn: 'button[name="product_listing_search"]',
            },
            title: '#post_title',
            saveProduct: 'input#publish',
            updatedSuccessMessage: 'div.dokan-message',
            productLink: (productName: string) => `//strong//a[contains(text(),'${productName}')]`,
            productCell: (productName: string) => `//strong//a[contains(text(),'${productName}')]/../..`,
            editProduct: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="edit"]//a`,
            rowActions: (productName: string) => `//a[contains(text(), '${productName}')]/../..//div[@class="row-actions"]`,
            wholesale: {
                wholesaleSection: 'div.dokan-wholesale-options',
                enableWholesale: '#wholesale\\[enable_wholesale\\]',
                wholesalePrice: '#dokan-wholesale-price',
                minimumQuantity: '#dokan-wholesale-qty',
            },
        },
    },
    customer: {
        cDashboard: {
            becomeWholesaleCustomer: '#dokan-become-wholesale-customer-btn',
            wholesaleRequestReturnMessage: '.dokan-wholesale-migration-wrapper div.woocommerce-info',
        },
        cRegistration: {
            regEmail: '#reg_email',
            regPassword: '#reg_password',
            regAsCustomer: '//input[@value="customer"]',
            register: '.woocommerce-Button',
        },
        cWholesale: {
            shop: {
                wholesalePrice: 'span.dokan-wholesale-price',
                wholesaleAmount: 'span.dokan-wholesale-price span.woocommerce-Price-amount.amount',
            },
            singleProductDetails: {
                wholesaleInfo: 'p.dokan-wholesale-meta',
            },
        },
        cShop: {
            searchProductLite: '(//input[@class="search-field"])[1]',
            filters: {
                searchProduct: 'input.dokan-form-control[placeholder="Search Products"]',
                search: '.dokan-btn',
            },
            productCard: {
                productTitle: '#main .products .woocommerce-loop-product__title',
                addToCart: '#main .products a.add_to_cart_button',
                viewCart: 'a.added_to_cart',
            },
        },
        cSingleProduct: {
            productDetails: {
                productTitle: '.product_title.entry-title',
                quantity: 'div.quantity input.qty',
                addToCart: 'button.single_add_to_cart_button',
                productAddedSuccessMessage: (productName: string) => `//div[@class="woocommerce-message" and contains(.,"“${productName}” has been added to your cart.")]`,
                productWithQuantityAddedSuccessMessage: (productName: string, quantity: string) => `//div[@class="woocommerce-message" and contains(.,"${quantity} × “${productName}” have been added to your cart.")]`,
            },
            productAddon: {
                addOnSelect: '.wc-pao-addon-select',
            },
        },
        cCart: {
            removeFirstItem: '(//button[@class="wc-block-cart-item__remove-link"])[1]',
            cartEmptyMessage: '.wp-block-woocommerce-empty-cart-block .wc-block-cart__empty-cart__title',
            cartTotal: '//span[normalize-space()="Subtotal"]/..//span[contains(@class, "wc-block-components-totals-item__value")]',
        },
        cCheckout: {
            directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
            checkPayments: '.payment_method_cheque label, label[for="radio-control-wc-payment-method-options-cheque"]',
            cashOnDelivery: '.payment_method_cod label, label[for="radio-control-wc-payment-method-options-cod"]',
            placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
        },
        cOrderReceived: {
            orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
            orderNumber: '.woocommerce-order-overview__order.order strong',
        },
        cWooSelector: {
            wooCommerceSuccessMessage: 'div.woocommerce-message',
            wooCommerceError: 'div.woocommerce-error',
        },
    },
    frontend: {
        customerLogout: '.woocommerce-MyAccount-navigation-link--customer-logout > a',
    },
    backend: {
        email: '#user_login',
        password: '#user_pass',
        login: '#wp-submit',
    },
} as const;

// ---------------------------------------------------------------------------
// Shared, page-first helpers — raw Playwright equivalents of the old basePage
// helpers (goto/goIfNotThere/clickAndWaitForResponse/typeAndWaitForResponse/…).
// Kept module-local (no @pages base class) so each page object stays self-contained.
// ---------------------------------------------------------------------------

// Navigate to a sub-path only if not already there (mirrors basePage.goIfNotThere).
async function goIfNotThere(page: Page, subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
    const target = toPath(subPath);
    if (page.url().replace(/\/$/, '') === target.replace(/\/$/, '')) {
        return;
    }
    await page.goto(target, { waitUntil });
}

// click and wait for a matching REST response (mirrors basePage.clickAndWaitForResponse).
async function clickAndWaitForResponse(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
}

// fill and wait for a matching REST response (mirrors basePage.typeAndWaitForResponse).
async function typeAndWaitForResponse(page: Page, subUrl: string, selector: string, text: string, code = 200): Promise<void> {
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).fill(text)]);
}

// click, wait for load state AND a matching response (mirrors basePage.clickAndWaitForResponseAndLoadState).
async function clickAndWaitForResponseAndLoadState(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    const [, response] = await Promise.all([page.waitForLoadState('load'), page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
    expect(response.status()).toBe(code);
}

// click, wait until network idle AND a matching response (mirrors …UntilNetworkIdle).
async function clickAndWaitForResponseAndNetworkIdle(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    // eslint-disable-next-line playwright/no-networkidle
    const [, response] = await Promise.all([page.waitForLoadState('networkidle'), page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
    expect(response.status()).toBe(code);
}

// click and accept the next dialog while waiting for a response (mirrors clickAndAcceptAndWaitForResponse).
async function clickAndAcceptAndWaitForResponse(page: Page, subUrl: string, selector: string, code = 200): Promise<void> {
    page.once('dialog', dialog => void dialog.accept());
    await Promise.all([page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), page.locator(selector).click()]);
}

// retry an async assertion until it passes (mirrors basePage.toPass / expect.toPass).
async function toPass(asyncFn: () => Promise<void>, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
    await expect(async () => {
        await asyncFn();
    }).toPass(options);
}

// resolve the currently logged-in username from the WordPress cookie (mirrors basePage.getCurrentUser).
async function getCurrentUser(page: Page): Promise<string | undefined> {
    const cookies = await page.context().cookies();
    const cookie = cookies.find(c => c?.name?.startsWith('wordpress_logged_in_'));
    if (!cookie?.value) {
        return undefined;
    }
    return decodeURIComponent(cookie.value).split('|')[0];
}

// computed background-color of an element (mirrors basePage.getElementBackgroundColor) — used for switch state.
async function getBackgroundColor(page: Page, selector: string): Promise<string> {
    return await page.locator(selector).evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
}

// assert every string selector in a (possibly nested) group is visible (mirrors basePage.multipleElementVisible).
async function expectGroupVisible(page: Page, group: Record<string, unknown>): Promise<void> {
    for (const key of Object.keys(group)) {
        const value = group[key];
        if (typeof value === 'string') {
            await expect(page.locator(value)).toBeVisible();
        } else if (typeof value === 'function') {
            continue;
        } else if (value && typeof value === 'object') {
            await expectGroupVisible(page, value as Record<string, unknown>);
        }
    }
}

// ---------------------------------------------------------------------------
// WholesalePage — admin/customer wholesale flows.
// ---------------------------------------------------------------------------
export class WholesalePage {
    readonly page: Page;
    readonly customerPage: CustomerPage;

    constructor(page: Page) {
        this.page = page;
        this.customerPage = new CustomerPage(page);
        void closeAnnouncementModal(page);
    }

    // switch to another (backend) user if not already logged in as them (mirrors loginPage.switchUser).
    private async switchUser(user: { username: string; password: string }): Promise<void> {
        const currentUser = await getCurrentUser(this.page);
        if (currentUser === user.username) {
            return;
        }
        await this.page.goto(toPath(data.subUrls.backend.adminLogin), { waitUntil: 'networkidle' });
        if (await this.page.locator(selectors.backend.email).isVisible().catch(() => false)) {
            await this.page.locator(selectors.backend.email).fill(user.username);
            await this.page.locator(selectors.backend.password).fill(user.password);
            await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.backend.adminDashboard, selectors.backend.login);
        }
    }

    // enable / disable a wholesale-customer status switch only if it needs to change.
    private async toggleWholesaleStatus(subUrl: string, sliderXpath: string, enable: boolean): Promise<void> {
        const spanSelector = /^(\/\/|\(\/\/)/.test(sliderXpath) ? `${sliderXpath}//span` : `${sliderXpath} span`;
        const value = await getBackgroundColor(this.page, spanSelector);
        const isOn = value.includes('rgb(0, 144, 255)');
        if (enable && !isOn) {
            await clickAndWaitForResponse(this.page, subUrl, spanSelector);
        } else if (!enable && isOn) {
            await clickAndWaitForResponse(this.page, subUrl, spanSelector);
        }
    }

    // enable wholesale module
    async enableWholesaleModule(): Promise<void> {
        // dokan menu
        await this.page.goto(toPath(data.subUrls.backend.dokan.dokan));
        await expect(this.page.locator(selectors.admin.menus.wholesaleCustomer)).toBeVisible();

        // dokan settings
        await this.page.goto(toPath(data.subUrls.backend.dokan.settings));
        await expect(this.page.locator(selectors.admin.settingsMenu.wholesale)).toBeVisible();

        // vendor dashboard
        await goIfNotThere(this.page, data.subUrls.frontend.vDashboard.products);
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.vendor.product.addNewProduct).click()]);
        await expect(this.page.locator(selectors.vendor.product.wholesale.wholesaleSection)).toBeVisible();

        // customer dashboard menu
        await this.page.goto(toPath(data.subUrls.frontend.myAccount));
        await expect(this.page.locator(selectors.customer.cDashboard.becomeWholesaleCustomer)).toBeVisible();
    }

    // disable wholesale module
    async disableWholesaleModule(): Promise<void> {
        // dokan menu
        await this.page.goto(toPath(data.subUrls.backend.dokan.dokan));
        await expect(this.page.locator(selectors.admin.menus.wholesaleCustomer)).toBeHidden();

        // dokan menu page
        await this.page.goto(toPath(data.subUrls.backend.dokan.wholeSaleCustomer));
        await expect(this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerDiv)).toBeHidden();

        // dokan settings
        await this.page.goto(toPath(data.subUrls.backend.dokan.settings));
        await expect(this.page.locator(selectors.admin.settingsMenu.wholesale)).toBeHidden();

        // vendor dashboard
        await goIfNotThere(this.page, data.subUrls.frontend.vDashboard.products);
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.vendor.product.addNewProduct).click()]);
        await expect(this.page.locator(selectors.vendor.product.wholesale.wholesaleSection)).toBeHidden();

        // customer dashboard menu
        await this.page.goto(toPath(data.subUrls.frontend.myAccount));
        await expect(this.page.locator(selectors.customer.cDashboard.becomeWholesaleCustomer)).toBeHidden();
    }

    // wholesale customers render properly
    async adminWholesaleCustomersRenderProperly(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.backend.dokan.wholeSaleCustomer);

        await expect(this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerText)).toBeVisible();
        await expectGroupVisible(this.page, selectors.admin.wholesaleCustomer.navTabs);
        await expectGroupVisible(this.page, selectors.admin.wholesaleCustomer.bulkActions);
        await expect(this.page.locator(selectors.admin.wholesaleCustomer.search)).toBeVisible();
        await expectGroupVisible(this.page, selectors.admin.wholesaleCustomer.table);
    }

    // search wholesale customer
    async searchWholesaleCustomer(wholesaleCustomer: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.backend.dokan.wholeSaleCustomer);
        await this.page.locator(selectors.admin.wholesaleCustomer.search).fill('');
        await typeAndWaitForResponse(this.page, data.subUrls.api.dokan.wholesaleCustomers, selectors.admin.wholesaleCustomer.search, wholesaleCustomer);
        await expect(this.page.locator(selectors.admin.wholesaleCustomer.numberOfRows)).toHaveCount(1);
        await expect(this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerCell(wholesaleCustomer))).toBeVisible();
    }

    // edit wholesale customer
    async editWholesaleCustomer(wholesaleCustomer: customer): Promise<void> {
        await this.searchWholesaleCustomer(wholesaleCustomer.username);
        await this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerCell(wholesaleCustomer.username)).hover();
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerEdit(wholesaleCustomer.username)).click()]);

        const userInfo = selectors.admin.userInfo;

        // basic info
        await this.page.selectOption(userInfo.role, { value: wholesaleCustomer.customerInfo.role });
        await this.page.locator(userInfo.firstName).fill(wholesaleCustomer.username);
        await this.page.locator(userInfo.lastName).fill(wholesaleCustomer.lastname);
        await this.page.locator(userInfo.nickname).fill(wholesaleCustomer.username);

        // contact info
        await this.page.locator(userInfo.email).fill(wholesaleCustomer.username + data.customer.customerInfo.emailDomain);

        // about the user
        await this.page.locator(userInfo.biographicalInfo).fill(wholesaleCustomer.customerInfo.biography);

        // billing address
        await this.page.locator(userInfo.billingAddress.firstName).fill(wholesaleCustomer.username);
        await this.page.locator(userInfo.billingAddress.lastName).fill(wholesaleCustomer.lastname);
        await this.page.locator(userInfo.billingAddress.company).fill(wholesaleCustomer.customerInfo.companyName);
        await this.page.locator(userInfo.billingAddress.address1).fill(wholesaleCustomer.customerInfo.street1);
        await this.page.locator(userInfo.billingAddress.address2).fill(wholesaleCustomer.customerInfo.street2);
        await this.page.locator(userInfo.billingAddress.city).fill(wholesaleCustomer.customerInfo.city);
        await this.page.locator(userInfo.billingAddress.postcode).fill(wholesaleCustomer.customerInfo.zipCode);
        await this.page.locator(userInfo.billingAddress.country).click();
        await this.page.locator(userInfo.billingAddress.countryInput).fill(wholesaleCustomer.customerInfo.country);
        await this.page.keyboard.press(data.key.enter);
        await this.page.locator(userInfo.billingAddress.state).click();
        await this.page.locator(userInfo.billingAddress.stateInput).fill(wholesaleCustomer.customerInfo.state);
        await this.page.keyboard.press(data.key.enter);
        await this.page.locator(userInfo.billingAddress.phone).fill(wholesaleCustomer.customerInfo.phone);
        await this.page.locator(userInfo.billingAddress.email).fill(wholesaleCustomer.username + data.customer.customerInfo.emailDomain);

        // shipping address
        await this.page.locator(userInfo.shippingAddress.firstName).fill(wholesaleCustomer.username);
        await this.page.locator(userInfo.shippingAddress.lastName).fill(wholesaleCustomer.lastname);
        await this.page.locator(userInfo.shippingAddress.company).fill(wholesaleCustomer.customerInfo.companyName);
        await this.page.locator(userInfo.shippingAddress.address1).fill(wholesaleCustomer.customerInfo.street1);
        await this.page.locator(userInfo.shippingAddress.address2).fill(wholesaleCustomer.customerInfo.street2);
        await this.page.locator(userInfo.shippingAddress.city).fill(wholesaleCustomer.customerInfo.city);
        await this.page.locator(userInfo.shippingAddress.postcode).fill(wholesaleCustomer.customerInfo.zipCode);
        await this.page.locator(userInfo.shippingAddress.country).click();
        await this.page.locator(userInfo.shippingAddress.countryInput).fill(wholesaleCustomer.customerInfo.country);
        await this.page.keyboard.press(data.key.enter);
        await this.page.locator(userInfo.shippingAddress.state).click();
        await this.page.locator(userInfo.shippingAddress.stateInput).fill(wholesaleCustomer.customerInfo.state);
        await this.page.keyboard.press(data.key.enter);
        await this.page.locator(userInfo.shippingAddress.phone).fill(wholesaleCustomer.customerInfo.phone);

        // update user
        await clickAndWaitForResponse(this.page, data.subUrls.backend.user, selectors.admin.users.updateUser, 302);
        await expect(this.page.locator(selectors.admin.users.updateSuccessMessage)).toContainText('User updated.');
    }

    // view wholesale customer orders
    async viewWholesaleCustomerOrders(wholesaleCustomer: string): Promise<void> {
        await this.searchWholesaleCustomer(wholesaleCustomer);
        await this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerCell(wholesaleCustomer)).hover();
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerOrders(wholesaleCustomer)).click()]);
        await expect(this.page.locator(selectors.admin.wooCommerceOrders.noRowsFound)).toBeHidden();
    }

    // update wholesale customer (enable | disable | delete)
    async updateWholesaleCustomer(wholesaleCustomer: string, action: string): Promise<void> {
        await this.searchWholesaleCustomer(wholesaleCustomer);

        switch (action) {
            case 'enable':
                await this.toggleWholesaleStatus(data.subUrls.api.dokan.wholesaleCustomers, selectors.admin.wholesaleCustomer.statusSlider(wholesaleCustomer), true);
                break;

            case 'disable':
                await this.toggleWholesaleStatus(data.subUrls.api.dokan.wholesaleCustomers, selectors.admin.wholesaleCustomer.statusSlider(wholesaleCustomer), false);
                break;

            case 'delete':
                await this.page.locator(selectors.admin.wholesaleCustomer.wholesaleCustomerCell(wholesaleCustomer)).hover();
                await clickAndAcceptAndWaitForResponse(this.page, data.subUrls.api.dokan.wholesaleCustomers, selectors.admin.wholesaleCustomer.wholesaleCustomerRemove(wholesaleCustomer));
                break;

            default:
                break;
        }
    }

    // wholesale customers bulk action
    async wholesaleCustomerBulkAction(action: string, wholesaleCustomer?: string): Promise<void> {
        if (wholesaleCustomer) {
            await this.searchWholesaleCustomer(wholesaleCustomer);
        } else {
            await goIfNotThere(this.page, data.subUrls.backend.dokan.wholeSaleCustomer);
        }

        // ensure row exists
        await expect(this.page.locator(selectors.admin.wholesaleCustomer.noRowsFound)).toBeHidden();

        await this.page.locator(selectors.admin.wholesaleCustomer.bulkActions.selectAll).click();
        await this.page.selectOption(selectors.admin.wholesaleCustomer.bulkActions.selectAction, { value: action });
        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.wholesaleCustomers, selectors.admin.wholesaleCustomer.bulkActions.applyAction);
    }

    // customer request to become wholesale customer
    async customerRequestForBecomeWholesaleCustomer(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.myAccount);
        await this.page.locator(selectors.customer.cDashboard.becomeWholesaleCustomer).click();
        await expect(this.page.locator(selectors.customer.cDashboard.wholesaleRequestReturnMessage)).toContainText(data.wholesale.wholesaleRequestSendMessage);
    }

    // customer become wholesale customer
    async customerBecomeWholesaleCustomer(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.myAccount);
        const currentUser = await getCurrentUser(this.page);
        await clickAndWaitForResponse(this.page, data.subUrls.api.dokan.wholesaleRegister, selectors.customer.cDashboard.becomeWholesaleCustomer);
        const needApproval = await this.page.locator(selectors.customer.cDashboard.wholesaleRequestReturnMessage).isVisible().catch(() => false);
        await expect(this.page.locator(selectors.customer.cWooSelector.wooCommerceSuccessMessage)).toBeVisible();
        if (!needApproval) {
            await expect(this.page.locator(selectors.customer.cWooSelector.wooCommerceSuccessMessage)).toContainText(data.wholesale.becomeWholesaleCustomerSuccessMessage);
        } else {
            await expect(this.page.locator(selectors.customer.cDashboard.wholesaleRequestReturnMessage)).toContainText(data.wholesale.wholesaleRequestSendMessage);
            await this.switchUser(data.admin);
            await this.updateWholesaleCustomer(currentUser as string, 'enable');
        }
    }

    // view wholesale price on shop / single product
    async viewWholeSalePrice(productName: string, canView = true, productDetails = true): Promise<void> {
        await this.page.goto(toPath(data.subUrls.frontend.shop)); // to ensure db changes are reflected
        await this.customerPage.searchProduct(productName);
        if (canView) {
            await expect(this.page.locator(selectors.customer.cWholesale.shop.wholesalePrice)).toBeVisible();
            await expect(this.page.locator(selectors.customer.cWholesale.shop.wholesaleAmount)).toBeVisible();
        } else {
            await expect(this.page.locator(selectors.customer.cWholesale.shop.wholesalePrice)).toBeHidden();
            await expect(this.page.locator(selectors.customer.cWholesale.shop.wholesaleAmount)).toBeHidden();
        }

        if (productDetails) {
            await this.customerPage.goToProductDetails(productName);
            if (canView) {
                await expect(this.page.locator(selectors.customer.cWholesale.singleProductDetails.wholesaleInfo)).toBeVisible();
            } else {
                await expect(this.page.locator(selectors.customer.cWholesale.singleProductDetails.wholesaleInfo)).toBeHidden();
            }
        }
    }

    // assert wholesale price on cart subtotal
    async assertWholesalePrice(wholesalePrice: string, minimumWholesaleQuantity: string): Promise<void> {
        const cartTotalText = (await this.page.locator(selectors.customer.cCart.cartTotal).textContent()) as string;
        const subtotal = Number(helpers.price(cartTotalText));
        const calcSubTotal = helpers.roundToTwo(helpers.subtotal([Number(wholesalePrice)], [Number(minimumWholesaleQuantity)]));
        expect(subtotal).toEqual(calcSubTotal);
    }
}

// ---------------------------------------------------------------------------
// CustomerPage — storefront/customer helpers used by the wholesale spec.
// ---------------------------------------------------------------------------
export class CustomerPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    async goToMyAccount(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.myAccount);
    }

    async goToCart(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.cart);
    }

    async goToCheckout(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.checkout);
    }

    async goToProductDetails(productName: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    // customer logout (mirrors loginPage.logout).
    private async logout(): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.myAccount);
        await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.frontend.customerLogout).click()]);
        const loggedInUser = await getCurrentUser(this.page);
        expect(loggedInUser).toBeUndefined();
    }

    // register a new customer
    async customerRegister(customerInfo: customer['customerInfo']): Promise<void> {
        const username = (customerInfo.firstName() + customerInfo.lastName()).replace("'", '');
        await this.goToMyAccount();
        const regIsVisible = await this.page.locator(selectors.customer.cRegistration.regEmail).isVisible().catch(() => false);
        if (!regIsVisible) {
            await this.logout();
        }
        await this.page.locator(selectors.customer.cRegistration.regEmail).fill(username + data.customer.customerInfo.emailDomain);
        await this.page.locator(selectors.customer.cRegistration.regPassword).fill(customerInfo.password);
        await this.page.locator(selectors.customer.cRegistration.regAsCustomer).click();
        await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.frontend.myAccount, selectors.customer.cRegistration.register, 302);
        const registrationErrorIsVisible = await this.page.locator(selectors.customer.cWooSelector.wooCommerceError).isVisible().catch(() => false);
        if (registrationErrorIsVisible) {
            const errorText = (await this.page.locator(selectors.customer.cWooSelector.wooCommerceError).textContent())?.trim();
            if (errorText === data.customer.registration.registrationErrorMessage) {
                console.log('User already exists!!');
                return;
            }
        }
        const loggedInUser = await getCurrentUser(this.page);
        expect(loggedInUser).toBe(username.toLowerCase());
    }

    // clear the cart (recursively remove line items).
    async clearCart(): Promise<void> {
        await this.goToCart();
        const emptyCart = await this.page.locator(selectors.customer.cCart.cartEmptyMessage).isVisible().catch(() => false);
        if (!emptyCart) {
            await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.api.wc.store, selectors.customer.cCart.removeFirstItem, 207);
            await this.clearCart();
        }
    }

    // add a product to cart from the shop archive.
    async addProductToCartFromShop(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await clickAndWaitForResponse(this.page, data.subUrls.frontend.addToCart, selectors.customer.cShop.productCard.addToCart);
        await expect(this.page.locator(selectors.customer.cShop.productCard.viewCart)).toBeVisible();
    }

    // add a product to cart from its single-product page.
    async addProductToCartFromSingleProductPage(productName: string, quantity?: string): Promise<void> {
        await this.goToProductDetails(productName);
        const addonIsVisible = await this.page.locator(selectors.customer.cSingleProduct.productAddon.addOnSelect).isVisible().catch(() => false);
        if (addonIsVisible) {
            await this.page.selectOption(selectors.customer.cSingleProduct.productAddon.addOnSelect, { index: 1 });
        }
        if (quantity) {
            await this.page.locator(selectors.customer.cSingleProduct.productDetails.quantity).fill(String(quantity));
        }
        await clickAndWaitForResponse(this.page, data.subUrls.frontend.productCustomerPage, selectors.customer.cSingleProduct.productDetails.addToCart);
        if (!quantity) {
            await expect(this.page.locator(selectors.customer.cSingleProduct.productDetails.productAddedSuccessMessage(productName))).toBeVisible();
        } else {
            await expect(this.page.locator(selectors.customer.cSingleProduct.productDetails.productWithQuantityAddedSuccessMessage(productName, quantity))).toBeVisible();
        }
    }

    // add a product to cart from shop or single-product page.
    async addProductToCart(productName: string, from: string, clearCart = true, quantity?: string): Promise<void> {
        if (clearCart) {
            await this.clearCart();
        }
        switch (from) {
            case 'shop':
                await this.addProductToCartFromShop(productName);
                break;
            case 'single-product':
                await this.addProductToCartFromSingleProductPage(productName, quantity);
                break;
            default:
                break;
        }
    }

    // place the order and return the order number.
    async paymentOrder(paymentMethod = 'bank'): Promise<string> {
        switch (paymentMethod) {
            case 'bank':
                await this.page.locator(selectors.customer.cCheckout.directBankTransfer).click();
                break;
            case 'check':
                await this.page.locator(selectors.customer.cCheckout.checkPayments).click();
                break;
            case 'cod':
                await this.page.locator(selectors.customer.cCheckout.cashOnDelivery).click();
                break;
            default:
                break;
        }

        await this.page.locator(selectors.customer.cCheckout.placeOrder).focus();
        await clickAndWaitForResponseAndLoadState(this.page, data.subUrls.frontend.orderReceived, selectors.customer.cCheckout.placeOrder);
        await expect(this.page.locator(selectors.customer.cOrderReceived.orderReceivedSuccessMessage)).toBeVisible();
        return (await this.page.locator(selectors.customer.cOrderReceived.orderNumber).textContent()) as string;
    }

    // search a product from the shop.
    async searchProduct(productName: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.shop);
        if (!DOKAN_PRO) {
            // search on lite
            await this.page.locator(selectors.customer.cShop.searchProductLite).fill(productName);
            await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.keyboard.press(data.key.enter)]);
            await expect(this.page.locator(selectors.customer.cSingleProduct.productDetails.productTitle)).toContainText(productName);
        } else {
            await this.page.locator(selectors.customer.cShop.filters.searchProduct).fill(productName);
            await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.locator(selectors.customer.cShop.filters.search).click()]);
            await expect(this.page.locator(selectors.customer.cShop.productCard.productTitle)).toContainText(productName);
        }
    }
}

// ---------------------------------------------------------------------------
// ProductsPage — vendor product edit / wholesale options.
// ---------------------------------------------------------------------------
export class ProductsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // vendor search a product in the vendor dashboard product list.
    async searchProduct(productName: string): Promise<void> {
        await goIfNotThere(this.page, data.subUrls.frontend.vDashboard.products);
        await this.page.locator(selectors.vendor.product.search.searchInput).fill(productName);
        await clickAndWaitForResponse(this.page, data.subUrls.frontend.vDashboard.products, selectors.vendor.product.search.searchBtn);
        await expect(this.page.locator(selectors.vendor.product.productLink(productName)).first()).toBeVisible();
    }

    // navigate to a product edit page by name (row-action based).
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        // force the row actions to be visible to avoid flakiness
        await this.page.locator(selectors.vendor.product.rowActions(productName)).first().evaluate(el => el.removeAttribute('class'));
        await this.page.locator(selectors.vendor.product.productCell(productName)).first().hover();
        await clickAndWaitForResponseAndNetworkIdle(this.page, data.subUrls.frontend.vDashboard.products, selectors.vendor.product.editProduct(productName));
        await expect(this.page.locator(selectors.vendor.product.title)).toHaveValue(productName);
    }

    // navigate to a product edit page by numeric id (falls back to name-based edit).
    async goToProductEditById(productId: string, nonce: string = PRODUCT_EDIT_NONCE): Promise<void> {
        if (productId && !Number.isNaN(Number(productId))) {
            await this.page.goto(toPath(data.subUrls.frontend.vDashboard.productEdit(productId, nonce)), { waitUntil: 'networkidle' });
        } else {
            await this.goToProductEdit(productId);
        }
    }

    // save the currently open vendor product.
    async saveProduct(): Promise<void> {
        // The classic product editor binds its form-submit handler asynchronously (WooCommerce product init).
        // Clicking "Save Product" before that handler is ready silently no-ops the first submit, so the save
        // request never fires and clickAndWaitForResponse* times out (passes locally where binding is fast,
        // fails in CI under load). Wait for the page to settle, then re-click until the save request fires.
        // eslint-disable-next-line playwright/no-networkidle
        await this.page.waitForLoadState('networkidle');
        await toPass(
            async () => {
                const [response] = await Promise.all([
                    this.page.waitForResponse(resp => resp.url().includes(data.subUrls.frontend.vDashboard.products) && resp.status() === 200, { timeout: 15000 }),
                    this.page.locator(selectors.vendor.product.saveProduct).click(),
                ]);
                expect(response.status()).toBe(200);
            },
            { intervals: [1000, 2000, 3000], timeout: 90000 },
        );
        await expect(this.page.locator(selectors.vendor.product.updatedSuccessMessage)).toContainText(data.product.createUpdateSaveSuccessMessage);
    }

    // add wholesale options to a product.
    async addProductWholesaleOptions(productName: string, wholesaleOption: product['productInfo']['wholesaleOption']): Promise<void> {
        await this.goToProductEditById(productName);
        await this.page.locator(selectors.vendor.product.wholesale.enableWholesale).check();
        await this.page.locator(selectors.vendor.product.wholesale.wholesalePrice).fill(wholesaleOption.wholesalePrice);
        await this.page.locator(selectors.vendor.product.wholesale.minimumQuantity).fill(wholesaleOption.minimumQuantity);
        await this.saveProduct();
        await expect(this.page.locator(selectors.vendor.product.wholesale.enableWholesale)).toBeChecked();
        await expect(this.page.locator(selectors.vendor.product.wholesale.wholesalePrice)).toHaveValue(wholesaleOption.wholesalePrice);
        await expect(this.page.locator(selectors.vendor.product.wholesale.minimumQuantity)).toHaveValue(wholesaleOption.minimumQuantity);
    }
}
