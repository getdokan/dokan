import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { staff } from '@utils/interfaces';


// selectors
const vendorStaff = selector.vendor.vStaff;

export class VendorStaffPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // vendor staff

    // vendor staff render properly
    async vendorStaffRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);

        // staff text is visible
        await this.toBeVisible(vendorStaff.staffText);

        // add new staff is visible
        await this.toBeVisible(vendorStaff.addStaff.addNewStaff);

        const noStaff = await this.isVisible(vendorStaff.noRowsFound);

        if (noStaff) {
            await this.toContainText(vendorStaff.noRowsFound, 'No staff found');
            console.log('No staff found on staff page');
        } else {
            // vendor staff table elements are visible
            await this.multipleElementVisible(vendorStaff.table);
        }
    }

    // update staff fields
    async updateStaffFields(staff: staff) {
        await this.clearAndType(vendorStaff.addStaff.firstName, staff.firstName);
        await this.clearAndType(vendorStaff.addStaff.lastName, staff.lastName);
        await this.clearAndType(vendorStaff.addStaff.email, staff.email);
        await this.clearAndType(vendorStaff.addStaff.phone, staff.phone);
        const isPasswordVisible = await this.isVisible(vendorStaff.editStaff.password);
        isPasswordVisible && (await this.clearAndType(vendorStaff.editStaff.password, staff.password));
    }

    // add new staff
    async addStaff(staff: staff) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.clickAndWaitForLoadState(vendorStaff.addStaff.addNewStaff);
        await this.updateStaffFields(staff);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.staff, vendorStaff.addStaff.createStaff);
        const userAlreadyExists = await this.isVisible(vendorStaff.addStaff.userAlreadyExists);
        if (userAlreadyExists) {
            console.log('Staff already exists!!');
            return;
        }
        await this.toBeVisible(vendorStaff.staffCell(staff.firstName + ' ' + staff.lastName));
    }

    // edit staff
    async editStaff(staff: staff) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.hover(vendorStaff.staffCell(staff.firstName + ' ' + staff.lastName));
        await this.clickAndWaitForLoadState(vendorStaff.editStaff.editStaff(staff.firstName + ' ' + staff.lastName));
        await this.updateStaffFields(staff);
        await this.pressOnLocatorAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.staff, vendorStaff.editStaff.updateStaff, data.key.enter);
        await this.toBeVisible(vendorStaff.staffCell(staff.firstName + ' ' + staff.lastName));
    }

    // add new staff
    async deleteStaff(staffName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.hover(vendorStaff.staffCell(staffName));
        await this.click(vendorStaff.deleteStaff.deleteStaff(staffName));
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.staff, vendorStaff.deleteStaff.okDelete, 302);
        await this.toContainText(vendorStaff.deleteStaff.deleteSuccessMessage, 'Staff deleted successfully');
    }

    // manage staff permission
    async manageStaffPermission(staffName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.staff);
        await this.hover(vendorStaff.staffCell(staffName));
        await this.clickAndWaitForLoadState(vendorStaff.managePermission.managePermission(staffName));

        // manage overview permission
        await this.multipleElementCheck(vendorStaff.managePermission.overview);

        // manage order permission
        await this.multipleElementCheck(vendorStaff.managePermission.order);

        // manage review permission
        await this.multipleElementCheck(vendorStaff.managePermission.review);

        // manage product permission
        await this.multipleElementCheck(vendorStaff.managePermission.product);

        // manage booking permission
        // await this.multipleElementCheck(vendorStaff.managePermission.booking); // todo:  add booking module + plugin check

        // manage store support permission
        await this.multipleElementCheck(vendorStaff.managePermission.storeSupport);

        // manage report permission
        await this.multipleElementCheck(vendorStaff.managePermission.report);

        // manage coupon permission
        await this.multipleElementCheck(vendorStaff.managePermission.coupon);

        // manage withdraw permission
        await this.multipleElementCheck(vendorStaff.managePermission.withdraw);

        // manage menu permission
        await this.multipleElementCheck(vendorStaff.managePermission.menu);

        // manage auction permission
        // await this.multipleElementCheck(vendorStaff.managePermission.auction); // todo:  add auction module + plugin check
    }
}
