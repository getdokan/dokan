import {expect, type Page} from '@playwright/test';
import {BasePage} from "./basePage";
import {LoginPage} from './loginPage'
import {selector} from './selectors'
import {data} from '../utils/testData'

export class AdminPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }
//
//     // Navigation
//
//     async goToAdminDashboard() {
//         await this.goIfNotThere(data.subUrls.backend.adminDashboard)
//     }
//
//     async goToDokanSettings() {
//         await this.goIfNotThere(data.subUrls.backend.dokanSettings)
//     }
//
//     async goToWooCommerceSettings() {
//         await this.goIfNotThere(data.subUrls.backend.woocommerceSettings)
//     }
//
//     async goToPlugins() {
//         await this.goIfNotThere(data.subUrls.backend.plugins)
//     }
//
//
//     // Wordpress Site Settings
//
//     // Plugin Activation Check
//     async checkActivePlugins(plugin) {
//         await this.goToPlugins()
//         for (let pluginSlug of plugin.pluginSlugList) {
//             let classValue = await this.getElementClassValue(selector.admin.plugins.plugin(pluginSlug))
//             expect(classValue).toMatch(plugin.activeClass)
//         }
//     }
//
//
//     // Admin Set Wordpress Site Settings
//     async setWpSettings(wpSettings) {
//         await this.setWpGeneralSettings(wpSettings.general)
//         await this.goToAdminDashboard()
//         await this.setPermalinkSettings(wpSettings.permalink)
//
//     }
//
//     // Set Wp General Settings
//     async setWpGeneralSettings(general) {
//         await this.hover(selector.admin.aDashboard.settings)
//         // Set General Settings
//         await this.click(selector.admin.settings.general)
//         // Enable User Registration
//         await this.check(selector.admin.settings.membership)
//         // Timezone
//         await this.select(selector.admin.settings.timezone, general.timezone)
//         await this.click(selector.admin.settings.generalSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(general.saveSuccessMessage)
//     }
//
//     // Admin Set Permalink Settings
//     async setPermalinkSettings(permalink) {
//         await this.hover(selector.admin.aDashboard.settings)
//         // Set Permalinks Settings
//         await this.click(selector.admin.settings.permalinks)
//         await this.click(selector.admin.settings.postName)
//         await this.click(selector.admin.settings.customBase)
//         await this.clearAndType(selector.admin.settings.customBaseInput, permalink.customBaseInput)
//         await this.click(selector.admin.settings.permalinkSaveChanges)
//
//         let permalinkSuccessMessage = await this.getElementText(selector.admin.settings.updatedSuccessMessage)
//         expect(permalinkSuccessMessage).toMatch(permalink.saveSuccessMessage)
//
//     }
//
//     // Dokan Settings
//
//     // Admin Set Dokan Settings
//     async setDokanSettings() {
//         await this.goToDokanSettings()
//         await this.setDokanGeneralSettings()
//         await this.setDokanSellingSettings()
//         await this.setDokanWithdrawSettings()
//         await this.setPageSettings()
//         await this.setDokanAppearanceSettings()
//         await this.setDokanPrivacyPolicySettings()
//         await this.setDokanStoreSupportSettings()
//         await this.setDokanRmaSettings()
//         await this.setDokanWholesaleSettings()
//         await this.setDokanEuComplianceSettings()
//         await this.setDokanDeliveryTimeSettings()
//         await this.setDokanProductAdvertisingSettings()
//         await this.setDokanGeolocationSettings()
//         await this.setDokanProductReportAbuseSettings()
//         await this.setDokanSpmvSettings()
//         await this.setDokanVendorSubscriptionSettings()
//     }
//
//     // Admin Set Dokan General Settings
//     async setDokanGeneralSettings(general) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.general)
//
//         // Site Options
//         await this.enableSwitcher(selector.admin.dokan.settings.adminAreaAccess)
//         await this.clearAndType(selector.admin.dokan.settings.vendorStoreUrl, general.vendorStoreUrl)
//         await this.click(selector.admin.dokan.settings.sellingProductTypes(general.sellingProductTypes))
//
//         // Vendor Store Options
//         await this.enableSwitcher(selector.admin.dokan.settings.storeTermsAndConditions)
//         await this.clearAndType(selector.admin.dokan.settings.storeProductPerPage, general.storeProductPerPage)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableTermsAndCondition)
//         await this.click(selector.admin.dokan.settings.storCategory(general.storCategory))
//         await this.click(selector.admin.dokan.settings.generalSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(general.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Selling Settings
//     async setDokanSellingSettings(selling) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.sellingOptions)
//
//         // Commission Settings
//         await this.select(selector.admin.dokan.settings.commissionType, selling.commissionType)
//         await this.clearAndType(selector.admin.dokan.settings.adminCommission, selling.adminCommission)
//         await this.click(selector.admin.dokan.settings.shippingFeeRecipient(selling.shippingFeeRecipient))
//         await this.click(selector.admin.dokan.settings.taxFeeRecipient(selling.taxFeeRecipient))
//
//         // Vendor Capability
//         await this.enableSwitcher(selector.admin.dokan.settings.newVendorProductUpload)
//         await this.enableSwitcher(selector.admin.dokan.settings.orderStatusChange)
//         await this.click(selector.admin.dokan.settings.newProductStatus(selling.newProductStatus))
//         await this.enableSwitcher(selector.admin.dokan.settings.duplicateProduct)
//         await this.enableSwitcher(selector.admin.dokan.settings.productMailNotification)
//         await this.click(selector.admin.dokan.settings.productCategorySelection(selling.productCategorySelection))
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorsCanCreateTags)
//         await this.enableSwitcher(selector.admin.dokan.settings.orderDiscount)
//         await this.enableSwitcher(selector.admin.dokan.settings.productDiscount)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorProductReview)
//         await this.enableSwitcher(selector.admin.dokan.settings.guestProductEnquiry)
//         await this.enableSwitcher(selector.admin.dokan.settings.newVendorEnableAuction)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableMinMaxQuantities)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableMinMaxAmount)
//         await this.click(selector.admin.dokan.settings.sellingOptionsSaveChanges)
//
//         let commission = await this.getElementValue(selector.admin.dokan.settings.adminCommission)
//         expect(commission).toMatch(selling.adminCommission)
//     }
//
//     // Admin Set Dokan Withdraw Settings
//     async setDokanWithdrawSettings(withdraw) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.withdrawOptions)
//
//         // Withdraw Options
//         await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsPaypal)
//         await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsBankTransfer)
//         await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsDokanCustom)
//         await this.enableSwitcher(selector.admin.dokan.settings.withdrawMethodsSkrill)
//         await this.clearAndType(selector.admin.dokan.settings.customMethodName, withdraw.customMethodName)
//         await this.clearAndType(selector.admin.dokan.settings.customMethodType, withdraw.customMethodType)
//         await this.clearAndType(selector.admin.dokan.settings.minimumWithdrawAmount, withdraw.minimumWithdrawAmount)
//         await this.enableSwitcher(selector.admin.dokan.settings.orderStatusForWithdrawCompleted)
//         await this.enableSwitcher(selector.admin.dokan.settings.orderStatusForWithdrawProcessing)
//         await this.clearAndType(selector.admin.dokan.settings.withdrawThreshold, withdraw.withdrawThreshold)
//
//         // Disbursement Schedule Settings
//         await this.enableSwitcher(selector.admin.dokan.settings.withdrawDisbursementManual)
//         await this.enableSwitcher(selector.admin.dokan.settings.withdrawDisbursementAuto)
//
//         // Disbursement Schedule
//         await this.enableSwitcher(selector.admin.dokan.settings.disburseMentQuarterlySchedule)
//         await this.enableSwitcher(selector.admin.dokan.settings.disburseMentMonthlySchedule)
//         await this.enableSwitcher(selector.admin.dokan.settings.disburseMentBiweeklySchedule)
//         await this.enableSwitcher(selector.admin.dokan.settings.disburseMentWeeklySchedule)
//
//         // Quarterly Schedule
//         await this.select(selector.admin.dokan.settings.quarterlyScheduleMonth, withdraw.quarterlyScheduleMonth)
//         await this.select(selector.admin.dokan.settings.quarterlyScheduleWeek, withdraw.quarterlyScheduleWeek)
//         await this.select(selector.admin.dokan.settings.quarterlyScheduleDay, withdraw.quarterlyScheduleDay)
//         // Monthly Schedule
//         await this.select(selector.admin.dokan.settings.monthlyScheduleWeek, withdraw.monthlyScheduleWeek)
//         await this.select(selector.admin.dokan.settings.monthlyScheduleDay, withdraw.monthlyScheduleDay)
//         // Biweekly Schedule
//         await this.select(selector.admin.dokan.settings.biweeklyScheduleWeek, withdraw.biweeklyScheduleWeek)
//         await this.select(selector.admin.dokan.settings.biweeklyScheduleDay, withdraw.biweeklyScheduleDay)
//         // Weekly Schedule
//         await this.select(selector.admin.dokan.settings.weeklyScheduleDay, withdraw.weeklyScheduleDay)
//         await this.click(selector.admin.dokan.settings.withdrawSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(withdraw.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Page Settings
//     async setPageSettings(page) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.pageSettings)
//
//         // this Settings
//         await this.select(selector.admin.dokan.settings.termsAndConditionsPage, page.termsAndConditionsPage)
//         await this.click(selector.admin.dokan.settings.pageSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(page.saveSuccessMessage)
//
//     }
//
//     // Admin Set Dokan Appearance Settings
//     async setDokanAppearanceSettings(appreance) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.appearance)
//
//         // Appearance Settings
//         await this.enableSwitcher(selector.admin.dokan.settings.showMapOnStorePage)
//         await this.click(selector.admin.dokan.settings.mapApiSourceGoogleMaps)
//         await this.clearAndType(selector.admin.dokan.settings.googleMapApiKey, appreance.googleMapApiKey)
//         await this.click(selector.admin.dokan.settings.storeHeaderTemplate2)
//         await this.click(selector.admin.dokan.settings.storeHeaderTemplate1)
//         await this.clearAndType(selector.admin.dokan.settings.storeBannerWidth, appreance.storeBannerWidth)
//         await this.clearAndType(selector.admin.dokan.settings.storeBannerHeight, appreance.storeBannerHeight)
//         await this.enableSwitcher(selector.admin.dokan.settings.storeOpeningClosingTimeWidget)
//         await this.enableSwitcher(selector.admin.dokan.settings.showVendorInfo)
//         await this.click(selector.admin.dokan.settings.appearanceSaveChanges)
//
//         let apiKey = await this.getElementValue(selector.admin.dokan.settings.googleMapApiKey)
//         expect(apiKey).toMatch(appreance.googleMapApiKey)
//     }
//
//     // Admin Set Dokan Privacy Policy Settings
//     async setDokanPrivacyPolicySettings(privacyPolicy) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.privacyPolicy)
//
//         // Privacy Policy Settings
//         await this.enableSwitcher(selector.admin.dokan.settings.enablePrivacyPolicy)
//         await this.select(selector.admin.dokan.settings.privacyPage, privacyPolicy.privacyPage)
//
//         let iframe = await this.switchToIframe(selector.admin.dokan.settings.privacyPolicyIframe)
//         await this.iframeClearAndType(iframe, selector.admin.dokan.settings.privacyPolicyHtmlBody, privacyPolicy.privacyPolicyHtmlBody)
//
//         await this.click(selector.admin.dokan.settings.privacyPolicySaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(privacyPolicy.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Store Support Settings
//     async setDokanStoreSupportSettings(storeSupport) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.storeSupport)
//
//         // Store Support Settings
//         //required
//         await this.enableSwitcher(selector.admin.dokan.settings.displayOnOrderDetails)
//         await this.select(selector.admin.dokan.settings.displayOnSingleProductPage, storeSupport.displayOnSingleProductPage)
//         await this.clearAndType(selector.admin.dokan.settings.supportButtonLabel, storeSupport.supportButtonLabel)
//         await this.enableSwitcher(selector.admin.dokan.settings.supportTicketEmailNotification)
//         await this.click(selector.admin.dokan.settings.storeSupportSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(storeSupport.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Rma Settings
//     async setDokanRmaSettings(rma) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.rma)
//
//         // Rma Settings
//         await this.select(selector.admin.dokan.settings.orderStatus, rma.orderStatus)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableRefundRequests)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableCouponRequests)
//
//         for (let rmaReason of rma.rmaReasons) {
//             await this.deleteIfExists(selector.admin.dokan.settings.reasonsForRmaSingle(rmaReason))
//             await this.clearAndType(selector.admin.dokan.settings.reasonsForRmaInput, rmaReason)
//             await this.click(selector.admin.dokan.settings.reasonsForRmaAdd)
//         }
//
//         let iframe = await this.switchToIframe(selector.admin.dokan.settings.refundPolicyIframe)
//         await this.iframeClearAndType(iframe, selector.admin.dokan.settings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody)
//
//         await this.click(selector.admin.dokan.settings.rmaSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(rma.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Wholesale Settings
//     async setDokanWholesaleSettings(wholesale) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.wholesale)
//
//         // Wholesale Settings
//         await this.click(selector.admin.dokan.settings.whoCanSeeWholesalePrice(wholesale.whoCanSeeWholesalePrice))
//         await this.enableSwitcher(selector.admin.dokan.settings.showWholesalePriceOnShopArchive)
//         await this.enableSwitcher(selector.admin.dokan.settings.needApprovalForCustomer)
//         await this.click(selector.admin.dokan.settings.wholesaleSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(wholesale.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Eu Compliance Settings
//     async setDokanEuComplianceSettings() {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.euComplianceFields)
//
//         // Eu Compliance Settings
//
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsCompanyName)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsCompanyIdOrEuidNumber)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsVatOrTaxNumber)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsNameOfBank)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorExtraFieldsBankIban)
//         await this.enableSwitcher(selector.admin.dokan.settings.displayInVendorRegistrationForm)
//         await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsCompanyIdOrEuidNumber)
//         await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsVatOrTaxNumber)
//         await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsNameOfBank)
//         await this.enableSwitcher(selector.admin.dokan.settings.customerExtraFieldsBankIban)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableGermanizedSupportForVendors)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorsWillBeAbleToOverrideInvoiceNumber)
//         await this.click(selector.admin.dokan.settings.euComplianceFieldsSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(data.dokanSettings.euCompliance.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Delivery Time Settings
//     async setDokanDeliveryTimeSettings(deliveryTime) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.deliveryTime)
//
//         // Delivery Time Settings
//
//         await this.enableSwitcher(selector.admin.dokan.settings.allowVendorSettings)
//         await this.clearAndType(selector.admin.dokan.settings.deliveryDateLabel, deliveryTime.deliveryDateLabel)
//         await this.clearAndType(selector.admin.dokan.settings.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer)
//         await this.clearAndType(selector.admin.dokan.settings.deliveryBoxInfo, deliveryTime.deliveryBoxInfo)
//         await this.enableSwitcher(selector.admin.dokan.settings.requireDeliveryDateAndTime)
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.sunday))
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.monday))
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.tuesday))
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.wednesday))
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.thursday))
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.friday))
//         await this.enableSwitcher(selector.admin.dokan.settings.deliveryDay(deliveryTime.deliveryDay.saturday))
//         await this.clearAndType(selector.admin.dokan.settings.openingTime, deliveryTime.openingTime)
//         await this.clearAndType(selector.admin.dokan.settings.closingTime, deliveryTime.closingTime)
//         await this.clearAndType(selector.admin.dokan.settings.timeSlot, deliveryTime.timeSlot)
//         await this.clearAndType(selector.admin.dokan.settings.orderPerSlot, deliveryTime.orderPerSlot)
//         await this.click(selector.admin.dokan.settings.deliveryTimeSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(deliveryTime.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Product Advertising Settings
//     async setDokanProductAdvertisingSettings(productAdvertising) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.productAdvertising)
//
//         // Product Advertising Settings
//         await this.clearAndType(selector.admin.dokan.settings.noOfAvailableSlot, productAdvertising.noOfAvailableSlot)
//         await this.clearAndType(selector.admin.dokan.settings.expireAfterDays, productAdvertising.expireAfterDays)
//         await this.enableSwitcher(selector.admin.dokan.settings.vendorCanPurchaseAdvertisement)
//         await this.clearAndType(selector.admin.dokan.settings.advertisementCost, productAdvertising.advertisementCost)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableAdvertisementInSubscription)
//         await this.enableSwitcher(selector.admin.dokan.settings.markAdvertisedProductAsFeatured)
//         await this.enableSwitcher(selector.admin.dokan.settings.displayAdvertisedProductOnTop)
//         await this.enableSwitcher(selector.admin.dokan.settings.outOfStockVisibility)
//         await this.click(selector.admin.dokan.settings.productAdvertisingSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(productAdvertising.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Geolocation Settings
//     async setDokanGeolocationSettings(geolocation) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.geolocation)
//
//         // Geolocation Settings
//         await this.click(selector.admin.dokan.settings.locationMapPosition(geolocation.locationMapPosition))
//         await this.click(selector.admin.dokan.settings.showMap(geolocation.showMap))
//         await this.enableSwitcher(selector.admin.dokan.settings.showFiltersBeforeLocationMap)
//         await this.enableSwitcher(selector.admin.dokan.settings.productLocationTab)
//         await this.click(selector.admin.dokan.settings.radiusSearchUnit(geolocation.radiusSearchUnit))
//         await this.clearAndType(selector.admin.dokan.settings.radiusSearchMinimumDistance, geolocation.radiusSearchMinimumDistance)
//         await this.clearAndType(selector.admin.dokan.settings.radiusSearchMaximumDistance, geolocation.radiusSearchMaximumDistance)
//         await this.clearAndType(selector.admin.dokan.settings.mapZoomLevel, geolocation.mapZoomLevel)
//         await this.clearAndType(selector.admin.dokan.settings.defaultLocation, geolocation.defaultLocation)
//
//         await this.press(data.key.arrowDown)
//         await this.press(data.key.enter)
//         await this.click(selector.admin.dokan.settings.geolocationSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(geolocation.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Product Report Abuse Settings
//     async setDokanProductReportAbuseSettings(productReportAbuse) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.productReportAbuse)
//
//         // Product Report Abuse Settings
//         await this.deleteIfExists(selector.admin.dokan.settings.reasonsForAbuseReportSingle(productReportAbuse.reasonsForAbuseReport))
//         await this.clearAndType(selector.admin.dokan.settings.reasonsForAbuseReportInput, productReportAbuse.reasonsForAbuseReport)
//         await this.click(selector.admin.dokan.settings.reasonsForAbuseReportAdd)
//         await this.click(selector.admin.dokan.settings.productReportAbuseSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(productReportAbuse.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Spmv Settings
//     async setDokanSpmvSettings(spmv) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.singleProductMultiVendor)
//
//         await this.enableSwitcher(selector.admin.dokan.settings.enableSingleProductMultipleVendor)
//         await this.clearAndType(selector.admin.dokan.settings.sellItemButtonText, spmv.sellItemButtonText)
//         await this.clearAndType(selector.admin.dokan.settings.availableVendorDisplayAreaTitle, spmv.availableVendorDisplayAreaTitle)
//         await this.select(selector.admin.dokan.settings.availableVendorSectionDisplayPosition, spmv.availableVendorSectionDisplayPosition)
//         await this.select(selector.admin.dokan.settings.showSpmvProducts, spmv.showSpmvProducts)
//         await this.click(selector.admin.dokan.settings.singleProductMultiVendorSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(spmv.saveSuccessMessage)
//     }
//
//     // Admin Set Dokan Vendor Subscription Settings
//     async setDokanVendorSubscriptionSettings(subscription) {
//         await this.goToDokanSettings()
//
//         await this.click(selector.admin.dokan.settings.vendorSubscription)
//
//         // Vendor Subscription Settings
//         await this.select(selector.admin.dokan.settings.subscription, subscription.displayPage)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableProductSubscription)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableSubscriptionInRegistrationForm)
//         await this.enableSwitcher(selector.admin.dokan.settings.enableEmailNotification)
//         await this.clearAndType(selector.admin.dokan.settings.noOfDays, subscription.noOfDays)
//         await this.select(selector.admin.dokan.settings.productStatus, subscription.productStatus)
//         await this.clearAndType(selector.admin.dokan.settings.cancellingEmailSubject, subscription.cancellingEmailSubject)
//         await this.clearAndType(selector.admin.dokan.settings.cancellingEmailBody, subscription.cancellingEmailBody)
//         await this.clearAndType(selector.admin.dokan.settings.alertEmailSubject, subscription.alertEmailSubject)
//         await this.clearAndType(selector.admin.dokan.settings.alertEmailBody, subscription.alertEmailBody)
//         await this.click(selector.admin.dokan.settings.vendorSubscriptionSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.dokan.settings.dokanUpdateSuccessMessage)
//         expect(successMessage).toMatch(subscription.saveSuccessMessage)
//
//         // Disabling Vendor Subscription
//
//         await this.disableSwitcher(selector.admin.dokan.settings.enableProductSubscription)
//         await this.click(selector.admin.dokan.settings.vendorSubscriptionSaveChanges)
//     }
//
//
//     // Tax
//
//     // Admin Enable-Disable Tax
//     async enableTax(enableTax = true) {
//         await this.goToWooCommerceSettings()
//
//         // Enable-Disable Tax
//         enableTax ? await this.check(selector.admin.wooCommerce.settings.enableTaxes) : await this.uncheck(selector.admin.wooCommerce.settings.enableTaxes)
//         await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(data.tax.saveSuccessMessage)
//     }
//
//     // Admin Add Standard Tax Rate
//     async addStandardTaxRate(tax) {
//
//         await this.goToWooCommerceSettings()
//
//         // Enable Tax
//         await this.enableTax()
//
//         // Set Tax Rate
//         await this.click(selector.admin.wooCommerce.settings.tax)
//         await this.click(selector.admin.wooCommerce.settings.standardRates)
//         let taxIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.taxRate)
//         if (!taxIsVisible) {
//             await this.click(selector.admin.wooCommerce.settings.insertRow)
//         }
//         await this.clearAndType(selector.admin.wooCommerce.settings.taxRate, tax.taxRate)
//         await this.click(selector.admin.wooCommerce.settings.taxTable)
//
//         await this.click(selector.admin.wooCommerce.settings.taxRateSaveChanges)
//
//
//         let newTaxRate = await this.getElementValue(selector.admin.wooCommerce.settings.taxRate)
//         expect(newTaxRate).toBe(String(Number(tax.taxRate).toPrecision(5)))
//     }
//
//
//     // Woocommerce Settings
//
//     // Admin Setup Woocommerce Settings
//     async setWoocommerceSettings() {
//         await this.enablePasswordInputField()
//         await this.addStandardTaxRate(data.tax)
//         await this.setCurrencyOptions(data.currency)
//         await this.addShippingMethod(data.shipping.shippingMethods.flatRate)
//         await this.addShippingMethod(data.shipping.shippingMethods.flatRate)
//         await this.addShippingMethod(data.shipping.shippingMethods.freeShipping)
//         await this.addShippingMethod(data.shipping.shippingMethods.tableRateShipping)
//         await this.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping)
//         await this.addShippingMethod(data.shipping.shippingMethods.vendorShipping)
//         await this.deleteShippingMethod(data.shipping.shippingMethods.flatRate)
//         await this.deleteShippingZone(data.shipping.shippingZone)
//     }
//
//     // Enable Password Field
//     async enablePasswordInputField(woocommerce) {
//         await this.goToWooCommerceSettings()
//         await this.click(selector.admin.wooCommerce.settings.accounts)
//         await this.uncheck(selector.admin.wooCommerce.settings.automaticPasswordGeneration)
//         await this.click(selector.admin.wooCommerce.settings.accountSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(woocommerce.saveSuccessMessage)
//     }
//
//     // Shipping Methods
//
//     // Enable Enable-Disable Shipping
//
//     async enableShipping(enableShipping = true) {
//
//         await this.goToWooCommerceSettings()
//         await this.click(selector.admin.wooCommerce.settings.enableShipping)
//         if (enableShipping) {
//             await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.enableShippingValues, data.shipping.enableShipping)
//         } else {
//             await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.enableShippingValues, data.shipping.disableShipping)
//         }
//         await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(data.shipping.saveSuccessMessage)
//
//     }
//
//     // Admin Add Shipping Method
//     async addShippingMethod(shipping) {
//         await this.goToWooCommerceSettings()
//
//         await this.click(selector.admin.wooCommerce.settings.shipping)
//
//         let zoneIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone))
//         if (!zoneIsVisible) {
//             // Add Shipping Zone
//             await this.click(selector.admin.wooCommerce.settings.addShippingZone)
//             await this.clearAndType(selector.admin.wooCommerce.settings.zoneName, shipping.shippingZone)
//             // await this.select(selector.admin.wooCommerce.settings.zoneRegions, shippingCountry) //use select values  'country:US',
//             await this.click(selector.admin.wooCommerce.settings.zoneRegions)
//             await this.type(selector.admin.wooCommerce.settings.zoneRegions, shipping.shippingCountry)
//
//             await this.press(data.key.enter)
//         } else {
//             // Edit Shipping Zone
//             await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone))
//             await this.click(selector.admin.wooCommerce.settings.editShippingMethod(shipping.shippingZone))
//         }
//
//         let methodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(helpers.replaceAndCapitalize(shipping.shippingMethod)))
//         if (!methodIsVisible) {
//             // Add Shipping Method
//             await this.click(selector.admin.wooCommerce.settings.addShippingMethods)
//             await this.select(selector.admin.wooCommerce.settings.shippingMethod, shipping.selectShippingMethod)
//             await this.click(selector.admin.wooCommerce.settings.addShippingMethod)
//
//         }
//         // Edit Shipping Method Options
//         await this.hover(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
//         await this.click(selector.admin.wooCommerce.settings.editShippingMethod(shipping.shippingMethod))
//
//         switch (shipping.selectShippingMethod) {
//             case 'flat_rate':
//                 // Flat Rate
//                 await this.clearAndType(selector.admin.wooCommerce.settings.flatRateMethodTitle, shipping.shippingMethod)
//                 await this.select(selector.admin.wooCommerce.settings.flatRateTaxStatus, shipping.taxStatus)
//                 await this.clearAndType(selector.admin.wooCommerce.settings.flatRateCost, shipping.shippingCost)
//                 break
//
//             case 'free_shipping':
//                 // Free Shipping
//                 await this.clearAndType(selector.admin.wooCommerce.settings.freeShippingTitle, shipping.shippingMethod)
//                 // await this.select(selector.admin.wooCommerce.settings.freeShippingRequires, shipping.freeShippingRequires)
//                 // await this.clearAndType(selector.admin.wooCommerce.settings.freeShippingMinimumOrderAmount,shipping.freeShippingMinimumOrderAmount)
//                 // await this.check(selector.admin.wooCommerce.settings.freeShippingCouponsDiscounts)
//                 break
//
//             case 'local_pickup':
//                 // Local Pickup
//                 await this.clearAndType(selector.admin.wooCommerce.settings.localPickupTitle, shipping.shippingMethod)
//                 await this.select(selector.admin.wooCommerce.settings.localPickupTaxStatus, shipping.taxStatus)
//                 await this.clearAndType(selector.admin.wooCommerce.settings.localPickupCost, shipping.shippingCost)
//                 break
//
//             case 'dokan_table_rate_shipping':
//                 // Dokan Table Rate Shipping
//                 await this.clearAndType(selector.admin.wooCommerce.settings.dokanTableRateShippingMethodTitle, shipping.shippingMethod)
//                 break
//
//             case 'dokan_distance_rate_shipping':
//                 // Dokan Distance Rate Shipping
//                 await this.clearAndType(selector.admin.wooCommerce.settings.dokanDistanceRateShippingMethodTitle, shipping.shippingMethod)
//                 break
//
//             case 'dokan_vendor_shipping':
//                 // Vendor Shipping
//                 await this.clearAndType(selector.admin.wooCommerce.settings.vendorShippingMethodTitle, shipping.shippingMethod)
//                 await this.select(selector.admin.wooCommerce.settings.vendorShippingTaxStatus, shipping.taxStatus)
//                 break
//
//             default:
//                 break
//         }
//
//         await this.click(selector.admin.wooCommerce.settings.shippingMethodSaveChanges)
//
//         await this.waitForSelector(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
//         let shippingMethodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
//         expect(shippingMethodIsVisible).toBe(true)
//
//     }
//
//     // Admin Delete Shipping Zone
//     async deleteShippingZone(shippingZone) {
//         await this.click(selector.admin.wooCommerce.settings.shipping)
//
//         await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shippingZone))
//         await this.alert('accept')
//         await this.click(selector.admin.wooCommerce.settings.deleteShippingZone(shippingZone))
//
//
//         let shippingZoneIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingZoneCell(shippingZone))
//         expect(shippingZoneIsVisible).toBe(false)
//     }
//
//     // Admin Delete Shipping Method
//     async deleteShippingMethod(shipping) {
//         await this.click(selector.admin.wooCommerce.settings.shipping)
//
//         await this.hover(selector.admin.wooCommerce.settings.shippingZoneCell(shipping.shippingZone))
//         await this.click(selector.admin.wooCommerce.settings.editShippingZone(shipping.shippingZone))
//         await this.hover(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
//         await this.click(selector.admin.wooCommerce.settings.deleteShippingMethod(shipping.shippingMethod))
//         await this.click(selector.admin.wooCommerce.settings.shippingZoneSaveChanges)
//
//         let shippingMethodIsVisible = await this.isVisible(selector.admin.wooCommerce.settings.shippingMethodCell(shipping.shippingMethod))
//         expect(shippingMethodIsVisible).toBe(false)
//     }
//
//
//     // Payment Methods
//
//     // Admin Setup Payment Settings
//     async setPaymentSettings() {
//         await this.goToWooCommerceSettings()
//         await this.setupBasicPaymentMethods()
//         await this.setupStripeConnect()
//         await this.setupPaypalMarketPlace()
//         await this.setupDokanMangoPay()
//         await this.setupDokanRazorpay()
//         await this.setupStripeExpress()
//     }
//
//     // Admin Set Currency Options
//     async setCurrencyOptions(currency) {
//         await this.goToWooCommerceSettings()
//
//         // Set Currency Options
//         await this.clearAndType(selector.admin.wooCommerce.settings.thousandSeparator, currency.currencyOptions.thousandSeparator)
//         await this.clearAndType(selector.admin.wooCommerce.settings.decimalSeparator, currency.currencyOptions.decimalSeparator)
//         await this.clearAndType(selector.admin.wooCommerce.settings.numberOfDecimals, currency.currencyOptions.numberOfDecimals)
//         await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(currency.saveSuccessMessage)
//
//     }
//
//     // Admin Set Currency
//     async setCurrency(currency) {
//         await this.goToWooCommerceSettings()
//         let currentCurrency = await this.getElementText(selector.admin.wooCommerce.settings.currency)
//         if (currentCurrency !== currency) {
//             await this.click(selector.admin.wooCommerce.settings.currency)
//             await this.type(selector.admin.wooCommerce.settings.currency, currency)
//             await this.press(data.key.enter)
//             await this.click(selector.admin.wooCommerce.settings.generalSaveChanges)
//
//             let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//             expect(successMessage).toMatch(data.payment.currency.saveSuccessMessage)
//         }
//     }
//
//     // Admin Setup Basic Payment Methods
//     async setupBasicPaymentMethods(payment) {
//         await this.goToWooCommerceSettings()
//
//         await this.click(selector.admin.wooCommerce.settings.payments)
//         // Bank Transfer
//         await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableDirectBankTransfer)
//         // Check Payments
//         await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableCheckPayments)
//         // Cash on Delivery
//         await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableCashOnDelivery)
//
//         await this.click(selector.admin.wooCommerce.settings.paymentMethodsSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(payment.saveSuccessMessage)
//     }
//
//     // Admin Setup Stripe
//     async setupStripeConnect(payment) {
//         await this.goToWooCommerceSettings()
//
//         await this.setCurrency(payment.currency.dollar)
//
//         await this.click(selector.admin.wooCommerce.settings.payments)
//         await this.click(selector.admin.wooCommerce.settings.setupDokanStripeConnect)
//         // Setup Strip Connect
//         await this.check(selector.admin.wooCommerce.settings.stripe.enableDisableStripe)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripe.title, payment.stripeConnect.title)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripe.description, payment.stripeConnect.description)
//         await this.check(selector.admin.wooCommerce.settings.stripe.nonConnectedSellers)
//         await this.check(selector.admin.wooCommerce.settings.stripe.displayNoticeToConnectSeller)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripe.displayNoticeInterval, payment.stripeConnect.displayNoticeInterval)
//         await this.check(selector.admin.wooCommerce.settings.stripe.threeDSecureAndSca)
//         await this.check(selector.admin.wooCommerce.settings.stripe.sellerPaysTheProcessingFeeIn3DsMode)
//         await this.check(selector.admin.wooCommerce.settings.stripe.testMode)
//         await this.check(selector.admin.wooCommerce.settings.stripe.stripeCheckout)
//         await this.click(selector.admin.wooCommerce.settings.stripe.stripeCheckoutLocale)
//         await this.type(selector.admin.wooCommerce.settings.stripe.stripeCheckoutLocale, payment.stripeConnect.stripeCheckoutLocale)
//         await this.press(data.key.enter)
//         await this.check(selector.admin.wooCommerce.settings.stripe.savedCards)
//         // Test Credentials
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripe.testPublishableKey, payment.stripeConnect.testPublishableKey)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripe.testSecretKey, payment.stripeConnect.testSecretKey)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripe.testClientId, payment.stripeConnect.testClientId)
//         await this.click(selector.admin.wooCommerce.settings.stripe.stripeSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(payment.saveSuccessMessage)
//     }
//
//     // Admin Setup Dokan Paypal Marketplace
//     async setupPaypalMarketPlace(payment) {
//         await this.goToWooCommerceSettings()
//
//         await this.setCurrency(payment.currency.dollar)
//
//         await this.click(selector.admin.wooCommerce.settings.payments)
//         await this.click(selector.admin.wooCommerce.settings.setupDokanPayPalMarketplace)
//         // Setup Paypal Marketplace
//         await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.enableDisablePayPalMarketplace)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.title, payment.paypalMarketPlace.title)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.description, payment.paypalMarketPlace.description)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalMerchantId, payment.paypalMarketPlace.payPalMerchantId)
//         // API Credentials
//         await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalSandbox)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.sandboxClientId, payment.paypalMarketPlace.sandboxClientId)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.sandBoxClientSecret, payment.paypalMarketPlace.sandBoxClientSecret)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalPartnerAttributionId, payment.paypalMarketPlace.payPalPartnerAttributionId)
//         await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.disbursementMode)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.paypalMarketPlace.disbursementModeValues, payment.paypalMarketPlace.disbursementMode)
//         await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.paymentButtonType)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.paypalMarketPlace.paymentButtonTypeValues, payment.paypalMarketPlace.paymentButtonType)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.marketplaceLogo, await this.getBaseUrl() + payment.paypalMarketPlace.marketplaceLogoPath)
//         await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.displayNoticeToConnectSeller)
//         await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.sendAnnouncementToConnectSeller)
//         await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.sendAnnouncementInterval, payment.paypalMarketPlace.announcementInterval)
//         await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.paypalMarketPlaceSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(payment.saveSuccessMessage)
//     }
//
//     // Admin Setup Mangopay
//     async setupMangoPay(payment) {
//         await this.goToWooCommerceSettings()
//
//         await this.setCurrency(payment.currency.euro)
//
//         await this.click(selector.admin.wooCommerce.settings.payments)
//         await this.click(selector.admin.wooCommerce.settings.setupDokanMangoPay)
//         // Setup Mangopay
//         await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.enableDisableMangoPayPayment)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.title, payment.mangoPay.title)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.description, payment.mangoPay.description)
//         // API Credentials
//         await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.mangoPaySandbox)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.sandboxClientId, payment.mangoPay.sandboxClientId)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.sandBoxApiKey, payment.mangoPay.sandBoxApiKey)
//         // Payment Options
//         await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCards)
//         // await this.type(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCards, 'CB/Visa/Mastercard')
//         // await this.press(data.key.enter)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCardsValues, payment.mangoPay.availableCreditCards)
//         await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServices)
//         // await this.type(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServices, 'Sofort*')
//         // await this.press(data.key.enter) //TODO: check why commented
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServicesValues, payment.mangoPay.availableDirectPaymentServices)
//         await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.savedCards)
//         // Fund Transfers and Payouts
//         await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.transferFunds)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.transferFundsValues, payment.mangoPay.transferFunds)
//         await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.payoutMode)
//         // Types and Requirements of Vendors
//         await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.typeOfVendors)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.typeOfVendorsValues, payment.mangoPay.typeOfVendors)
//         await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.businessRequirement)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.businessRequirementValues, payment.mangoPay.businessRequirement)
//         // Advanced Settings
//         await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.displayNoticeToNonConnectedSellers)
//         await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.sendAnnouncementToNonConnectedSellers)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.announcementInterval, payment.mangoPay.announcementInterval)
//         await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.dokanMangopaySaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(payment.saveSuccessMessage)
//     }
//
//     // Admin Setup Razorpay
//     async setupRazorpay(payment) {
//         await this.goToWooCommerceSettings()
//
//         await this.setCurrency(payment.currency.rupee)
//
//         await this.click(selector.admin.wooCommerce.settings.payments)
//         await this.click(selector.admin.wooCommerce.settings.setupDokanRazorpay)
//         // Setup Razorpay
//         await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.enableDisableDokanRazorpay)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.title, payment.razorPay.title)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.description, payment.razorPay.description)
//         // API Credentials
//         await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.razorpaySandbox)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.testKeyId, payment.razorPay.testKeyId)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.testKeySecret, payment.razorPay.testKeySecret)
//         await this.click(selector.admin.wooCommerce.settings.dokanRazorpay.disbursementMode)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanRazorpay.disbursementModeValues, payment.razorPay.disbursementMode)
//         await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.sellerPaysTheProcessingFee)
//         await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.displayNoticeToConnectSeller)
//         await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.sendAnnouncementToConnectSeller)
//         await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.sendAnnouncementInterval, payment.razorPay.announcementInterval)
//         await this.click(selector.admin.wooCommerce.settings.dokanRazorpay.dokanRazorpaySaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(payment.saveSuccessMessage)
//     }
//
//     // Admin Setup Stripe Express
//     async setupStripeExpress(payment) {
//         await this.goToWooCommerceSettings()
//
//         await this.setCurrency(payment.currency.dollar)
//
//         await this.click(selector.admin.wooCommerce.settings.payments)
//         await this.click(selector.admin.wooCommerce.settings.setupDokanStripeExpress)
//
//         // Stripe Express
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.enableOrDisableStripeExpress)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.title, payment.stripeExpress.title)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.description, payment.stripeExpress.description)
//         // API Credentials
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.testMode)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.testPublishableKey, payment.stripeExpress.testPublishableKey)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.testSecretKey, payment.stripeExpress.testSecretKey)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.testWebhookSecret, payment.stripeExpress.testWebhookSecret)
//         // Payment and Disbursement
//         await this.click(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethods)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.card)
//         await this.click(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethods)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.ideal)
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.takeProcessingFeesFromSellers)
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.savedCards)
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.capturePaymentsManually)
//         await this.click(selector.admin.wooCommerce.settings.stripeExpress.disburseFunds)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.disbursementModeValues, payment.stripeExpress.disbursementMode)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.customerBankStatement, payment.stripeExpress.customerBankStatement)
//         // Payment Request Options (Apple Pay/Google Pay)
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.paymentRequestButtons)
//         await this.select(selector.admin.wooCommerce.settings.stripeExpress.buttonType, payment.stripeExpress.paymentRequestButtonType)
//         await this.select(selector.admin.wooCommerce.settings.stripeExpress.buttonTheme, payment.stripeExpress.paymentRequestButtonTheme)
//         await this.click(selector.admin.wooCommerce.settings.stripeExpress.buttonLocations)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.product)
//         await this.click(selector.admin.wooCommerce.settings.stripeExpress.buttonLocations)
//         await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.cart)
//         // Advanced Settings
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.displayNoticeToNonConnectedSellers)
//         await this.check(selector.admin.wooCommerce.settings.stripeExpress.sendAnnouncementToNonConnectedSellers)
//         await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.announcementInterval, payment.stripeExpress.announcementInterval)
//         await this.click(selector.admin.wooCommerce.settings.stripeExpress.stripeExpressSaveChanges)
//
//         let successMessage = await this.getElementText(selector.admin.wooCommerce.settings.updatedSuccessMessage)
//         expect(successMessage).toMatch(payment.saveSuccessMessage)
//     }
//
//
//     // Vendors
//
//     // Admin Add New Vendors
//     async addVendor(vendorInfo) {
//
//         let firstName = vendorInfo.firstName()
//         let email = vendorInfo.email()
//         await this.hover(selector.admin.aDashboard.dokan)
//         await this.click(selector.admin.dokan.vendorsMenu)
//
//         // Add New Vendor
//         await this.click(selector.admin.dokan.vendors.addNewVendor)
//         // Account Info
//         await this.type(selector.admin.dokan.vendors.firstName, firstName)
//         await this.type(selector.admin.dokan.vendors.lastName, vendorInfo.lastName())
//         await this.type(selector.admin.dokan.vendors.storeName, vendorInfo.storeName)
//         await this.type(selector.admin.dokan.vendors.phoneNumber, vendorInfo.phoneNumber)
//         await this.type(selector.admin.dokan.vendors.email, email)
//         await this.click(selector.admin.dokan.vendors.generatePassword)
//         await this.clearAndType(selector.admin.dokan.vendors.password, vendorInfo.password)
//         await this.type(selector.admin.dokan.vendors.username, firstName)
//         await this.type(selector.admin.dokan.vendors.companyName, vendorInfo.companyName)
//         await this.type(selector.admin.dokan.vendors.companyIdEuidNumber, vendorInfo.companyId)
//         await this.type(selector.admin.dokan.vendors.vatOrTaxNumber, vendorInfo.vatNumber)
//         await this.type(selector.admin.dokan.vendors.nameOfBank, vendorInfo.nameOfBank)
//         await this.type(selector.admin.dokan.vendors.bankIban, vendorInfo.bankIban)
//
//         await this.click(selector.admin.dokan.vendors.next)
//         // Address
//         await this.type(selector.admin.dokan.vendors.street1, vendorInfo.street1)
//         await this.type(selector.admin.dokan.vendors.street2, vendorInfo.street2)
//         await this.type(selector.admin.dokan.vendors.city, vendorInfo.city)
//         await this.type(selector.admin.dokan.vendors.zip, vendorInfo.zip)
//         await this.click(selector.admin.dokan.vendors.country)
//         await this.type(selector.admin.dokan.vendors.countryInput, vendorInfo.country)
//         await this.press(data.key.enter)
//         await this.click(selector.admin.dokan.vendors.state)
//         await this.type(selector.admin.dokan.vendors.state, vendorInfo.state)
//         await this.click(selector.admin.dokan.vendors.next)
//         // Payment Options
//         await this.type(selector.admin.dokan.vendors.accountName, vendorInfo.accountName)
//         await this.type(selector.admin.dokan.vendors.accountNumber, vendorInfo.accountNumber)
//         await this.type(selector.admin.dokan.vendors.bankName, vendorInfo.bankName)
//         await this.type(selector.admin.dokan.vendors.bankAddress, vendorInfo.bankAddress)
//         await this.type(selector.admin.dokan.vendors.routingNumber, vendorInfo.routingNumber)
//         await this.type(selector.admin.dokan.vendors.iban, vendorInfo.iban)
//         await this.type(selector.admin.dokan.vendors.swift, vendorInfo.swift)
//         await this.type(selector.admin.dokan.vendors.payPalEmail, vendorInfo.payPalEmail)
//         await this.check(selector.admin.dokan.vendors.enableSelling)
//         await this.check(selector.admin.dokan.vendors.publishProductDirectly)
//         await this.check(selector.admin.dokan.vendors.makeVendorFeature)
//         // Create Vendor
//         await this.click(selector.admin.dokan.vendors.createVendor)
//         await this.click(selector.admin.dokan.vendors.editVendorInfo)
//
//         let vendorEmail = await this.getElementValue(selector.admin.dokan.vendors.editVendor.email)
//         expect(vendorEmail).toBe(email)
//
//     }
//
//     // Products
//
//
//     // Admin Add Categories
//     async addCategory(categoryName) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.categoriesMenu)
//
//         let categoryIsVisible = await this.isVisible(selector.admin.products.category.categoryCell(categoryName))
//         if (!categoryIsVisible) {
//             // Add New Category
//             await this.type(selector.admin.products.category.name, categoryName)
//             await this.type(selector.admin.products.category.slug, categoryName)
//             await this.click(selector.admin.products.category.addNewCategory)
//
//             await this.waitForSelector(selector.admin.products.category.categoryCell(categoryName))
//             let categoryIsVisible = await this.isVisible(selector.admin.products.category.categoryCell(categoryName))
//             expect(categoryIsVisible).toBe(true)
//         }
//     }
//
//     // Admin Add Attributes
//     async addAttributes(attribute) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.attributesMenu)
//
//         let attributeIsVisible = await this.isVisible(selector.admin.products.attribute.attributeCell(attribute.attributeName))
//         if (!attributeIsVisible) {
//             // Add New Attribute
//             await this.type(selector.admin.products.attribute.name, attribute.attributeName)
//             await this.type(selector.admin.products.attribute.slug, attribute.attributeName)
//             await this.click(selector.admin.products.attribute.addAttribute)
//
//             await this.waitForSelector(selector.admin.products.attribute.attributeCell(attribute.attributeName))
//             let attributeIsVisible = await this.isVisible(selector.admin.products.attribute.attributeCell(attribute.attributeName))
//             expect(attributeIsVisible).toBe(true)
//
//             await this.click(selector.admin.products.attribute.configureTerms(attribute.attributeName))
//
//             // Add New Term
//             for (let attributeTerm of attribute.attributeTerms) {
//
//                 await this.type(selector.admin.products.attribute.attributeTerm, attributeTerm)
//                 await this.type(selector.admin.products.attribute.attributeTermSlug, attributeTerm)
//                 await this.click(selector.admin.products.attribute.addAttributeTerm)
//
//                 await this.waitForSelector(selector.admin.products.attribute.attributeTermCell(attributeTerm))
//                 let attributeTermIsVisible = await this.isVisible(selector.admin.products.attribute.attributeTermCell(attributeTerm))
//                 expect(attributeTermIsVisible).toBe(true)
//             }
//         }
//     }
//
//     // Admin Add Simple Product
//     async addSimpleProduct(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New Simple Product
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//         await this.type(selector.admin.products.product.regularPrice, product.regularPrice())
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Stock status
//         if (product.stockStatus) {
//             await this.editStockStatus(data.product.stockStatus.outOfStock)
//         }
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//
//         switch (product.status) {
//             case 'publish':
//                 // Publish
//                 await this.click(selector.admin.products.product.publish)
//
//                 let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//                 expect(productCreateSuccessMessage).toMatch(data.product.publishSuccessMessage)
//                 break
//
//             case 'draft':
//                 // Draft
//                 await this.click(selector.admin.products.product.saveDraft)
//
//                 let draftProductCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//                 expect(draftProductCreateSuccessMessage).toMatch(data.product.draftUpdateSuccessMessage)
//                 break
//
//             case 'pending':
//                 // Pending
//                 await this.click(selector.admin.products.product.editStatus)
//                 await this.select(selector.admin.products.product.status, data.product.status.pending)
//
//                 await this.click(selector.admin.products.product.saveDraft)
//
//                 let pendingProductCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//                 expect(pendingProductCreateSuccessMessage).toMatch(data.product.pendingProductUpdateSuccessMessage)
//                 break
//
//             default:
//                 break
//         }
//
//     }
//
//     // Admin Add Variable Product
//     async addVariableProduct(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New Variable Product
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//
//
//         // Add Attributes
//
//         await this.click(selector.admin.products.product.attributes)
//
//         await this.select(selector.admin.products.product.customProductAttribute, `pa_${product.attribute}`)
//
//         await this.click(selector.admin.products.product.addAttribute)
//
//         await this.click(selector.admin.products.product.selectAll)
//         await this.click(selector.admin.products.product.usedForVariations)
//
//         await this.click(selector.admin.products.product.saveAttributes)
//
//
//         // Add Variations
//         await this.click(selector.admin.products.product.variations)
//         await this.wait(6)
//         await this.select(selector.admin.products.product.addVariations, product.variations.linkAllVariation)
//
//         await this.alert('accept')
//         await this.click(selector.admin.products.product.go)
//
//         await this.wait(6)
//         await this.select(selector.admin.products.product.addVariations, product.variations.variableRegularPrice)
//
//         await this.click(selector.admin.products.product.go)
//         await this.alertWithValue(120) // Don't work
//
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//         // Publish
//         await this.click(selector.admin.products.product.publish)
//
//         let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//         expect(productCreateSuccessMessage).toMatch(data.product.publishSuccessMessage)
//     }
//
//     // Admin Add Simple Subscription Product
//     async addSimpleSubscription(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New Simple Subscription
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//         await this.type(selector.admin.products.product.subscriptionPrice, product.subscriptionPrice())
//         await this.select(selector.admin.products.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval)
//         await this.select(selector.admin.products.product.subscriptionPeriod, product.subscriptionPeriod)
//         await this.select(selector.admin.products.product.expireAfter, product.expireAfter)
//         await this.type(selector.admin.products.product.subscriptionTrialLength, product.subscriptionTrialLength)
//         await this.select(selector.admin.products.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod)
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//         // Publish
//         await this.click(selector.admin.products.product.publish)
//
//
//         let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//         expect(productCreateSuccessMessage).toMatch(data.product.publishSuccessMessage)
//     }
//
//     // Admin Add External Product
//     async addExternalProduct(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New External Product
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//         await this.type(selector.admin.products.product.productUrl, await this.getBaseUrl() + product.productUrl)
//         await this.type(selector.admin.products.product.buttonText, product.buttonText)
//         await this.type(selector.admin.products.product.regularPrice, product.regularPrice())
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//         // Publish
//         await this.click(selector.admin.products.product.publish)
//
//
//         let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//         expect(productCreateSuccessMessage).toMatch(data.product.publishSuccessMessage)
//     }
//
//     // Admin Add Dokan Subscription Product
//     async addDokanSubscription(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New Dokan Subscription Product
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//         await this.type(selector.admin.products.product.regularPrice, product.regularPrice())
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Subscription Details
//         await this.type(selector.admin.products.product.numberOfProducts, product.numberOfProducts)
//         await this.type(selector.admin.products.product.packValidity, product.packValidity)
//         await this.type(selector.admin.products.product.advertisementSlot, product.advertisementSlot)
//         await this.type(selector.admin.products.product.expireAfterDays, product.expireAfterDays)
//         await this.click(selector.admin.products.product.recurringPayment)
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//         // Publish
//         await this.click(selector.admin.products.product.publish)
//
//
//         let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//         expect(productCreateSuccessMessage).toMatch(data.product.publishSuccessMessage)
//     }
//
//     // Admin Add Auction Product
//     async addAuctionProduct(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New Auction Product
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//         await this.select(selector.admin.products.product.itemCondition, product.itemCondition)
//         await this.select(selector.admin.products.product.auctionType, product.auctionType)
//         await this.type(selector.admin.products.product.startPrice, product.regularPrice())
//         await this.type(selector.admin.products.product.bidIncrement, product.bidIncrement())
//         await this.type(selector.admin.products.product.reservedPrice, product.reservedPrice())
//         await this.type(selector.admin.products.product.buyItNowPrice, product.buyItNowPrice())
//         await this.type(selector.admin.products.product.auctionDatesFrom, product.startDate)
//         await this.type(selector.admin.products.product.auctionDatesTo, product.endDate)
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//         // Publish
//         await this.click(selector.admin.products.product.publish)
//
//
//         let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//         expect(productCreateSuccessMessage).toMatch(product.publishSuccessMessage)
//     }
//
//     // Admin Add Booking Product
//     async addBookingProduct(product) {
//         await this.hover(selector.admin.aDashboard.products)
//         await this.click(selector.admin.products.addNewMenu)
//
//         // Add New Booking Product
//         // Name
//         await this.type(selector.admin.products.product.productName, product.productName())
//         await this.select(selector.admin.products.product.productType, product.productType)
//         await this.select(selector.admin.products.product.bookingDurationType, product.bookingDurationType)
//         await this.clearAndType(selector.admin.products.product.bookingDurationMax, product.bookingDurationMax)
//         await this.select(selector.admin.products.product.calendarDisplayMode, product.calendarDisplayMode)
//         // Costs
//         await this.click(selector.admin.products.product.bookingCosts)
//
//         await this.clearAndType(selector.admin.products.product.baseCost, product.baseCost)
//         await this.clearAndType(selector.admin.products.product.blockCost, product.blockCost)
//         // Category
//         await this.click(selector.admin.products.product.category(product.category))
//         // Vendor Store Name
//         await this.selectByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameOptions, product.storeName)
//         await this.scrollToTop()
//
//         // Publish
//         await this.click(selector.admin.products.product.publish)
//
//
//         let productCreateSuccessMessage = await this.getElementText(selector.admin.products.product.updatedSuccessMessage)
//         expect(productCreateSuccessMessage).toMatch(product.publishSuccessMessage)
//     }
//
//     // Admin Update Product Stock Status
//     async editStockStatus(status) {
//         await this.click(selector.admin.products.product.inventory)
//         await this.select(selector.admin.products.product.stockStatus, status)
//     }
//
//
//     // Wholesale Customer
//
//     // Admin Approve Wholesale Request
//     async adminApproveWholesaleRequest(customer) {
//         await this.hover(selector.admin.aDashboard.dokan)
//         await this.click(selector.admin.dokan.wholesaleCustomerMenu)
//         await this.click(selector.admin.dokan.wholesaleCustomer.statusSlider)
//         // await this.wait(5)
//
//         let enableStatusSuccessMessage = await this.getElementText(selector.admin.dokan.wholesaleCustomer.enableStatusUpdateSuccessMessage)
//         expect(enableStatusSuccessMessage).toMatch(data.wholesale.wholesaleCapabilityActivate)
//     }
//
//     async getOrderDetails(orderNumber) {
//         let subMenuOpened = await this.getElementClassValue(selector.admin.aDashboard.dokanMenu)
//         if (subMenuOpened.includes('opensub')) {
//             await this.hover(selector.admin.aDashboard.dokan)
//             await this.click(selector.admin.dokan.reportsMenu)
//         } else {
//             await this.click(selector.admin.dokan.reportsMenu)
//
//         }
//         await this.click(selector.admin.dokan.reports.allLogs)
//
//         await this.type(selector.admin.dokan.reports.searchByOrder, orderNumber)
//
//
//         let aOrderDetails = {
//             orderNumber: (await this.getElementText(selector.admin.dokan.reports.orderId)).split('#')[1],
//             store: await this.getElementText(selector.admin.dokan.reports.store),
//             orderTotal: helpers.price(await this.getElementText(selector.admin.dokan.reports.orderTotal)),
//             vendorEarning: helpers.price(await this.getElementText(selector.admin.dokan.reports.vendorEarning)),
//             commission: helpers.price(await this.getElementText(selector.admin.dokan.reports.commission)),
//             gatewayFee: helpers.price(await this.getElementText(selector.admin.dokan.reports.gatewayFee)),
//             shippingCost: helpers.price(await this.getElementText(selector.admin.dokan.reports.shippingCost)),
//             tax: helpers.price(await this.getElementText(selector.admin.dokan.reports.tax)),
//             orderStatus: await this.getElementText(selector.admin.dokan.reports.orderStatus),
//             orderDate: await this.getElementText(selector.admin.dokan.reports.orderDate),
//         }
//         return aOrderDetails
//     }
//
//     // Get Total Admin Commission from Admin Dashboard
//     async getTotalAdminCommission() {
//         await this.hover(selector.admin.aDashboard.dokan)
//         await this.click(selector.admin.dokan.dashboardMenu)
//
//         let totalAdminCommission = helpers.price(await this.getElementText(selector.admin.dokan.dashboard.commissionEarned))
//         return totalAdminCommission
//     }
//
//     // Admin Approve Return Request
//     async approveRefundRequest(orderNumber, approve = false) {
//         await this.searchRefundRequest(orderNumber)
//
//         await this.hover(selector.admin.dokan.refunds.refundCell(orderNumber))
//         if (approve) {
//             await this.click(selector.admin.dokan.refunds.approveRefund(orderNumber))
//         } else {
//             await this.click(selector.admin.dokan.refunds.cancelRefund(orderNumber))
//         }
//
//
//         let refundRequestIsVisible = await this.isVisible(selector.admin.dokan.refunds.refundCell(orderNumber))
//         expect(refundRequestIsVisible).toBe(false)
//     }
//
//     // Search Refund Request
//     async searchRefundRequest(orderNumber) {
//         await this.hover(selector.admin.aDashboard.dokan)
//         await this.click(selector.admin.dokan.refundsMenu)
//
//         // Search Refund Request
//         await this.type(selector.admin.dokan.refunds.searchRefund, orderNumber)
//         // await this.press(data.key.enter)
//
//
//         await this.waitForSelector(selector.admin.dokan.refunds.refundCell(orderNumber))
//         let searchedRefundRequestIsVisible = await this.isVisible(selector.admin.dokan.refunds.refundCell(orderNumber))
//         expect(searchedRefundRequestIsVisible).toBe(true)
//     }
//
//
//     // Dokan Setup Wizard
//
//     // Admin Set Dokan Setup Wizard
//     async setDokanSetupWizard(dokanSetupWizard) {
//         await this.hover(selector.admin.aDashboard.dokan)
//         await this.click(selector.admin.dokan.toolsMenu)
//
//         // Open Dokan Setup Wizard
//         await this.click(selector.admin.dokan.tools.openSetupWizard)
//
//         await this.click(selector.admin.dokan.dokanSetupWizard.letsGo)
//         // Store
//         await this.clearAndType(selector.admin.dokan.dokanSetupWizard.vendorStoreURL, dokanSetupWizard.vendorStoreURL)
//         await this.click(selector.admin.dokan.dokanSetupWizard.shippingFeeRecipient)
//         await this.setDropdownOptionSpan(selector.admin.dokan.dokanSetupWizard.shippingFeeRecipientValues, dokanSetupWizard.shippingFeeRecipient)
//         await this.click(selector.admin.dokan.dokanSetupWizard.taxFeeRecipient)
//         await this.setDropdownOptionSpan(selector.admin.dokan.dokanSetupWizard.taxFeeRecipientValues, dokanSetupWizard.taxFeeRecipient)
//         await this.click(selector.admin.dokan.dokanSetupWizard.mapApiSource)
//         await this.setDropdownOptionSpan(selector.admin.dokan.dokanSetupWizard.mapApiSource, dokanSetupWizard.mapApiSource)
//         await this.clearAndType(selector.admin.dokan.dokanSetupWizard.googleMapApiKey, dokanSetupWizard.googleMapApiKey)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.shareEssentialsOff)
//         await this.click(selector.admin.dokan.dokanSetupWizard.sellingProductTypes)
//         await this.setDropdownOptionSpan(selector.admin.dokan.dokanSetupWizard.sellingProductTypes, dokanSetupWizard.sellingProductTypes)
//         await this.click(selector.admin.dokan.dokanSetupWizard.continue)
//         // await this.click(selector.admin.dokan.dokanSetupWizard.skipThisStep)
//
//         // Selling
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.newVendorEnableSelling)
//         await this.click(selector.admin.dokan.dokanSetupWizard.commissionType)
//         await this.setDropdownOptionSpan(selector.admin.dokan.dokanSetupWizard.commissionTypeValues, dokanSetupWizard.commissionTypeValues)
//         await this.clearAndType(selector.admin.dokan.dokanSetupWizard.adminCommission, dokanSetupWizard.adminCommission)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusChange)
//         await this.click(selector.admin.dokan.dokanSetupWizard.continue)
//         // await this.click(selector.admin.dokan.dokanSetupWizard.skipThisStep)
//         // Withdraw
//         // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.payPal)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.bankTransfer)
//         // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.wirecard)
//         // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.stripe)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.custom)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.skrill)
//         await this.clearAndType(selector.admin.dokan.dokanSetupWizard.minimumWithdrawLimit, dokanSetupWizard.minimumWithdrawLimit)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusForWithdrawCompleted)
//         await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusForWithdrawProcessing)
//         await this.click(selector.admin.dokan.dokanSetupWizard.continue)
//         // Recommended
//         await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.wooCommerceConversionTracking)
//         await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.weMail)
//         await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.texty)
//         await this.click(selector.admin.dokan.dokanSetupWizard.continueRecommended)
//         // Ready!
//         await this.click(selector.admin.dokan.dokanSetupWizard.visitDokanDashboard)
//
//         await this.waitForSelector(selector.admin.dokan.dashboard.dashboardText)
//         let dashboardTextIsVisible = await this.isVisible(selector.admin.dokan.dashboard.dashboardText)
//         expect(dashboardTextIsVisible).toBe(true)
//     }
//
//     // Dokan Modules
//
//     // Module Activation Check
//     async checkActiveModules() {
//         await this.hover(selector.admin.aDashboard.dokan)
//         await this.click(selector.admin.dokan.modulesMenu)
//
//         await this.click(selector.admin.dokan.modules.inActive)
//
//
//         let noModulesMessage = await this.isVisible(selector.admin.dokan.modules.noModulesFound)
//         if (noModulesMessage) {
//             let noModulesMessageText = await this.getElementText(selector.admin.dokan.modules.noModulesFound)
//             expect(noModulesMessageText).toMatch(data.module.noModuleMessage)
//         } else {
//             let inActiveModuleNames = await this.getMultipleElementTexts(selector.admin.dokan.modules.moduleName)
//             throw new Error("Inactive modules: " + inActiveModuleNames)
//         }
//     }
}
