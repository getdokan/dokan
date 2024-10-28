import { test, Page } from '@playwright/test';
import { LiveChatPage } from '@pages/liveChatPage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe('Live chat test', () => {
    let vendor: LiveChatPage;
    let customer: LiveChatPage;
    let vPage: Page, cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new LiveChatPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new LiveChatPage(cPage);

        // todo: enable vendor live chat
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.liveChat, dbData.dokan.liveChatSettings);
        await cPage.close();
    });

    // admin

    test('admin can enable chat button on vendor page', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'on' });
        await customer.viewLiveChatButtonOnStore(data.predefined.vendorInfo.shopName);
    });

    test('admin can disable chat button on vendor page', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'Has Dokan Issues');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'off' });
        await customer.viewLiveChatButtonOnStore(data.predefined.vendorInfo.shopName, true);
        // reset
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'on' });
    });

    test('admin can enable chat button on product page (above_tab)', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'above_tab' });
        await customer.viewLiveChatButtonOnProduct(data.predefined.simpleProduct.product1.name, 'above-tab');
    });

    test('admin can enable chat button on product page (inside_tab)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'Has Dokan Issues');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.liveChat, { chat_button_product_page: 'inside_tab' });
        await customer.viewLiveChatButtonOnProduct(data.predefined.simpleProduct.product1.name, 'inside-tab');
    });

    test('admin can disable chat button on product page', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(true, 'Has Dokan Issues');
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
});
