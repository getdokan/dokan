import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { dokanSettings } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

export class SettingsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // settings

    // dokan settings render properly
    async dokanSettingsRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);

        // settings text is visible
        await this.toBeVisible(selector.admin.dokan.settings.settingsText);

        // settings section elements are visible
        await this.multipleElementVisible(selector.admin.dokan.settings.sections);

        // settings header elements are visible
        await this.multipleElementVisible(selector.admin.dokan.settings.header);

        // settings field is visible
        await this.toBeVisible(selector.admin.dokan.settings.fields);

        // settings save Changes is visible
        await this.toBeVisible(selector.admin.dokan.settings.saveChanges);
    }

    // search settings
    async searchSettings(settings: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);

        await this.clearAndType(selector.admin.dokan.settings.search.input, settings);
        await this.toBeVisible(selector.admin.dokan.settings.fields);
        await this.click(selector.admin.dokan.settings.search.close);
    }

    // scroll to top settings
    async scrollToTopSettings() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);

        await this.scrollToBottom();
        await this.toBeVisible(selector.admin.dokan.settings.backToTop);
    }

    // dokan settings

    // admin set dokan general settings
    async setDokanGeneralSettings(general: dokanSettings['general']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.general);

        // site options
        await this.enableSwitcher(selector.admin.dokan.settings.general.adminAreaAccess);
        await this.clearAndType(selector.admin.dokan.settings.general.vendorStoreUrl, general.vendorStoreUrl);
        await this.typeFrameSelector(selector.admin.dokan.settings.general.setupWizardMessageIframe, selector.admin.dokan.settings.general.setupWizardMessageHtmlBody, general.setupWizardMessage);
        DOKAN_PRO && (await this.click(selector.admin.dokan.settings.general.sellingProductTypes(general.sellingProductTypes)));

        // vendor store options
        await this.enableSwitcher(selector.admin.dokan.settings.general.storeTermsAndConditions);
        await this.clearAndType(selector.admin.dokan.settings.general.storeProductPerPage, general.storeProductPerPage);
        if (DOKAN_PRO) {
            await this.enableSwitcher(selector.admin.dokan.settings.general.enableTermsAndCondition);
            await this.click(selector.admin.dokan.settings.general.storCategory(general.storCategory));
        }

        // product page settings
        await this.enableSwitcher(selector.admin.dokan.settings.general.showVendorInfo);
        await this.enableSwitcher(selector.admin.dokan.settings.general.enableMoreProductsTab);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.general.generalSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, general.saveSuccessMessage);
    }

    // admin set dokan selling settings
    async setDokanSellingSettings(selling: dokanSettings['selling']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.sellingOptions);

        // commission settings
        await this.selectByValue(selector.admin.dokan.settings.selling.commissionType, selling.commissionType);
        await this.clearAndType(selector.admin.dokan.settings.selling.adminCommission, selling.adminCommission);
        // await this.click(selector.admin.dokan.settings.selling.shippingFeeRecipient(selling.shippingFeeRecipient)); //todo: makes test flaky
        await this.click(selector.admin.dokan.settings.selling.productTaxFeeRecipient(selling.productTaxFeeRecipient));
        await this.click(selector.admin.dokan.settings.selling.shippingTaxFeeRecipient(selling.shippingTaxFeeRecipient));

        // vendor capabilities
        await this.enableSwitcher(selector.admin.dokan.settings.selling.enableSelling);
        await this.enableSwitcher(selector.admin.dokan.settings.selling.onePageProductCreate);
        await this.enableSwitcher(selector.admin.dokan.settings.selling.orderStatusChange);
        await this.enableSwitcher(selector.admin.dokan.settings.selling.selectAnyCategory);
        if (DOKAN_PRO) {
            await this.click(selector.admin.dokan.settings.selling.newProductStatus(selling.newProductStatus));
            await this.enableSwitcher(selector.admin.dokan.settings.selling.duplicateProduct);
            await this.click(selector.admin.dokan.settings.selling.productCategorySelection(selling.productCategorySelection));
            await this.enableSwitcher(selector.admin.dokan.settings.selling.vendorsCanCreateTags);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.orderDiscount);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.productDiscount);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.vendorProductReviewStatusChange);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.guestProductEnquiry);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.newVendorEnableAuction);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.enableMinMaxQuantities);
            await this.enableSwitcher(selector.admin.dokan.settings.selling.enableMinMaxAmount);
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.selling.sellingOptionsSaveChanges);
        await this.toHaveValue(selector.admin.dokan.settings.selling.adminCommission, selling.adminCommission);
    }

    // Admin Set Dokan Withdraw Settings
    async setDokanWithdrawSettings(withdraw: dokanSettings['withdraw']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.withdrawOptions);

        // Withdraw Options
        await this.enableSwitcher(selector.admin.dokan.settings.withdraw.withdrawMethodsPaypal);
        await this.enableSwitcher(selector.admin.dokan.settings.withdraw.withdrawMethodsBankTransfer);
        if (DOKAN_PRO) {
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.withdrawMethodsDokanCustom);
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.withdrawMethodsSkrill);
            await this.clearAndType(selector.admin.dokan.settings.withdraw.customMethodName, withdraw.customMethodName);
            await this.clearAndType(selector.admin.dokan.settings.withdraw.customMethodType, withdraw.customMethodType);
        }
        await this.clearAndType(selector.admin.dokan.settings.withdraw.minimumWithdrawAmount, withdraw.minimumWithdrawAmount);
        await this.enableSwitcher(selector.admin.dokan.settings.withdraw.orderStatusForWithdrawCompleted);
        await this.enableSwitcher(selector.admin.dokan.settings.withdraw.orderStatusForWithdrawProcessing);
        if (DOKAN_PRO) {
            await this.clearAndType(selector.admin.dokan.settings.withdraw.withdrawThreshold, withdraw.withdrawThreshold);

            // Disbursement Schedule Settings
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.withdrawDisbursementManual);
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.withdrawDisbursementAuto);

            // Disbursement Schedule
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.disburseMentQuarterlySchedule);
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.disburseMentMonthlySchedule);
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.disburseMentBiweeklySchedule);
            await this.enableSwitcher(selector.admin.dokan.settings.withdraw.disburseMentWeeklySchedule);

            // Quarterly Schedule
            await this.selectByValue(selector.admin.dokan.settings.withdraw.quarterlyScheduleMonth, withdraw.quarterlyScheduleMonth);
            await this.selectByValue(selector.admin.dokan.settings.withdraw.quarterlyScheduleWeek, withdraw.quarterlyScheduleWeek);
            await this.selectByValue(selector.admin.dokan.settings.withdraw.quarterlyScheduleDay, withdraw.quarterlyScheduleDay);
            // Monthly Schedule
            await this.selectByValue(selector.admin.dokan.settings.withdraw.monthlyScheduleWeek, withdraw.monthlyScheduleWeek);
            await this.selectByValue(selector.admin.dokan.settings.withdraw.monthlyScheduleDay, withdraw.monthlyScheduleDay);
            // Biweekly Schedule
            await this.selectByValue(selector.admin.dokan.settings.withdraw.biweeklyScheduleWeek, withdraw.biweeklyScheduleWeek);
            await this.selectByValue(selector.admin.dokan.settings.withdraw.biweeklyScheduleDay, withdraw.biweeklyScheduleDay);
            // Weekly Schedule
            await this.selectByValue(selector.admin.dokan.settings.withdraw.weeklyScheduleDay, withdraw.weeklyScheduleDay);
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.withdraw.withdrawSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, withdraw.saveSuccessMessage);
    }

    // Admin Set Dokan Reverse Withdraw Settings
    async setDokanReverseWithdrawSettings(reverseWithdraw: dokanSettings['reverseWithdraw']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.reverseWithdrawal);

        // reverse withdraw options
        await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.enableReverseWithdrawal);
        await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.enableReverseWithdrawalForThisGateway);

        await this.selectByValue(selector.admin.dokan.settings.reverseWithdraw.billingType, reverseWithdraw.billingType);
        await this.clearAndType(selector.admin.dokan.settings.reverseWithdraw.reverseBalanceThreshold, reverseWithdraw.reverseBalanceThreshold);
        await this.clearAndType(selector.admin.dokan.settings.reverseWithdraw.gracePeriod, reverseWithdraw.gracePeriod);

        await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.disableAddToCartButton);
        await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.hideWithdrawMenu);
        await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.MakeVendorStatusInactive);

        await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.displayNoticeDuringGracePeriod);
        DOKAN_PRO && (await this.enableSwitcher(selector.admin.dokan.settings.reverseWithdraw.sendAnnouncement));

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.reverseWithdraw.reverseWithdrawSaveChanges);
        await this.toHaveValue(selector.admin.dokan.settings.reverseWithdraw.reverseBalanceThreshold, reverseWithdraw.reverseBalanceThreshold);
    }

    // Admin Set Dokan Page Settings
    async setPageSettings(page: dokanSettings['page']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.pageSettings);

        await this.selectByLabel(selector.admin.dokan.settings.page.dashboard, page.dashboard);
        await this.selectByLabel(selector.admin.dokan.settings.page.myOrders, page.myOrders);
        await this.selectByLabel(selector.admin.dokan.settings.page.storeListing, page.storeListing);
        await this.selectByLabel(selector.admin.dokan.settings.page.termsAndConditions, page.termsAndConditions);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.page.pageSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, page.saveSuccessMessage);
    }

    // Admin Set Dokan Appearance Settings
    async setDokanAppearanceSettings(appearance: dokanSettings['appearance']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.appearance);

        // Appearance Settings
        await this.enableSwitcher(selector.admin.dokan.settings.appearance.showMapOnStorePage);
        await this.click(selector.admin.dokan.settings.appearance.mapApiSourceGoogleMaps);
        await this.clearAndType(selector.admin.dokan.settings.appearance.googleMapApiKey, appearance.googleMapApiKey);
        await this.enableSwitcher(selector.admin.dokan.settings.appearance.showContactFormOnStorePage);
        await this.click(selector.admin.dokan.settings.appearance.storeHeaderTemplate2);
        await this.click(selector.admin.dokan.settings.appearance.storeHeaderTemplate1);
        if (DOKAN_PRO) {
            await this.clearAndType(selector.admin.dokan.settings.appearance.storeBannerWidth, appearance.storeBannerWidth);
            await this.clearAndType(selector.admin.dokan.settings.appearance.storeBannerHeight, appearance.storeBannerHeight);
            await this.enableSwitcher(selector.admin.dokan.settings.appearance.storeOpeningClosingTimeWidget);
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.appearance.appearanceSaveChanges);
        await this.toHaveValue(selector.admin.dokan.settings.appearance.googleMapApiKey, appearance.googleMapApiKey);
    }

    // Admin Set Dokan Privacy Policy Settings
    async setDokanPrivacyPolicySettings(privacyPolicy: dokanSettings['privacyPolicy']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.privacyPolicy);

        // Privacy Policy Settings
        await this.enableSwitcher(selector.admin.dokan.settings.privacyPolicy.enablePrivacyPolicy);
        await this.selectByValue(selector.admin.dokan.settings.privacyPolicy.privacyPage, privacyPolicy.privacyPage);
        await this.typeFrameSelector(selector.admin.dokan.settings.privacyPolicy.privacyPolicyIframe, selector.admin.dokan.settings.privacyPolicy.privacyPolicyHtmlBody, privacyPolicy.privacyPolicyContent);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.privacyPolicy.privacyPolicySaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, privacyPolicy.saveSuccessMessage);
    }

    // Admin Set Dokan Color Settings
    async setDokanColorSettings(colors: dokanSettings['colors']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.colors);

        // Colors Settings
        if (colors.paletteChoice === 'pre-defined') {
            await this.click(selector.admin.dokan.settings.colors.predefineColorPalette);
            await this.click(selector.admin.dokan.settings.colors.colorPalette[colors.colorPalette as keyof typeof selector.admin.dokan.settings.colors.colorPalette]);
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.colors.colorsSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, colors.saveSuccessMessage);
    }

    // Admin Set Dokan Live Search Settings
    async setDokanLiveSearchSettings(liveSearch: dokanSettings['liveSearch']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.liveSearch);

        // Live Search Settings
        await this.selectByValue(selector.admin.dokan.settings.liveSearch.liveSearchOptions, liveSearch.liveSearchOption);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.liveSearch.liveSearchSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, liveSearch.saveSuccessMessage);
    }

    // Admin Set Dokan Store Support Settings
    async setDokanStoreSupportSettings(storeSupport: dokanSettings['storeSupport']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.storeSupport);

        // Store Support Settings
        await this.enableSwitcher(selector.admin.dokan.settings.storeSupport.displayOnOrderDetails);
        await this.selectByValue(selector.admin.dokan.settings.storeSupport.displayOnSingleProductPage, storeSupport.displayOnSingleProductPage);
        await this.clearAndType(selector.admin.dokan.settings.storeSupport.supportButtonLabel, storeSupport.supportButtonLabel);
        await this.enableSwitcher(selector.admin.dokan.settings.storeSupport.supportTicketEmailNotification);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.storeSupport.storeSupportSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, storeSupport.saveSuccessMessage);
    }

    // Admin Set Dokan Email Verification Settings
    async setDokanEmailVerificationSettings(emailVerification: dokanSettings['emailVerification']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.emailVerification);

        // Email Verification Settings
        await this.enableSwitcher(selector.admin.dokan.settings.emailVerification.enableEmailVerification);
        await this.clearAndType(selector.admin.dokan.settings.emailVerification.registrationNotice, emailVerification.registrationNotice);
        await this.clearAndType(selector.admin.dokan.settings.emailVerification.loginNotice, emailVerification.loginNotice);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.emailVerification.emailVerificationSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, emailVerification.saveSuccessMessage);
    }

    // Admin Set Dokan Shipping Status Settings
    async setDokanShippingStatusSettings(shippingStatus: dokanSettings['shippingStatus']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.shippingStatus);

        // Shipping Status Settings
        await this.enableSwitcher(selector.admin.dokan.settings.shippingStatus.allowShipmentTracking);

        // shipping status
        await this.enableSwitcher(selector.admin.dokan.settings.shippingStatus.shippingProviders.australiaPost);
        await this.enableSwitcher(selector.admin.dokan.settings.shippingStatus.shippingProviders.canadaPost);
        await this.enableSwitcher(selector.admin.dokan.settings.shippingStatus.shippingProviders.cityLink);

        await this.clearAndType(selector.admin.dokan.settings.shippingStatus.customShippingStatusInput, shippingStatus.customShippingStatus);
        await this.click(selector.admin.dokan.settings.shippingStatus.customShippingStatusAdd);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.shippingStatus.shippingStatusSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, shippingStatus.saveSuccessMessage);
    }

    // Admin Set Dokan Quote Settings
    async setDokanQuoteSettings(quote: dokanSettings['quote']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.quote);

        // Live Search Settings
        await this.enableSwitcher(selector.admin.dokan.settings.quote.enableQuoteForOutOfStockProducts);
        await this.enableSwitcher(selector.admin.dokan.settings.quote.enableAjaxAddToQuote);
        await this.enableSwitcher(selector.admin.dokan.settings.quote.redirectToQuotePage);

        await this.clearAndType(selector.admin.dokan.settings.quote.decreaseOfferedPrice, quote.decreaseOfferedPrice);
        // await this.enableSwitcher(selector.admin.dokan.settings.quote.enableConvertToOrder);
        // await this.enableSwitcher(selector.admin.dokan.settings.quote.enableQuoteConverterDisplay);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.quote.quoteSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, quote.saveSuccessMessage);
    }

    // Admin Set Dokan Rma Settings
    async setDokanRmaSettings(rma: dokanSettings['rma']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.rma);

        // Rma Settings
        await this.selectByValue(selector.admin.dokan.settings.rma.orderStatus, rma.orderStatus);
        await this.enableSwitcher(selector.admin.dokan.settings.rma.enableRefundRequests);
        await this.enableSwitcher(selector.admin.dokan.settings.rma.enableCouponRequests);

        for (const rmaReason of rma.rmaReasons) {
            await this.deleteIfExists(selector.admin.dokan.settings.rma.reasonsForRmaSingle(rmaReason));
            await this.clearAndType(selector.admin.dokan.settings.rma.reasonsForRmaInput, rmaReason);
            await this.click(selector.admin.dokan.settings.rma.reasonsForRmaAdd);
        }

        await this.typeFrameSelector(selector.admin.dokan.settings.rma.refundPolicyIframe, selector.admin.dokan.settings.rma.refundPolicyHtmlBody, rma.refundPolicyHtmlBody);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.rma.rmaSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, rma.saveSuccessMessage);
    }

    // Admin Set Dokan Wholesale Settings
    async setDokanWholesaleSettings(wholesale: dokanSettings['wholesale']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.wholesale);

        // Wholesale Settings
        await this.click(selector.admin.dokan.settings.wholesale.whoCanSeeWholesalePrice(wholesale.whoCanSeeWholesalePrice));
        await this.enableSwitcher(selector.admin.dokan.settings.wholesale.showWholesalePriceOnShopArchive);
        await this.disableSwitcher(selector.admin.dokan.settings.wholesale.needApprovalForCustomer);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.wholesale.wholesaleSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, wholesale.saveSuccessMessage);
    }

    // Admin Set Dokan Eu Compliance Settings
    async setDokanEuComplianceSettings(euCompliance: dokanSettings['euCompliance']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.euComplianceFields);

        // Eu Compliance Settings
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.vendorExtraFieldsCompanyName);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.vendorExtraFieldsCompanyIdOrEuidNumber);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.vendorExtraFieldsVatOrTaxNumber);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.vendorExtraFieldsNameOfBank);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.vendorExtraFieldsBankIban);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.displayInVendorRegistrationForm);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.customerExtraFieldsCompanyIdOrEuidNumber);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.customerExtraFieldsVatOrTaxNumber);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.customerExtraFieldsNameOfBank);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.customerExtraFieldsBankIban);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.enableGermanizedSupportForVendors);
        await this.enableSwitcher(selector.admin.dokan.settings.euCompliance.vendorsWillBeAbleToOverrideInvoiceNumber);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.euCompliance.euComplianceFieldsSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, euCompliance.saveSuccessMessage);
    }

    // Admin Set Dokan Delivery Time Settings
    async setDokanDeliveryTimeSettings(deliveryTime: dokanSettings['deliveryTime']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.deliveryTime);

        // Delivery Time Settings
        await this.enableSwitcher(selector.admin.dokan.settings.deliveryTime.allowVendorSettings);
        await this.enableSwitcher(selector.admin.dokan.settings.deliveryTime.homeDelivery);
        await this.enableSwitcher(selector.admin.dokan.settings.deliveryTime.storePickup);
        await this.clearAndType(selector.admin.dokan.settings.deliveryTime.deliveryDateLabel, deliveryTime.deliveryDateLabel);
        await this.clearAndType(selector.admin.dokan.settings.deliveryTime.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer);
        await this.clearAndType(selector.admin.dokan.settings.deliveryTime.timeSlot, deliveryTime.timeSlot);
        await this.clearAndType(selector.admin.dokan.settings.deliveryTime.orderPerSlot, deliveryTime.orderPerSlot);
        await this.clearAndType(selector.admin.dokan.settings.deliveryTime.deliveryBoxInfo, deliveryTime.deliveryBoxInfo);
        await this.disableSwitcher(selector.admin.dokan.settings.deliveryTime.requireDeliveryDateAndTime);
        for (const day of deliveryTime.days) {
            await this.enableSwitcher(selector.admin.dokan.settings.deliveryTime.deliveryDay(day));
            if (deliveryTime.choice === 'full-day') {
                await this.click(selector.admin.dokan.settings.deliveryTime.openingTime(day));
                await this.page.getByRole('listitem').filter({ hasText: 'Full day' }).click();
            } else {
                await this.page.getByRole('listitem').filter({ hasText: deliveryTime.openingTime }).click();
                await this.click(selector.admin.dokan.settings.deliveryTime.closingTime(day));
                await this.page.getByRole('listitem').filter({ hasText: deliveryTime.closingTime }).click();
            }
        }

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.deliveryTime.deliveryTimeSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, deliveryTime.saveSuccessMessage);
    }

    // Admin Set Dokan Product Advertising Settings
    async setDokanProductAdvertisingSettings(productAdvertising: dokanSettings['productAdvertising']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.productAdvertising);

        // Product Advertising Settings
        await this.clearAndType(selector.admin.dokan.settings.productAdvertising.noOfAvailableSlot, productAdvertising.noOfAvailableSlot);
        await this.clearAndType(selector.admin.dokan.settings.productAdvertising.expireAfterDays, productAdvertising.expireAfterDays);
        await this.enableSwitcher(selector.admin.dokan.settings.productAdvertising.vendorCanPurchaseAdvertisement);
        await this.clearAndType(selector.admin.dokan.settings.productAdvertising.advertisementCost, productAdvertising.advertisementCost);
        await this.enableSwitcher(selector.admin.dokan.settings.productAdvertising.enableAdvertisementInSubscription);
        await this.enableSwitcher(selector.admin.dokan.settings.productAdvertising.markAdvertisedProductAsFeatured);
        await this.enableSwitcher(selector.admin.dokan.settings.productAdvertising.displayAdvertisedProductOnTop);
        await this.enableSwitcher(selector.admin.dokan.settings.productAdvertising.outOfStockVisibility);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.productAdvertising.productAdvertisingSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, productAdvertising.saveSuccessMessage);
    }

    // Admin Set Dokan Geolocation Settings
    async setDokanGeolocationSettings(geolocation: dokanSettings['geolocation']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.geolocation);

        // Geolocation Settings
        await this.click(selector.admin.dokan.settings.geolocation.locationMapPosition(geolocation.locationMapPosition));
        await this.click(selector.admin.dokan.settings.geolocation.showMap(geolocation.showMap));
        await this.enableSwitcher(selector.admin.dokan.settings.geolocation.showFiltersBeforeLocationMap);
        await this.enableSwitcher(selector.admin.dokan.settings.geolocation.productLocationTab);
        await this.click(selector.admin.dokan.settings.geolocation.radiusSearchUnit(geolocation.radiusSearchUnit));
        await this.clearAndType(selector.admin.dokan.settings.geolocation.radiusSearchMinimumDistance, geolocation.radiusSearchMinimumDistance);
        await this.clearAndType(selector.admin.dokan.settings.geolocation.radiusSearchMaximumDistance, geolocation.radiusSearchMaximumDistance);
        await this.clearAndType(selector.admin.dokan.settings.geolocation.mapZoomLevel, geolocation.mapZoomLevel);
        await this.focus(selector.admin.dokan.settings.geolocation.defaultLocation);
        await this.typeAndWaitForResponse(data.subUrls.gmap, selector.admin.dokan.settings.geolocation.defaultLocation, geolocation.defaultLocation);
        // await this.press(data.key.arrowDown);
        // await this.press(data.key.enter);
        await this.click(selector.admin.dokan.settings.geolocation.mapResultFirst);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.geolocation.geolocationSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, geolocation.saveSuccessMessage);
    }

    // Admin Set Dokan Product Report Abuse Settings
    async setDokanProductReportAbuseSettings(productReportAbuse: dokanSettings['productReportAbuse']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.productReportAbuse);

        // Product Report Abuse Settings
        await this.deleteIfExists(selector.admin.dokan.settings.productReportAbuse.reasonsForAbuseReportSingle(productReportAbuse.reasonsForAbuseReport));
        await this.clearAndType(selector.admin.dokan.settings.productReportAbuse.reasonsForAbuseReportInput, productReportAbuse.reasonsForAbuseReport);
        await this.click(selector.admin.dokan.settings.productReportAbuse.reasonsForAbuseReportAdd);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.productReportAbuse.productReportAbuseSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, productReportAbuse.saveSuccessMessage);
    }

    // Admin Set Dokan Spmv Settings
    async setDokanSpmvSettings(spmv: dokanSettings['spmv']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.singleProductMultiVendor);

        await this.enableSwitcher(selector.admin.dokan.settings.spmv.enableSingleProductMultipleVendor);
        await this.clearAndType(selector.admin.dokan.settings.spmv.sellItemButtonText, spmv.sellItemButtonText);
        await this.clearAndType(selector.admin.dokan.settings.spmv.availableVendorDisplayAreaTitle, spmv.availableVendorDisplayAreaTitle);
        await this.selectByValue(selector.admin.dokan.settings.spmv.availableVendorSectionDisplayPosition, spmv.availableVendorSectionDisplayPosition);
        await this.selectByValue(selector.admin.dokan.settings.spmv.showSpmvProducts, spmv.showSpmvProducts);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.spmv.singleProductMultiVendorSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, spmv.saveSuccessMessage);
    }

    // Admin Set Dokan Vendor Subscription Settings
    async setDokanVendorSubscriptionSettings(subscription: dokanSettings['vendorSubscription']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.vendorSubscription);

        // Vendor Subscription Settings
        await this.selectByLabel(selector.admin.dokan.settings.vendorSubscriptions.subscription, subscription.displayPage);
        await this.enableSwitcher(selector.admin.dokan.settings.vendorSubscriptions.enableProductSubscription);
        await this.enableSwitcher(selector.admin.dokan.settings.vendorSubscriptions.enableSubscriptionInRegistrationForm);
        await this.enableSwitcher(selector.admin.dokan.settings.vendorSubscriptions.enableEmailNotification);
        await this.clearAndType(selector.admin.dokan.settings.vendorSubscriptions.noOfDays, subscription.noOfDays);
        await this.selectByValue(selector.admin.dokan.settings.vendorSubscriptions.productStatus, subscription.productStatus);
        await this.clearAndType(selector.admin.dokan.settings.vendorSubscriptions.cancellingEmailSubject, subscription.cancellingEmailSubject);
        await this.clearAndType(selector.admin.dokan.settings.vendorSubscriptions.cancellingEmailBody, subscription.cancellingEmailBody);
        await this.clearAndType(selector.admin.dokan.settings.vendorSubscriptions.alertEmailSubject, subscription.alertEmailSubject);
        await this.clearAndType(selector.admin.dokan.settings.vendorSubscriptions.alertEmailBody, subscription.alertEmailBody);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.vendorSubscriptions.vendorSubscriptionSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, subscription.saveSuccessMessage);
    }

    // disable dokan vendor subscription
    async disableDokanVendorSubscription(subscription: dokanSettings['vendorSubscription']) {
        await this.goToDokanSettings();
        await this.click(selector.admin.dokan.settings.menus.vendorSubscription);

        // Disabling Vendor Subscription
        await this.disableSwitcher(selector.admin.dokan.settings.vendorSubscriptions.enableProductSubscription);

        // save settings
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.settings.vendorSubscriptions.vendorSubscriptionSaveChanges);
        await this.toContainText(selector.admin.dokan.settings.dokanUpdateSuccessMessage, subscription.saveSuccessMessage);
    }
}
