import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const dashboardAdmin = selector.admin.dokan.dashboard;

export class AdminDashboardPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // Navigate to Dokan Dashboard
    async goToDokanDashboard() {
        await this.goIfNotThere(data.subUrls.backend.dokan.dokanNew);
        await this.page.waitForLoadState('networkidle');
    }

    // Check if dashboard loads properly
    async adminDashboardRenderProperly() {
        await this.goToDokanDashboard();
        
        // Wait for page to be fully loaded
        await this.page.waitForLoadState('networkidle');
        
        // Check if dashboard title is visible
        await this.toBeVisible("//h1[normalize-space()='Dashboard']");
        
        await this.toBeVisible("//h3[normalize-space()='To-Do']");

        await this.toBeVisible("//div[contains(text(),'Vendor Approvals')]");

        await this.toBeVisible("//div[contains(text(),'Product Approvals')]");

        await this.toBeVisible("//div[contains(text(),'Pending Withdrawals')]");

        await this.toBeVisible("//div[contains(text(),'Pending Verifications')]");

        await this.toBeVisible("//div[contains(text(),'Open Support Tickets')]");

        await this.toBeVisible("//div[contains(text(),'Return Requests')]");

        await this.toBeVisible("//div[contains(text(),'Product Q&A Inquiries')]");

        await this.toBeVisible("//div[contains(text(),'Pending Quotes')]");

        await this.toBeVisible("//h3[normalize-space()='Analytics']");

        await this.toBeVisible("//div[contains(text(),'Sales Overview')]");

        await this.toBeVisible("(//button[contains(@class,'inline-flex items-center')])[1]");

        await this.toBeVisible("//div[contains(text(),'Revenue Insight')]");

        await this.toBeVisible("(//button[contains(@class,'inline-flex items-center')])[2]");

        await this.toBeVisible("(//h3[contains(@class,'font-semibold text-base')])[3]");    

        await this.toBeVisible("//span[normalize-space(text())='New Products']");

        await this.toBeVisible("//span[normalize-space(text())='Active Vendors']");

        await this.toBeVisible("//span[normalize-space(text())='New Vendor Registration']");

        await this.toBeVisible("//span[normalize-space(text())='New Customers']");

        await this.toBeVisible("//span[normalize-space(text())='Recurring Customers']");

        await this.toBeVisible("//span[normalize-space(text())='Refunds']");

        await this.toBeVisible("//span[normalize-space(text())='Reviews']");

        await this.toBeVisible("//span[normalize-space(text())='Order Cancellation Rate']");

        await this.toBeVisible("//span[normalize-space(text())='Support Tickets']");

        await this.toBeVisible("//span[normalize-space(text())='Abuse Reports']");

        await this.toBeVisible("//h3[normalize-space(text())='Daily Sales Chart']");

        await this.toBeVisible("//h3[normalize-space()='Monthly Overview']");

        await this.toBeVisible("(//span[@class='text-sm font-medium'])[1]");

        await this.toBeVisible("(//span[@class='text-sm font-medium'])[2]");

        await this.toBeVisible("(//span[@class='text-sm font-medium'])[3]");

        await this.toBeVisible("//h3[normalize-space(text())='Vendor Metrics']");   

        await this.toBeVisible("//span[normalize-space(text())='Verified Vendors']");

        await this.toBeVisible("//span[normalize-space(text())='Subscribed Vendors']");

        await this.toBeVisible("//span[normalize-space(text())='Vendor on Vacation']");

        await this.toBeVisible("//h3[normalize-space(text())='All-Time Marketplace Stats']");

        await this.toBeVisible("//span[normalize-space(text())='Total Products']");

        await this.toBeVisible("//span[normalize-space(text())='Total Vendors']");

        await this.toBeVisible("//span[normalize-space(text())='Total Customers']"); 

        await this.toBeVisible("//span[normalize-space(text())='Total Orders']");

        await this.toBeVisible("//span[@class='text-black font-semibold text-sm'][normalize-space()='Total Sales']");

        await this.toBeVisible("//span[normalize-space()='Total Commissions']");
        
        await this.toBeVisible("//h3[normalize-space()='Top Performing Vendors']");

        // Replace this line:
        await this.toBeVisible("//div[@class='top-vendors-table relative overflow-x-auto shadow-md sm:rounded-lg bg-white']//th[1]");

        await this.toBeVisible("//h3[normalize-space()='Most Reviewed Products']");

        await this.toBeVisible("//h3[normalize-space()='Most Reported Vendors']");

        await this.toBeVisible("//a[normalize-space()='Click Here']");

    }

    // Check "At a Glance" values accuracy
    async dokanAtAGlanceValueAccuracy(atAGlanceValues: any) {
        await this.goToDokanDashboard();
        await this.page.waitForLoadState('networkidle');
        
        // Wait for the "At a Glance" section to be visible
        await this.toBeVisible(dashboardAdmin.atAGlance.atAGlance);
        
        // Get and verify net sales value
        const netSales = await this.getElementText(dashboardAdmin.atAGlance.netSalesThisMonth);
        expect(netSales).toBeDefined();
        
        // Get and verify commission earned value
        const commissionEarned = await this.getElementText(dashboardAdmin.atAGlance.commissionEarned);
        expect(commissionEarned).toBeDefined();
        
        // Get and verify signup this month value
        const signupThisMonth = await this.getElementText(dashboardAdmin.atAGlance.signupThisMonth);
        expect(signupThisMonth).toBeDefined();
        
        // Get and verify vendor awaiting approval value
        const vendorAwaitingApproval = await this.getElementText(dashboardAdmin.atAGlance.vendorAwaitingApproval);
        expect(vendorAwaitingApproval).toBeDefined();
        
        // Get and verify product created this month value
        const productCreatedThisMonth = await this.getElementText(dashboardAdmin.atAGlance.productCreatedThisMonth);
        expect(productCreatedThisMonth).toBeDefined();
        
        // Get and verify withdraw awaiting approval value
        const withdrawAwaitingApproval = await this.getElementText(dashboardAdmin.atAGlance.withdrawAwaitingApproval);
        expect(withdrawAwaitingApproval).toBeDefined();
        
        // Log the received values for debugging
        console.log('Received atAGlanceValues:', atAGlanceValues);
    }

    // Add Dokan news subscriber
    async addDokanNewsSubscriber(userDetails: any) {
        await this.goToDokanDashboard();
        await this.page.waitForLoadState('networkidle');
        
        // Wait for subscribe box to be visible
        await this.toBeVisible(dashboardAdmin.subscribeBox.subscribeBox);
        
        // Fill in subscriber name
        await this.clearAndType(dashboardAdmin.subscribeBox.subscriberName, userDetails.name());
        
        // Fill in subscriber email
        await this.clearAndType(dashboardAdmin.subscribeBox.subscriberEmail, userDetails.email());
        
        // Click subscribe button and wait for response
        await this.clickAndWaitForResponse(data.subUrls.backend.dokan.subscribe, dashboardAdmin.subscribeBox.subscribeButton, 302);
        
        // Verify thank you message appears
        await this.toContainText(dashboardAdmin.subscribeBox.thankYouMessage, 'Thank you for subscribing!');
    }
}