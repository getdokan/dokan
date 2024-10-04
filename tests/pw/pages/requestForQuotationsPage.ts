import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { CustomerPage } from '@pages/customerPage';
import { MyOrdersPage } from '@pages/myOrdersPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { requestForQuotation } from '@utils/interfaces';

// selectors
const requestForQuotationAdmin = selector.admin.dokan.requestForQuotation;
const requestForQuotationVendor = selector.vendor.vRequestQuotes;
const requestForQuotationCustomer = selector.customer.cRequestForQuote;

export class RequestForQuotationsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);
    customerMyOrders = new MyOrdersPage(this.page);

    // request for quote

    // quote rules

    // quote rules render properly
    async adminQuoteRulesRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);

        // request for quote menus are visible
        await this.multipleElementVisible(requestForQuotationAdmin.menus);

        // quote rules text is visible
        await this.toBeVisible(requestForQuotationAdmin.quoteRules.quoteRulesText);

        // new quote rules is visible
        await this.toBeVisible(requestForQuotationAdmin.quoteRules.newQuoteRule);

        // nav tabs are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quoteRules.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quoteRules.bulkActions);

        // quote rules table elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quoteRules.table);
    }

    // update quote rule files
    async updateQuoteRuleFields(rule: requestForQuotation['quoteRule']) {
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.ruleTitle, rule.title);
        await this.check(requestForQuotationAdmin.quoteRules.addNewQuoteRule.applyQuoteFor(rule.userRole));

        // products
        if (rule.applyOnAllProducts) {
            await this.enableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.applyOnAllProducts);
        } else {
            await this.disableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.applyOnAllProducts);

            // specific products
            if (rule.specificProducts) {
                await this.enableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.specificProducts);
                if (rule.includeProducts) {
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.includeProducts);
                    await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, requestForQuotationAdmin.quoteRules.addNewQuoteRule.includeProductsInput, rule.includeProducts);
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedInput(rule.includeProducts));
                    await this.toBeVisible(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedResult(rule.includeProducts));
                    await this.press('Escape'); // to shift focus
                }

                if (rule.excludeProducts) {
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.excludeProducts);
                    await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, requestForQuotationAdmin.quoteRules.addNewQuoteRule.excludeProductsInput, rule.excludeProducts);
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedInput(rule.excludeProducts));
                    await this.toBeVisible(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedResult(rule.excludeProducts));
                    await this.press('Escape'); // to shift focus
                }
            }

            // specific categories
            if (rule.specificCategories) {
                await this.enableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.specificCategories);
                for (const category of rule.categories) {
                    await this.check(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectCategories(category));
                    await this.toBeChecked(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectCategories(category));
                }
            }

            // specific vendors
            if (rule.specificVendors) {
                await this.enableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.specificVendors);

                if (rule.includeVendors) {
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.includeVendors);
                    await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, requestForQuotationAdmin.quoteRules.addNewQuoteRule.includeVendorsInput, rule.includeVendors);
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedInput(rule.includeVendors));
                    await this.toBeVisible(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedResult(rule.includeVendors));
                    await this.press('Escape'); // to shift focus
                }

                if (rule.excludeVendors) {
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.excludeVendors);
                    await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, requestForQuotationAdmin.quoteRules.addNewQuoteRule.excludeVendorsInput, rule.excludeVendors);
                    await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedInput(rule.excludeVendors));
                    await this.toBeVisible(requestForQuotationAdmin.quoteRules.addNewQuoteRule.selectedResult(rule.excludeVendors));
                    await this.press('Escape'); // to shift focus
                }
            }
        }

        // todo: skipped until api is fixed
        if (rule.expireLimit) {
            await this.enableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.expireLimit);
            await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.expireLimitInput, rule.expireLimit);
        }

        if (rule.hidePrice) {
            await this.enableSwitcher(requestForQuotationAdmin.quoteRules.addNewQuoteRule.hidePrice);
            await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.hidePriceText, rule.hidePriceText);
        } else {
            if (rule.hideAddToCartButton) await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.hideAddToCartButton);
            if (rule.hideAddToCartButton) await this.click(requestForQuotationAdmin.quoteRules.addNewQuoteRule.keepBothAddToCartAndQuoteButton);
        }
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.customButtonLabel, rule.customButtonLabel);

        // priority
        await this.clearAndType(requestForQuotationAdmin.quoteRules.addNewQuoteRule.priorityOrder, rule.order);

        // publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.addNewQuoteRule.publishRule);
    }

    // add quote rule
    async addQuoteRule(rule: requestForQuotation['quoteRule']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules);
        await this.clickAndWaitForResponses([data.subUrls.api.dokan.quotes, data.subUrls.api.dokan.products], requestForQuotationAdmin.quoteRules.newQuoteRule);
        await this.updateQuoteRuleFields(rule);
    }

    // edit quote rule
    async editQuoteRule(rule: requestForQuotation['quoteRule']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules, 'networkidle', true);
        await this.hover(requestForQuotationAdmin.quoteRules.quoteRulesCell(rule.title));
        await this.clickAndWaitForResponses([data.subUrls.api.dokan.quotes, data.subUrls.api.dokan.products], requestForQuotationAdmin.quoteRules.quoteRulesEdit(rule.title));
        await this.updateQuoteRuleFields(rule);
    }

    // update quote rule
    async updateQuoteRule(quoteTitle: string, action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules, 'networkidle', true);

        switch (action) {
            case 'trash':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.navTabs.published);
                await this.hover(requestForQuotationAdmin.quoteRules.quoteRulesCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.quoteRulesTrash(quoteTitle));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.navTabs.trash);
                await this.hover(requestForQuotationAdmin.quoteRules.trashedQuoteRulesCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.quoteRulesPermanentlyDelete(quoteTitle));
                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.navTabs.trash);
                await this.hover(requestForQuotationAdmin.quoteRules.trashedQuoteRulesCell(quoteTitle));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.quoteRulesRestore(quoteTitle));
                break;

            default:
                break;
        }
    }

    // quote rules bulk action
    async quoteRulesBulkAction(action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuoteRules, 'networkidle', true);

        // ensure row exists
        await this.notToBeVisible(requestForQuotationAdmin.quoteRules.noRowsFound);

        await this.check(requestForQuotationAdmin.quoteRules.bulkActions.selectAll);

        await this.selectByValue(requestForQuotationAdmin.quoteRules.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quoteRules, requestForQuotationAdmin.quoteRules.bulkActions.applyAction);
    }

    // quotes

    // quotes render properly
    async adminQuotesRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        // request for quote menus are visible
        await this.multipleElementVisible(requestForQuotationAdmin.menus);

        // quotes text is visible
        await this.toBeVisible(requestForQuotationAdmin.quotesList.quotesText);

        // new quote is visible
        await this.toBeVisible(requestForQuotationAdmin.quotesList.newQuote);

        // nav tabs are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quotesList.navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quotesList.bulkActions);

        // quotes table elements are visible
        await this.multipleElementVisible(requestForQuotationAdmin.quotesList.table);
    }

    // update quote fields
    async updateQuoteFields(quote: requestForQuotation['quote'], action = 'create') {
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.quoteTitle, quote.title);

        // customer information
        await this.click(requestForQuotationAdmin.quotesList.addNewQuote.quoteUserDropDown);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.addNewQuote.quoteUserInput, quote.user);
        await this.click(requestForQuotationAdmin.quotesList.addNewQuote.selectedInput(`${quote.user}( ${quote.email} )`));
        await this.toBeVisible(requestForQuotationAdmin.quotesList.addNewQuote.selectedResult(`${quote.user}( ${quote.email} )`));

        // await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.fullName, quote.fullName);
        // await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.email, quote.email);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.companyName, quote.companyName);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.phoneNumber, quote.phoneNumber);

        // quote product
        if (action === 'create') {
            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.quoteVendorDropdown);
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, requestForQuotationAdmin.quotesList.addNewQuote.quoteVendorInput, quote.vendor);
            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.selectedInput(quote.vendor));
            await this.toBeVisible(requestForQuotationAdmin.quotesList.addNewQuote.selectedResult(quote.vendor));

            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.addProducts);
            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.quoteProductDropdown);
            await this.typeAndWaitForResponse(data.subUrls.api.dokan.products, requestForQuotationAdmin.quotesList.addNewQuote.quoteProductInput, quote.product);
            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.selectedInput(quote.product));
            await this.toBeVisible(requestForQuotationAdmin.quotesList.addNewQuote.selectedResult(quote.product));
            await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.quoteProductQuantity, quote.quantity);

            await this.click(requestForQuotationAdmin.quotesList.addNewQuote.addToQuote);
        }

        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.offerPrice, quote.offerPrice);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.offerProductQuantity, quote.offerProductQuantity);
        await this.clearAndType(requestForQuotationAdmin.quotesList.addNewQuote.shippingCost, quote.shippingCost);

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.addNewQuote.create);
    }

    // add quote
    async addQuote(quote: requestForQuotation['quote']) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.click(requestForQuotationAdmin.quotesList.newQuote);
        await this.updateQuoteFields(quote, 'create');
    }

    // edit quote
    async editQuote(quote: requestForQuotation['quote']) {
        // todo: add goto quote via direct url
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);
        await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quote.id));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteEdit(quote.id));
        await this.updateQuoteFields(quote, 'update');
    }

    // update quote
    async updateQuote(quoteId: string, action: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuote);

        switch (action) {
            case 'trash':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.pending);
                await this.toBeVisible(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
                await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteTrash(quoteId));
                break;

            case 'permanently-delete':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.trash);
                await this.toBeVisible(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
                await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quotePermanentlyDelete(quoteId));
                break;

            case 'restore':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.trash);
                await this.toBeVisible(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
                await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteRestore(quoteId));
                break;

            default:
                break;
        }
    }

    // approve quote
    async approveQuote(quoteId: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuote);
        await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteEdit(quoteId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.approveQuote);
    }

    // convert quote to order
    async convertQuoteToOrder(quoteId: string) {
        await this.goto(data.subUrls.backend.dokan.requestForQuote);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.navTabs.approved);
        await this.hover(requestForQuotationAdmin.quotesList.quoteCell(quoteId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.quoteEdit(quoteId));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.convertToOrder);
    }

    // quotes bulk action
    async quotesBulkAction(action: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.requestForQuote);

        // ensure row exists
        await this.notToBeVisible(requestForQuotationAdmin.quotesList.noRowsFound);

        await this.click(requestForQuotationAdmin.quotesList.bulkActions.selectAll);
        await this.selectByValue(requestForQuotationAdmin.quotesList.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.quotes, requestForQuotationAdmin.quotesList.bulkActions.applyAction);
    }

    // vendor

    // vendor request quotes render properly
    async vendorRequestQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);

        // request quotes text is visible
        await this.toBeVisible(requestForQuotationVendor.requestQuotesText);

        const noQuoteRequests = await this.isVisible(requestForQuotationVendor.noQuoteMessage);

        if (noQuoteRequests) {
            // go to shop is visible
            await this.toBeVisible(requestForQuotationVendor.goToShop);
        } else {
            // request quote table elements are visible
            await this.multipleElementVisible(requestForQuotationVendor.table);
        }
    }

    // vendor view request quote details
    async vendorViewQuoteDetails(quoteTitle: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.requestQuotes);
        await this.clickAndWaitForLoadState(requestForQuotationVendor.viewQuoteDetails(quoteTitle));

        // todo: update all locators

        // quote basic details elements are visible
        // await this.multipleElementVisible(requestForQuotationVendor.quoteDetails.basicDetails);

        // quote item details elements are visible
        await this.multipleElementVisible(requestForQuotationVendor.quoteDetails.quoteItemDetails.table);

        // quote total details elements are visible
        // await this.multipleElementVisible(requestForQuotationVendor.quoteDetails.quoteTotals);

        // update quote is visible
        // await this.toBeVisible(requestForQuotationVendor.quoteDetails.updateQuote);
        // await this.toBeVisibleAnyOfThem([requestForQuotationVendor.quoteDetails.approveThisQuote, requestForQuotationVendor.quoteDetails.convertToOrder]);
    }

    // update quote
    async vendorUpdateQuoteRequest(quoteId: string, quote: requestForQuotation['vendorQuote']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        await this.clearAndType(requestForQuotationVendor.quoteDetails.offeredPriceInput(quote.productName), quote.offeredPrice);
        await this.clearAndType(requestForQuotationVendor.quoteDetails.shippingCost, quote.shippingCost);
        await this.clearAndType(requestForQuotationVendor.quoteDetails.reply, quote.reply);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), requestForQuotationVendor.quoteDetails.updateQuote);
        await this.toContainText(requestForQuotationVendor.quoteDetails.message, 'Your quote has been successfully updated.');
    }

    // approve quote
    async vendorApproveQuoteRequest(quoteId: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), requestForQuotationVendor.quoteDetails.approveThisQuote);
        await this.toContainText(requestForQuotationVendor.quoteDetails.message, 'Your quote has been successfully updated.');
    }

    // convert quote to order
    async vendorConvertQuoteToOrder(quoteId: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.quoteDetails(quoteId));
        const needApproval = await this.isVisible(requestForQuotationVendor.quoteDetails.approveThisQuote);
        if (needApproval) {
            await this.vendorApproveQuoteRequest(quoteId);
        }
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.quoteDetails(quoteId), requestForQuotationVendor.quoteDetails.convertToOrder);
        await this.toContainText(requestForQuotationVendor.quoteDetails.message, `Your Quote #${quoteId} has been converted to Order #`);
    }

    // customer

    // customer request for quote render properly
    async requestForQuoteRenderProperly(link?: string) {
        if (link) {
            await this.goto(link);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.requestForQuote);
            // request for text is visible
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.requestForQuoteText);
        }

        const noQuote = await this.isVisible(requestForQuotationCustomer.requestForQuote.noQuotesFound);

        if (noQuote) {
            await this.toContainText(requestForQuotationCustomer.requestForQuote.noQuotesFound, 'Your quote is currently empty.');
            console.log('No quotes found on request for quote page');
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.returnToShop);
        } else {
            // quote item table details elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestForQuote.quoteItemDetails.table);

            // quote total details elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestForQuote.quoteTotals);

            // update quote is visible
            await this.toBeVisible(requestForQuotationCustomer.requestForQuote.updateQuote);
        }
    }

    // requested quotes render properly
    async requestedQuotesRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

        // request quotes text is visible
        await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteText);

        const noQuoteRequests = await this.isVisible(requestForQuotationCustomer.requestedQuote.noQuoteMessage);

        if (noQuoteRequests) {
            // go to shop is visible
            await this.toBeVisible(requestForQuotationCustomer.requestedQuote.goToShop);
        } else {
            // request quote table elements are visible
            await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.table);

            // pagination is visible
            // await this.toBeVisible(requestForQuotationCustomer.requestedQuote.pagination);
        }
    }

    // customer view requested quote details
    async customerViewRequestedQuoteDetails(quoteTitle: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.requestedQuote);

        await this.clickAndWaitForLoadState(requestForQuotationCustomer.requestedQuote.viewQuoteDetails(quoteTitle));

        // todo: need to add & update all locators
        // quote basic details elements are visible
        // await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.basicDetails);

        // // quote item details elements are visible
        // await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quoteItemDetails.quoteDetailsText);
        // await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quoteItemDetails.table);

        // // quote total details elements are visible
        // await this.multipleElementVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quoteTotals);

        // // update quote is visible
        // await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.updateQuote);
    }

    // customer update requested quote
    async customerUpdateRequestedQuote(quoteId: string, quote: requestForQuotation['userQuote']) {
        await this.goIfNotThere(data.subUrls.frontend.quoteDetails(quoteId));
        await this.clearAndType(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.offeredPriceInput(quote.productName), quote.offeredPrice);
        await this.clearAndType(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.quantityInput(quote.productName), quote.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.quoteDetails(quoteId), requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.updateQuote);
        await this.toContainText(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.message, 'Your quote has been successfully updated.');
    }

    // customer pay converted quote
    async payConvertedQuote(quoteId: string) {
        await this.goto(data.subUrls.frontend.quoteDetails(quoteId));
        await this.forceLinkToSameTab(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.viewOrder);
        await this.clickAndWaitForLoadState(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.viewOrder);
        await this.toBeVisible(requestForQuotationCustomer.orderDetails.quoteNoteOnOrderDetails);
        const orderId = (await this.getElementText(selector.customer.cOrderDetails.orderDetails.orderNumber)) as string;
        await this.customerMyOrders.payPendingOrder(orderId, 'bank');
    }

    // customer quote product
    async customerQuoteProduct(quote: requestForQuotation['userQuote'], guest?: requestForQuotation['guest']): Promise<string | void> {
        await this.customerPage.goToProductDetails(quote.productName);

        await this.clickAndWaitForResponse(data.subUrls.ajax, requestForQuotationCustomer.singleProductDetails.addToQuote);
        const viewQuoteIsVisible = await this.isVisible(requestForQuotationCustomer.singleProductDetails.viewQuote);
        if (viewQuoteIsVisible) {
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, requestForQuotationCustomer.singleProductDetails.viewQuote);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.requestForQuote);
        }
        // await this.clearAndType(requestForQuotationCustomer.requestForQuote.offeredPriceInput(quote.productName), quote.offeredPrice);
        await this.clearAndType(requestForQuotationCustomer.requestForQuote.quantityInput(quote.productName), quote.quantity);

        if (guest) {
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.fullName, guest.fullName);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.email, guest.email);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.phoneNumber, guest.phoneNumber);

            await this.selectByValue(requestForQuotationCustomer.requestForQuote.guest.address.country, guest.address.countrySelectValue);
            await this.selectByValue(requestForQuotationCustomer.requestForQuote.guest.address.state, guest.address.stateSelectValue);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.address.city, guest.address.city);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.address.postCode, guest.address.postCode);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.address.addressLine1, guest.address.addressLine1);
            await this.clearAndType(requestForQuotationCustomer.requestForQuote.guest.address.addressLine2, guest.address.addressLine2);
        }

        await this.clearAndType(requestForQuotationCustomer.requestForQuote.expectedDelivery, quote.expectedDelivery);
        await this.clearAndType(requestForQuotationCustomer.requestForQuote.additionalMessage, quote.additionalMessage);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.requestForQuote, requestForQuotationCustomer.requestForQuote.placeQuote, 302);
        await this.toBeVisible(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.requestedQuoteText);

        if (!guest) {
            const quoteId = (await this.getElementText(requestForQuotationCustomer.requestedQuote.requestedQuoteDetails.basicDetails.quoteNumber))?.trim().match(/\d+/)?.[0];
            return quoteId;
        }
    }
}
