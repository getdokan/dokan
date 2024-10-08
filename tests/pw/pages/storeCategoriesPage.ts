import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { storeCategory } from '@utils/interfaces';

// selectors
const storeCategoryAdmin = selector.admin.dokan.vendors.storeCategory;
const storeCategoryVendor = selector.vendor.vStoreSettings.storeCategories;
const vendors = selector.admin.dokan.vendors;

export class StoreCategoriesPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // store categories

    // store categories render properly
    async adminStoreCategoryRenderProperly() {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.click(selector.admin.dokan.vendors.storeCategories);

        // add new category elements are visible
        await this.multipleElementVisible(storeCategoryAdmin.addNewCategory);

        // search category input is visible
        await this.toBeVisible(storeCategoryAdmin.search);

        // store category table elements are visible
        await this.multipleElementVisible(storeCategoryAdmin.table);
    }

    // add store category
    async addStoreCategory(storeCategory: storeCategory) {
        await this.goIfNotThere(data.subUrls.backend.dokan.vendors);
        await this.click(selector.admin.dokan.vendors.storeCategories);

        await this.clearAndType(storeCategoryAdmin.addNewCategory.name, storeCategory.name);
        await this.clearAndType(storeCategoryAdmin.addNewCategory.description, storeCategory.description);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, storeCategoryAdmin.addNewCategory.addNewCategory);
    }

    // search store category
    async searchStoreCategory(categoryName: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.storeCategories);
        await this.typeAndWaitForResponse(data.subUrls.api.dokan.storeCategories, storeCategoryAdmin.search, categoryName);
        await this.toHaveCount(storeCategoryAdmin.numberOfRows, 1);
        await this.toBeVisible(storeCategoryAdmin.storeCategoryCell(categoryName));
    }

    // edit store category
    async editStoreCategory(storeCategory: storeCategory) {
        await this.searchStoreCategory(storeCategory.name);

        await this.hover(storeCategoryAdmin.storeCategoryCell(storeCategory.name));
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, storeCategoryAdmin.storeCategoryEdit(storeCategory.name));
        await this.clearAndType(storeCategoryAdmin.editCategory.name, storeCategory.name);
        await this.clearAndType(storeCategoryAdmin.editCategory.description, storeCategory.description);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, storeCategoryAdmin.editCategory.update);
    }

    // update store category
    async updateStoreCategory(categoryName: string, action: string) {
        await this.searchStoreCategory(categoryName);

        await this.removeAttribute(storeCategoryAdmin.storeCategoryRowActions(categoryName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(storeCategoryAdmin.storeCategoryCell(categoryName));

        switch (action) {
            case 'set-default':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeCategories, storeCategoryAdmin.storeCategorySetDefault(categoryName));
                await this.toBeVisible(storeCategoryAdmin.defaultCategory(categoryName));
                break;

            case 'delete':
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.storeCategories, storeCategoryAdmin.storeCategoryDelete(categoryName));
                await this.notToBeVisible(storeCategoryAdmin.storeCategoryCell(categoryName));
                break;

            default:
                break;
        }
    }

    // assign store category
    async assignStoreCategoryToVendor(sellerId: string, categories: string[]) {
        await this.goto(data.subUrls.backend.dokan.vendorDetails(sellerId));
        await this.click(vendors.editVendor.editVendorIcon);

        await this.click(vendors.editVendor.storeCategoryDropdown);
        for (const category of categories) {
            await this.clearAndType(vendors.editVendor.storeCategoryInput, category);
            await this.toContainText(vendors.editVendor.searchedStoreCategory, category);
            await this.press(data.key.enter);
            // for multiple categories
            if (categories.length > 1) await this.toBeVisible(vendors.editVendor.selectedStoreCategory(category));
        }

        await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, vendors.editVendor.saveChanges);
        await this.click(vendors.editVendor.closeUpdateSuccessModal);
        const storeCategories = (await this.getElementText(vendors.vendorDetails.profileInfo.storeCategory))!.split(', ');
        expect(storeCategories).toEqual(expect.arrayContaining(categories));
    }

    // vendor

    // vendor update store category
    async vendorUpdateStoreCategory(category: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
        const isSingleCategory = await this.isVisible(storeCategoryVendor.storeCategoryDropDown);
        if (isSingleCategory) {
            await this.click(storeCategoryVendor.storeCategoryDropDown);
            await this.clearAndType(storeCategoryVendor.storeCategoryInput, category);
        } else {
            await this.clearAndType(storeCategoryVendor.storeCategoriesInput, category);
        }
        await this.toContainText(storeCategoryVendor.result, category);
        await this.press(data.key.enter);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
        await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, 'Your information has been saved successfully');
    }
}
