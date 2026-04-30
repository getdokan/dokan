import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';
import { closeAnnouncementModal } from '@utils/helpers';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class AddProductPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================
    vendor = {
        productsUrl: `${BASE_URL}/dashboard/products/`,
        addNewProductButton: 'a',
        productFormHeading: 'h1',
        // Legacy PHP product form used by Dokan vendor dashboard.
        productTitle: '#post_title',
        regularPrice: '#_regular_price',
        salePrice: '#_sale_price',
        downloadableCheckbox: '#_downloadable',
        virtualCheckbox: '#_virtual',
        saveProductButton: '#publish',
        updateSuccessMessage: '.dokan-message',
        titleRequiredError: "span.error[for='post_title']",
        descriptionRequiredError: '.dokan-alert-danger',
        productSearchInput: '//input[@name="product_search_name"]',
        searchButton: 'button[name="product_listing_search"]',
        firstProductRowTitle: 'table.dokan-table tbody tr td[data-title="Name"] a',
        longDescriptionIframe: 'iframe#post_content_ifr',
        shortDescriptionIframe: 'iframe#post_excerpt_ifr',
        longDescriptionTextarea: 'textarea#post_content',
        shortDescriptionTextarea: 'textarea#post_excerpt',

        downloadableOptions: {
            addFileButton: 'button.insert-file-row',
            fileNameInput: "input[placeholder='File Name']",
            fileUrlInput: "input[placeholder='http://']",
            downloadLimitInput: '#_download_limit',
            downloadExpiryInput: '#_download_expiry',
        },
    };

    testData = {
        simple: {
            short_description: faker.lorem.paragraph(4),
            long_description: faker.lorem.paragraph(10),
            price: '99',
        },
        downloadable: {
            fileName: 'Sample PDF',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            downloadLimit: '3',
            downloadExpiry: '7',
        },
    };

    // ============================================
    // HELPER METHODS
    // ============================================
    makeProductName = () => faker.commerce.productName();
    

    async waitForPageReady() {
        await this.page.waitForLoadState('domcontentloaded');
    }

    async goToProductsPage() {
        await this.page.goto(this.vendor.productsUrl);
        await this.waitForPageReady();
        await closeAnnouncementModal(this.page);
        await this.page.getByRole('link', { name: 'Add new product' }).first().waitFor({ state: 'visible' });
    }

    async openAddProductForm() {
        await this.page.getByRole('link', { name: 'Add new product' }).first().click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.vendor.productTitle).waitFor({ state: 'visible' });
    }

    async isAddProductHeadingVisible(): Promise<boolean> {
        // Legacy form heading is "Add New Product".
        return this.page.getByRole('heading', { name: 'Add New Product', exact: true }).isVisible();
    }

    async fillTitle(title: string) {
        await this.page.locator(this.vendor.productTitle).fill(title);
    }

    async fillRegularPrice(price: string) {
        await this.page.locator(this.vendor.regularPrice).fill(price);
    }

    async fillShortDescription(short_description: string) {
        // Dokan's vendor form uses WP classic TinyMCE; write directly to the underlying textarea
        // so we don't depend on editor state or iframe readiness.
        await this.page.locator(this.vendor.shortDescriptionTextarea).evaluate(
            (el, value) => {
                (el as HTMLTextAreaElement).value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            },
            short_description,
        );
    }

    async fillLongDescription(long_description: string) {
        await this.page.locator(this.vendor.longDescriptionTextarea).evaluate(
            (el, value) => {
                (el as HTMLTextAreaElement).value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            },
            long_description,
        );
    }

    async selectSimpleProductType() {
        // Legacy form has no product-type selector: default is Simple, with Virtual/Downloadable
        // exposed as separate checkboxes. Clearing both gives Simple.
        const downloadable = this.page.locator(this.vendor.downloadableCheckbox);
        const virtual = this.page.locator(this.vendor.virtualCheckbox);
        if (await downloadable.isChecked()) await downloadable.uncheck();
        if (await virtual.isChecked()) await virtual.uncheck();
    }

    async saveProduct() {
        await Promise.all([
            this.page.waitForLoadState('domcontentloaded'),
            this.page.locator(this.vendor.saveProductButton).click(),
        ]);
    }

    async getSuccessMessage(): Promise<string> {
        const success = this.page.locator(this.vendor.updateSuccessMessage).first();
        await success.waitFor({ state: 'visible' });
        return (await success.textContent())?.trim() ?? '';
    }

    async searchProduct(productName: string) {
        await this.page.locator(this.vendor.productSearchInput).fill(productName);
        await this.page.locator(this.vendor.searchButton).click({delay: 1000});
        await this.page.waitForLoadState('networkidle');
    }

    async getFirstProductTitle(): Promise<string> {
        const title = this.page.locator(this.vendor.firstProductRowTitle).first();
        await title.waitFor({ state: 'visible' });
        return (await title.textContent())?.trim() ?? '';
    }

    async enableDownloadable() {
        const downloadable = this.page.locator(this.vendor.downloadableCheckbox);
        if (!(await downloadable.isChecked())) await downloadable.check();
    }

    async enableVirtual() {
        const virtual = this.page.locator(this.vendor.virtualCheckbox);
        if (!(await virtual.isChecked())) await virtual.check();
    }

    async isDownloadableChecked(): Promise<boolean> {
        return await this.page.locator(this.vendor.downloadableCheckbox).isChecked();
    }

    async isVirtualChecked(): Promise<boolean> {
        return await this.page.locator(this.vendor.virtualCheckbox).isChecked();
    }

    async fillDownloadableFields() {
        await this.page.locator('button').filter({ hasText: 'Choose' }).first().click();
        const chooseFileButton = this.page.locator('button').filter({ hasText: 'Upload Files' });
        await chooseFileButton.click();
        await this.page.locator('#__wp-uploader-id-4').click();

        
        await this.page.locator(this.vendor.downloadableOptions.fileNameInput).fill(this.testData.downloadable.fileName);
        await this.page.locator(this.vendor.downloadableOptions.fileUrlInput).fill(this.testData.downloadable.fileUrl);
        await this.page.locator(this.vendor.downloadableOptions.downloadLimitInput).fill(this.testData.downloadable.downloadLimit);
        await this.page.locator(this.vendor.downloadableOptions.downloadExpiryInput).fill(this.testData.downloadable.downloadExpiry);
    }

    async getDownloadableFileName(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.fileNameInput)
                .first()
                .inputValue()
        ).trim();
    }

    async getDownloadableFileUrl(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.fileUrlInput)
                .first()
                .inputValue()
        ).trim();
    }

    async getDownloadLimit(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.downloadLimitInput)
                .inputValue()
        ).trim();
    }

    async getDownloadExpiry(): Promise<string> {
        return (
            await this.page
                .locator(this.vendor.downloadableOptions.downloadExpiryInput)
                .inputValue()
        ).trim();
    }

    async saveWithoutRequiredFields() {
        await this.page.locator(this.vendor.saveProductButton).isDisabled();
    }

    async getTitleRequiredErrorText(): Promise<string> {
        const err = this.page.locator(this.vendor.titleRequiredError).first();
        await err.waitFor({ state: 'visible' });
        return (await err.textContent())?.trim() ?? '';
    }

    async getDescriptionRequiredErrorText(): Promise<string> {
        const err = this.page.locator(this.vendor.descriptionRequiredError).first();
        await err.waitFor({ state: 'visible' });
        return (await err.textContent())?.trim() ?? '';
    }
}
