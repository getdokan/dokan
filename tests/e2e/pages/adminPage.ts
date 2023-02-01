import { expect, type Page } from '@playwright/test';
import { BasePage } from "./basePage";
import { selector } from './selectors';
import { data } from '../utils/testData';
import { helpers } from '../utils/helpers';

export class AdminPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    // navigation

    async goToAdminDashboard() {
        await this.goIfNotThere(data.subUrls.backend.adminDashboard);
    }

    async goToDokanSettings() {
        await this.goIfNotThere(data.subUrls.backend.dokanSettings);
    }

    async goToWooCommerceSettings() {
        await this.goIfNotThere(data.subUrls.backend.woocommerceSettings);
    }


    // wordpress site settings

    // plugin activation check
    async checkActivePlugins(plugins: any) {
        await this.goIfNotThere(data.subUrls.backend.plugins);
        for (let pluginSlug of plugins.pluginSlugList) {
            await expect(this.page.locator(selector.admin.plugins.plugin(pluginSlug))).toHaveClass(plugins.activeClass)
        }
    }

    // admin set wordpress site settings
    async setWpSettings(wpSettings:any) {
        await this.setWpGeneralSettings(wpSettings.general)
        await this.setPermalinkSettings(wpSettings.permalink)
    }

    // sst wp general settings
    async setWpGeneralSettings(general:any) {
        await this.goto(data.subUrls.backend.general)

        // enable user registration
        await this.check(selector.admin.settings.membership)
        // timezone
        await this.selectByValue(selector.admin.settings.timezone, general.timezone)
        await this.click(selector.admin.settings.generalSaveChanges)
        await expect(this.page.locator(selector.admin.settings.updatedSuccessMessage)).toContainText(general.saveSuccessMessage)
    }

    // admin set permalink settings
    async setPermalinkSettings(permalink: any) {
        await this.goto(data.subUrls.backend.permalinks)

        // set permalinks settings
        await this.click(selector.admin.settings.postName)
        await this.click(selector.admin.settings.customBase)
        await this.clearAndFill(selector.admin.settings.customBaseInput, permalink.customBaseInput)
        await this.click(selector.admin.settings.permalinkSaveChanges)
        await expect(this.page.locator(selector.admin.settings.updatedSuccessMessage)).toContainText(permalink.saveSuccessMessage)
    }

    // dokan settings

    // admin set dokan general settings
    async setDokanGeneralSettings(general: any) {
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.general)

        // site options
        await this.enableSwitcher(selector.admin.dokan.settings.adminAreaAccess)
        await this.clearAndFill(selector.admin.dokan.settings.vendorStoreUrl, general.vendorStoreUrl)
        await this.click(selector.admin.dokan.settings.sellingProductTypes(general.sellingProductTypes))

        // vendor store options
        await this.enableSwitcher(selector.admin.dokan.settings.storeTermsAndConditions)
        await this.clearAndFill(selector.admin.dokan.settings.storeProductPerPage, general.storeProductPerPage)
        await this.enableSwitcher(selector.admin.dokan.settings.enableTermsAndCondition)
        await this.click(selector.admin.dokan.settings.storCategory(general.storCategory))
        await this.click(selector.admin.dokan.settings.generalSaveChanges)

        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(general.saveSuccessMessage)
    }

    // admin set dokan selling settings
    async setDokanSellingSettings(selling: any) {
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.sellingOptions)

        // commission settings
        await this.selectByValue(selector.admin.dokan.settings.commissionType, selling.commissionType)
        await this.clearAndFill(selector.admin.dokan.settings.adminCommission, selling.adminCommission)
        await this.click(selector.admin.dokan.settings.shippingFeeRecipient(selling.shippingFeeRecipient))
        await this.click(selector.admin.dokan.settings.taxFeeRecipient(selling.taxFeeRecipient))

        // vendor capability
        await this.enableSwitcher(selector.admin.dokan.settings.newVendorProductUpload)
        await this.enableSwitcher(selector.admin.dokan.settings.orderStatusChange)
        await this.click(selector.admin.dokan.settings.newProductStatus(selling.newProductStatus))
        await this.enableSwitcher(selector.admin.dokan.settings.duplicateProduct)
        await this.enableSwitcher(selector.admin.dokan.settings.productMailNotification)
        await this.click(selector.admin.dokan.settings.productCategorySelection(selling.productCategorySelection))
        await this.enableSwitcher(selector.admin.dokan.settings.vendorsCanCreateTags)
        await this.enableSwitcher(selector.admin.dokan.settings.orderDiscount)
        await this.enableSwitcher(selector.admin.dokan.settings.productDiscount)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorProductReview)
        await this.enableSwitcher(selector.admin.dokan.settings.guestProductEnquiry)
        await this.enableSwitcher(selector.admin.dokan.settings.newVendorEnableAuction)
        await this.enableSwitcher(selector.admin.dokan.settings.enableMinMaxQuantities)
        await this.enableSwitcher(selector.admin.dokan.settings.enableMinMaxAmount)
        await this.click(selector.admin.dokan.settings.sellingOptionsSaveChanges)

        await expect(this.page.locator(selector.admin.dokan.settings.adminCommission)).toHaveValue(selling.adminCommission)
    }

    // Admin Set Dokan Withdraw Settings
    async setDokanWithdrawSettings(withdraw: any) {
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.withdrawOptions)

        // Withdraw Options
        await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsPaypal)
        await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsBankTransfer)
        await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsDokanCustom)
        await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsSkrill)
        await this.clearAndFill(selector.admin.dokan.settings.customMethodName, withdraw.customMethodName)
        await this.clearAndFill(selector.admin.dokan.settings.customMethodType, withdraw.customMethodType)
        await this.clearAndFill(selector.admin.dokan.settings.minimumWithdrawAmount, withdraw.minimumWithdrawAmount)
        await this.enableSwitcher(selector.admin.dokan.settings.orderStatusForWithdrawCompleted)
        await this.enableSwitcher(selector.admin.dokan.settings.orderStatusForWithdrawProcessing)
        await this.clearAndFill(selector.admin.dokan.settings.withdrawThreshold, withdraw.withdrawThreshold)

        // Disbursement Schedule Settings
        await this.enableSwitcher(selector.admin.dokan.settings.withdrawDisbursementManual)
        await this.enableSwitcher(selector.admin.dokan.settings.withdrawDisbursementAuto)

        // Disbursement Schedule
        await this.enableSwitcher(selector.admin.dokan.settings.disburseMentQuarterlySchedule)
        await this.enableSwitcher(selector.admin.dokan.settings.disburseMentMonthlySchedule)
        await this.enableSwitcher(selector.admin.dokan.settings.disburseMentBiweeklySchedule)
        await this.enableSwitcher(selector.admin.dokan.settings.disburseMentWeeklySchedule)

        // Quarterly Schedule
        await this.selectByValue(selector.admin.dokan.settings.quarterlyScheduleMonth, withdraw.quarterlyScheduleMonth)
        await this.selectByValue(selector.admin.dokan.settings.quarterlyScheduleWeek, withdraw.quarterlyScheduleWeek)
        await this.selectByValue(selector.admin.dokan.settings.quarterlyScheduleDay, withdraw.quarterlyScheduleDay)
        // Monthly Schedule
        await this.selectByValue(selector.admin.dokan.settings.monthlyScheduleWeek, withdraw.monthlyScheduleWeek)
        await this.selectByValue(selector.admin.dokan.settings.monthlyScheduleDay, withdraw.monthlyScheduleDay)
        // Biweekly Schedule
        await this.selectByValue(selector.admin.dokan.settings.biweeklyScheduleWeek, withdraw.biweeklyScheduleWeek)
        await this.selectByValue(selector.admin.dokan.settings.biweeklyScheduleDay, withdraw.biweeklyScheduleDay)
        // Weekly Schedule
        await this.selectByValue(selector.admin.dokan.settings.weeklyScheduleDay, withdraw.weeklyScheduleDay)
        await this.click(selector.admin.dokan.settings.withdrawSaveChanges)

        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(withdraw.saveSuccessMessage)
    }

    // Admin Set Dokan Page Settings
    async setPageSettings(page:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.pageSettings)

        // this Settings
        await this.selectByLabel(selector.admin.dokan.settings.termsAndConditionsPage, page.termsAndConditionsPage)
        await this.click(selector.admin.dokan.settings.pageSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(page.saveSuccessMessage)

    }

    // Admin Set Dokan Appearance Settings
    async setDokanAppearanceSettings(appearance:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.appearance)

        // Appearance Settings
        await this.enableSwitcher(selector.admin.dokan.settings.showMapOnStorePage)
        await this.click(selector.admin.dokan.settings.mapApiSourceGoogleMaps)
        await this.clearAndFill(selector.admin.dokan.settings.googleMapApiKey, appearance.googleMapApiKey)
        await this.click(selector.admin.dokan.settings.storeHeaderTemplate2)
        await this.click(selector.admin.dokan.settings.storeHeaderTemplate1)
        await this.clearAndFill(selector.admin.dokan.settings.storeBannerWidth, appearance.storeBannerWidth)
        await this.clearAndFill(selector.admin.dokan.settings.storeBannerHeight, appearance.storeBannerHeight)
        await this.enableSwitcher(selector.admin.dokan.settings.storeOpeningClosingTimeWidget)
        await this.enableSwitcher(selector.admin.dokan.settings.showVendorInfo)
        await this.click(selector.admin.dokan.settings.appearanceSaveChanges)

        let apiKey = await this.getElementValue(selector.admin.dokan.settings.googleMapApiKey)
        expect(apiKey).toBe(appearance.googleMapApiKey)
    }

    // Admin Set Dokan Privacy Policy Settings
    async setDokanPrivacyPolicySettings(privacyPolicy:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.privacyPolicy)

        // Privacy Policy Settings
        await this.enableSwitcher(selector.admin.dokan.settings.enablePrivacyPolicy)
        await this.selectByValue(selector.admin.dokan.settings.privacyPage, privacyPolicy.privacyPage)

        // let iframe = await this.switchToIframe(selector.admin.dokan.settings.privacyPolicyIframe)
        // await this.iframeclearAndFill(iframe, selector.admin.dokan.settings.privacyPolicyHtmlBody, privacyPolicy.privacyPolicyHtmlBody)
        await this.typeFrameSelector(selector.admin.dokan.settings.privacyPolicyIframe, selector.admin.dokan.settings.privacyPolicyHtmlBody, privacyPolicy.privacyPolicyHtmlBody)

        await this.click(selector.admin.dokan.settings.privacyPolicySaveChanges)

        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(privacyPolicy.saveSuccessMessage)

    }

    // Admin Set Dokan Store Support Settings
    async setDokanStoreSupportSettings(storeSupport:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.storeSupport)

        // Store Support Settings
        //required
        await this.enableSwitcher(selector.admin.dokan.settings.displayOnOrderDetails)
        await this.selectByValue(selector.admin.dokan.settings.displayOnSingleProductPage, storeSupport.displayOnSingleProductPage)
        await this.clearAndFill(selector.admin.dokan.settings.supportButtonLabel, storeSupport.supportButtonLabel)
        await this.enableSwitcher(selector.admin.dokan.settings.supportTicketEmailNotification)
        await this.click(selector.admin.dokan.settings.storeSupportSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(storeSupport.saveSuccessMessage)
    }

    // Admin Set Dokan Rma Settings
    async setDokanRmaSettings(rma:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.rma)

        // Rma Settings
        await this.selectByValue(selector.admin.dokan.settings.orderStatus, rma.orderStatus)
        await this.enableSwitcher(selector.admin.dokan.settings.enableRefundRequests)
        await this.enableSwitcher(selector.admin.dokan.settings.enableCouponRequests)

        for (let rmaReason of rma.rmaReasons) {
            await this.deleteIfExists(selector.admin.dokan.settings.reasonsForRmaSingle(rmaReason))
            await this.clearAndFill(selector.admin.dokan.settings.reasonsForRmaInput, rmaReason)
            await this.click(selector.admin.dokan.settings.reasonsForRmaAdd)
        }

        // let iframe = await this.switchToIframe(selector.admin.dokan.settings.refundPolicyIframe)
        // await this.iframeclearAndFill(iframe, selector.admin.dokan.settings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody)
        await this.typeFrameSelector(selector.admin.dokan.settings.refundPolicyIframe, selector.admin.dokan.settings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody)
        await this.click(selector.admin.dokan.settings.rmaSaveChanges)

        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(rma.saveSuccessMessage)

    }

    // Admin Set Dokan Wholesale Settings
    async setDokanWholesaleSettings(wholesale:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.wholesale)

        // Wholesale Settings
        await this.click(selector.admin.dokan.settings.whoCanSeeWholesalePrice(wholesale.whoCanSeeWholesalePrice))
        await this.enableSwitcher(selector.admin.dokan.settings.showWholesalePriceOnShopArchive)
        await this.enableSwitcher(selector.admin.dokan.settings.needApprovalForCustomer)
        await this.click(selector.admin.dokan.settings.wholesaleSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(wholesale.saveSuccessMessage)
    }

    // Admin Set Dokan Eu Compliance Settings
    async setDokanEuComplianceSettings(euCompliance:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.euComplianceFields)

        // Eu Compliance Settings
        await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsCompanyName)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsCompanyIdOrEuidNumber)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsVatOrTaxNumber)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsNameOfBank)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsBankIban)
        await this.enableSwitcher(selector.admin.dokan.settings.displayInVendorRegistrationForm)
        await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsCompanyIdOrEuidNumber)
        await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsVatOrTaxNumber)
        await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsNameOfBank)
        await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsBankIban)
        await this.enableSwitcher(selector.admin.dokan.settings.enableGermanizedSupportForVendors)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorsWillBeAbleToOverrideInvoiceNumber)
        await this.click(selector.admin.dokan.settings.euComplianceFieldsSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(euCompliance.saveSuccessMessage)
    }

    // Admin Set Dokan Delivery Time Settings
    async setDokanDeliveryTimeSettings(deliveryTime:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.deliveryTime)

        // Delivery Time Settings

        await this.enableSwitcher(selector.admin.dokan.settings.allowVendorSettings)
        await this.enableSwitcher(selector.admin.dokan.settings.homeDelivery)
        await this.enableSwitcher(selector.admin.dokan.settings.storePickup)
        await this.clearAndFill(selector.admin.dokan.settings.deliveryDateLabel, deliveryTime.deliveryDateLabel)
        await this.clearAndFill(selector.admin.dokan.settings.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer)
        await this.clearAndFill(selector.admin.dokan.settings.timeSlot, deliveryTime.timeSlot)
        await this.clearAndFill(selector.admin.dokan.settings.orderPerSlot, deliveryTime.orderPerSlot)
        await this.clearAndFill(selector.admin.dokan.settings.deliveryBoxInfo, deliveryTime.deliveryBoxInfo)
        await this.enableSwitcher(selector.admin.dokan.settings.requireDeliveryDateAndTime)

        for (let day in deliveryTime.deliveryDay) {
            await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay[day]))
            // await this.clearAndFill(selector.admin.dokan.settings.openingTime(deliveryTime.deliveryDay[day]), deliveryTime.openingTime)
            await this.click(selector.admin.dokan.settings.openingTime(deliveryTime.deliveryDay[day]))
            await this.click("//ul[@class='ui-timepicker-list']//li[contains(text(),'12:00 am')]")
            // await this.clearAndFill(selector.admin.dokan.settings.closingTime(deliveryTime.deliveryDay[day]), deliveryTime.closingTime)
            await this.click(selector.admin.dokan.settings.closingTime(deliveryTime.deliveryDay[day]))
            await this.click("//ul[@class='ui-timepicker-list']//li[contains(text(),'11:30 pm')]")
        }
        // await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.monday))
        // await this.type(selector.admin.dokan.settings.openingTime(deliveryTime.deliveryDay.monday), deliveryTime.openingTime)
        // await this.type(selector.admin.dokan.settings.closingTime(deliveryTime.deliveryDay.monday), deliveryTime.closingTime)
        // await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.tuesday))
        // await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.wednesday))
        // await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.thursday))
        // await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.friday))
        // await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.saturday))
        // await this.clearAndFill(selector.admin.dokan.settings.openingTime, deliveryTime.openingTime)
        // await this.clearAndFill(selector.admin.dokan.settings.closingTime, deliveryTime.closingTime)
        await this.wait(2)
        await this.hover(selector.admin.dokan.settings.deliveryTimeSaveChanges)
        await this.click(selector.admin.dokan.settings.deliveryTimeSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(deliveryTime.saveSuccessMessage)
    }

    // Admin Set Dokan Product Advertising Settings
    async setDokanProductAdvertisingSettings(productAdvertising:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.productAdvertising)

        // Product Advertising Settings
        await this.clearAndFill(selector.admin.dokan.settings.noOfAvailableSlot, productAdvertising.noOfAvailableSlot)
        await this.clearAndFill(selector.admin.dokan.settings.expireAfterDays, productAdvertising.expireAfterDays)
        await this.enableSwitcher(selector.admin.dokan.settings.vendorCanPurchaseAdvertisement)
        await this.clearAndFill(selector.admin.dokan.settings.advertisementCost, productAdvertising.advertisementCost)
        await this.enableSwitcher(selector.admin.dokan.settings.enableAdvertisementInSubscription)
        await this.enableSwitcher(selector.admin.dokan.settings.markAdvertisedProductAsFeatured)
        await this.enableSwitcher(selector.admin.dokan.settings.displayAdvertisedProductOnTop)
        await this.enableSwitcher(selector.admin.dokan.settings.outOfStockVisibility)
        await this.click(selector.admin.dokan.settings.productAdvertisingSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(productAdvertising.saveSuccessMessage)
    }

    // Admin Set Dokan Geolocation Settings
    async setDokanGeolocationSettings(geolocation:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.geolocation)

        // Geolocation Settings
        await this.click(selector.admin.dokan.settings.locationMapPosition(geolocation.locationMapPosition))
        await this.click(selector.admin.dokan.settings.showMap(geolocation.showMap))
        await this.enableSwitcher(selector.admin.dokan.settings.showFiltersBeforeLocationMap)
        await this.enableSwitcher(selector.admin.dokan.settings.productLocationTab)
        await this.click(selector.admin.dokan.settings.radiusSearchUnit(geolocation.radiusSearchUnit))
        await this.clearAndFill(selector.admin.dokan.settings.radiusSearchMinimumDistance, geolocation.radiusSearchMinimumDistance)
        await this.clearAndFill(selector.admin.dokan.settings.radiusSearchMaximumDistance, geolocation.radiusSearchMaximumDistance)
        await this.clearAndFill(selector.admin.dokan.settings.mapZoomLevel, geolocation.mapZoomLevel)
        await this.clearAndFill(selector.admin.dokan.settings.defaultLocation, geolocation.defaultLocation)

        await this.press(data.key.arrowDown)
        await this.press(data.key.enter)
        await this.click(selector.admin.dokan.settings.geolocationSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(geolocation.saveSuccessMessage)
    }

    // Admin Set Dokan Product Report Abuse Settings
    async setDokanProductReportAbuseSettings(productReportAbuse:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.productReportAbuse)

        // Product Report Abuse Settings
        await this.deleteIfExists(selector.admin.dokan.settings.reasonsForAbuseReportSingle(productReportAbuse.reasonsForAbuseReport))
        await this.clearAndFill(selector.admin.dokan.settings.reasonsForAbuseReportInput, productReportAbuse.reasonsForAbuseReport)
        await this.click(selector.admin.dokan.settings.reasonsForAbuseReportAdd)
        await this.click(selector.admin.dokan.settings.productReportAbuseSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(productReportAbuse.saveSuccessMessage)
    }

    // Admin Set Dokan Spmv Settings
    async setDokanSpmvSettings(spmv:any){
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.singleProductMultiVendor)

        await this.enableSwitcher(selector.admin.dokan.settings.enableSingleProductMultipleVendor)
        await this.clearAndFill(selector.admin.dokan.settings.sellItemButtonText, spmv.sellItemButtonText)
        await this.clearAndFill(selector.admin.dokan.settings.availableVendorDisplayAreaTitle, spmv.availableVendorDisplayAreaTitle)
        await this.selectByValue(selector.admin.dokan.settings.availableVendorSectionDisplayPosition, spmv.availableVendorSectionDisplayPosition)
        await this.selectByValue(selector.admin.dokan.settings.showSpmvProducts, spmv.showSpmvProducts)
        await this.click(selector.admin.dokan.settings.singleProductMultiVendorSaveChanges)
        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(spmv.saveSuccessMessage)

    }

    // Admin Set Dokan Vendor Subscription Settings
    async setDokanVendorSubscriptionSettings(subscription: any) {
        await this.goToDokanSettings()
        await this.click(selector.admin.dokan.settings.vendorSubscription)

        // Vendor Subscription Settings
        await this.selectByValue(selector.admin.dokan.settings.subscription, subscription.displayPage)
        await this.enableSwitcher(selector.admin.dokan.settings.enableProductSubscription)
        await this.enableSwitcher(selector.admin.dokan.settings.enableSubscriptionInRegistrationForm)
        await this.enableSwitcher(selector.admin.dokan.settings.enableEmailNotification)
        await this.clearAndFill(selector.admin.dokan.settings.noOfDays, subscription.noOfDays)
        await this.selectByValue(selector.admin.dokan.settings.productStatus, subscription.productStatus)
        await this.clearAndFill(selector.admin.dokan.settings.cancellingEmailSubject, subscription.cancellingEmailSubject)
        await this.clearAndFill(selector.admin.dokan.settings.cancellingEmailBody, subscription.cancellingEmailBody)
        await this.clearAndFill(selector.admin.dokan.settings.alertEmailSubject, subscription.alertEmailSubject)
        await this.clearAndFill(selector.admin.dokan.settings.alertEmailBody, subscription.alertEmailBody)
        await this.click(selector.admin.dokan.settings.vendorSubscriptionSaveChanges)

        await expect(this.page.locator(selector.admin.dokan.settings.dokanUpdateSuccessMessage)).toContainText(subscription.saveSuccessMessage)

        // Disabling Vendor Subscription
        await this.disableSwitcher(selector.admin.dokan.settings.enableProductSubscription) // TODO: handle with flag
        await this.click(selector.admin.dokan.settings.vendorSubscriptionSaveChanges)
    }


    // Tax

    // Admin Enable-Disable Tax
    async enableTax(enableTax = true) {
        await this.goToWooCommerceSettings()
        // Enable-Disable Tax
        enableTax ? await this.check(selector.admin.wooCommerce.settings.enableTaxes) : await this.uncheck(selector.admin.wooCommerce.settings.enableTaxes)
        await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(data.tax.saveSuccessMessage)
    }

    // Admin Add Standard Tax Rate
    async addStandardTaxRate(tax:any){

        await this.goToWooCommerceSettings()

        // Enable Tax
        await this.enableTax()

        // Set Tax Rate
        await this.click(selector.admin.wooCommerce.settings.tax)
        await this.click(selector.admin.wooCommerce.settings.standardRates)
        let taxIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.taxRate)
        if (!taxIsVisible) {
            await this.click(selector.admin.wooCommerce.settings.insertRow)
        }
        await this.clearAndFill(selector.admin.wooCommerce.settings.taxRate, tax.taxRate)
        await this.click(selector.admin.wooCommerce.settings.taxTable)

        await this.click(selector.admin.wooCommerce.settings.taxRateSaveChanges)


        let newTaxRate = await this.getElementValue(selector.admin.wooCommerce.settings.taxRate)
        // expect(newTaxRate).toBe(String(Number(tax.taxRate).toPrecision(5)))
        expect(newTaxRate).toBe(tax.taxRate)
    }


    // Woocommerce Settings

    // Admin Setup Woocommerce Settings
    async setWoocommerceSettings(data:any){
        await this.enablePasswordInputField(data)
        await this.addStandardTaxRate(data.tax)
        await this.setCurrencyOptions(data.currency)
        await this.addShippingMethod(data.shipping.shippingMethods.flatRate)
        await this.addShippingMethod(data.shipping.shippingMethods.flatRate)
        await this.addShippingMethod(data.shipping.shippingMethods.freeShipping)
        await this.addShippingMethod(data.shipping.shippingMethods.tableRateShipping)
        await this.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping)
        await this.addShippingMethod(data.shipping.shippingMethods.vendorShipping)
        await this.deleteShippingMethod(data.shipping.shippingMethods.flatRate)
        await this.deleteShippingZone(data.shipping.shippingZone)
    }

    // Enable Password Field
    async enablePasswordInputField(woocommerce:any){
        await this.goToWooCommerceSettings()
        await this.click(selector.admin.wooCommerce.settings.accounts)
        await this.uncheck(selector.admin.wooCommerce.settings.automaticPasswordGeneration)
        await this.click(selector.admin.wooCommerce.settings.accountSaveChanges)
        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(woocommerce.saveSuccessMessage)
    }

    // Shipping Methods

    // Enable Enable-Disable Shipping

    async enableShipping(enableShipping = true) {

        await this.goToWooCommerceSettings()
        await this.click(selector.admin.wooCommerce.settings.enableShipping)
        if (enableShipping) {  //TODO: is this needed
            await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.enableShippingValues, data.shipping.enableShipping)
        } else {
            await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.enableShippingValues, data.shipping.disableShipping)
        }
        await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(data.shipping.saveSuccessMessage)

    }

    // Admin Add Shipping Method
    async addShippingMethod(shipping:any){
        await this.goToWooCommerceSettings()

        await this.click(selector.admin.wooCommerce.settings.shipping)

        let zoneIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone))
        if (!zoneIsVisible) {
            // Add Shipping Zone
            await this.click(selector.admin.wooCommerce.settings.addShippingZone)
            await this.clearAndFill(selector.admin.wooCommerce.settings.zoneName, shipping.shippingZone)
            // await this.selectByValue(selector.admin.wooCommerce.settings.zoneRegions, shippingCountry) //use select values  'country:US',
            await this.click(selector.admin.wooCommerce.settings.zoneRegions)
            await this.type(selector.admin.wooCommerce.settings.zoneRegions, shipping.shippingCountry)

            await this.press(data.key.enter)
        } else {
            // Edit Shipping Zone
            await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone))
            await this.click(selector.admin.wooCommerce.settings.editShippingMethod(shipping.shippingZone))
        }

        let methodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(helpers.replaceAndCapitalize(shipping.shippingMethod)))
        if (!methodIsVisible) {
            // Add Shipping Method
            await this.click(selector.admin.wooCommerce.settings.addShippingMethods)
            await this.selectByValue(selector.admin.wooCommerce.settings.shippingMethod, shipping.selectShippingMethod)
            await this.click(selector.admin.wooCommerce.settings.addShippingMethod)

        }
        // Edit Shipping Method Options
        await this.hover(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
        await this.click(selector.admin.wooCommerce.settings.editShippingMethod(shipping.shippingMethod))

        switch (shipping.selectShippingMethod) {
            case 'flat_rate':
                // Flat Rate
                await this.clearAndFill(selector.admin.wooCommerce.settings.flatRateMethodTitle, shipping.shippingMethod)
                await this.selectByValue(selector.admin.wooCommerce.settings.flatRateTaxStatus, shipping.taxStatus)
                await this.clearAndFill(selector.admin.wooCommerce.settings.flatRateCost, shipping.shippingCost)
                break

            case 'free_shipping':
                // Free Shipping
                await this.clearAndFill(selector.admin.wooCommerce.settings.freeShippingTitle, shipping.shippingMethod)
                // await this.selectByValue(selector.admin.wooCommerce.settings.freeShippingRequires, shipping.freeShippingRequires)
                // await this.clearAndFill(selector.admin.wooCommerce.settings.freeShippingMinimumOrderAmount,shipping.freeShippingMinimumOrderAmount)
                // await this.check(selector.admin.wooCommerce.settings.freeShippingCouponsDiscounts)
                break

            case 'local_pickup':
                // Local Pickup
                await this.clearAndFill(selector.admin.wooCommerce.settings.localPickupTitle, shipping.shippingMethod)
                await this.selectByValue(selector.admin.wooCommerce.settings.localPickupTaxStatus, shipping.taxStatus)
                await this.clearAndFill(selector.admin.wooCommerce.settings.localPickupCost, shipping.shippingCost)
                break

            case 'dokan_table_rate_shipping':
                // Dokan Table Rate Shipping
                await this.clearAndFill(selector.admin.wooCommerce.settings.dokanTableRateShippingMethodTitle, shipping.shippingMethod)
                break

            case 'dokan_distance_rate_shipping':
                // Dokan Distance Rate Shipping
                await this.clearAndFill(selector.admin.wooCommerce.settings.dokanDistanceRateShippingMethodTitle, shipping.shippingMethod)
                break

            case 'dokan_vendor_shipping':
                // Vendor Shipping
                await this.clearAndFill(selector.admin.wooCommerce.settings.vendorShippingMethodTitle, shipping.shippingMethod)
                await this.selectByValue(selector.admin.wooCommerce.settings.vendorShippingTaxStatus, shipping.taxStatus)
                break

            default:
                break
        }

        await this.click(selector.admin.wooCommerce.settings.shippingMethodSaveChanges)

        await this.waitForSelector(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
        let shippingMethodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
        expect(shippingMethodIsVisible).toBe(true)

    }

    // Admin Delete Shipping Zone
    async deleteShippingZone(shippingZone:any){
        await this.click(selector.admin.wooCommerce.settings.shipping)

        await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shippingZone))
        await this.acceptAlert()
        await this.click(selector.admin.wooCommerce.settings.deleteShippingZone(shippingZone))


        let shippingZoneIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingZoneCell(shippingZone))
        expect(shippingZoneIsVisible).toBe(false)
    }

    // Admin Delete Shipping Method
    async deleteShippingMethod(shipping:any){
        await this.click(selector.admin.wooCommerce.settings.shipping)

        await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone))
        await this.click(selector.admin.wooCommerce.settings.editShippingZone(shipping.shippingZone))
        await this.hover(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
        await this.click(selector.admin.wooCommerce.settings.deleteShippingMethod(shipping.shippingMethod))
        await this.click(selector.admin.wooCommerce.settings.shippingZoneSaveChanges)

        let shippingMethodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
        expect(shippingMethodIsVisible).toBe(false)
    }


    // Payment Methods

    // Admin Set Currency Options
    async setCurrencyOptions(currency:any){
        await this.goToWooCommerceSettings()

        // Set Currency Options
        await this.clearAndFill(selector.admin.wooCommerce.settings.thousandSeparator, currency.currencyOptions.thousandSeparator)
        await this.clearAndFill(selector.admin.wooCommerce.settings.decimalSeparator, currency.currencyOptions.decimalSeparator)
        await this.clearAndFill(selector.admin.wooCommerce.settings.numberOfDecimals, currency.currencyOptions.numberOfDecimals)
        await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(currency.saveSuccessMessage)

    }

    // Admin Set Currency
    async setCurrency(currency:any){
        await this.goToWooCommerceSettings()
        let currentCurrency = await this.getElementText(selector.admin.wooCommerce.settings.currency)
        if (currentCurrency !== currency) {
            await this.click(selector.admin.wooCommerce.settings.currency)
            await this.type(selector.admin.wooCommerce.settings.currency, currency)
            await this.press(data.key.enter)
            await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
            await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(data.payment.currency.saveSuccessMessage)
        }
    }

    // Admin Setup Basic Payment Methods
    async setupBasicPaymentMethods(payment:any){
        await this.goToWooCommerceSettings()

        await this.click(selector.admin.wooCommerce.settings.payments)
        // Bank Transfer
        await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableDirectBankTransfer)
        // Check Payments
        await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableCheckPayments)
        // Cash on Delivery
        await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableCashOnDelivery)

        await this.click(selector.admin.wooCommerce.settings.paymentMethodsSaveChanges)
        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(payment.saveSuccessMessage)
    }

    // Admin Setup Stripe
    async setupStripeConnect(payment:any){
        await this.goToWooCommerceSettings()

        await this.setCurrency(payment.currency.dollar)

        await this.click(selector.admin.wooCommerce.settings.payments)
        await this.click(selector.admin.wooCommerce.settings.setupDokanStripeConnect)
        // Setup Strip Connect
        await this.check(selector.admin.wooCommerce.settings.stripe.enableDisableStripe)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripe.title, payment.stripeConnect.title)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripe.description, payment.stripeConnect.description)
        await this.check(selector.admin.wooCommerce.settings.stripe.nonConnectedSellers)
        await this.check(selector.admin.wooCommerce.settings.stripe.displayNoticeToConnectSeller)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripe.displayNoticeInterval, payment.stripeConnect.displayNoticeInterval)
        await this.check(selector.admin.wooCommerce.settings.stripe.threeDSecureAndSca)
        await this.check(selector.admin.wooCommerce.settings.stripe.sellerPaysTheProcessingFeeIn3DsMode)
        await this.check(selector.admin.wooCommerce.settings.stripe.testMode)
        await this.check(selector.admin.wooCommerce.settings.stripe.stripeCheckout)
        await this.click(selector.admin.wooCommerce.settings.stripe.stripeCheckoutLocale)
        await this.type(selector.admin.wooCommerce.settings.stripe.stripeCheckoutLocale, payment.stripeConnect.stripeCheckoutLocale)
        await this.press(data.key.enter)
        await this.check(selector.admin.wooCommerce.settings.stripe.savedCards)
        // Test Credentials
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripe.testPublishableKey, payment.stripeConnect.testPublishableKey)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripe.testSecretKey, payment.stripeConnect.testSecretKey)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripe.testClientId, payment.stripeConnect.testClientId)
        await this.click(selector.admin.wooCommerce.settings.stripe.stripeSaveChanges)

        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(payment.saveSuccessMessage)

    }

    // Admin Setup Dokan Paypal Marketplace
    async setupPaypalMarketPlace(payment:any){
        await this.goToWooCommerceSettings()

        await this.setCurrency(payment.currency.dollar)

        await this.click(selector.admin.wooCommerce.settings.payments)
        await this.click(selector.admin.wooCommerce.settings.setupDokanPayPalMarketplace)
        // Setup Paypal Marketplace
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.enableDisablePayPalMarketplace)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.title, payment.paypalMarketPlace.title)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.description, payment.paypalMarketPlace.description)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalMerchantId, payment.paypalMarketPlace.payPalMerchantId)
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalSandbox)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.sandboxClientId, payment.paypalMarketPlace.sandboxClientId)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.sandBoxClientSecret, payment.paypalMarketPlace.sandBoxClientSecret)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalPartnerAttributionId, payment.paypalMarketPlace.payPalPartnerAttributionId)
        await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.disbursementMode)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.paypalMarketPlace.disbursementModeValues, payment.paypalMarketPlace.disbursementMode)
        await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.paymentButtonType)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.paypalMarketPlace.paymentButtonTypeValues, payment.paypalMarketPlace.paymentButtonType)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.marketplaceLogo, await this.getBaseUrl() + payment.paypalMarketPlace.marketplaceLogoPath)
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.displayNoticeToConnectSeller)
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.sendAnnouncementToConnectSeller)
        await this.clearAndFill(selector.admin.wooCommerce.settings.paypalMarketPlace.sendAnnouncementInterval, payment.paypalMarketPlace.announcementInterval)
        await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.paypalMarketPlaceSaveChanges)

        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(payment.saveSuccessMessage)
    }

    // Admin Setup Mangopay
    async setupMangoPay(payment:any){
        await this.goToWooCommerceSettings()

        await this.setCurrency(payment.currency.euro)

        await this.click(selector.admin.wooCommerce.settings.payments)
        await this.click(selector.admin.wooCommerce.settings.setupDokanMangoPay)
        // Setup Mangopay
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.enableDisableMangoPayPayment)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanMangoPay.title, payment.mangoPay.title)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanMangoPay.description, payment.mangoPay.description)
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.mangoPaySandbox)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanMangoPay.sandboxClientId, payment.mangoPay.sandboxClientId)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanMangoPay.sandBoxApiKey, payment.mangoPay.sandBoxApiKey)
        // Payment Options
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCards)
        // await this.type(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCards, 'CB/Visa/Mastercard')
        // await this.press(data.key.enter)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCardsValues, payment.mangoPay.availableCreditCards)
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServices)
        // await this.type(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServices, 'Sofort*')
        // await this.press(data.key.enter) //TODO: check why commented
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServicesValues, payment.mangoPay.availableDirectPaymentServices)
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.savedCards)
        // Fund Transfers and Payouts
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.transferFunds)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.transferFundsValues, payment.mangoPay.transferFunds)
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.payoutMode)
        // Types and Requirements of Vendors
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.typeOfVendors)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.typeOfVendorsValues, payment.mangoPay.typeOfVendors)
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.businessRequirement)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.businessRequirementValues, payment.mangoPay.businessRequirement)
        // Advanced Settings
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.displayNoticeToNonConnectedSellers)
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.sendAnnouncementToNonConnectedSellers)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanMangoPay.announcementInterval, payment.mangoPay.announcementInterval)
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.dokanMangopaySaveChanges)

        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(payment.saveSuccessMessage)
    }

    // Admin Setup Razorpay
    async setupRazorpay(payment:any){
        await this.goToWooCommerceSettings()

        await this.setCurrency(payment.currency.rupee)

        await this.click(selector.admin.wooCommerce.settings.payments)
        await this.click(selector.admin.wooCommerce.settings.setupDokanRazorpay)
        // Setup Razorpay
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.enableDisableDokanRazorpay)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanRazorpay.title, payment.razorPay.title)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanRazorpay.description, payment.razorPay.description)
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.razorpaySandbox)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanRazorpay.testKeyId, payment.razorPay.testKeyId)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanRazorpay.testKeySecret, payment.razorPay.testKeySecret)
        await this.click(selector.admin.wooCommerce.settings.dokanRazorpay.disbursementMode)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanRazorpay.disbursementModeValues, payment.razorPay.disbursementMode)
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.sellerPaysTheProcessingFee)
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.displayNoticeToConnectSeller)
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.sendAnnouncementToConnectSeller)
        await this.clearAndFill(selector.admin.wooCommerce.settings.dokanRazorpay.sendAnnouncementInterval, payment.razorPay.announcementInterval)
        await this.click(selector.admin.wooCommerce.settings.dokanRazorpay.dokanRazorpaySaveChanges)

        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(payment.saveSuccessMessage)
    }

    // Admin Setup Stripe Express
    async setupStripeExpress(payment:any){
        await this.goToWooCommerceSettings()

        await this.setCurrency(payment.currency.dollar)

        await this.click(selector.admin.wooCommerce.settings.payments)
        await this.click(selector.admin.wooCommerce.settings.setupDokanStripeExpress)

        // Stripe Express
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.enableOrDisableStripeExpress)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.title, payment.stripeExpress.title)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.description, payment.stripeExpress.description)
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.testMode)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.testPublishableKey, payment.stripeExpress.testPublishableKey)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.testSecretKey, payment.stripeExpress.testSecretKey)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.testWebhookSecret, payment.stripeExpress.testWebhookSecret)
        // Payment and Disbursement
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethods)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.card)
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethods)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.ideal)
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.takeProcessingFeesFromSellers)
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.savedCards)
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.capturePaymentsManually)
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.disburseFunds)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.disbursementModeValues, payment.stripeExpress.disbursementMode)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.customerBankStatement, payment.stripeExpress.customerBankStatement)
        // Payment Request Options (Apple Pay/Google Pay)
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.paymentRequestButtons)
        await this.selectByValue(selector.admin.wooCommerce.settings.stripeExpress.buttonType, payment.stripeExpress.paymentRequestButtonType)
        await this.selectByValue(selector.admin.wooCommerce.settings.stripeExpress.buttonTheme, payment.stripeExpress.paymentRequestButtonTheme)
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.buttonLocations)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.product)
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.buttonLocations)
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.cart)
        // Advanced Settings
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.displayNoticeToNonConnectedSellers)
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.sendAnnouncementToNonConnectedSellers)
        await this.clearAndFill(selector.admin.wooCommerce.settings.stripeExpress.announcementInterval, payment.stripeExpress.announcementInterval)
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.stripeExpressSaveChanges)

        await expect(this.page.locator(selector.admin.wooCommerce.settings.updatedSuccessMessage)).toContainText(payment.saveSuccessMessage)
    }


    // vendors

    // admin add new vendors
    async addVendor(vendorInfo: any) {
        await this.goIfNotThere(data.subUrls.backend.dokanVendors)

        let firstName = vendorInfo.firstName()
        let email = vendorInfo.email()

        // add new vendor
        await this.click(selector.admin.dokan.vendors.addNewVendor)
        // account info
        await this.type(selector.admin.dokan.vendors.firstName, firstName)
        await this.type(selector.admin.dokan.vendors.lastName, vendorInfo.lastName())
        await this.type(selector.admin.dokan.vendors.storeName, vendorInfo.shopName)
        await this.typeAndWaitForResponse('dokan/v1/stores', selector.admin.dokan.vendors.storeUrl, vendorInfo.shopName)
        await this.type(selector.admin.dokan.vendors.phoneNumber, vendorInfo.phoneNumber)
        await this.typeAndWaitForResponse('dokan/v1/stores', selector.admin.dokan.vendors.email, email)
        await this.click(selector.admin.dokan.vendors.generatePassword)
        await this.clearAndFill(selector.admin.dokan.vendors.password, vendorInfo.password)
        await this.typeAndWaitForResponse('dokan/v1/stores', selector.admin.dokan.vendors.username, firstName)
        await this.type(selector.admin.dokan.vendors.companyName, vendorInfo.companyName)
        await this.type(selector.admin.dokan.vendors.companyIdEuidNumber, vendorInfo.companyId)
        await this.type(selector.admin.dokan.vendors.vatOrTaxNumber, vendorInfo.vatNumber)
        await this.type(selector.admin.dokan.vendors.nameOfBank, vendorInfo.bankName)
        await this.type(selector.admin.dokan.vendors.bankIban, vendorInfo.bankIban)
        await this.click(selector.admin.dokan.vendors.next)
        // address
        await this.type(selector.admin.dokan.vendors.street1, vendorInfo.street1)
        await this.type(selector.admin.dokan.vendors.street2, vendorInfo.street2)
        await this.type(selector.admin.dokan.vendors.city, vendorInfo.city)
        await this.type(selector.admin.dokan.vendors.zip, vendorInfo.zipCode)
        await this.click(selector.admin.dokan.vendors.country)
        await this.type(selector.admin.dokan.vendors.countryInput, vendorInfo.country)
        await this.press(data.key.enter)
        await this.click(selector.admin.dokan.vendors.state)
        await this.type(selector.admin.dokan.vendors.state, vendorInfo.state)
        await this.click(selector.admin.dokan.vendors.next)
        // payment options
        await this.type(selector.admin.dokan.vendors.accountName, vendorInfo.accountName)
        await this.type(selector.admin.dokan.vendors.accountNumber, vendorInfo.accountNumber)
        await this.type(selector.admin.dokan.vendors.bankName, vendorInfo.bankName)
        await this.type(selector.admin.dokan.vendors.bankAddress, vendorInfo.bankAddress)
        await this.type(selector.admin.dokan.vendors.routingNumber, vendorInfo.routingNumber)
        await this.type(selector.admin.dokan.vendors.iban, vendorInfo.iban)
        await this.type(selector.admin.dokan.vendors.swift, vendorInfo.swiftCode)
        await this.fill(selector.admin.dokan.vendors.payPalEmail, vendorInfo.email())
        await this.check(selector.admin.dokan.vendors.enableSelling)
        await this.check(selector.admin.dokan.vendors.publishProductDirectly)
        await this.check(selector.admin.dokan.vendors.makeVendorFeature)
        // create vendor
        await this.clickAndWaitForResponse('/dokan/v1/stores', selector.admin.dokan.vendors.createVendor);
        await expect(this.page.locator(selector.admin.dokan.vendors.sweetAlertTitle)).toContainText('Vendor Created');
        await this.click(selector.admin.dokan.vendors.closeSweetAlert);
        // await this.click(selector.admin.dokan.vendors.editVendorInfo)
        // let vendorEmail = await this.getElementValue(selector.admin.dokan.vendors.editVendor.email)
        // expect(vendorEmail).toBe(email)
    }

    // admin add categories
    async addCategory(categoryName: string) {
        await this.goIfNotThere(data.subUrls.backend.wcAddNewCategories);

        // add new category
        await this.fill(selector.admin.products.category.name, categoryName);
        await this.fill(selector.admin.products.category.slug, categoryName);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.category.addNewCategory);
        await expect(this.page.locator(selector.admin.products.category.categoryCell(categoryName))).toBeVisible();
    }

    // admin add attributes
    async addAttributes(attribute: any) {
        await this.goIfNotThere(data.subUrls.backend.wcAddNewAttributes);

        // add new attribute
        await this.fill(selector.admin.products.attribute.name, attribute.attributeName);
        await this.fill(selector.admin.products.attribute.slug, attribute.attributeName);
        await this.clickAndWaitForResponse(data.subUrls.backend.wcAddNewAttributes, selector.admin.products.attribute.addAttribute);
        await expect(this.page.locator(selector.admin.products.attribute.attributeCell(attribute.attributeName))).toBeVisible();
        await this.clickAndWaitForResponse('wp-admin/edit-tags.php?taxonomy', selector.admin.products.attribute.configureTerms(attribute.attributeName));

        // add new term
        for (let attributeTerm of attribute.attributeTerms) {
            await this.fill(selector.admin.products.attribute.attributeTerm, attributeTerm);
            await this.fill(selector.admin.products.attribute.attributeTermSlug, attributeTerm);
            await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.attribute.addAttributeTerm);
            await expect(this.page.locator(selector.admin.products.attribute.attributeTermCell(attributeTerm))).toBeVisible();
        }
    }

    // admin add simple product
    async addSimpleProduct(product: any) {

        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // add new simple product
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        await this.type(selector.admin.products.product.regularPrice, product.regularPrice())
        await this.click(selector.admin.products.product.category(product.category))
        // stock status
        product.stockStatus && await this.editStockStatus(data.product.stockStatus.outOfStock)
        // vendor store name //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()

        switch (product.status) {
            case 'publish':
                await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302);
                await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
                break

            case 'draft':
                await this.click(selector.admin.products.product.saveDraft)
                await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.draftUpdateSuccessMessage)
                break

            case 'pending':
                await this.click(selector.admin.products.product.editStatus)
                await this.selectByValue(selector.admin.products.product.status, data.product.status.pending)
                await this.click(selector.admin.products.product.saveDraft)
                await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.pendingProductUpdateSuccessMessage)
                break

            default:
                break
        }
    }

    // admin add variable product
    async addVariableProduct(product: any) {

        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // add new variable product
        // name
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        // add attributes
        await this.click(selector.admin.products.product.attributes)
        await this.clickAndWaitForResponse('wp-admin/admin-ajax.php?action=woocommerce_json_search_product_attributes', selector.admin.products.product.addExistingAttribute)
        await this.typeAndWaitForResponse('wp-admin/admin-ajax.php?term', selector.admin.products.product.addExistingAttributeInput, product.attribute)
        await this.pressAndWaitForResponse(data.subUrls.ajax, data.key.enter)
        await this.clickAndWaitForResponse('wp-admin/admin-ajax.php?action=woocommerce_json_search_taxonomy_terms', selector.admin.products.product.selectAll)
        await this.click(selector.admin.products.product.usedForVariations)
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.product.saveAttributes)
        // add variations
        await this.click(selector.admin.products.product.variations)
        await this.selectByValue(selector.admin.products.product.addVariations, product.variations.linkAllVariation)
        // await this.fillAlert('120')
        await this.click(selector.admin.products.product.go)

        await this.selectByValue(selector.admin.products.product.addVariations, product.variations.variableRegularPrice)
        await this.fillAlert('120')
        await this.click(selector.admin.products.product.go)

        // category
        await this.click(selector.admin.products.product.category(product.category))
        // Vendor Store Name //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()
        // Publish
        await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302)
        await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // Admin Add Simple Subscription Product
    async addSimpleSubscription(product: any) {
        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // Add New Simple Subscription
        // Name
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        await this.type(selector.admin.products.product.subscriptionPrice, product.subscriptionPrice())
        await this.selectByValue(selector.admin.products.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval)
        await this.selectByValue(selector.admin.products.product.subscriptionPeriod, product.subscriptionPeriod)
        await this.selectByValue(selector.admin.products.product.expireAfter, product.expireAfter)
        await this.type(selector.admin.products.product.subscriptionTrialLength, product.subscriptionTrialLength)
        await this.selectByValue(selector.admin.products.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod)
        // Category
        await this.click(selector.admin.products.product.category(product.category))
        // Vendor Store Name //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()

        // Publish
        await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302)

        await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // Admin Add External Product
    async addExternalProduct(product: any) {

        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // Add New External Product
        // Name
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        await this.type(selector.admin.products.product.productUrl, await this.getBaseUrl() + product.productUrl)
        await this.type(selector.admin.products.product.buttonText, product.buttonText)
        await this.type(selector.admin.products.product.regularPrice, product.regularPrice())
        // Category
        await this.click(selector.admin.products.product.category(product.category))
        // Vendor Store Name //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()

        // Publish
        await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302)

        await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // Admin Add Dokan Subscription Product
    async addDokanSubscription(product: any) {

        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // Add New Dokan Subscription Product
        // Name
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        await this.type(selector.admin.products.product.regularPrice, product.regularPrice())
        // Category
        await this.click(selector.admin.products.product.category(product.category))
        // Subscription Details
        await this.type(selector.admin.products.product.numberOfProducts, product.numberOfProducts)
        await this.type(selector.admin.products.product.packValidity, product.packValidity)
        await this.type(selector.admin.products.product.advertisementSlot, product.advertisementSlot)
        await this.type(selector.admin.products.product.expireAfterDays, product.expireAfterDays)
        await this.click(selector.admin.products.product.recurringPayment)
        // Vendor Store Name //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()

        // Publish
        await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302)
        await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // Admin Add Auction Product
    async addAuctionProduct(product: any) {

        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // Add New Auction Product
        // Name
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        await this.selectByValue(selector.admin.products.product.itemCondition, product.itemCondition)
        await this.selectByValue(selector.admin.products.product.auctionType, product.auctionType)
        await this.type(selector.admin.products.product.startPrice, product.regularPrice())
        await this.type(selector.admin.products.product.bidIncrement, product.bidIncrement())
        await this.type(selector.admin.products.product.reservedPrice, product.reservedPrice())
        await this.type(selector.admin.products.product.buyItNowPrice, product.buyItNowPrice())
        await this.type(selector.admin.products.product.auctionDatesFrom, product.startDate)
        await this.type(selector.admin.products.product.auctionDatesTo, product.endDate)
        // Category
        await this.click(selector.admin.products.product.category(product.category))
        // Vendor Store Name //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()

        // Publish
        await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302)
        await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // Admin Add Booking Product
    async addBookingProduct(product: any) {

        await this.goIfNotThere(data.subUrls.backend.wcAddNewProducts)

        // Add New Booking Product
        // Name
        await this.type(selector.admin.products.product.productName, product.productName())
        await this.selectByValue(selector.admin.products.product.productType, product.productType)
        await this.selectByValue(selector.admin.products.product.bookingDurationType, product.bookingDurationType)
        await this.clearAndFill(selector.admin.products.product.bookingDurationMax, product.bookingDurationMax)
        await this.selectByValue(selector.admin.products.product.calendarDisplayMode, product.calendarDisplayMode)
        // Costs
        await this.click(selector.admin.products.product.bookingCosts)
        await this.clearAndFill(selector.admin.products.product.baseCost, product.baseCost)
        await this.clearAndFill(selector.admin.products.product.blockCost, product.blockCost)
        // Category
        await this.click(selector.admin.products.product.category(product.category))
        // Vendor Store Name  //TODO: uncomment after fix
        // await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName)
        await this.scrollToTop()

        // Publish
        await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302)
        await expect(this.page.locator(selector.admin.products.product.updatedSuccessMessage)).toContainText(data.product.publishSuccessMessage);
    }

    // Admin Update Product Stock Status
    async editStockStatus(status:any){
        await this.click(selector.admin.products.product.inventory)
        await this.selectByValue(selector.admin.products.product.stockStatus, status)
    }


    // Wholesale Customer

    // Admin Approve Wholesale Request
    async adminApproveWholesaleRequest(customer: string) {
        await this.hover(selector.admin.aDashboard.dokan)
        await this.click(selector.admin.dokan.wholesaleCustomerMenu)
        await this.click(selector.admin.dokan.wholesaleCustomer.statusSlider(customer))
        await expect(this.page.locator(selector.admin.dokan.wholesaleCustomer.enableStatusUpdateSuccessMessage)).toContainText(data.wholesale.wholesaleCapabilityActivate)
    }

    async getOrderDetails(orderNumber:any){
        let subMenuOpened = await this.getClassValue(selector.admin.aDashboard.dokanMenu)
        if (subMenuOpened.includes('opensub')) {
            await this.hover(selector.admin.aDashboard.dokan)
            await this.click(selector.admin.dokan.reportsMenu)
        } else {
            await this.click(selector.admin.dokan.reportsMenu)

        }
        await this.click(selector.admin.dokan.reports.allLogs)

        await this.type(selector.admin.dokan.reports.searchByOrder, orderNumber)


        let aOrderDetails = {
            orderNumber: (await this.getElementText(selector.admin.dokan.reports.orderId)).split('#')[1],
            store: await this.getElementText(selector.admin.dokan.reports.store),
            orderTotal: helpers.price(await this.getElementText(selector.admin.dokan.reports.orderTotal)),
            vendorEarning: helpers.price(await this.getElementText(selector.admin.dokan.reports.vendorEarning)),
            commission: helpers.price(await this.getElementText(selector.admin.dokan.reports.commission)),
            gatewayFee: helpers.price(await this.getElementText(selector.admin.dokan.reports.gatewayFee)),
            shippingCost: helpers.price(await this.getElementText(selector.admin.dokan.reports.shippingCost)),
            tax: helpers.price(await this.getElementText(selector.admin.dokan.reports.tax)),
            orderStatus: await this.getElementText(selector.admin.dokan.reports.orderStatus),
            orderDate: await this.getElementText(selector.admin.dokan.reports.orderDate),
        }
        return aOrderDetails
    }

    // Get Total Admin Commission from Admin Dashboard
    async getTotalAdminCommission() {
        await this.hover(selector.admin.aDashboard.dokan)
        await this.click(selector.admin.dokan.dashboardMenu)

        let totalAdminCommission = helpers.price(await this.getElementText(selector.admin.dokan.dashboard.commissionEarned))
        return totalAdminCommission
    }

    // Admin Approve Return Request
    async approveRefundRequest(orderNumber, approve = false) {
        await this.searchRefundRequest(orderNumber)

        await this.hover(selector.admin.dokan.refunds.refundCell(orderNumber))
        if (approve) {
            await this.click(selector.admin.dokan.refunds.approveRefund(orderNumber))
        } else {
            await this.click(selector.admin.dokan.refunds.cancelRefund(orderNumber))
        }


        let refundRequestIsVisible = await this.isVisible(selector.admin.dokan.refunds.refundCell(orderNumber))
        expect(refundRequestIsVisible).toBe(false)
    }

    // Search Refund Request
    async searchRefundRequest(orderNumber:any){
        await this.hover(selector.admin.aDashboard.dokan)
        await this.click(selector.admin.dokan.refundsMenu)

        // Search Refund Request
        await this.type(selector.admin.dokan.refunds.searchRefund, orderNumber)
        // await this.press(data.key.enter)


        await this.waitForSelector(selector.admin.dokan.refunds.refundCell(orderNumber))
        let searchedRefundRequestIsVisible = await this.isVisible(selector.admin.dokan.refunds.refundCell(orderNumber))
        expect(searchedRefundRequestIsVisible).toBe(true)
    }


    // Dokan Setup Wizard

    // Admin Set Dokan Setup Wizard
    async setDokanSetupWizard(dokanSetupWizard: any) {
        // await this.hover(selector.admin.aDashboard.dokan)
        // await this.click(selector.admin.dokan.toolsMenu)

        // Open Dokan Setup Wizard
        // await this.click(selector.admin.dokan.tools.openSetupWizard)

        await this.goto(data.subUrls.backend.dokanSetupWizard)

        await this.click(selector.admin.dokan.dokanSetupWizard.letsGo)
        // Store
        // await this.clearAndFill(selector.admin.dokan.dokanSetupWizard.vendorStoreURL, dokanSetupWizard.vendorStoreURL)
        // await this.selectByValue(selector.admin.dokan.dokanSetupWizard.shippingFeeRecipient, dokanSetupWizard.shippingFeeRecipient)
        // await this.selectByValue(selector.admin.dokan.dokanSetupWizard.taxFeeRecipient, dokanSetupWizard.taxFeeRecipient)
        // await this.selectByValue(selector.admin.dokan.dokanSetupWizard.mapApiSource, dokanSetupWizard.mapApiSource)
        // await this.clearAndFill(selector.admin.dokan.dokanSetupWizard.googleMapApiKey, dokanSetupWizard.googleMapApiKey)
        // await this.click(selector.admin.dokan.dokanSetupWizard.shareEssentialsOff)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.shareEssentialsOff)
        // await this.selectByValue(selector.admin.dokan.dokanSetupWizard.sellingProductTypes, dokanSetupWizard.sellingProductTypes)
        // await this.click(selector.admin.dokan.dokanSetupWizard.continue)
        // await this.click(selector.admin.dokan.dokanSetupWizard.skipThisStep)

        // // Selling
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.newVendorEnableSelling)
        // await this.selectByValue(selector.admin.dokan.dokanSetupWizard.commissionType, dokanSetupWizard.commissionType)
        // await this.clearAndFill(selector.admin.dokan.dokanSetupWizard.adminCommission, dokanSetupWizard.adminCommission)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusChange)
        // await this.click(selector.admin.dokan.dokanSetupWizard.continue)
        // // await this.click(selector.admin.dokan.dokanSetupWizard.skipThisStep)
        // // Withdraw
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.payPal)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.bankTransfer)
        // // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.wirecard)
        // // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.stripe)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.custom)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.skrill)
        // await this.clearAndFill(selector.admin.dokan.dokanSetupWizard.minimumWithdrawLimit, dokanSetupWizard.minimumWithdrawLimit)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusForWithdrawCompleted)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusForWithdrawProcessing)
        // await this.click(selector.admin.dokan.dokanSetupWizard.continue)
        // // Recommended
        // await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.wooCommerceConversionTracking)
        // await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.weMail)
        // await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.texty)
        // await this.click(selector.admin.dokan.dokanSetupWizard.continueRecommended)
        // // Ready!
        // await this.click(selector.admin.dokan.dokanSetupWizard.visitDokanDashboard)

        // await this.waitForSelector(selector.admin.dokan.dashboard.dashboardText)
        // let dashboardTextIsVisible = await this.isVisible(selector.admin.dokan.dashboard.dashboardText)
        // expect(dashboardTextIsVisible).toBe(true)
    }

    // Dokan Modules

    // Module Activation Check
    async checkActiveModules() {
        await this.hover(selector.admin.aDashboard.dokan)
        await this.click(selector.admin.dokan.modulesMenu)

        await this.click(selector.admin.dokan.modules.inActive)

        let noModulesMessage = await this.isVisible(selector.admin.dokan.modules.noModulesFound)
        if (noModulesMessage) {
            await expect(this.page.locator(selector.admin.dokan.modules.noModulesFound)).toContainText(data.module.noModuleMessage)
        } else {
            let inActiveModuleNames = await this.getMultipleElementTexts(selector.admin.dokan.modules.moduleName)
            throw new Error("Inactive modules: " + inActiveModuleNames)
        }
    }
}
