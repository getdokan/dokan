import { test, Page, request } from '@playwright/test';
import { LiveChatPage } from '@pages/liveChatPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbData } from '@utils/dbData';
import { helpers } from '@utils/helpers';

const { VENDOR_ID } = process.env;

test.describe('Live chat test', () => {
    let admin: LiveChatPage;
    let vendor: LiveChatPage;
    let customer: LiveChatPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new LiveChatPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new LiveChatPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new LiveChatPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        await dbUtils.updateUserMeta(VENDOR_ID, 'dokan_profile_settings', { live_chat: 'yes' });
        await helpers.exeCommandWpcli(data.commands.wpcli.rewritePermalink);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.liveChat, dbData.dokan.liveChatSettings);
        await apiUtils.activateModules(payloads.moduleIds.liveChat, payloads.adminAuth);
        await aPage.close();
        await vPage.close();
        await cPage.close();
    });

    //admin

    test('admin can enable live chat module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableLiveChatModule();
    });

    test('admin can enable chat button on vendor page', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_seller_page: 'on' });
        await customer.viewLiveChatButtonOnStore(data.predefined.vendorInfo.shopName);
    });

    test('admin can disable chat button on vendor page', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_seller_page: 'off' });
        await customer.viewLiveChatButtonOnStore(data.predefined.vendorInfo.shopName, true);

        // reset
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_seller_page: 'on' });
    });

    test('admin can enable chat button on product page (above_tab)', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'above_tab' });
        await customer.viewLiveChatButtonOnProduct(data.predefined.simpleProduct.product1.name, 'above-tab');
    });

    test('admin can enable chat button on product page (inside_tab)', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'inside_tab' });
        await customer.viewLiveChatButtonOnProduct(data.predefined.simpleProduct.product1.name, 'inside-tab');
    });

    test('admin can disable chat button on product page', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'dont_show' });
        await customer.viewLiveChatButtonOnProduct(data.predefined.simpleProduct.product1.name, 'dont-show');
    });

    // vendor

    test('vendor can view inbox menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorInboxRenderProperly();
    });

    test('vendor can reply to customer message', { tag: ['@pro', '@customer'] }, async () => {
        await customer.sendMessageToVendor('vendor1store', data.uniqueId.nanoIdRandom());
        await vendor.sendMessageToCustomer(data.predefined.customerInfo.username1, data.uniqueId.nanoIdRandom());
    });

    // customer

    test('customer can send message to vendor', { tag: ['@pro', '@customer'] }, async () => {
        await customer.sendMessageToVendor(data.predefined.vendorInfo.shopName, data.uniqueId.nanoIdRandom());
    });

    // admin
    test('admin can disable live chat module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.liveChat, payloads.adminAuth);
        await admin.disableLiveChatModule();
    });
});
