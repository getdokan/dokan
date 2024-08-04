import { test as base } from '@playwright/test';
import { AbuseReportsPage } from '@pages/abuseReportsPage';
import { AdminDashboardPage } from '@pages/adminDashboardPage';
import { AdminPage } from '@pages/adminPage';
import { AnnouncementsPage } from '@pages/announcementsPage';
import { CatalogModePage } from '@pages/catalogModePage';
import { ColorsPage } from '@pages/colorsPage';
import { CouponsPage } from '@pages/couponsPage';
import { CustomerPage } from '@pages/customerPage';
import { EmailVerificationsPage } from '@pages/emailVerificationsPage';
import { EuCompliancePage } from '@pages/euCompliancePage';
import { FollowStorePage } from '@pages/followStorePage';
import { HelpPage } from '@pages/helpPage';
import { LicensePage } from '@pages/licensePage';
import { LocalSetupPage } from '@pages/localSetupPage';
import { LoginPage } from '@pages/loginPage';
import { MenuManagerPage } from '@pages/menuManagerPage';
import { ModulesPage } from '@pages/modulesPage';
import { MyOrdersPage } from '@pages/myOrdersPage';
import { NoticeAndPromotionPage } from '@pages/noticeAndPromotionPage';
import { OrdersPage } from '@pages/ordersPage';
import { PaymentsPage } from '@pages/paymentsPage';
import { PluginPage } from '@pages/pluginPage';
import { PrivacyPolicyPage } from '@pages/privacyPolicyPage';
import { ProductAddonsPage } from '@pages/productAddonsPage';
import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
import { ProductEnquiryPage } from '@pages/productEnquiryPage';
import { ProductQAPage } from '@pages/productQAPage';
import { ProductReviewsPage } from '@pages/productReviewsPage';
import { ProductsPage } from '@pages/productsPage';
import { RefundsPage } from '@pages/refundsPage';
import { ReportsPage } from '@pages/reportsPage';
import { RequestForQuotationsPage } from '@pages/requestForQuotationsPage';
import { ReverseWithdrawsPage } from '@pages/reverseWithdrawsPage';
import { SellerBadgesPage } from '@pages/sellerBadgesPage';
import { SettingPage } from '@pages/settingPage';
import { SettingsPage } from '@pages/settingsPage';
import { ShippingPage } from '@pages/shippingPage';
import { ShopPage } from '@pages/shopPage';
import { ShortcodePage } from '@pages/shortcodePage';
import { SingleProductPage } from '@pages/singleProductPage';
import { SingleStorePage } from '@pages/singleStorePage';
import { SpmvPage } from '@pages/spmvPage';
import { StoreAppearance } from '@pages/storeAppearance';
import { StoreCategoriesPage } from '@pages/storeCategoriesPage';
import { StoreListingPage } from '@pages/storeListingPage';
import { StoreReviewsPage } from '@pages/storeReviewsPage';
import { StoresPage } from '@pages/storesPage';
import { StoreSupportsPage } from '@pages/storeSupportsPage';
import { TaxPage } from '@pages/taxPage';
import { ToolsPage } from '@pages/toolsPage';
import { VendorAnalyticsPage } from '@pages/vendorAnalyticsPage';
import { AuctionsPage } from '@pages/vendorAuctionsPage';
import { BookingPage } from '@pages/vendorBookingPage';
import { VendorDashboardPage } from '@pages/vendorDashboardPage';
import { VendorDeliveryTimePage } from '@pages/vendorDeliveryTimePage';
import { VendorPage } from '@pages/vendorPage';
import { VendorProductSubscriptionPage } from '@pages/vendorProductSubscriptionPage';
import { VendorReportsPage } from '@pages/vendorReportsPage';
import { VendorReturnRequestPage } from '@pages/vendorReturnRequestPage';
import { VendorSettingsPage } from '@pages/vendorSettingsPage';
import { VendorShippingPage } from '@pages/vendorShippingPage';
import { VendorStaffPage } from '@pages/vendorStaffPage';
import { VendorToolsPage } from '@pages/vendorToolsPage';
import { VendorVerificationsPage } from '@pages/vendorVerificationsPage';
import { VisualPage } from '@pages/visualPage';
import { WholesaleCustomersPage } from '@pages/wholesaleCustomersPage';
import { WithdrawsPage } from '@pages/withdrawsPage';

// types of pages
type pages = {
    abuseReportsPage: AbuseReportsPage;
    adminDashboardPage: AdminDashboardPage;
    adminPage: AdminPage;
    announcementsPage: AnnouncementsPage;
    catalogModePage: CatalogModePage;
    colorsPage: ColorsPage;
    couponsPage: CouponsPage;
    customerPage: CustomerPage;
    emailVerificationsPage: EmailVerificationsPage;
    euCompliancePage: EuCompliancePage;
    followStorePage: FollowStorePage;
    helpPage: HelpPage;
    licensePage: LicensePage;
    localSetupPage: LocalSetupPage;
    loginPage: LoginPage;
    menuManagerPage: MenuManagerPage;
    modulesPage: ModulesPage;
    myOrdersPage: MyOrdersPage;
    noticeAndPromotionPage: NoticeAndPromotionPage;
    ordersPage: OrdersPage;
    paymentsPage: PaymentsPage;
    pluginPage: PluginPage;
    privacyPolicyPage: PrivacyPolicyPage;
    productAddonsPage: ProductAddonsPage;
    productAdvertisingPage: ProductAdvertisingPage;
    productEnquiryPage: ProductEnquiryPage;
    productQAPage: ProductQAPage;
    productReviewsPage: ProductReviewsPage;
    productsPage: ProductsPage;
    refundsPage: RefundsPage;
    reportsPage: ReportsPage;
    requestForQuotationsPage: RequestForQuotationsPage;
    reverseWithdrawsPage: ReverseWithdrawsPage;
    sellerBadgesPage: SellerBadgesPage;
    settingPage: SettingPage;
    settingsPage: SettingsPage;
    shippingPage: ShippingPage;
    shopPage: ShopPage;
    shortcodePage: ShortcodePage;
    singleProductPage: SingleProductPage;
    singleStorePage: SingleStorePage;
    spmvPage: SpmvPage;
    storeAppearance: StoreAppearance;
    storeCategoriesPage: StoreCategoriesPage;
    storeListingPage: StoreListingPage;
    storeReviewsPage: StoreReviewsPage;
    storesPage: StoresPage;
    storeSupportsPage: StoreSupportsPage;
    taxPage: TaxPage;
    toolsPage: ToolsPage;
    VendorAnalyticsPage: VendorAnalyticsPage;
    auctionsPage: AuctionsPage;
    bookingPage: BookingPage;
    vendorDashboardPage: VendorDashboardPage;
    vendorDeliveryTimePage: VendorDeliveryTimePage;
    vendorPage: VendorPage;
    vendorProductSubscriptionPage: VendorProductSubscriptionPage;
    vendorReportsPage: VendorReportsPage;
    vendorReturnRequestPage: VendorReturnRequestPage;
    vendorSettingsPage: VendorSettingsPage;
    vendorShippingPage: VendorShippingPage;
    vendorStaffPage: VendorStaffPage;
    vendorToolsPage: VendorToolsPage;
    vendorVerificationsPage: VendorVerificationsPage;
    visualPage: VisualPage;
    wholesaleCustomersPage: WholesaleCustomersPage;
    withdrawsPage: WithdrawsPage;
};

export const test = base.extend<pages>({
    abuseReportsPage: async ({ page }, use) => {
        await use(new AbuseReportsPage(page));
    },

    adminDashboardPage: async ({ page }, use) => {
        await use(new AdminDashboardPage(page));
    },

    adminPage: async ({ page }, use) => {
        await use(new AdminPage(page));
    },

    announcementsPage: async ({ page }, use) => {
        await use(new AnnouncementsPage(page));
    },

    catalogModePage: async ({ page }, use) => {
        await use(new CatalogModePage(page));
    },

    colorsPage: async ({ page }, use) => {
        await use(new ColorsPage(page));
    },

    couponsPage: async ({ page }, use) => {
        await use(new CouponsPage(page));
    },

    customerPage: async ({ page }, use) => {
        await use(new CustomerPage(page));
    },

    emailVerificationsPage: async ({ page }, use) => {
        await use(new EmailVerificationsPage(page));
    },

    euCompliancePage: async ({ page }, use) => {
        await use(new EuCompliancePage(page));
    },

    followStorePage: async ({ page }, use) => {
        await use(new FollowStorePage(page));
    },

    helpPage: async ({ page }, use) => {
        await use(new HelpPage(page));
    },

    licensePage: async ({ page }, use) => {
        await use(new LicensePage(page));
    },

    localSetupPage: async ({ page }, use) => {
        await use(new LocalSetupPage(page));
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    menuManagerPage: async ({ page }, use) => {
        await use(new MenuManagerPage(page));
    },

    modulesPage: async ({ page }, use) => {
        await use(new ModulesPage(page));
    },

    myOrdersPage: async ({ page }, use) => {
        await use(new MyOrdersPage(page));
    },

    noticeAndPromotionPage: async ({ page }, use) => {
        await use(new NoticeAndPromotionPage(page));
    },

    ordersPage: async ({ page }, use) => {
        await use(new OrdersPage(page));
    },

    paymentsPage: async ({ page }, use) => {
        await use(new PaymentsPage(page));
    },

    pluginPage: async ({ page }, use) => {
        await use(new PluginPage(page));
    },

    privacyPolicyPage: async ({ page }, use) => {
        await use(new PrivacyPolicyPage(page));
    },

    productAddonsPage: async ({ page }, use) => {
        await use(new ProductAddonsPage(page));
    },

    productAdvertisingPage: async ({ page }, use) => {
        await use(new ProductAdvertisingPage(page));
    },

    productEnquiryPage: async ({ page }, use) => {
        await use(new ProductEnquiryPage(page));
    },

    productQAPage: async ({ page }, use) => {
        await use(new ProductQAPage(page));
    },

    productReviewsPage: async ({ page }, use) => {
        await use(new ProductReviewsPage(page));
    },

    productsPage: async ({ page }, use) => {
        await use(new ProductsPage(page));
    },

    refundsPage: async ({ page }, use) => {
        await use(new RefundsPage(page));
    },

    reportsPage: async ({ page }, use) => {
        await use(new ReportsPage(page));
    },

    requestForQuotationsPage: async ({ page }, use) => {
        await use(new RequestForQuotationsPage(page));
    },

    reverseWithdrawsPage: async ({ page }, use) => {
        await use(new ReverseWithdrawsPage(page));
    },

    sellerBadgesPage: async ({ page }, use) => {
        await use(new SellerBadgesPage(page));
    },

    settingPage: async ({ page }, use) => {
        await use(new SettingPage(page));
    },

    settingsPage: async ({ page }, use) => {
        await use(new SettingsPage(page));
    },

    shippingPage: async ({ page }, use) => {
        await use(new ShippingPage(page));
    },

    shopPage: async ({ page }, use) => {
        await use(new ShopPage(page));
    },

    shortcodePage: async ({ page }, use) => {
        await use(new ShortcodePage(page));
    },

    singleProductPage: async ({ page }, use) => {
        await use(new SingleProductPage(page));
    },

    singleStorePage: async ({ page }, use) => {
        await use(new SingleStorePage(page));
    },

    spmvPage: async ({ page }, use) => {
        await use(new SpmvPage(page));
    },

    storeAppearance: async ({ page }, use) => {
        await use(new StoreAppearance(page));
    },

    storeCategoriesPage: async ({ page }, use) => {
        await use(new StoreCategoriesPage(page));
    },

    storeListingPage: async ({ page }, use) => {
        await use(new StoreListingPage(page));
    },

    storeReviewsPage: async ({ page }, use) => {
        await use(new StoreReviewsPage(page));
    },

    storesPage: async ({ page }, use) => {
        await use(new StoresPage(page));
    },

    storeSupportsPage: async ({ page }, use) => {
        await use(new StoreSupportsPage(page));
    },

    taxPage: async ({ page }, use) => {
        await use(new TaxPage(page));
    },

    toolsPage: async ({ page }, use) => {
        await use(new ToolsPage(page));
    },

    VendorAnalyticsPage: async ({ page }, use) => {
        await use(new VendorAnalyticsPage(page));
    },

    auctionsPage: async ({ page }, use) => {
        await use(new AuctionsPage(page));
    },

    bookingPage: async ({ page }, use) => {
        await use(new BookingPage(page));
    },

    vendorDashboardPage: async ({ page }, use) => {
        await use(new VendorDashboardPage(page));
    },

    vendorDeliveryTimePage: async ({ page }, use) => {
        await use(new VendorDeliveryTimePage(page));
    },

    vendorPage: async ({ page }, use) => {
        await use(new VendorPage(page));
    },

    vendorProductSubscriptionPage: async ({ page }, use) => {
        await use(new VendorProductSubscriptionPage(page));
    },

    vendorReportsPage: async ({ page }, use) => {
        await use(new VendorReportsPage(page));
    },

    vendorReturnRequestPage: async ({ page }, use) => {
        await use(new VendorReturnRequestPage(page));
    },

    vendorSettingsPage: async ({ page }, use) => {
        await use(new VendorSettingsPage(page));
    },

    vendorShippingPage: async ({ page }, use) => {
        await use(new VendorShippingPage(page));
    },

    vendorStaffPage: async ({ page }, use) => {
        await use(new VendorStaffPage(page));
    },

    vendorToolsPage: async ({ page }, use) => {
        await use(new VendorToolsPage(page));
    },

    vendorVerificationsPage: async ({ page }, use) => {
        await use(new VendorVerificationsPage(page));
    },

    visualPage: async ({ page }, use) => {
        await use(new VisualPage(page));
    },

    wholesaleCustomersPage: async ({ page }, use) => {
        await use(new WholesaleCustomersPage(page));
    },

    withdrawsPage: async ({ page }, use) => {
        await use(new WithdrawsPage(page));
    },

});

export { expect, request, Page } from '@playwright/test';


// export const test = testpage;
// export const expect = testpage.expect;