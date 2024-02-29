import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';

// selectors
const vendorTools = selector.vendor.vTools;

export class VendorToolsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // tools

    // vendor tools render properly
    async vendorToolsRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.tools);

        // tools text is visible
        await this.toBeVisible(vendorTools.toolsText);

        // tools menus are visible
        await this.multipleElementVisible(vendorTools.menus);

        // import

        // import xml elements are visible
        const { completionMessage, ...xml } = vendorTools.import.xml;
        await this.multipleElementVisible(xml);

        // csv

        // import csv text is visible
        await this.toBeVisible(vendorTools.import.csv.importCsvText);

        // import csv button is visible
        await this.toBeVisible(vendorTools.import.csv.csv);

        // export

        await this.click(vendorTools.menus.export);

        // export xml elements are visible
        await this.multipleElementVisible(vendorTools.export.xml);

        // export csv text is visible
        await this.toBeVisible(vendorTools.export.csv.exportCsvText);

        // export csv button is visible
        await this.toBeVisible(vendorTools.export.csv.exportCsv);

        await this.click(vendorTools.export.csv.exportCsv);

        // export csv elements are visible
        const { exportCsvText, exportCsv, ...csv } = vendorTools.export.csv;
        await this.multipleElementVisible(csv);
    }

    async importProduct(importType: string, filePath: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.tools);

        switch (importType) {
            case 'xml':
                await this.uploadFile(vendorTools.import.xml.chooseXmlFile, filePath);
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.tools, vendorTools.import.xml.xml);
                await this.toBeVisible(vendorTools.import.xml.completionMessage);
                break;

            case 'csv': // todo: add wait for uploading file, add api level assertion
                await this.clickAndWaitForLoadState(vendorTools.import.csv.csv);
                await this.uploadFile(vendorTools.import.csv.chooseCsv, filePath);
                await this.click(vendorTools.import.csv.updateExistingProducts);
                await this.clickAndWaitForLoadState(vendorTools.import.csv.continue);
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.csvImport, vendorTools.import.csv.runTheImporter);
                await this.toContainText(vendorTools.import.csv.completionMessage, 'Import complete!');
                break;

            default:
                break;
        }
    }

    async exportProduct(exportType: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.export);

        switch (exportType) {
            case 'xml':
                await this.click(vendorTools.export.xml.all);
                await this.clickAndWaitForDownload(vendorTools.export.xml.exportXml);
                break;

            case 'csv':
                await this.clickAndWaitForLoadState(vendorTools.export.csv.exportCsv);
                await this.click(vendorTools.export.csv.customMeta);
                await this.clickAndWaitForDownload(vendorTools.export.csv.generateCsv);
                break;

            default:
                break;
        }
    }
}
