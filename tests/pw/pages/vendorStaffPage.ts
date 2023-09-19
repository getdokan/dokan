import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { staff } from '@utils/interfaces';

export class VendorStaffPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor staff

    // vendor staff render properly
    async vendorStaffRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);

        // staff text is visible
        await this.toBeVisible(selector.vendor.vStaff.staffText);

        // add new staff is visible
        await this.toBeVisible(selector.vendor.vStaff.addStaff.addNewStaff);

        const noStaff = await this.isVisible(selector.vendor.vStaff.noRowsFound);

        if (noStaff) {
            await this.toContainText(selector.vendor.vStaff.noRowsFound, 'No staff found');
            console.log('No staff found on staff page');
        } else {
            // vendor staff table elements are visible
            await this.multipleElementVisible(selector.vendor.vStaff.table);
        }
    }

    // update staff fields
    async updateStaffFields(staff: staff) {
        await this.clearAndType(selector.vendor.vStaff.addStaff.firstName, staff.firstName);
        await this.clearAndType(selector.vendor.vStaff.addStaff.lastName, staff.lastName);
        await this.clearAndType(selector.vendor.vStaff.addStaff.email, staff.email);
        await this.clearAndType(selector.vendor.vStaff.addStaff.phone, staff.phone);
        const isPasswordVisible = await this.isVisible(selector.vendor.vStaff.editStaff.password);
        isPasswordVisible && (await this.clearAndType(selector.vendor.vStaff.editStaff.password, staff.password));
    }

    // add new staff
    async addStaff(staff: staff) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.clickAndWaitForLoadState(selector.vendor.vStaff.addStaff.addNewStaff);
        await this.updateStaffFields(staff);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.staff, selector.vendor.vStaff.addStaff.createStaff);
        const userAlreadyExists = await this.isVisible(selector.vendor.vStaff.addStaff.userAlreadyExists);
        if (userAlreadyExists) {
            console.log('Staff already exists!!');
            return;
        }
        await this.toBeVisible(selector.vendor.vStaff.staffCell(staff.firstName + ' ' + staff.lastName));
    }

    // edit staff
    async editStaff(staff: staff) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.hover(selector.vendor.vStaff.staffCell(staff.firstName + ' ' + staff.lastName));
        await this.clickAndWaitForLoadState(selector.vendor.vStaff.editStaff.editStaff(staff.firstName + ' ' + staff.lastName));
        await this.updateStaffFields(staff);
        await this.pressOnLocatorAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.staff, selector.vendor.vStaff.editStaff.updateStaff, data.key.enter);
        await this.toBeVisible(selector.vendor.vStaff.staffCell(staff.firstName + ' ' + staff.lastName));
    }

    // add new staff
    async deleteStaff(staffName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.hover(selector.vendor.vStaff.staffCell(staffName));
        await this.click(selector.vendor.vStaff.deleteStaff.deleteStaff(staffName));
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.staff, selector.vendor.vStaff.deleteStaff.okDelete, 302);
        await this.toContainText(selector.vendor.vStaff.deleteStaff.deleteSuccessMessage, 'Staff deleted successfully');
    }

    // manage staff permission
    async manageStaffPermission(staffName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.hover(selector.vendor.vStaff.staffCell(staffName));
        await this.clickAndWaitForLoadState(selector.vendor.vStaff.managePermission.managePermission(staffName));

        // manage overview permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.overview);

        // manage order permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.order);

        // manage review permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.review);

        // manage product permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.product);

        // manage booking permission
        // await this.multipleElementCheck(selector.vendor.vStaff.managePermission.booking); // todo:  add booking module + plugin check

        // manage store support permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.storeSupport);

        // manage report permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.report);

        // manage coupon permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.coupon);

        // manage withdraw permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.withdraw);

        // manage menu permission
        await this.multipleElementCheck(selector.vendor.vStaff.managePermission.menu);

        // manage auction permission
        // await this.multipleElementCheck(selector.vendor.vStaff.managePermission.auction); // todo:  add auction module + plugin check
    }
}
