import MyAccountAuthPage from '@pages/frontend/my-account/auth/my-account-auth.page';
import AllMyOrdersPage from '@pages/frontend/my-orders/all-my-orders.page';
import CustomerOrderDetailsPage from '@pages/frontend/my-orders/customer-order-details.page';
import VendorDashboardSidebarPage from '@pages/frontend/vendor-dashboard/common/vendor-sidebar.page';
import VendorAllOrdersPage from '@pages/frontend/vendor-dashboard/orders/vendor-all-orders.page';
import VendorEditOrderPage from '@pages/frontend/vendor-dashboard/orders/vendor-edit-order.page';
import { LoginPage } from '@pages/loginPage';
import WpAdminSidebar from '@pages/wp-admin/common/sidebar.page';
import AllProductsPage from '@pages/wp-admin/products/all-products.page';
import EditProductPage from '@pages/wp-admin/products/edit-product.page';
import test, { chromium, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

test.describe.only('Mark Order As Received - 02', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        await page.goto(testInfo.project.use.baseURL as string);
    });

    test('Customer is able to mark order as received for single vendor shipments', async ({ page, request }) => {
        const browserOptions = { headless: false };
        const api = new ApiUtils(request);

        // create customer
        const customer = await api.createCustomer(payloads.createCustomer(), payloads.adminAuth);
        const customerId = customer[0].id;
        const customerEmail = customer[0].email;

        // // create vendor
        const vendor = await api.createStore(payloads.createStore(), payloads.adminAuth);
        const vendorId = vendor[0].id;
        const vendorEmail = vendor[0].email;

        // // create product
        const product = await api.createProduct(
            {
                name: `Automation Simple Product ${vendorId}`,
                type: 'simple',
                regular_price: '10',
                status: 'publish',
                post_author: `${vendorId}`,
                categories: [
                    {
                        name: 'Uncategorized',
                        slug: 'uncategorized',
                    },
                ],
                description: '<p>test description</p>',
                short_description: '<p>test short description</p>',
            },
            payloads.adminAuth,
        );

        const productId = product[1];

        const adminBrowser = await chromium.launch(browserOptions);
        const adminPage = await adminBrowser.newPage();
        const adminLogin = new LoginPage(adminPage);

        const sidebar = new WpAdminSidebar(adminPage);
        const allProductsPage = new AllProductsPage(adminPage);
        const editProductPage = new EditProductPage(adminPage);

        // publish product
        await adminLogin.adminLogin({ username: process.env.ADMIN, password: process.env.ADMIN_PASSWORD });
        await sidebar.clickOnProductsLink();
        await allProductsPage.clickOnProductTitleById(productId);
        await editProductPage.clickOnPublishButton();

        // close admin browser
        await adminBrowser.close();

        const payload = {
            payment_method: 'bacs',
            payment_method_title: 'Direct Bank Transfer',
            set_paid: true,
            customer_id: customerId,
            billing: {
                first_name: 'customer1',
                last_name: 'c1',
                address_1: 'abc street',
                address_2: 'xyz street',
                city: 'New York',
                state: 'NY',
                postcode: '10003',
                country: 'US',
                email: 'customer1@yopmail.com',
                phone: '(555) 555-5555',
            },

            shipping: {
                first_name: 'customer1',
                last_name: 'c1',
                address_1: 'abc street',
                address_2: 'xyz street',
                city: 'New York',
                state: 'NY',
                postcode: '10003',
                country: 'US',
            },

            line_items: [
                {
                    product_id: '',
                    quantity: 1,
                },
            ],
        };

        // create order
        const orderResponse = await api.createOrder(productId, payload, payloads.adminAuth);
        const orderId: number = orderResponse[1]['id'];

        const vendorBrowser = await chromium.launch(browserOptions);
        const vendorPage = await vendorBrowser.newPage();

        const vendorDashboardSidebarPage = new VendorDashboardSidebarPage(vendorPage);
        const vendorAllOrdersPage = new VendorAllOrdersPage(vendorPage);
        const vendorEditOrderPage = new VendorEditOrderPage(vendorPage);
        const vendorMyAccountAuthPage = new MyAccountAuthPage(vendorPage);

        // vendor login
        await vendorPage.goto('/dashboard/');
        await vendorMyAccountAuthPage.enterUsername(vendorEmail);
        await vendorMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        await vendorMyAccountAuthPage.clickOnLoginButton();

        // create shipment
        await vendorDashboardSidebarPage.clickOnOrdersTab();
        await vendorAllOrdersPage.clickOnOrderById(`${orderId}`);
        await vendorEditOrderPage.clickOnCreateNewShipmentButton();
        await vendorEditOrderPage.clickOnShipmentItemCheckboxByIndex('1');

        await vendorEditOrderPage.selectShippingStatus('Delivered');
        await vendorEditOrderPage.selectShippingProvider('Fedex');
        await vendorEditOrderPage.enterShippingDate('July 27, 2024');
        await vendorEditOrderPage.enterShippingTrackingNumber('#KDJNS93');
        await vendorEditOrderPage.clickOnCreateShipmentButton();

        // close vendor browser
        await vendorBrowser.close();

        const customerBrowser = await chromium.launch(browserOptions);
        const customerPage = await customerBrowser.newPage();

        const customerMyAccountAuthPage = new MyAccountAuthPage(customerPage);
        const allMyOrdersPage = new AllMyOrdersPage(customerPage);
        const customerOrderDetailsPage = new CustomerOrderDetailsPage(customerPage);

        // customer login
        await customerPage.goto('/my-account/');
        await customerMyAccountAuthPage.enterUsername(customerEmail);
        await customerMyAccountAuthPage.enterPassword(process.env.USER_PASSWORD);
        await customerMyAccountAuthPage.clickOnLoginButton();

        // customer marks order as received
        await customerPage.goto('/my-orders/');
        await allMyOrdersPage.clickOnViewButtonByOrderId(`${orderId}`);
        await customerOrderDetailsPage.markOrderAsReceived('#1');
        await customerOrderDetailsPage.clickOnDialogBoxOkButton();

        // temporary solution, will be replaced
        await page.waitForTimeout(3000);

        const status = await customerOrderDetailsPage.trackingStatusByShipmentNumber('#1').textContent();
        expect(status?.trim()).toEqual('Received');
    });
});
