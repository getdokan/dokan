import { Page, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

// ============================================
// LOCAL TEST DATA (extracted from testData.ts/.env)
// ============================================

const testData = {
    customer: {
        username: 'customer1',
        password: '01dokan01',
        lastname: 'ln',
        fullName: 'customer1 c1',
        email: 'customer1@email.com',

        customerInfo: {
            emailDomain: '@email.com',
            get email() { return `${faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '')}@email.com`; },
            password: '01dokan01',
            password1: '01dokan011',
            get firstName() { return faker.person.firstName('male').toLowerCase().replace(/[^a-z0-9]/g, ''); },
            get lastName() { return faker.person.lastName('male').toLowerCase().replace(/[^a-z0-9]/g, ''); },
            get username() { return faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, ''); },
            get shopName() { return `${faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '')}store`; },
            role: 'customer',
            companyName: 'Customer Company',
            companyId: 'CUST1',
            vatNumber: 'CUSTVAT1',
            bankName: 'bankName',
            bankAddress: 'bankAddress',
            bankIban: 'DE89 3704 0044 0532 0130 00',
            phone: '0123456789',
            street1: 'abc street',
            street2: 'xyz street',
            country: 'United States (US)',
            city: 'New York',
            zipCode: '10006',
            state: 'New York',
            billing: {
                firstName: 'customer1',
                lastName: 'c1',
                companyName: 'Customer Billing Co',
                companyId: 'CUSTB1',
                vatNumber: 'CUSTVATB1',
                bankName: 'bankName',
                bankIban: 'DE89 3704 0044 0532 0130 01',
                street1: 'abc street',
                street2: 'xyz street',
                city: 'New York',
                zipCode: '10003',
                country: 'United States (US)',
                state: 'New York',
                email: 'customer1@email.com',
                phone: '0123456789',
            },
            shipping: {
                email: 'customer1@email.com',
                firstName: 'customer1',
                lastName: 'c1',
                companyName: 'Customer Shipping Co',
                street1: 'abc street',
                street2: 'xyz street',
                city: 'New York',
                zipCode: '10003',
                country: 'United States (US)',
                state: 'New York',
                phone: '0123456789',
            },
        },

        account: {
            updateSuccessMessage: 'Account details changed successfully.',
        },
        address: {
            addressChangeSuccessMessage: 'Address changed successfully.',
        },
        registration: {
            registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
        },
    },

    predefined: {
        simpleProduct: {
            product1: {
                name: 'p1_v1 (simple)',
            },
        },
        vendor2: {
            simpleProduct: {
                product1: {
                    name: 'p1_v2 (simple)',
                },
            },
        },
    },
};

// ============================================
// LOCAL URL HELPERS (subset of data.subUrls.frontend)
// ============================================

const subUrls = {
    myAccount: 'my-account',
    accountMigration: 'my-account/account-migration',
    editAccountCustomer: 'my-account/edit-account',
    billingAddress: 'my-account/edit-address/billing',
    shippingAddress: 'my-account/edit-address/shipping',
    editAddress: 'my-account/edit-address',
    shop: 'shop',
    cart: 'cart',
    checkout: 'checkout',
    productDetails: (productName: string) => `shop/uncategorized/${encodeURIComponent(productName)}`,
};

// ============================================
// LOCAL SELECTORS (subset of selectors.ts)
// ============================================

const selectors = {
    frontend: {
        username: '#username',
        userPassword: '#password',
        rememberMe: '#rememberme',
        logIn: '//button[@value="Log in"]',
        customerLogout: '.woocommerce-MyAccount-navigation-link--customer-logout > a',
    },
    registration: {
        regEmail: '#reg_email',
        regPassword: '#reg_password',
        regAsCustomer: '//input[@value="customer"]',
        register: '.woocommerce-Button',
    },
    myAccountMenus: {
        accountDetails: '.woocommerce-MyAccount-navigation-link--edit-account a',
    },
    dashboard: {
        becomeVendor: '//a[contains(text(),"Become a Vendor")]',
        firstName: '#first-name',
        lastName: '#last-name',
        shopName: '#company-name',
        shopUrl: '#seller-url',
        phone: '#shop-phone',
        companyName: '#dokan-company-name',
        companyId: '#dokan-company-id-number',
        vatNumber: '#dokan-vat-number',
        bankName: '#dokan-bank-name',
        bankIban: '#dokan-bank-iban',
        termsAndConditions: '#tc_agree',
        subscriptionPack: '#dokan-subscription-pack',
        becomeAVendor: '.dokan-btn',
    },
    accountDetails: {
        firstName: '#account_first_name',
        lastName: '#account_last_name',
        displayName: '#account_display_name',
        email: '#account_email',
        currentPassword: '#password_current',
        newPassword: '#password_1',
        confirmNewPassword: '#password_2',
        saveChanges: '.woocommerce-Button',
    },
    address: {
        billing: {
            firstName: '#billing_first_name',
            lastName: '#billing_last_name',
            companyID: '#billing_dokan_company_id_number',
            vatOrTaxNumber: '#billing_dokan_vat_number',
            nameOfBank: '#billing_dokan_bank_name',
            bankIban: '#billing_dokan_bank_iban',
            country: '//select[@id="billing_country"]/..//span[@class="select2-selection__arrow"]',
            countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
            countryValue: (country: string) =>
                `//li[contains(@class,"select2-results__option") and normalize-space(text())="${country}"]`,
            selectedCountry: '//span[@id="select2-billing_country-container"]',
            streetAddress: '#billing_address_1',
            streetAddress2: '#billing_address_2',
            city: '#billing_city',
            state: '//select[@id="billing_state"]/..//span[@class="select2-selection__arrow"]',
            stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
            stateValue: (state: string) =>
                `//li[contains(@class,"select2-results__option")and normalize-space(text())="${state}"]`,
            selectedState: '//span[@id="select2-billing_state-container"]',
            zipCode: '#billing_postcode',
            phone: '#billing_phone',
            email: '#billing_email',
            saveAddress: '//button[@name="save_address"]',
        },
        shipping: {
            firstName: '#shipping_first_name',
            lastName: '#shipping_last_name',
            country: '//select[@id="shipping_country"]/..//span[@class="select2-selection__arrow"]',
            countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
            countryValue: (country: string) =>
                `//li[contains(@class,"select2-results__option") and normalize-space(text())="${country}"]`,
            selectedCountry: '//span[@id="select2-shipping_country-container"]',
            streetAddress: '#shipping_address_1',
            streetAddress2: '#shipping_address_2',
            city: '#shipping_city',
            state: '//select[@id="shipping_state"]/..//span[@class="select2-selection__arrow"]',
            stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
            stateValue: (state: string) =>
                `//li[contains(@class,"select2-results__option")and normalize-space(text())="${state}"]`,
            selectedState: '//span[@id="select2-shipping_state-container"]',
            zipCode: '#shipping_postcode',
            saveAddress: '//button[@name="save_address"]',
        },
    },
    cart: {
        cartItem: (productName: string) =>
            `//tr[@class='wc-block-cart-items__row']//a[@class= 'wc-block-components-product-name' and contains(text(),'${productName}')]`,
        proceedToCheckout:
            '//div[@class="wc-block-cart__submit-container"]//a[contains(@href,"/checkout/") and contains(@class,"wc-block-cart__submit-button")]',
        removeFirstItem: '(//button[@class="wc-block-cart-item__remove-link"])[1]',
        cartEmptyMessage: '.wp-block-woocommerce-empty-cart-block .wc-block-cart__empty-cart__title',
    },
    checkout: {
        billing: {
            email: '#email',
            country: '#billing-country input',
            firstName: '#billing-first_name',
            lastName: '#billing-last_name',
            address: '#billing-address_1',
            address2toggle: 'button.wc-block-components-address-form__address_2-toggle',
            address2: '#billing-address_2',
            city: '#billing-city',
            stateInput: '#billing-state input',
            zipCode: '#billing-postcode',
            phone: '#billing-phone',
        },
        shipping: {
            email: '#email',
            country: '#shipping-country input',
            firstName: '#shipping-first_name',
            lastName: '#shipping-last_name',
            address: '#shipping-address_1',
            address2toggle: 'button.wc-block-components-address-form__address_2-toggle',
            address2: '#shipping-address_2',
            city: '#shipping-city',
            stateInput: '#shipping-state input',
            zipCode: '#shipping-postcode',
            phone: '#shipping-phone',
        },
        directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
        placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
    },
    shop: {
        searchProductLite: '(//input[@class="search-field"])[1]',
    },
    singleProduct: {
        quantity: 'div.quantity input.qty',
        addToCart: 'button.single_add_to_cart_button',
        productAddedSuccessMessage: (productName: string) =>
            `//div[@class="woocommerce-message" and contains(.,"“${productName}” has been added to your cart.")]`,
        productWithQuantityAddedSuccessMessage: (productName: string, quantity: string) =>
            `//div[@class="woocommerce-message" and contains(.,"${quantity} × “${productName}” have been added to your cart.")]`,
        viewCart: '.woocommerce .woocommerce-message > .button',
    },
    woo: {
        successMessage: 'div.woocommerce-message',
        error: 'div.woocommerce-error',
    },
    orderReceived: {
        orderReceivedSuccessMessage:
            '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',
        orderNumber: '.woocommerce-order-overview__order.order strong',
        subOrdersHeading: '//h2[normalize-space()="Sub Orders"]',
    },
};

// ============================================
// CUSTOMER PAGE
// ============================================

export class CustomerPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private async goto(subPath: string) {
        const url = `${BASE_URL}/${subPath}`;
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    private async getCurrentUser(): Promise<string | undefined> {
        const cookies = await this.page.context().cookies();
        const cookie = cookies.find(c => c.name && c.name.startsWith('wordpress_logged_in_'));
        if (!cookie?.value) {
            return;
        }
        return decodeURIComponent(cookie.value).split('|')[0];
    }

    private async logoutIfLoggedIn() {
        await this.goto(subUrls.myAccount);
        const logoutVisible = await this.page.locator(selectors.frontend.customerLogout).isVisible().catch(() => false);
        if (logoutVisible) {
            await Promise.all([
                this.page.waitForLoadState('networkidle'),
                this.page.locator(selectors.frontend.customerLogout).click(),
            ]);
        }
    }

    private async ensureLoggedInAsDefaultCustomer() {
        await this.goto(subUrls.myAccount);
        const current = await this.getCurrentUser();
        if (current === testData.customer.username) {
            return;
        }

        if (current && current !== testData.customer.username) {
            await this.logoutIfLoggedIn();
            await this.goto(subUrls.myAccount);
        }

        await this.page.locator(selectors.frontend.username).fill(testData.customer.username);
        await this.page.locator(selectors.frontend.userPassword).fill(testData.customer.password);
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.frontend.logIn).click(),
        ]);
        const loggedInUser = await this.getCurrentUser();
        expect(loggedInUser).toBe(testData.customer.username);
    }

    // ============================================
    // PUBLIC HELPERS USED BY SPEC
    // ============================================

    async registerDefaultCustomer(): Promise<void> {
        const info = testData.customer.customerInfo;
        // Snapshot faker values once so they stay consistent throughout this call
        const firstName = info.firstName;
        const lastName  = info.lastName;
        const username  = (firstName + lastName).replace(/[^a-z0-9]/g, '');
        const email     = username + info.emailDomain;
        const password  = info.password;

        await this.goto(subUrls.myAccount);

        // If registration form not visible, log out first
        const regVisible = await this.page.locator(selectors.registration.regEmail).isVisible().catch(() => false);
        if (!regVisible) {
            await this.logoutIfLoggedIn();
            await this.goto(subUrls.myAccount);
        }

        await this.page.locator(selectors.registration.regEmail).fill(email);
        await this.page.locator(selectors.registration.regPassword).fill(password);
        // Dokan Lite 5.0.0 removed the visible customer/vendor radios from the
        // my-account form (role is now a hidden input, vendor signup moved to a
        // dedicated onboarding page). Click only when the role control is still
        // a visible radio — older templates and Pro's registration page still
        // render it that way.
        const regAsCustomer = this.page.locator(selectors.registration.regAsCustomer);
        if (await regAsCustomer.isVisible().catch(() => false)) {
            await regAsCustomer.click();
        }

        // Submit the registration form. In Dokan Lite 5.0.0 the my-account
        // register button click does not reliably trigger native form submit
        // (a JS handler swallows the click), so we call form.submit()
        // directly. submit() bypasses the JS submit-event listeners that the
        // button click would fire — it goes straight to the network POST.
        await Promise.all([
            this.page.waitForNavigation({ url: /\/my-account\/?/, waitUntil: 'load', timeout: 30000 }),
            this.page.evaluate(() => {
                const form =
                    (document.querySelector('form.woocommerce-form-register') as HTMLFormElement | null) ??
                    (document.querySelector('form.register') as HTMLFormElement | null);
                if (!form) {
                    throw new Error('Register form not found on /my-account');
                }
                // The form has a button[name=register] that the server reads
                // to dispatch the registration handler. submit() doesn't include
                // a button's name/value — inject a hidden field so wp_signon /
                // WC_Form_Handler::process_registration() still triggers.
                if (!form.querySelector('input[name="register"]')) {
                    const hidden = document.createElement('input');
                    hidden.type = 'hidden';
                    hidden.name = 'register';
                    hidden.value = 'Register';
                    form.appendChild(hidden);
                }
                form.submit();
            }),
        ]);

        // Wait for the logout link — confirms we are on the logged-in my-account page
        await this.page.locator(selectors.frontend.customerLogout).waitFor({ state: 'visible', timeout: 15000 });
        const loggedInUser = await this.getCurrentUser();
        expect(loggedInUser).toBe(username);
    }

    async loginDefaultCustomer(): Promise<void> {
        await this.ensureLoggedInAsDefaultCustomer();
    }

    async logoutDefaultCustomer(): Promise<void> {
        await this.logoutIfLoggedIn();
    }

    async registerAndBecomeVendorDefaultCustomer(): Promise<void> {
        await this.registerDefaultCustomer();

        const info = testData.customer.customerInfo;
        // Snapshot faker values once so they don't change between calls
        const firstName = info.firstName;
        const lastName  = info.lastName;
        const shopName  = info.shopName;

        await this.goto(subUrls.myAccount);
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.dashboard.becomeVendor).click(),
        ]);

        await this.page.locator(selectors.dashboard.firstName).fill(firstName);
        await this.page.locator(selectors.dashboard.lastName).fill(lastName);
        await this.page.locator(selectors.dashboard.shopName).fill(shopName);
        await this.page.locator(selectors.dashboard.shopUrl).click();
        await this.page.locator(selectors.dashboard.phone).fill(info.phone);

        await this.page.locator(selectors.dashboard.companyName).fill(info.companyName);
        await this.page.locator(selectors.dashboard.companyId).fill(info.companyId);
        await this.page.locator(selectors.dashboard.vatNumber).fill(info.vatNumber);
        await this.page.locator(selectors.dashboard.bankName).fill(info.bankName);
        await this.page.locator(selectors.dashboard.bankIban).fill(info.bankIban);

        const termsVisible = await this.page.locator(selectors.dashboard.termsAndConditions).isVisible().catch(() => false);
        if (termsVisible) {
            await this.page.locator(selectors.dashboard.termsAndConditions).click();
        }

        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.dashboard.becomeAVendor).click(),
        ]);
    }

    async addDefaultBillingAddress(): Promise<void> {
        const billing = testData.customer.customerInfo.billing;

        await this.goto(subUrls.billingAddress);

        await this.page.locator(selectors.address.billing.firstName).fill(billing.firstName);
        await this.page.locator(selectors.address.billing.lastName).fill(billing.lastName);
        await this.page.locator(selectors.address.billing.companyID).fill(billing.companyId);
        await this.page.locator(selectors.address.billing.vatOrTaxNumber).fill(billing.vatNumber);
        await this.page.locator(selectors.address.billing.nameOfBank).fill(billing.bankName);
        await this.page.locator(selectors.address.billing.bankIban).fill(billing.bankIban);

        // Country
        await this.page.locator(selectors.address.billing.country).click();
        await this.page.locator(selectors.address.billing.countryInput).fill(billing.country);
        await this.page.locator(selectors.address.billing.countryValue(billing.country)).click();

        await this.page.locator(selectors.address.billing.streetAddress).fill(billing.street1);
        await this.page.locator(selectors.address.billing.streetAddress2).fill(billing.street2);
        await this.page.locator(selectors.address.billing.city).fill(billing.city);

        // State
        await this.page.locator(selectors.address.billing.state).click();
        await this.page.locator(selectors.address.billing.stateInput).fill(billing.state);
        await this.page.locator(selectors.address.billing.stateValue(billing.state)).click();

        await this.page.locator(selectors.address.billing.zipCode).fill(billing.zipCode);
        await this.page.locator(selectors.address.billing.phone).fill(billing.phone);
        await this.page.locator(selectors.address.billing.email).fill(billing.email);

        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.address.billing.saveAddress).click(),
        ]);

        await expect(this.page.locator(selectors.woo.successMessage)).toContainText(
            testData.customer.address.addressChangeSuccessMessage,
        );
    }

    async addDefaultShippingAddress(): Promise<void> {
        const shipping = testData.customer.customerInfo.shipping;

        await this.goto(subUrls.shippingAddress);

        await this.page.locator(selectors.address.shipping.firstName).fill(shipping.firstName);
        await this.page.locator(selectors.address.shipping.lastName).fill(shipping.lastName);

        await this.page.locator(selectors.address.shipping.country).click();
        await this.page.locator(selectors.address.shipping.countryInput).fill(shipping.country);
        await this.page.locator(selectors.address.shipping.countryValue(shipping.country)).click();

        await this.page.locator(selectors.address.shipping.streetAddress).fill(shipping.street1);
        await this.page.locator(selectors.address.shipping.streetAddress2).fill(shipping.street2);
        await this.page.locator(selectors.address.shipping.city).fill(shipping.city);

        await this.page.locator(selectors.address.shipping.state).click();
        await this.page.locator(selectors.address.shipping.stateInput).fill(shipping.state);
        await this.page.locator(selectors.address.shipping.stateValue(shipping.state)).click();

        await this.page.locator(selectors.address.shipping.zipCode).fill(shipping.zipCode);

        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.address.shipping.saveAddress).click(),
        ]);

        await expect(this.page.locator(selectors.woo.successMessage)).toContainText(
            testData.customer.address.addressChangeSuccessMessage,
        );
    }

    async addDefaultCustomerDetails(): Promise<void> {
        const customer = testData.customer;
        const info = testData.customer.customerInfo;

        await this.goto(subUrls.editAccountCustomer);

        await this.page.locator(selectors.accountDetails.firstName).fill(customer.username);
        await this.page.locator(selectors.accountDetails.lastName).fill(customer.lastname);
        await this.page.locator(selectors.accountDetails.displayName).fill(customer.username);
        await this.page.locator(selectors.accountDetails.email).fill(customer.username + info.emailDomain);

        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.accountDetails.saveChanges).click(),
        ]);

        await expect(this.page.locator(selectors.woo.successMessage)).toContainText(
            testData.customer.account.updateSuccessMessage,
        );
    }

    async addDefaultProductToCartAndAssert(): Promise<void> {
        const productName = testData.predefined.simpleProduct.product1.name;

        // Go to shop and search product
        await this.goto(subUrls.shop);
        await this.page.locator(selectors.shop.searchProductLite).fill(productName);
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');

        // On single product page, add to cart
        await this.page.locator(selectors.singleProduct.addToCart).click();
        await expect(this.page.locator(selectors.singleProduct.productAddedSuccessMessage(productName))).toBeVisible();

        // View cart and assert item is present
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.singleProduct.viewCart).click(),
        ]);

        await expect(this.page.locator(selectors.cart.cartItem(productName))).toBeVisible();
    }

    async buyDefaultProduct(): Promise<void> {
        const productName = testData.predefined.simpleProduct.product1.name;

        // Add product to cart
        await this.addProductToCart(productName);

        // Proceed to checkout
        await this.goToCheckoutFromCart();

        // Fill billing and place order
        await this.fillCheckoutBilling(testData.customer.customerInfo.billing);
        await this.selectBankTransferAndPlaceOrder();
    }

    async buyDefaultMultiVendorProducts(): Promise<void> {
        const p1 = testData.predefined.simpleProduct.product1.name;
        const p2 = testData.predefined.vendor2.simpleProduct.product1.name;

        await this.clearCartIfNeeded();

        await this.addProductToCart(p1, false);
        await this.addProductToCart(p2, false);

        await this.goToCheckoutFromCart();
        await this.fillCheckoutBilling(testData.customer.customerInfo.billing);
        await this.selectBankTransferAndPlaceOrder(true);
    }

    // ============================================
    // INTERNAL FLOW HELPERS
    // ============================================

    private async addProductToCart(productName: string, clearCart = true): Promise<void> {
        if (clearCart) {
            await this.clearCartIfNeeded();
        }

        await this.goto(subUrls.shop);
        await this.page.locator(selectors.shop.searchProductLite).fill(productName);
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');

        await this.page.locator(selectors.singleProduct.addToCart).click();
        await expect(this.page.locator(selectors.singleProduct.productAddedSuccessMessage(productName))).toBeVisible();
    }

    private async clearCartIfNeeded(): Promise<void> {
        await this.goto(subUrls.cart);
        const empty = await this.page.locator(selectors.cart.cartEmptyMessage).isVisible().catch(() => false);
        if (empty) return;

        // Remove all items by repeatedly clicking removeFirstItem until cart is empty
        // Limit iterations to avoid infinite loops
        for (let i = 0; i < 10; i++) {
            const removeVisible = await this.page.locator(selectors.cart.removeFirstItem).isVisible().catch(() => false);
            if (!removeVisible) break;
            await Promise.all([
                this.page.waitForLoadState('networkidle'),
                this.page.locator(selectors.cart.removeFirstItem).click(),
            ]);
        }
    }

    private async goToCheckoutFromCart(): Promise<void> {
        await this.goto(subUrls.cart);
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.cart.proceedToCheckout).click(),
        ]);
    }

    private async fillCheckoutBilling(billing: typeof testData.customer.customerInfo.billing): Promise<void> {
        await this.page.locator(selectors.checkout.billing.email).fill(billing.email);
        await this.page.locator(selectors.checkout.billing.country).fill(billing.country);
        await this.page.keyboard.press('Enter');
        await this.page.locator(selectors.checkout.billing.firstName).fill(billing.firstName);
        await this.page.locator(selectors.checkout.billing.lastName).fill(billing.lastName);
        await this.page.locator(selectors.checkout.billing.address).fill(billing.street1);

        const toggleVisible = await this.page
            .locator(selectors.checkout.billing.address2toggle)
            .isVisible()
            .catch(() => false);
        if (toggleVisible) {
            await this.page.locator(selectors.checkout.billing.address2toggle).click();
        }
        await this.page.locator(selectors.checkout.billing.address2).fill(billing.street2);
        await this.page.locator(selectors.checkout.billing.city).fill(billing.city);
        await this.page.locator(selectors.checkout.billing.stateInput).fill(billing.state);
        await this.page.keyboard.press('Enter');
        await this.page.locator(selectors.checkout.billing.zipCode).fill(billing.zipCode);
        await this.page.locator(selectors.checkout.billing.phone).fill(billing.phone);
    }

    private async selectBankTransferAndPlaceOrder(expectSubOrders = false): Promise<void> {
        await this.page.locator(selectors.checkout.directBankTransfer).click();

        await this.page.locator(selectors.checkout.placeOrder).scrollIntoViewIfNeeded();
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(selectors.checkout.placeOrder).click(),
        ]);

        await expect(this.page.locator(selectors.orderReceived.orderReceivedSuccessMessage)).toBeVisible();

        if (expectSubOrders) {
            await expect(this.page.locator(selectors.orderReceived.subOrdersHeading)).toBeVisible();
        }
    }
}

