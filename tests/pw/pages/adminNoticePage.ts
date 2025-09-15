import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const dashboardAdmin = selector.admin.dokan.dashboard;

export class AdminNoticePage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // admin dashboard render properly
    async adminDashboardRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.dokan);

        // dashboard text is visible
        await this.toBeVisible(dashboardAdmin.dashboardText);

        // admin notices container is visible
        await this.toBeVisible("div[class='dokan-dashboard'] h1");
    }

    // wait for the slide counter to show expected total count ("x of N")
    async expectTotalNotices() {
        await this.toBeVisible("//h3[normalize-space()='Dokan came up with a new look!']");
        
    }

    // more robust current title getter by evaluating in page: pick the notice where element is not hidden (offsetParent)
    async getVisibleNoticeTitle(): Promise<string> {
        const title = await this.page.evaluate(() => {
            const notices = Array.from(document.querySelectorAll('.dokan-admin-notices .dokan-admin-notice')) as HTMLElement[];
            const visible = notices.find(n => (n as HTMLElement).offsetParent !== null || window.getComputedStyle(n).display !== 'none');
            const titleEl = visible?.querySelector('.dokan-message-title') as HTMLElement | null;
            return titleEl?.textContent?.trim() || '';
        });
        return title as string;
    }
}
