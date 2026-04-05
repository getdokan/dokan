import { test, Page } from '@playwright/test';
import { LiveChatPage, api, db, helpers, payloads, testData } from './liveChatPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { VENDOR_ID } = process.env;

test.describe('Live chat test', () => {
    if (!process.env.TALKJS_APP_ID || !process.env.TALKJS_APP_SECRET) {
        test.skip(true, 'Live chat credentials not found');
    }

    let admin: LiveChatPage;
    let vendor: LiveChatPage;
    let customer: LiveChatPage;
    let aPage: Page, vPage: Page, cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new LiveChatPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new LiveChatPage(vPage);

        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new LiveChatPage(cPage);

        await api.init();
        await db.updateUserMeta(VENDOR_ID || '', 'dokan_profile_settings', { live_chat: 'yes' });
        await helpers.exeCommandWpcli('wp rewrite flush');
    });

    test.afterAll(async () => {
        await db.setOptionValue(testData.optionName.liveChat, testData.liveChatSettings);
        await api.activateModules(payloads.moduleIds.liveChat, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await api.dispose();
        await db.dispose();
    });

    test('admin can enable live chat module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableLiveChatModule();
    });

    test('admin can enable chat button on vendor page', { tag: ['@pro', '@admin'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveChat, { chat_button_seller_page: 'on' });
        await customer.viewLiveChatButtonOnStore(testData.predefined.vendorInfo.shopName);
    });

    test('admin can disable chat button on vendor page', { tag: ['@pro', '@admin'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveChat, { chat_button_seller_page: 'off' });
        await customer.viewLiveChatButtonOnStore(testData.predefined.vendorInfo.shopName, true);
        await db.updateOptionValue(testData.optionName.liveChat, { chat_button_seller_page: 'on' });
    });

    test('admin can enable chat button on product page (above_tab)', { tag: ['@pro', '@admin'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveChat, { chat_button_product_page: 'above_tab' });
        await customer.viewLiveChatButtonOnProduct(testData.predefined.simpleProduct.product1.name, 'above-tab');
    });

    test('admin can enable chat button on product page (inside_tab)', { tag: ['@pro', '@admin'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveChat, { chat_button_product_page: 'inside_tab' });
        await customer.viewLiveChatButtonOnProduct(testData.predefined.simpleProduct.product1.name, 'inside-tab');
    });

    test('admin can disable chat button on product page', { tag: ['@pro', '@admin'] }, async () => {
        await db.updateOptionValue(testData.optionName.liveChat, { chat_button_product_page: 'dont_show' });
        await customer.viewLiveChatButtonOnProduct(testData.predefined.simpleProduct.product1.name, 'dont-show');
    });

    test('vendor can view inbox menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorInboxRenderProperly();
    });

    test('vendor can reply to customer message', { tag: ['@pro', '@customer'] }, async () => {
        await customer.sendMessageToVendor('vendor1store', testData.nanoIdRandom());
        await vendor.sendMessageToCustomer(testData.predefined.customerInfo.username1, testData.nanoIdRandom());
    });

    test('customer can send message to vendor', { tag: ['@pro', '@customer'] }, async () => {
        await customer.sendMessageToVendor(testData.predefined.vendorInfo.shopName, testData.nanoIdRandom());
    });

    test('admin can disable live chat module', { tag: ['@pro', '@admin'] }, async () => {
        await api.deactivateModules(payloads.moduleIds.liveChat, payloads.adminAuth);
        await admin.disableLiveChatModule();
    });
});
