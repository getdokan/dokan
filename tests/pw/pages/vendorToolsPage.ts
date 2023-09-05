import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';


export class VendorToolsPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// tools

	// vendor tools render properly
	async vendorToolsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.tools);

		// tools text is visible
		await this.toBeVisible(selector.vendor.vTools.toolsText);

		// tools menus are visible
		await this.multipleElementVisible(selector.vendor.vTools.menus);


		// import

		// import xml elements are visible
		
		const { completionMessage,  ...xml } = selector.vendor.vTools.import.xml;
		await this.multipleElementVisible(xml);


		// csv

		// import csv text is visible
		await this.toBeVisible(selector.vendor.vTools.import.csv.importCsvText);

		// import csv button is visible
		await this.toBeVisible(selector.vendor.vTools.import.csv.csv);


		// export

		await this.click(selector.vendor.vTools.menus.export);

		// export xml elements are visible
		await this.multipleElementVisible(selector.vendor.vTools.export.xml);

		// export csv text is visible
		await this.toBeVisible(selector.vendor.vTools.export.csv.exportCsvText);

		// export csv button is visible
		await this.toBeVisible(selector.vendor.vTools.export.csv.exportCsv);


		await this.click(selector.vendor.vTools.export.csv.exportCsv);

		// export csv elements are visible
		
		const { exportCsvText, exportCsv, ...csv } = selector.vendor.vTools.export.csv;
		await this.multipleElementVisible(csv);


	}

	async importProduct(importType: string, filePath: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.tools);

		switch(importType){

		case 'xml' :
			await this.uploadFile(selector.vendor.vTools.import.xml.chooseXmlFile, filePath);
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.tools, selector.vendor.vTools.import.xml.xml);
			await this.toBeVisible(selector.vendor.vTools.import.xml.completionMessage);
			break;

		case 'csv' : //todo: add wait for uploading file, add api level assertion
			await this.clickAndWaitForLoadState(selector.vendor.vTools.import.csv.csv);
			await this.uploadFile(selector.vendor.vTools.import.csv.chooseCsv, filePath);
			await this.click(selector.vendor.vTools.import.csv.updateExistingProducts);
			await this.clickAndWaitForLoadState(selector.vendor.vTools.import.csv.continue);
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.csvImport, selector.vendor.vTools.import.csv.runTheImporter);
			await this.toContainText(selector.vendor.vTools.import.csv.completionMessage, 'Import complete!');
			break;

		default :
			break;
		}

	}

	async exportProduct(exportType: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.export);

		switch(exportType){

		case 'xml' :
			await this.click(selector.vendor.vTools.export.xml.all);
			await this.clickAndWaitForDownload(selector.vendor.vTools.export.xml.exportXml);
			break;

		case 'csv' :
			await this.clickAndWaitForLoadState(selector.vendor.vTools.export.csv.exportCsv);
			await this.click(selector.vendor.vTools.export.csv.customMeta);
			await this.clickAndWaitForDownload(selector.vendor.vTools.export.csv.generateCsv);
			break;

		default :
			break;
		}

	}

}