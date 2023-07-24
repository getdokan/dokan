import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { vendor } from 'utils/interfaces';

const { DOKAN_PRO } = process.env;


export class StoresPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// vendors

	// vendors render properly
	async adminVendorsRenderProperly(){
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

		// vendor text is visible
		await this.toBeVisible(selector.admin.dokan.vendors.vendorsText);

		// and new vendor  is visible
		await this.toBeVisible(selector.admin.dokan.vendors.addNewVendor);

		// nav tabs are visible
		await this.multipleElementVisible(selector.admin.dokan.vendors.navTabs);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.admin.dokan.vendors.bulkActions);

		// search vendor input is visible
		await this.toBeVisible(selector.admin.dokan.vendors.search);

		// vendor table elements are visible
		await this.multipleElementVisible(selector.admin.dokan.vendors.table);
	}


	// admin add new vendors
	async addVendor(vendorInfo: vendor['vendorInfo']) {
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

		const firstName = vendorInfo.firstName();
		const email = vendorInfo.email();

		// add new vendor
		await this.click(selector.admin.dokan.vendors.addNewVendor);
		// account info
		await this.type(selector.admin.dokan.vendors.newVendor.firstName, firstName);
		await this.type(selector.admin.dokan.vendors.newVendor.lastName, vendorInfo.lastName());
		await this.type(selector.admin.dokan.vendors.newVendor.storeName, vendorInfo.shopName);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.newVendor.storeUrl, vendorInfo.shopName);
		await this.type(selector.admin.dokan.vendors.newVendor.phoneNumber, vendorInfo.phoneNumber);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.newVendor.email, email);
		await this.click(selector.admin.dokan.vendors.newVendor.generatePassword);
		await this.clearAndType(selector.admin.dokan.vendors.newVendor.password, vendorInfo.password);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.newVendor.username, firstName);
		await this.type(selector.admin.dokan.vendors.newVendor.companyName, vendorInfo.companyName);
		await this.type(selector.admin.dokan.vendors.newVendor.companyIdEuidNumber, vendorInfo.companyId);
		await this.type(selector.admin.dokan.vendors.newVendor.vatOrTaxNumber, vendorInfo.vatNumber);
		await this.type(selector.admin.dokan.vendors.newVendor.nameOfBank, vendorInfo.bankName);
		await this.type(selector.admin.dokan.vendors.newVendor.bankIban, vendorInfo.bankIban);
		await this.click(selector.admin.dokan.vendors.newVendor.next);
		// address
		await this.type(selector.admin.dokan.vendors.newVendor.street1, vendorInfo.street1);
		await this.type(selector.admin.dokan.vendors.newVendor.street2, vendorInfo.street2);
		await this.type(selector.admin.dokan.vendors.newVendor.city, vendorInfo.city);
		await this.type(selector.admin.dokan.vendors.newVendor.zip, vendorInfo.zipCode);
		await this.click(selector.admin.dokan.vendors.newVendor.country);
		await this.type(selector.admin.dokan.vendors.newVendor.countryInput, vendorInfo.country);
		await this.press(data.key.enter);
		await this.click(selector.admin.dokan.vendors.newVendor.state);
		await this.type(selector.admin.dokan.vendors.newVendor.stateInput, vendorInfo.state);
		await this.press(data.key.enter);
		await this.click(selector.admin.dokan.vendors.newVendor.next);
		// payment options
		await this.type(selector.admin.dokan.vendors.newVendor.accountName, vendorInfo.accountName);
		await this.type(selector.admin.dokan.vendors.newVendor.accountNumber, vendorInfo.accountNumber);
		await this.type(selector.admin.dokan.vendors.newVendor.bankName, vendorInfo.bankName);
		await this.type(selector.admin.dokan.vendors.newVendor.bankAddress, vendorInfo.bankAddress);
		await this.type(selector.admin.dokan.vendors.newVendor.routingNumber, vendorInfo.routingNumber);
		await this.type(selector.admin.dokan.vendors.newVendor.iban, vendorInfo.iban);
		await this.type(selector.admin.dokan.vendors.newVendor.swift, vendorInfo.swiftCode);
		await this.fill(selector.admin.dokan.vendors.newVendor.payPalEmail, vendorInfo.email());
		await this.check(selector.admin.dokan.vendors.newVendor.enableSelling);
		await this.check(selector.admin.dokan.vendors.newVendor.publishProductDirectly);
		await this.check(selector.admin.dokan.vendors.newVendor.makeVendorFeature);
		// create vendor
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.newVendor.createVendor);
		await this.toContainText(selector.admin.dokan.vendors.sweetAlertTitle, 'Vendor Created');
		await this.click(selector.admin.dokan.vendors.closeSweetAlert);
	}


	// edit vendor
	async editVendor(vendor: vendor ){
		await this.searchVendor(vendor.storeName);

		await this.hover(selector.admin.dokan.vendors.vendorCell(vendor.storeName));
		await this.clickAndWaitForNavigation(selector.admin.dokan.vendors.vendorEdit);

		if (!DOKAN_PRO){

			// basic info
			await this.selectByValue(selector.admin.users.userInfo.role, vendor.vendorInfo.role);
			await this.clearAndType(selector.admin.users.userInfo.firstName, vendor.username);
			await this.clearAndType(selector.admin.users.userInfo.lastName, vendor.lastname);
			await this.clearAndType(selector.admin.users.userInfo.nickname, vendor.username );

			// contact info
			await this.clearAndType(selector.admin.users.userInfo.email, vendor.username + data.vendor.vendorInfo.emailDomain);

			// About the user
			await this.clearAndType(selector.admin.users.userInfo.biographicalInfo, vendor.vendorInfo.biography);

			// vendor address

			// billing
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.firstName, vendor.username );
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.lastName, vendor.lastname );
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.company, vendor.vendorInfo.companyName);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.address1, vendor.vendorInfo.street1);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.address2, vendor.vendorInfo.street2);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.city, vendor.vendorInfo.city);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.postcode, vendor.vendorInfo.zipCode);
			await this.click(selector.admin.users.userInfo.billingAddress.country);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.countryInput, vendor.vendorInfo.country);
			await this.press(data.key.enter);
			await this.click(selector.admin.users.userInfo.billingAddress.state);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.stateInput, vendor.vendorInfo.state);
			await this.press(data.key.enter);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.phone, vendor.vendorInfo.phoneNumber);
			await this.clearAndType(selector.admin.users.userInfo.billingAddress.email, vendor.username + data.vendor.vendorInfo.emailDomain);

			// pro edit user
			// await this.clearAndType(selector.admin.users.userInfo.billingAddress.companyIdOrEuidNumber, vendor.vendorInfo.companyId);
			// await this.clearAndType(selector.admin.users.userInfo.billingAddress.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
			// await this.clearAndType(selector.admin.users.userInfo.billingAddress.bank, vendor.vendorInfo.bankName);
			// await this.clearAndType(selector.admin.users.userInfo.billingAddress.bankIban, vendor.vendorInfo.bankIban);

			// shipping
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.firstName, vendor.username );
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.lastName, vendor.lastname );
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.company, vendor.vendorInfo.companyName);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.address1, vendor.vendorInfo.street1);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.address2, vendor.vendorInfo.street2);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.city, vendor.vendorInfo.city);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.postcode, vendor.vendorInfo.zipCode);
			await this.click(selector.admin.users.userInfo.shippingAddress.country);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.countryInput, vendor.vendorInfo.country);
			await this.press(data.key.enter);
			await this.click(selector.admin.users.userInfo.shippingAddress.state);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.stateInput, vendor.vendorInfo.state);
			await this.press(data.key.enter);
			await this.clearAndType(selector.admin.users.userInfo.shippingAddress.phone, vendor.vendorInfo.phoneNumber);

			// dokan options
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.storeName, vendor.vendorInfo.storeName);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.storeUrl, vendor.vendorInfo.storeName);
			// store address
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.address1, vendor.vendorInfo.street1);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.address2, vendor.vendorInfo.street2);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.city, vendor.vendorInfo.city);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.postcode, vendor.vendorInfo.zipCode);
			await this.click(selector.admin.users.userInfo.dokanOptions.country);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.countryInput, vendor.vendorInfo.country);
			await this.press(data.key.enter);
			await this.click(selector.admin.users.userInfo.dokanOptions.state);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.stateInput, vendor.vendorInfo.state);
			await this.press(data.key.enter);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.phone, vendor.vendorInfo.phoneNumber);

			// pro edit user
			// await this.clearAndType(selector.admin.users.userInfo.dokanOptions.companyName, vendor.vendorInfo.companyName);
			// await this.clearAndType(selector.admin.users.userInfo.dokanOptions.companyIdOrEuidNumber, vendor.vendorInfo.companyId);
			// await this.clearAndType(selector.admin.users.userInfo.dokanOptions.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
			// await this.clearAndType(selector.admin.users.userInfo.dokanOptions.bank, vendor.vendorInfo.bankName);
			// await this.clearAndType(selector.admin.users.userInfo.dokanOptions.bankIban, vendor.vendorInfo.bankIban);

			// social profiles
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.facebook, vendor.vendorInfo.socialProfileUrls.facebook);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.twitter, vendor.vendorInfo.socialProfileUrls.twitter);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.pinterest, vendor.vendorInfo.socialProfileUrls.pinterest);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.linkedin, vendor.vendorInfo.socialProfileUrls.linkedin);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.youtube, vendor.vendorInfo.socialProfileUrls.youtube);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.instagram, vendor.vendorInfo.socialProfileUrls.instagram);
			await this.clearAndType(selector.admin.users.userInfo.dokanOptions.flickr, vendor.vendorInfo.socialProfileUrls.flickr);

			// other settings
			await this.check(selector.admin.users.userInfo.dokanOptions.selling);
			await this.check(selector.admin.users.userInfo.dokanOptions.publishing);
			await this.check(selector.admin.users.userInfo.dokanOptions.featuredVendor);

			// update user
			await this.clickAndWaitForResponse(data.subUrls.backend.user, selector.admin.users.updateUser, 302);
			await this.toContainText(selector.admin.users.updateSuccessMessage, 'User updated.');

		} else {

			// basic
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.firstName, vendor.username);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.lastName, vendor.lastname);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.storeName, vendor.vendorInfo.storeName);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.phoneNumber, vendor.vendorInfo.phone); //TODO: change input after fix
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.email, vendor.username + data.vendor.vendorInfo.emailDomain);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.companyName, vendor.vendorInfo.companyName);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.companyIdEuidNumber, vendor.vendorInfo.companyId);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.vatOrTaxNumber, vendor.vendorInfo.vatNumber);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.nameOfBank, vendor.vendorInfo.bankName);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.bankIban, vendor.vendorInfo.bankIban);

			// address
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.street1, vendor.vendorInfo.street1);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.street2, vendor.vendorInfo.street2);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.city, vendor.vendorInfo.city);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.zipCode, vendor.vendorInfo.zipCode);
			await this.click(selector.admin.dokan.vendors.editVendor.country);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.countryInput, vendor.vendorInfo.country);
			await this.press(data.key.enter);
			await this.click(selector.admin.dokan.vendors.editVendor.state);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.stateInput, vendor.vendorInfo.state);
			await this.press(data.key.enter);

			// social options
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.facebook, vendor.vendorInfo.socialProfileUrls.facebook);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.flickr, vendor.vendorInfo.socialProfileUrls.flickr);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.twitter, vendor.vendorInfo.socialProfileUrls.twitter);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.youtube, vendor.vendorInfo.socialProfileUrls.youtube);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.linkedin, vendor.vendorInfo.socialProfileUrls.linkedin);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.pinterest, vendor.vendorInfo.socialProfileUrls.pinterest);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.instagram, vendor.vendorInfo.socialProfileUrls.instagram);

			// payment options
			// bank
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.accountName, vendor.vendorInfo.payment.bankAccountName);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.accountNumber, vendor.vendorInfo.payment.bankAccountNumber);
			await this.selectByValue(selector.admin.dokan.vendors.editVendor.accountType, vendor.vendorInfo.payment.bankAccountType);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.bankName, vendor.vendorInfo.payment.bankName);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.bankAddress, vendor.vendorInfo.payment.bankAddress);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.routingNumber, vendor.vendorInfo.payment.bankRoutingNumber);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.iban, vendor.vendorInfo.payment.bankIban);
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.swift, vendor.vendorInfo.payment.bankSwiftCode);
			//paypal
			await this.clearAndType(selector.admin.dokan.vendors.editVendor.payPalEmail, vendor.vendorInfo.payment.email());

			//TODO: admin commission
			//TODO: vendor subscription

			// other settings
			await this.enableSwitcher(selector.admin.dokan.vendors.editVendor.enableSelling);
			await this.enableSwitcher(selector.admin.dokan.vendors.editVendor.publishProductDirectly);
			await this.enableSwitcher(selector.admin.dokan.vendors.editVendor.makeVendorFeature);

			await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.editVendor.saveChanges);
			await this.click(selector.admin.dokan.vendors.editVendor.confirmSaveChanges);

		}
	}


	// search vendor
	async searchVendor(vendorName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

		await this.clearInputField(selector.admin.dokan.vendors.search);

		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.search, vendorName);
		await this.toBeVisible(selector.admin.dokan.vendors.vendorCell(vendorName));

		// negative scenario //TODO: add this to all search also add flag to avoid this scenario
		// await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.search, vendorName + 'abcdefgh');
		// await this.toBeVisible(selector.admin.dokan.vendors.noRowsFound);

	}


	// update vendor
	async updateVendor(vendorName: string, action: string ){
		await this.searchVendor(vendorName);

		switch(action){

		case 'enable' :
			await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.statusSlider(vendorName));
			break;

		case 'disable' :
			await this.disableSwitcherAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.statusSlider(vendorName));
			break;

		default :
			break;

		}

	}


	// view vendor orders, products
	async viewVendor(vendorName: string, action: string ){
		await this.searchVendor(vendorName);

		await this.hover(selector.admin.dokan.vendors.vendorCell(vendorName));

		switch(action){

		case 'products' :
			await this.clickAndWaitForNavigation(selector.admin.dokan.vendors.vendorProducts);
			break;

		case 'orders' :
			await this.clickAndWaitForNavigation(selector.admin.dokan.vendors.vendorOrders);
			break;

		default :
			break;

		}

		const count = (await this.getElementText(selector.admin.dokan.vendors.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).not.toBe(0);

	}


	// vendor bulk action
	async vendorBulkAction(action: string){
		// await this.searchVendor(vendorName); //TODO: can be used to minimized number of rows to be affected
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

		// ensure row exists
		await this.notToBeVisible(selector.admin.dokan.vendors.noRowsFound);

		await this.click(selector.admin.dokan.vendors.bulkActions.selectAll);
		await this.selectByValue(selector.admin.dokan.vendors.bulkActions.selectAction, action);
		await this.clickAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.bulkActions.applyAction);
	}

}
