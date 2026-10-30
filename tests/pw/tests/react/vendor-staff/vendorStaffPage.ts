import type { Locator, Page, Response } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';
import { DataViewsTable } from '../_shared/dataViewsTable';

const STAFF_REST = /\/dokan\/v1\/vendor-staff(\/\d+)?(\?|$)/;
const CAPS_REST = /\/dokan\/v1\/vendor-staff\/\d+\/capabilities/;

/** React vendor Staff (Pro): /dashboard/new/#/staffs, /create, /update/:id, /permissions/:id. */
export class VendorStaffPage {
    readonly table: DataViewsTable;

    constructor(readonly page: Page) {
        this.table = new DataViewsTable(page, '/dokan/v1/vendor-staff');
    }

    private async open(hash: string): Promise<void> {
        await closeAnnouncementModal(this.page);
        await this.page.goto(`dashboard/new/#/${hash}`);
    }

    async gotoList(): Promise<void> {
        await this.open('staffs');
        await this.table.settled();
    }

    async gotoCreate(): Promise<void> {
        await this.open('staffs/create');
        await this.page.locator('#first_name').waitFor();
    }

    async gotoEdit(id: string): Promise<void> {
        const loaded = this.page.waitForResponse(r => r.request().method() === 'GET' && r.url().includes(`/vendor-staff/${id}`));
        await this.open(`staffs/update/${id}`);
        await loaded;
        await this.page.locator('#email').waitFor();
    }

    async gotoPermissions(id: string): Promise<void> {
        await this.open(`staffs/permissions/${id}`);
        await this.page.getByRole('button', { name: 'Save Permissions' }).waitFor();
    }

    row(name: string): Locator {
        return this.table.rows.filter({ hasText: name });
    }

    async fillForm(data: { firstName: string; lastName: string; email: string; phone?: string }): Promise<void> {
        await this.page.locator('#first_name').fill(data.firstName);
        await this.page.locator('#last_name').fill(data.lastName);
        await this.page.locator('#email').fill(data.email);
        if (data.phone) {
            // cleave.js masked input commits its raw value only from key events.
            await this.page.locator('#phone').pressSequentially(data.phone);
        }
    }

    /** Click Create or Update and return the staff REST response. */
    async submit(label: 'Create' | 'Update'): Promise<Response> {
        const saved = this.page.waitForResponse(r => r.request().method() !== 'GET' && STAFF_REST.test(r.url()));
        await this.page.getByRole('button', { name: label, exact: true }).click();
        return saved;
    }

    cap(name: string): Locator {
        return this.page.locator(`#${name}`);
    }

    async savePermissions(): Promise<Response> {
        const saved = this.page.waitForResponse(r => r.request().method() !== 'GET' && CAPS_REST.test(r.url()));
        await this.page.getByRole('button', { name: 'Save Permissions' }).click();
        return saved;
    }

    async resetPermissions(): Promise<Response> {
        const saved = this.page.waitForResponse(r => r.request().method() !== 'GET' && CAPS_REST.test(r.url()));
        await this.page.getByRole('button', { name: 'Reset', exact: true }).click();
        await this.page.getByRole('button', { name: 'Yes, Reset' }).click();
        return saved;
    }

    sidebarLink(name: string): Locator {
        return this.page.locator('aside.dokan-frontend-sidebar nav a').filter({ has: this.page.locator(`span:text-is("${name}")`) });
    }

    get permissionDenied(): Locator {
        return this.page.getByRole('heading', { name: 'Permission Denied' });
    }
}
