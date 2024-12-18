import { test, Page } from '@playwright/test';
import { VisualPage } from '@pages/visualPage';
import { data } from '@utils/testData';
import { selector } from '@pages/selectors';

test.describe('dokan visual test', () => {
    test.skip(true, 'skip visual tests');
    let admin: VisualPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VisualPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('dokan admin dashboard @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.dokan);
    });

    test('admin withdraw menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.withdraw);
    });

    test('admin reverse withdraw menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.reverseWithdraws);
    });

    test('admin add reverse withdrawal @visual', async () => {
        await admin.addReverseWithdrawal();
    });

    test('admin vendors menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.vendors);
    });

    test('admin can add vendor @visual', async () => {
        await admin.addVendor();
    });

    test('admin store category @visual', async () => {
        await admin.adminStoreCategoryRenderProperly();
    });

    test('dokan store reviews menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.storeReviews);
    });

    test('dokan store support menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.storeSupport);
    });

    test('dokan seller badge menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.sellerBadge);
    });

    test('admin can create seller badge @visual', async () => {
        await admin.createSellerBadge();
    });

    test('admin quotes menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.requestForQuote);
    });

    test('admin can add quote @visual', async () => {
        await admin.addQuote();
    });

    test('admin quote rules menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.requestForQuoteRules);
    });

    test('admin can add quote rule @visual', async () => {
        await admin.addQuoteRule();
    });

    test('dokan abuse report menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.abuseReports);
    });

    test('dokan announcements menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.announcements);
    });

    test('admin can add announcement @visual', async () => {
        await admin.addAnnouncement();
    });

    test('admin refunds menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.refunds);
    });

    test('admin reports menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.reports);
    });

    test('admin All Logs menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.allLogs);
    });

    test('dokan modules menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.modules);
    });

    test('dokan modules plan @visual', async () => {
        await admin.adminModulesPlanRenderProperly();
    });

    test('dokan tools menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.tools);
    });

    test('admin verifications menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.verifications);
    });

    test('dokan product advertising menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.productAdvertising);
    });

    test('admin can add product advertisement @visual', async () => {
        await admin.addNewProductAdvertisement();
    });

    test('dokan wholesale customers menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.wholeSaleCustomer);
    });

    test('dokan help menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.help);
    });

    test('dokan settings general menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.general);
    });

    test('dokan settings selling menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.sellingOptions);
    });

    test('dokan settings withdraw menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.withdrawOptions);
    });

    test('dokan settings reverseWithdraw menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.reverseWithdrawal);
    });

    test('dokan settings page menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.pageSettings);
    });

    test('dokan settings appearance menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.appearance);
    });

    test('dokan settings privacyPolicy menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.privacyPolicy);
    });

    test('dokan settings colors menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.colors);
    });

    test('dokan settings liveSearch menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.liveSearch);
    });

    test('dokan settings storeSupport menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.storeSupport);
    });

    test('dokan settings sellerVerification menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.vendorVerification);
    });

    test('dokan settings verificationSmsGateways menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.verificationSmsGateways);
    });

    test('dokan settings emailVerification menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.emailVerification);
    });

    test('dokan settings socialApi menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.socialApi);
    });

    test('dokan settings shippingStatus menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.shippingStatus);
    });

    test('dokan settings quote menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.quote);
    });

    test('dokan settings liveChat menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.liveChat);
    });

    test('dokan settings rma menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.rma);
    });

    test('dokan settings wholesale menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.wholesale);
    });

    test('dokan settings euComplianceFields menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.euComplianceFields);
    });

    test('dokan settings deliveryTime menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.deliveryTime);
    });

    test('dokan settings productAdvertising menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.productAdvertising);
    });

    test('dokan settings geolocation menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.geolocation);
    });

    test('dokan settings productReportAbuse menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.productReportAbuse);
    });

    test('dokan settings singleProductMultiVendor menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.singleProductMultiVendor);
    });

    test('dokan settings vendorSubscription menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.vendorSubscription);
    });

    test('dokan settings vendorAnalytics menu @visual', async () => {
        await admin.dokanSettingsMenu(selector.admin.dokan.settings.menus.vendorAnalytics);
    });

    test('dokan license menu @visual', async () => {
        await admin.dokanMenu(data.subUrls.backend.dokan.license);
    });
});
