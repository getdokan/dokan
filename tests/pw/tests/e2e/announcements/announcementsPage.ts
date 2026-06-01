import { Page, expect } from '@playwright/test';


import { toPath } from '@utils/helpers';

/**
 * Close Dokan Pro's vendor announcement modal whenever it appears.
 *
 * Inlined from utils/helpers.ts so this folder remains self-contained per
 * tests/pw/CONVENTIONS.md §4. The modal is rendered on every vendor
 * dashboard page in 5.0.0+ until the latest unread announcement is
 * dismissed, and blocks test interactions. Calling once per page installs
 * a `page.addLocatorHandler` that auto-dismisses thereafter.
 */
async function closeAnnouncementModal(page: Page): Promise<void> {
    const installed = '__dokanAnnouncementModalHandlerInstalled' as const;
    const pageWithFlag = page as Page & { [installed]?: boolean };

    if (!pageWithFlag[installed]) {
        pageWithFlag[installed] = true;
        const modal = page.locator('.vendor-announcement-modal');
        await page.addLocatorHandler(
            modal,
            async () => {
                const closeBtn = modal.locator('button[aria-label="Close"]').first();
                if (await closeBtn.isVisible().catch(() => false)) {
                    await closeBtn.click({ timeout: 2000 }).catch(() => undefined);
                } else {
                    await page.keyboard.press('Escape').catch(() => undefined);
                }
            },
            { noWaitAfter: true },
        ).catch(() => undefined);
    }

    try {
        const modal = page.locator('.vendor-announcement-modal').first();
        const visible = await modal.isVisible({ timeout: 500 }).catch(() => false);
        if (!visible) return;
        const closeBtn = modal.locator('button[aria-label="Close"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
            await closeBtn.click().catch(() => undefined);
        } else {
            await page.keyboard.press('Escape').catch(() => undefined);
        }
        await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    } catch {
        // Silent — keep the test moving even if the selector shape changes.
    }
}

export class AnnouncementsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors
    admin = {
        announcementsUrl: toPath(`wp-admin/admin.php?page=dokan#/announcement`),

        // Page Header
        announcementText: '.dokan-announcement-wrapper h1',
        addNewAnnouncement: '//button[normalize-space()="Add Announcement"]',

        // Nav Tabs
        navTabs: {
            all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
            published: '//ul[@class="subsubsub"]//li//a[contains(text(),"Published")]',
            pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
            scheduled: '//ul[@class="subsubsub"]//li//a[contains(text(),"Scheduled")]',
            draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
            trash: '//ul[@class="subsubsub"]//li//a[contains(text(),"Trash")]',
        },

        // Bulk Actions
        bulkActions: {
            selectAll: 'thead .manage-column input',
            selectAction: '.tablenav.top #bulk-action-selector-top',
            applyAction: '.tablenav.top .button.action',
        },

        // Table
        table: {
            announcementTable: '.dokan-announcement-wrapper table',
            titleColumn: 'thead th.title',
            contentColumn: 'thead th.content',
            sentToColumn: 'thead th.send_to',
            statusColumn: 'thead th.status',
            dateColumn: 'thead th.created_at',
        },

        noRowsFound: '//td[normalize-space()="No announcement found."]',
        announcementCell: (title: string) => `//a[contains(text(),'${title}')]/../..`,
        announcementCellPublished: (title: string) => `//strong[contains(text(),'${title}')]/../..`,
        announcementStatusPublished: (title: string) =>
            `//strong[contains(text(),'${title}')]/../..//td[@class="column status"]//span[@class="publish"]`,
        announcementStatusScheduled: (title: string) =>
            `//a[contains(text(),'${title}')]/../../..//td[@class="column status"]//span[@class="future"]`,
        // For draft items (title renders as <a>)
        announcementEdit: (title: string) => `//a[contains(text(),'${title}')]/../..//span[@class="edit"]`,
        // For published items (title renders as <strong>)
        announcementEditPublished: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="edit"]`,
        announcementDelete: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="trash"]`,
        announcementPermanentlyDelete: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="delete"]`,
        announcementRestore: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="restore"]`,

        // Add / Edit Announcement Form
        addAnnouncement: {
            title: '#titlediv input',
            contentIframe: '#postdivrich iframe',
            contentHtmlBody: '#tinymce',
            sendAnnouncementTo: '#announcement_sender_type',
            saveAsDraft: 'input.draft-btn',
            publish: 'input.publish-btn',

            schedule: {
                addSchedule: 'span#timestamp a',
                month: 'fieldset#timestampdiv label select',
                day: 'input#jj',
                year: 'input#aa',
                hour: 'input#hh',
                minute: 'input#mm',
                ok: '//button[normalize-space()="Ok"]',
                cancel: '//button[normalize-space()="Cancel"]',
            },
        },
    };

    // Admin New Dashboard Selectors
    adminNewDashboard = {
        announcementsUrl: toPath(`wp-admin/admin.php?page=dokan-dashboard#/announcement`),

        // Trash / Empty Trash
        trashTab: `//div[contains(text(),'Trash')]`,
        selectAllCheckbox: `#inspector-checkbox-control-1`,
        deletePermanently: `//span[normalize-space()='Delete Permanently']`,
        confirmDelete: `//button[normalize-space()='Delete']`,

        // Add Announcement Form
        addAnnouncement: {
            addButton: `button[name="Add Announcement"]`,
            addButtonSpan: `//span[normalize-space()='Add Announcement']`,
            title: `//input[@id='announcement-title']`,
            content: `//div[@class='ql-editor ql-blank']`,
            contentParagraph: `//div[@class='ql-editor ql-blank']//p`,
            draftRadio: `//input[@id='hs-default-radio-draft']`,
            scheduledRadio: `//input[@id='hs-default-radio-future']`,
            datePickerToggle: String.raw`span.inline-flex.h-full.items-center.rounded-bl.rounded-tl.bg-\[\#EAEAEA\].px-3.text-sm.text-\[\#4F4F4F\]`,
            createButton: `button[name="Create Announcement"]`,
            createButtonSpan: `//span[normalize-space()='Create Announcement']`,
            createButtonText: `Create Announcement`,
        },

        // Announcement List
        announcementTitle: (title: string) => `//div[contains(text(),'${title}')]`,
        // Scope status badge to the row that contains the given title — the
        // older nth-child positional selector breaks on any layout shift.
        announcementStatusBadgeForTitle: (title: string, status: string) =>
            `//tr[.//div[contains(text(),'${title}')]]//span[normalize-space()='${status}']`,

        // Row action button (3-dot menu) identified by the announcement title.
        // Excludes rows whose status cell contains "Trash" — when an
        // announcement of the same title was already trashed by a previous run
        // (or another test), DataViews shows both rows in the All view and the
        // unscoped XPath becomes ambiguous (strict-mode violation).
        rowActionButton: (title: string) =>
            `//tr[.//div[contains(text(),'${title}')] and not(.//*[normalize-space()='Trash'])]//button[@aria-label='Actions']`,
        moveToTrash: `//div[@role='menuitem'][normalize-space()='Move to Trash']`,
        confirmTrash: `//button[normalize-space()='Confirm']`,
    };

    // Vendor New Dashboard Selectors
    vendorNewDashboard = {
        // NOTE: hash route here is `#announcement` (no slash) which does NOT match
        // the working HashRouter route `#/announcement` used elsewhere; the detail
        // card never renders, so vendorViewAnnouncementInNewDashboard times out.
        announcementsUrl: toPath(`dashboard/new/#announcement`),

        // Vendor's new dashboard renders each announcement as an <article>
        // containing a <button> with three <p> children (title, description,
        // timestamp). Title used to be an <h3>; updated for the v5.0.0 layout.
        // Multiple rows can share the same title across reruns — pick the
        // first match.
        announcementCard: (title: string) =>
            `//article[.//p[normalize-space()='${title}']]//button`,
        // Detail panel heading — accept any of h1/h2/h3 with the title text,
        // since the new dashboard layout may use any of them across versions.
        announcementDetailTitle: (title: string) =>
            `//*[self::h1 or self::h2 or self::h3][normalize-space()='${title}']`,
    };

    // Vendor Selectors
    vendor = {
        announcementsUrl: toPath(`dashboard/announcement`),

        announcementDiv: '.dokan-announcement-wrapper-item',
        announcementDate: '.dokan-annnouncement-date',
        announcementHeading: '.dokan-announcement-heading',
        announcementContent: '.dokan-announcement-content',
        removeAnnouncement: '.remove_announcement',

        announcementLink: (title: string) =>
            `//div[@class="dokan-announcement-heading"]//h3[contains(text(),"${title}")]/..`,
        deleteAnnouncement: (title: string) =>
            `//div[@class="dokan-announcement-heading"]//h3[contains(text(),"${title}")]/../../../..//a[@class="remove_announcement"]`,
        confirmDeleteAnnouncement: '.swal2-confirm',

        // Announcement Detail Page
        announcement: {
            title: '.dokan-notice-single-notice-area .entry-title',
            date: '.dokan-single-announcement-date',
            content: '.dokan-notice-single-notice-area .entry-content',
            backToAllNotice: '//a[normalize-space()="Back to all Notice"]',
        },
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        announcement: {
            content: 'test announcement Content',
            receiver: 'all_seller',
        },
        receiverTypes: {
            allVendors: 'all_seller',
            selectedVendors: 'selected_seller',
            enabledVendors: 'enabled_seller',
            disabledVendors: 'disabled_seller',
            featuredVendors: 'featured_seller',
        },
    };

    // ============================================
    // HELPER METHODS
    // ============================================

    generateTitle(): string {
        return `test announcement_${Date.now()}`;
    }

    // ============================================
    // ADMIN METHODS
    // ============================================

    async goToAnnouncementsPage() {
        await this.page.goto(this.admin.announcementsUrl);
        await this.page.waitForLoadState('load');
        await this.page.locator(this.admin.announcementText).waitFor({ state: 'visible' });
        // Page header renders before the React/Vue list fetches data. Wait
        // for either a populated list table or the empty-state — assertions
        // that scan for a specific row otherwise race the data fetch.
        await this.page.waitForFunction(
            () => {
                const table = document.querySelector('table.wp-list-table');
                if (!table) return false;
                const tbody = table.querySelector('tbody');
                if (!tbody) return false;
                // Either rows are populated, or the "no items" notice is shown.
                return tbody.querySelectorAll('tr').length > 0 || !!tbody.querySelector('.no-items');
            },
            null,
            { timeout: 15000 },
        );
    }

    async adminAnnouncementsRenderProperly() {
        await this.goToAnnouncementsPage();

        // Verify page header
        await expect(this.page.locator(this.admin.announcementText)).toBeVisible();
        await expect(this.page.locator(this.admin.addNewAnnouncement)).toBeVisible();

        // Verify nav tabs
        for (const tab of Object.values(this.admin.navTabs)) {
            await expect(this.page.locator(tab)).toBeVisible();
        }

        // Verify bulk action elements
        await expect(this.page.locator(this.admin.bulkActions.selectAll)).toBeVisible();
        await expect(this.page.locator(this.admin.bulkActions.selectAction)).toBeVisible();
        await expect(this.page.locator(this.admin.bulkActions.applyAction)).toBeVisible();

        // Verify table columns
        await expect(this.page.locator(this.admin.table.announcementTable)).toBeVisible();
        await expect(this.page.locator(this.admin.table.titleColumn)).toBeVisible();
        await expect(this.page.locator(this.admin.table.contentColumn)).toBeVisible();
        await expect(this.page.locator(this.admin.table.sentToColumn)).toBeVisible();
        await expect(this.page.locator(this.admin.table.statusColumn)).toBeVisible();
        await expect(this.page.locator(this.admin.table.dateColumn)).toBeVisible();

        // Navigate to add announcement form and verify fields
        await this.page.locator(this.admin.addNewAnnouncement).click();
        await this.page.waitForLoadState('load');
        await expect(this.page.locator(this.admin.addAnnouncement.title)).toBeVisible();
        await expect(this.page.locator(this.admin.addAnnouncement.sendAnnouncementTo)).toBeVisible();
        await expect(this.page.locator(this.admin.addAnnouncement.publish)).toBeVisible();
        await this.page.goBack();
        await this.page.waitForLoadState('load');
    }

    async fillAnnouncementTitle(title: string) {
        await this.page.locator(this.admin.addAnnouncement.title).waitFor({ state: 'visible' });
        await this.page.locator(this.admin.addAnnouncement.title).fill(title);
    }

    async fillAnnouncementContent(content: string) {
        const frame = this.page.frameLocator(this.admin.addAnnouncement.contentIframe);
        await frame.locator(this.admin.addAnnouncement.contentHtmlBody).waitFor({ state: 'visible' });
        await frame.locator(this.admin.addAnnouncement.contentHtmlBody).fill(content);
    }

    async addAnnouncement(title: string, content: string = 'test announcement Content', receiver: string = 'all_seller') {
        await this.goToAnnouncementsPage();
        await this.page.locator(this.admin.addNewAnnouncement).click();
        await this.page.waitForLoadState('load');

        await this.fillAnnouncementTitle(title);
        await this.fillAnnouncementContent(content);
        await this.page.selectOption(this.admin.addAnnouncement.sendAnnouncementTo, receiver);

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.addAnnouncement.publish).click(),
        ]);
        await this.page.waitForLoadState('load');
        await expect(this.page.locator(this.admin.announcementStatusPublished(title))).toBeVisible();
    }

    // Save as draft so the title renders as <a> (not <strong>) in the list,
    // which is required for the edit row-action selectors to work.
    // Note: clicking saveAsDraft keeps the browser on the edit form page,
    // so we navigate back to the list explicitly afterward.
    async addAnnouncementAsDraft(title: string, content: string = 'test announcement Content', receiver: string = 'all_seller') {
        await this.goToAnnouncementsPage();
        await this.page.locator(this.admin.addNewAnnouncement).click();
        await this.page.waitForLoadState('load');

        await this.fillAnnouncementTitle(title);
        await this.fillAnnouncementContent(content);
        await this.page.selectOption(this.admin.addAnnouncement.sendAnnouncementTo, receiver);

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.addAnnouncement.saveAsDraft).click(),
        ]);
        await this.page.waitForLoadState('load');

        // saveAsDraft stays on the edit form; navigate directly to the Draft
        // tab via the hash route. Default tab is "All" which is paginated, so
        // a freshly-created draft can land beyond page 1 in a dirty DB; the
        // Draft filter sorts the new row to page 1.
        //
        // Why goto() and not navTabs.draft.click(): the tab click races the
        // post-navigate re-render — the table loader overlay appears AFTER
        // any pre-click wait runs (when the React shell starts fetching) and
        // intercepts pointer events for 15s. A hash-route navigation triggers
        // the same Vue/React routing without the actionability race.
        await this.page.goto(toPath(`wp-admin/admin.php?page=dokan#/announcement?status=draft`));
        await this.page.waitForLoadState('load');
        // Mirror goToAnnouncementsPage's table-ready wait. A hash-route nav
        // resolves before the Vue list re-fetches with the new filter, so a
        // straight visibility assertion races the fetch.
        await this.page.waitForFunction(
            () => {
                const table = document.querySelector('table.wp-list-table');
                if (!table) return false;
                const tbody = table.querySelector('tbody');
                if (!tbody) return false;
                return tbody.querySelectorAll('tr').length > 0 || !!tbody.querySelector('.no-items');
            },
            null,
            { timeout: 15000 },
        );
        // Draft items render as <a> wrapped in <strong>; announcementCell
        // walks up from the inner <a> to the <td>.
        await expect(this.page.locator(this.admin.announcementCell(title))).toBeVisible();
    }

    async addScheduledAnnouncement(title: string, content: string = 'test announcement Content', receiver: string = 'all_seller') {
        await this.goToAnnouncementsPage();
        await this.page.locator(this.admin.addNewAnnouncement).click();
        await this.page.waitForLoadState('load');

        await this.fillAnnouncementTitle(title);
        await this.fillAnnouncementContent(content);
        await this.page.selectOption(this.admin.addAnnouncement.sendAnnouncementTo, receiver);

        // Set schedule date to 10 days in the future
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);

        await this.page.locator(this.admin.addAnnouncement.schedule.addSchedule).click();
        await this.page.selectOption(this.admin.addAnnouncement.schedule.month, { index: futureDate.getMonth() });
        await this.page.fill(this.admin.addAnnouncement.schedule.day, String(futureDate.getDate()));
        await this.page.fill(this.admin.addAnnouncement.schedule.year, String(futureDate.getFullYear()));
        await this.page.fill(this.admin.addAnnouncement.schedule.hour, String(futureDate.getHours()));
        await this.page.fill(this.admin.addAnnouncement.schedule.minute, String(futureDate.getMinutes()));
        await this.page.locator(this.admin.addAnnouncement.schedule.ok).click();

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.addAnnouncement.publish).click(),
        ]);
        await this.page.waitForLoadState('load');
        await expect(this.page.locator(this.admin.announcementStatusScheduled(title))).toBeVisible();
    }

    async editAnnouncement(originalTitle: string, newTitle: string) {
        await this.goToAnnouncementsPage();
        // The default "All" tab is paginated; a freshly-created draft can fall
        // onto page 2+ depending on sort order, and the announcementCell XPath
        // only scans page 1. Switch to the Draft tab so the just-created draft
        // is guaranteed to be on the first (and only) page of results.
        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200).catch(() => null),
            this.page.locator(this.admin.navTabs.draft).click(),
        ]);
        // Draft announcements render the title as <a> wrapped in <strong>;
        // the announcementCell XPath finds the inner <a> and walks up to the
        // <td>. Published items expose only Trash (no inner <a>).
        const row = this.page.locator(this.admin.announcementCell(originalTitle));
        const editLink = this.page.locator(this.admin.announcementEdit(originalTitle));
        await expect(row).toBeVisible();

        // Row actions are revealed on row hover. After list re-renders, hover state
        // can be lost — re-hover and re-check until the edit link is actually
        // clickable, then click in the same retry to avoid a re-render race.
        await expect(async () => {
            await row.hover();
            await expect(editLink).toBeVisible({ timeout: 2000 });
            await editLink.click();
            await expect(this.page.locator(this.admin.addAnnouncement.title)).toBeVisible({ timeout: 5000 });
        }).toPass({ timeout: 20000 });

        await this.page.locator(this.admin.addAnnouncement.title).fill(newTitle);

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.addAnnouncement.publish).click(),
        ]);
        await this.page.waitForLoadState('load');
        await expect(this.page.locator(this.admin.announcementStatusPublished(newTitle))).toBeVisible();
    }

    private async hoverAndClickRowAction(rowSelector: string, actionSelector: string): Promise<void> {
        const row = this.page.locator(rowSelector);
        const action = this.page.locator(actionSelector);
        await expect(row).toBeVisible();
        // Row actions are CSS-revealed on row hover; if the list re-renders the
        // hover state is lost. Re-hover and re-click in one retry block.
        await expect(async () => {
            await row.hover();
            await expect(action).toBeVisible({ timeout: 2000 });
            await Promise.all([
                this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
                action.click(),
            ]);
        }).toPass({ timeout: 20000 });
        await this.page.waitForLoadState('load');
    }

    async trashAnnouncement(title: string) {
        await this.goToAnnouncementsPage();

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.navTabs.published).click(),
        ]);
        await this.page.waitForLoadState('load');

        await this.hoverAndClickRowAction(
            this.admin.announcementCellPublished(title),
            this.admin.announcementDelete(title),
        );
    }

    async restoreAnnouncement(title: string) {
        await this.goToAnnouncementsPage();

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.navTabs.trash).click(),
        ]);
        await this.page.waitForLoadState('load');

        await this.hoverAndClickRowAction(
            this.admin.announcementCellPublished(title),
            this.admin.announcementRestore(title),
        );
    }

    async permanentlyDeleteAnnouncement(title: string) {
        await this.goToAnnouncementsPage();

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.status() === 200),
            this.page.locator(this.admin.navTabs.trash).click(),
        ]);
        await this.page.waitForLoadState('load');

        await this.hoverAndClickRowAction(
            this.admin.announcementCellPublished(title),
            this.admin.announcementPermanentlyDelete(title),
        );
    }

    async announcementBulkAction(action: string) {
        await this.page.goto(this.admin.announcementsUrl);
        await this.page.waitForLoadState('load');

        // Ensure there is at least one row before performing bulk action
        await expect(this.page.locator(this.admin.noRowsFound)).not.toBeVisible();

        await this.page.locator(this.admin.bulkActions.selectAll).click();
        await this.page.selectOption(this.admin.bulkActions.selectAction, action);

        await Promise.all([
            // Wait for the bulk MUTATION (non-GET), not the list's refetch GET to the same
            // endpoint — matching the GET would resolve before the rows are actually actioned.
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.request().method() !== 'GET' && res.status() < 400),
            this.page.locator(this.admin.bulkActions.applyAction).click(),
        ]);
        await this.page.waitForLoadState('load');
    }

    async emptyTrashInNewAdminDashboard() {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.locator(this.adminNewDashboard.trashTab).click();
        await this.page.locator(this.adminNewDashboard.selectAllCheckbox).click();
        await this.page.locator(this.adminNewDashboard.deletePermanently).click();
        await this.page.locator(this.adminNewDashboard.confirmDelete).click();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async emptyTrashInNewAdminDashboardAfterTests() {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.locator(this.adminNewDashboard.trashTab).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.adminNewDashboard.selectAllCheckbox).click();
        await this.page.locator(this.adminNewDashboard.deletePermanently).click();
        await this.page.locator(this.adminNewDashboard.confirmDelete).click();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async createPublishedAnnouncementInNewAdminDashboard(title: string, content: string) {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.getByRole('button', { name: 'Add Announcement' }).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.title).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.title).fill(title);
        await this.page.locator(this.adminNewDashboard.addAnnouncement.content).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.content).fill(content);
        await this.page.getByRole('button', { name: 'Create Announcement' }).click();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async createDraftAnnouncementInNewAdminDashboard(title: string, content: string) {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.getByRole('button', { name: 'Add Announcement' }).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.title).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.title).fill(title);
        await this.page.locator(this.adminNewDashboard.addAnnouncement.contentParagraph).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.contentParagraph).fill(content);
        await this.page.locator(this.adminNewDashboard.addAnnouncement.draftRadio).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.createButtonSpan).click();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async createScheduledAnnouncementInNewAdminDashboard(title: string, content: string) {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.locator(this.adminNewDashboard.addAnnouncement.addButtonSpan).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.title).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.title).fill(title);
        await this.page.locator(this.adminNewDashboard.addAnnouncement.contentParagraph).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.contentParagraph).fill(content);
        await this.page.locator(this.adminNewDashboard.addAnnouncement.scheduledRadio).click();
        await this.page.locator(this.adminNewDashboard.addAnnouncement.datePickerToggle).click();

        // Set a future date dynamically (current year + 5)
        const futureYear = new Date().getFullYear() + 5;
        await this.page.getByRole('spinbutton', { name: 'Day' }).click();
        await this.page.getByRole('spinbutton', { name: 'Year' }).click();
        await this.page.getByRole('spinbutton', { name: 'Year' }).press('ArrowRight');
        await this.page.getByRole('spinbutton', { name: 'Year' }).press('ArrowRight');
        await this.page.getByRole('spinbutton', { name: 'Year' }).fill(String(futureYear));

        await this.page.getByText(this.adminNewDashboard.addAnnouncement.createButtonText).click();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async verifyDraftAnnouncementInNewAdminDashboard(title: string) {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await expect(
            this.page.locator(this.adminNewDashboard.announcementTitle(title)),
            `Announcement title "${title}" should be visible in the list`,
        ).toHaveText(title);

        await expect(
            this.page.locator(this.adminNewDashboard.announcementStatusBadgeForTitle(title, 'Draft')),
            `Announcement "${title}" should have a Draft status badge`,
        ).toBeVisible();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async verifyDraftStatusVisibleInNewAdminDashboard() {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        // Multiple rows may be in Draft status; assert at least one.
        await expect(
            this.page.getByText('Draft', { exact: true }).first(),
            'Text "Draft" should be visible on the page',
        ).toBeVisible();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async verifyScheduledStatusVisibleInNewAdminDashboard() {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        // The status text can appear in column header + badge cells; use
        // .first() to avoid strict-mode violations when more than one
        // matching node is rendered.
        await expect(
            this.page.getByText('Scheduled', { exact: true }).first(),
            'Text "Scheduled" should be visible on the page',
        ).toBeVisible();

        await this.page.waitForLoadState('domcontentloaded');
    }

    async trashAnnouncementByTitle(title: string) {
        await this.page.locator(this.adminNewDashboard.rowActionButton(title)).click();
        await this.page.locator(this.adminNewDashboard.moveToTrash).click();
        // The confirm fires a REST mutation; the table then refetches.
        // Sequential trash calls used to race the loader and the next row's
        // Actions button became unclickable.
        await Promise.all([
            // Wait for the trash MUTATION (non-GET), not the table's refetch GET to the same
            // endpoint — matching the GET would resolve before the row is actually trashed.
            this.page.waitForResponse(res => res.url().includes('dokan/v1/announcement') && res.request().method() !== 'GET' && res.status() < 400),
            this.page.locator(this.adminNewDashboard.confirmTrash).click(),
        ]);
        await this.page.waitForLoadState('domcontentloaded');
        // Wait for the post-mutation table re-render to settle before any
        // follow-up Actions-button click on the same view.
        await expect(this.page.locator('.loading')).toBeHidden({ timeout: 15000 });
    }

    async trashAndPermanentlyDeleteAnnouncementsInNewAdminDashboard() {
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        await this.trashAnnouncementByTitle('Test Draft Announcement 2');
        await this.trashAnnouncementByTitle('Test Scheduled Announcement 3');
        await this.trashAnnouncementByTitle('Test Published Announcement 1');

        // Re-navigate to ensure SPA is in a clean state before emptying trash
        await this.page.goto(this.adminNewDashboard.announcementsUrl);
        await this.page.waitForLoadState('domcontentloaded');

        // Go to Trash tab, select all, and permanently delete
        await this.page.locator(this.adminNewDashboard.trashTab).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.adminNewDashboard.selectAllCheckbox).click();
        await this.page.locator(this.adminNewDashboard.deletePermanently).click();
        await this.page.locator(this.adminNewDashboard.confirmDelete).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ============================================
    // VENDOR NEW DASHBOARD METHODS
    // ============================================

    async vendorViewAnnouncementInNewDashboard(title: string) {
        await this.page.goto(this.vendorNewDashboard.announcementsUrl);
        // The new vendor dashboard uses hash routing (#announcement) and keeps
        // background polling alive — networkidle never fires. Skip it and wait
        // for the actual announcement card to render.
        await this.page.waitForLoadState('domcontentloaded');

        // Multiple rows may share the same title across reruns; click the
        // first match.
        const card = this.page.locator(this.vendorNewDashboard.announcementCard(title)).first();
        await card.waitFor({ state: 'visible', timeout: 30 * 1000 });
        await card.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ============================================
    // VENDOR METHODS
    // ============================================

    async goToVendorAnnouncementsPage() {
        await this.page.goto(this.vendor.announcementsUrl);
        await this.page.waitForLoadState('load');
    }

    async vendorAnnouncementsRenderProperly() {
        await this.goToVendorAnnouncementsPage();

        await expect(this.page.locator(this.vendor.announcementDiv).first()).toBeVisible();
        await expect(this.page.locator(this.vendor.announcementDate).first()).toBeVisible();
        await expect(this.page.locator(this.vendor.announcementHeading).first()).toBeVisible();
        await expect(this.page.locator(this.vendor.announcementContent).first()).toBeVisible();
        await expect(this.page.locator(this.vendor.removeAnnouncement).first()).toBeVisible();
    }

    async vendorViewAnnouncement(title: string) {
        await this.goToVendorAnnouncementsPage();

        await this.page.locator(this.vendor.announcementLink(title)).click();
        await this.page.waitForLoadState('load');

        await expect(this.page.locator(this.vendor.announcement.title)).toContainText(title);
        await expect(this.page.locator(this.vendor.announcement.date)).toBeVisible();
        await expect(this.page.locator(this.vendor.announcement.backToAllNotice)).toBeVisible();
    }

    async vendorDeleteAnnouncement(title: string) {
        await this.goToVendorAnnouncementsPage();

        await this.page.locator(this.vendor.deleteAnnouncement(title)).click();

        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('admin-ajax.php') && res.status() === 200),
            this.page.locator(this.vendor.confirmDeleteAnnouncement).click(),
        ]);
        await this.page.waitForLoadState('load');
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    async waitForPageReady() {
        await this.page.waitForLoadState('load');
    }
}
