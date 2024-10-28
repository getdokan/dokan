import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

// selectors
const liveChatVendor = selector.vendor.vInbox;
const liveChatCustomer = selector.customer.cLiveChat;
const singleStoreCustomer = selector.customer.cSingleStore;
const singleProductCustomer = selector.customer.cSingleProduct;

export class LiveChatPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async gotoSingleStore(storeName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)), 'networkidle');
    }

    async goToProductDetails(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
    }

    // vendor

    // vendor inbox render properly
    async vendorInboxRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.inbox);

        // chat persons, chat box, chat text box, send button is visible
        await this.toBeVisibleFrameLocator(liveChatVendor.liveChatIframe, liveChatVendor.chatPersons);
        await this.toBeVisibleFrameLocator(liveChatVendor.liveChatIframe, liveChatVendor.chatBox);
        await this.toBeVisibleFrameLocator(liveChatVendor.liveChatIframe, liveChatVendor.chatTextBox);
        await this.toBeVisibleFrameLocator(liveChatVendor.liveChatIframe, liveChatVendor.sendButton);
    }

    // vendor send message to vendor customer
    async sendMessageToCustomer(chatPerson: string, message: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.inbox);
        await this.clickFrameSelector(liveChatVendor.liveChatIframe, liveChatVendor.chatPerson(chatPerson));
        await this.typeFrameSelector(liveChatVendor.liveChatIframe, liveChatVendor.chatTextBox, message);
        await this.clickFrameSelectorAndWaitForResponse(liveChatVendor.liveChatIframe, data.subUrls.frontend.talkjs, liveChatVendor.sendButton);
        await this.toBeVisibleFrameLocator(liveChatVendor.liveChatIframe, liveChatVendor.sentMessage(message));
    }

    // customer

    // customer send message to vendor customer
    async sendMessageToVendor(storename: string, message: string): Promise<void> {
        await this.gotoSingleStore(storename);
        await this.click(singleStoreCustomer.storeTabs.chatNow);
        await this.toBeVisible(liveChatCustomer.liveChatIframe);
        await this.typeFrameSelector(liveChatCustomer.liveChatIframe, liveChatCustomer.chatTextBox, message);
        await this.clickFrameSelectorAndWaitForResponse(liveChatCustomer.liveChatIframe, data.subUrls.frontend.talkjs, liveChatCustomer.sendButton);
        await this.toBeVisibleFrameLocator(liveChatCustomer.liveChatIframe, liveChatCustomer.sentMessage(message));
    }

    async viewLiveChatButtonOnStore(storename: string, disable = false) {
        await this.gotoSingleStore(storename);
        if (!disable) {
            await this.toBeVisible(singleStoreCustomer.storeTabs.chatNow);
        } else {
            await this.notToBeVisible(singleStoreCustomer.storeTabs.chatNow);
        }
    }

    async viewLiveChatButtonOnProduct(productName: string, option: string) {
        await this.goToProductDetails(productName);

        switch (option) {
            case 'above-tab':
                await this.toBeVisible(singleProductCustomer.productDetails.chatNow);
                break;

            case 'inside-tab':
                await this.click(singleProductCustomer.menus.vendorInfo);
                await this.toBeVisible(singleProductCustomer.productDetails.chatNow);
                break;

            case 'dont-show':
                await this.notToBeVisible(singleProductCustomer.productDetails.chatNow);
                await this.click(singleProductCustomer.menus.vendorInfo);
                await this.notToBeVisible(singleProductCustomer.productDetails.chatNow);
                break;

            default:
                break;
        }
    }
}
