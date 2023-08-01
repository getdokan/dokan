
//todo ***** list all core tests and setup tests : plugins activated, wp settings, woocommerce settings, dokan modules activated , dokan settings for both e2e and api
//todo:  make e2e tests independent specially admin tests
//todo:  GRAB CONSOLE ERROR, And PHP ERROR *****************
//todo:  slack integration
//todo:  working-directory: ./path/to/tests
//todo:  update auth if expired instead of every-time
//todo:  separate two junit report showing on simple git-action summary
//todo:  separate everything for local & CI like: global setup, env, playwright config
//todo:  implement fixture for lite pro issue handle
//todo:  separate globalSetup for local & CI , cant reg user every time for local site or find another soln.
//todo:  #  // "no-unused-vars": "off" is enabled for now but remove before push
//todo:  test basic auth can be used instead of cookies for authentication
//todo:  # Configure projects for multiple environments : ci, local,
//todo:  # convert waitForNavigation to waitForUrl
//todo:  # why two pages are opening : fix that
//todo:  # test should run parallely
//todo:  # add fixture
//todo:  use extrahttpheaders: for grab storage.json  // not possible
//todo:  usr extrahttpheaders: for test describe and avoid storage.json all-together
//todo:  convert all expect parameter to correct way: left side received and right part expected
//todo:  convert all string assertion:
//todo:  remove all single events like waitforNavigation, waitForUrl, 
// filter received & expected test
// trim if necessary
// lowercase
//todo:  add system info after git action info via system status function, current theme should be there
//todo:  use only one password for every user FOR both suite e2e and api
//todo:  theme is not activating fix this
//todo:  test cli dont work
//todo:  fix permalink issue 
//todo:  replace click with check for all check fields all suite
//todo: 
//todo:  TODO: remove not needed env variables from yml file, like slowmo, setup .........
//todo: 
//todo: 
//todo:  add wait for navigation to add wait for responses or build a new one merging both *****************
//todo:  add more ui assertions to all tests
//todo: 
//todo: 
//todo:  global setup & teardown can be converted to project setup
//todo: 
//todo: 
//todo:  check data exists or not for all bulk actions

//todo locator = selector.admin.dokan.settings; locator length can be shorten

//todo:  make tests more independent where possible specially admin parts : use before-all , after-all, delete data in before-all or after-all to repeat each tests: test should be passed for repeat-each:5






//todo:  this.page.waitForLoadState( 'domcontentloaded' ),  for every navigation check if any tests fail *****************************
//todo:  this.page.waitForLoadState( 'networkidle' ), if any tests fail for domcontentloaded, but domcontentloaded doesn't wait for other things like images, subframes, and async scripts to finish loading.



// TODO: BULK ACTION: add search option before bulk option to minimize the number of rows to be effected  for all bulk action
// if(productName){
// 	await this.searchAdvertisedProduct(productName);
// } else {
// 	await this.goIfNotThere(data.subUrls.backend.dokan.productAdvertising);
// }




// TODO: woocommerce

// TODO: implement this for checkbox assert
		// Verify changes have been saved
		await expect( page.locator( '#woocommerce_calc_taxes' ) ).toBeChecked();

// TODO:  reconsider that you need multiple assertion or not
		// Verify that settings have been saved
		await expect(
			page.locator( '#setting-error-settings_updated' )
		).toContainText( 'Permalink structure updated.' );
		await expect( page.locator( '#permalink_structure' ) ).toHaveValue(
			'/%postname%/'
		);
		await expect(
			page.locator( '#woocommerce_permalink_structure' )
		).toHaveValue( '/product/' );

//todo:  follow woocommerce project structure like global setup, teardown, ....

//todo:  Grab stateDir, baseURL from config
const { stateDir, baseURL, userAgent } = config.projects[ 0 ].use;

console.log( `State Dir: ${ stateDir }` );
console.log( `Base URL: ${ baseURL }` );


//todo:  try this for wait for navigation
// await page.waitForLoadState( 'networkidle' );


//todo:  file upload : plugin
// const [ fileChooser ] = await Promise.all( [
//     page.waitForEvent( 'filechooser' ),
//     page.click( '#pluginzip' ),
// ] );
// await fileChooser.setFiles( woocommerceZipPath );


//todo:  can implement test.step
// test( `can update WooCommerce to "${ UPDATE_WC }"`, async ( {
//     page,
//     baseURL,
// } ) => {

// await test.step(
//     'Choose the option "Replace current with uploaded"',
//     async () => { 


//     });

// });



//todo:  what is expect.poll

await expect
					.poll(
						async () => {
							await page.goto( 'wp-admin/plugins.php', {
								waitUntil: 'networkidle',
							} );

							return await updateCompleteMessage.isVisible();
						},
						{
							intervals: [ 10_000 ],
							timeout: 120_000,
						}
					)
					.toEqual( true );

//todo:  try error.response.data

response = await axios( options ).catch( ( error ) => {
    if ( error.response ) {
        console.error( error.response.data );
    }
    throw new Error( error.message );
} );

//todo:  use this for plugin download and activate scenario
response.data.pipe( fs.createWriteStream( zipFilePath ) );



//todo:  use this for run command via code , built a utility function
export const installPluginThruWpCli = async ( pluginPath ) => {
	const runWpCliCommand = async ( command ) => {
		const { stdout, stderr } = await execAsync(
			`pnpm exec wp-env run tests-cli "${ command }"`
		);

		console.log( stdout );
		console.error( stderr );
	};


    // TODO: try & convert xpath to this
    'input:below(:text("Search for a product…"))',
    // search for each product to add
		await page.click( 'text=Search for a product…' );


		// Recalculate taxes
		page.on( 'dialog', ( dialog ) => dialog.accept() );
		await page.click( 'text=Recalculate' );


    //todo:  what is page.dispatchEvent
    await page.goto(
        'wp-admin/admin.php?page=wc-settings&tab=shipping&section=classes'
    );

    await page.dispatchEvent(
        '.wc-shipping-class-delete >> nth=0',
        'click'
    );
    await page.dispatchEvent(
        '.wc-shipping-class-delete >> nth=0',
        'click'
    );
    await page.dispatchEvent( 'text=Save shipping classes', 'click' );



//todo:  why waitUntil on goto , what is the default value
    await page.goto(
        'wp-admin/admin.php?page=wc-settings&tab=shipping&zone_id=new',
        { waitUntil: 'networkidle' }
    );

//todo:  ensure empty cart like this , try to use both clearCookies to clear cart & storagejson for authenticate user
// check clearcookies clear storagejson or not
	test.beforeEach( async ( { context, page } ) => {
		// Shopping cart is very sensitive to cookies, so be explicit
		await context.clearCookies();

		await page.goto( `/shop/?add-to-cart=${ productId }` );
		await page.waitForLoadState( 'networkidle' );
	} );


	//todo:  use this instead of networkidle
	// Start test
	await page.waitForLoadState( 'networkidle' );


 //ToDo: update every checkbox with check instead of click, check method , if checked remains checked
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 



// TODO: ********************api suite******************

//todo:  convert admin as vendor to vendor for whole suite
//todo:  fix rank math api
//todo:  create valid payload for every request : which doesn't cause php warning
//todo:  how customerID, vendorId will be feed in tests , from env_setup, from payload (might be cause circular error, or empty value 
// because import before call, on before-all)
//todo:  run every test separately and update if necessary
//todo:  run with parallel mode on , make tests independent if necessary
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo: 
//todo:  USe this for global setup, reporter or use two separate file for both suite
To expand on the process.env solution:

// playwright.config.ts
const config = {
	globalSetup: process.env.MODE === 'test' ? './test-global-setup.ts' : './production-global-setup.ts',
  };
  export default config;
  Run it like this:
  
  MODE=production npx playwright test




//todo:  read every playwright github issue & playwright comment

//todo:  convert testSummary from commonjs module to ex module
//todo:  implement new playwright settings 
//todo:  ['json', { outputFile: 'results.json' }] add json reporter and try to replace junit, ust json report for test summary
//todo:  fix npm run error without npx
//todo:  add last updated time on test summary



//todo:  readme

//todo:  add lite & pro config on readme
//todo:  add emoji to readme
//todo:  make readme follow readme guideline
//todo:  use chatgpt to rephrase readme
//todo:  test test env to doc
// About the environment
// The default values are:

// Latest stable WordPress version
// PHP 7.4
// Latest stable WordPress version
// MariaDB
// URL: http://localhost:8086/
// Admin credentials: admin/password



//todo:  add os and browsers in env info




// <----------------------------------------------- NEW TODO ------------------------------------------------->


//todo: ************ DON"T USE goIfNotThere where we need to reflact any changes done via api call or db table modification ************
 also after performing some test to load changes we need to skip goIfNotThere, also look for that
 test order can be the culprit too

//todo:  HANDLE ERROR: throw new Error('Badge is already published');
// either throw error or just return or convert to playwright error

//todo:  add modal or sub option on explotory tesing tests all
		//TOdo: assert either this or that 
		//todo: assert to have count more than , less than  used not-to-have-count

//todo:  export log test keep this
		// await Promise.all([
		// 	this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.logs) && resp.status() === 200),
		// 	this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.backend.dokan.downloadOrderLogs) && resp.status() === 200),
		// 	this.page.locator(selector.admin.dokan.reports.allLogs.exportLogs).click()
		// ]); //todo:  add wait for multiple different response on base-page
//todo:  add tag @explo to every view test and remove "@pro" form "@lite @pro" tests

//todo:  remove every eslint comment before push
//todo: replace every goto with goIfNotThere

// test.beforeAll(async ({ request }) => {
// 	apiUtils = new ApiUtils(request);
	// delete previous badges
//todo:	await apiUtils.deleteAllSellerBadges(); //todo:  apply this type of trick where possible
//todo: clear data in beforeAll where necessary









// tests to write

Store support
	//todo: filter store support by calendar
	//todo:  ask for get support on order received page

wholesale setting options tests
	//todo:  customer need or don't need approval : re-modify above two tests
	//todo:  only customer can see wholesale price
	//todo:  all users can see wholesale price
	//todo:  customer can purchase product at wholesale price
	//todo:  vendor can see Wholesale Price on Shop Archive
	//todo:  vendor can create wholesale product  via api

search
	//todo add new tests or multiple entry in same test for all search parameter, i.e : by-customer, by-product, but-store,..
refunds
 	//todo:  add separate test or separate entry in same test for all search parameter
	//todo:  add vendor tests
product advertisement
    //todo:  add search product advertisement by order
	//todo:  filter by calendar
	//todo:  add tests for every setting options
	//todo:  add vendor tests
rfq
	//todo:  add vendor tests

			//todo:  create a generic function for below scenario on base page
			await Promise.all([
				this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.quotes) && resp.status() === 200),
				this.page.waitForResponse((resp) => resp.url().includes(data.subUrls.api.dokan.products) && resp.status() === 200),
				this.page.locator(selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule).click()
			]);
reports 
	//todo:  filter by calendar
vendor stuff
	//todo:  add tests for all permission group
	//todo : add tests for email template
reverse withdraw

	//todo: filter reverse withdraws by calendar
	//todo:  add vendor tests

admin settings
	//todo:  add more set settings live search, sms gateway, seller verification, email verification
coupon
	//todo: add more customer tests
verifications
	//todo:  need multiple verification request for admin, use db alteration
	//todo:  admin can disapprove verification request
	//todo:  add vendor tests
	//todo: admin can approve phone verification request
store review
	// test('customer can edit store review @pro', async ( ) => {
	// 	//todo:  need separate method or update locator, ensure previous review exits
	// 	await customer.reviewStore(data.predefined.vendorStores.vendor1, data.store);
	// });

	//todo: delete, restore, and permanently delete can be merged into one

	//todo:  fix this clear filter not works
	// await this.goIfNotThere(data.subUrls.backend.dokan.storeReviews);
	// const clearIsVisible = await this.isVisible(selector.admin.dokan.storeReviews.filters.filterClear);
	// if(clearIsVisible) {
	// 	await this.clickAndWaitForResponse(data.subUrls.api.dokan.storeReviews, selector.admin.dokan.storeReviews.filters.filterClear);
	// }

follow Store
// test('customer can follow store on store listing @pro', async ( ) => {
// 	await customer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromStoreListing); //todo:  update parameter
// });
	//todo:  vendor can see followers, need followers via api
seller badge
	// test.skip('admin can filter vendors by seller badge  @pro', async ( ) => {
	// 	//todo:  need to wait 1 min after badge create ; run via background process; can background process can be automated
	// 	await admin.filterVendorsByBadge(data.sellerBadge.eventName.productsPublished);
	// });

	// test.skip('admin can view seller badge vendors @pro', async ( ) => {
	// 	//todo:  need to wait 1 min after badge create; run via background process ; can background process can be automated
	// 	await admin.sellerBadgeVendors(data.sellerBadge.eventName.productsPublished);
	// });
stores spec
// test.beforeAll(async ({ browser,  }) => {
// 	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
// 	aPage = await adminContext.newPage();
// 	admin = new StoresPage(aPage);
// 	// apiUtils = new ApiUtils(request);
// 	// [,, storeName] = await apiUtils.createStore(payloads.createStore());  //todo: ues different store all stores
});

stores page
store on map
// storeName && await this.toBeVisible(selector.customer.cStoreList.map.storeOnMap.storeOnList(storeName)); //todo:  need to update store settings via e2e to render on map for vendor1

products
	//todo:  import product


single product


	// product vendor info
	async productVendorInfo(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.click(selector.customer.cSingleProduct.menus.vendorInfo);
		await this.multipleElementVisible(selector.customer.cSingleProduct.vendorInfo);
		//todo:  assert actual value i.e. vendor info
	}


	// product location
	async productLocation(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.click(selector.customer.cSingleProduct.menus.location);
		await this.multipleElementVisible(selector.customer.cSingleProduct.location);
		//todo:  assert actual value i.e. location
	}

	// product warranty policy
	async productWarrantyPolicy(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.click(selector.customer.cSingleProduct.menus.warrantyPolicy);
		await this.multipleElementVisible(selector.customer.cSingleProduct.warrantyPolicy);
		//todo:  assert actual value i.e. warranty policy
	}

	async viewHighlightedVendorInfo(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.multipleElementVisible(selector.customer.cSingleProduct.vendorHighlightedInfo);
		//todo:  assert actual value i.e. vendor info
	}

stores page
	// search vendor
	async searchVendor(vendorName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.vendors);

		await this.clearInputField(selector.admin.dokan.vendors.search);

		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.search, vendorName);
		await this.toBeVisible(selector.admin.dokan.vendors.vendorCell(vendorName));

		// negative scenario //todo:  add this to all search also add flag to avoid this scenario
		// await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.vendors.search, vendorName + 'abcdefgh');
		// await this.toBeVisible(selector.admin.dokan.vendors.noRowsFound);

	}

seller badge

// vendor filter seller badge
async filterSellerBadges(option: string){
	await this.clickIfVisible(selector.vendor.vBadges.congratsModal.closeModal);

	await this.goIfNotThere(data.subUrls.frontend.vDashboard.badges);
	await this.selectByValue( selector.vendor.vBadges.filterBadges, option);
	const count = (await this.getElementText(selector.vendor.vBadges.numberOfBadgesFound))?.split(' ')[0];
	expect(Number(count)).not.toBe(0);
	//TOdo: either this or that assertion
	//todo: to have count more than
}


Reports 


	// search all logs
	async searchAllLogs(orderId: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

		await this.clearInputField(selector.admin.dokan.reports.allLogs.search);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.search, orderId);
		await this.toBeVisible(selector.admin.dokan.reports.allLogs.orderIdCell(orderId));
		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.clear); //todo: why
	}


	// export all logs
	async exportAllLogs(orderId: string){
		await this.searchAllLogs(orderId);
		await this.clickAndWaitForDownload(selector.admin.dokan.reports.allLogs.exportLogs);
	}


	// filter all logs by store
	async filterAllLogsByStore(storeName: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

		await this.click(selector.admin.dokan.reports.allLogs.filters.filterByStore);
		await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, selector.admin.dokan.reports.allLogs.filters.filterByStoreInput, storeName);
		await this.pressAndWaitForResponse(data.subUrls.api.dokan.logs, data.key.enter);

		const count = (await this.getElementText(selector.admin.dokan.reports.allLogs.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).not.toBe(0);
		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.clear); //todo: why
	}


	// filter all logs by status
	async filterAllLogsByStatus(orderStatus: string){
		await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

		await this.click(selector.admin.dokan.reports.allLogs.filters.filterByStatus);  //todo:  add multiselect option
		await this.type( selector.admin.dokan.reports.allLogs.filters.filterByStatusInput, orderStatus);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.searchedResult);
		const count = (await this.getElementText(selector.admin.dokan.reports.allLogs.numberOfRowsFound))?.split(' ')[0];
		expect(Number(count)).not.toBe(0);
		// await this.clickAndWaitForResponse(data.subUrls.api.dokan.logs, selector.admin.dokan.reports.allLogs.filters.clear); //todo: why
	}


_environmentcheck

	//todo:  try to fix product advertisement product, reversewithdraw product, storemap save via api, currently e2e is used




	setup('add test vendor orders @pro', async ({ request }) => {  //todo:  required for which test, might be replaced with create order with status
		const apiUtils = new ApiUtils(request);
		await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, customer_id: CUSTOMER_ID }, payloads.vendorAuth);
	});


















test Data
	//todo: use unique value for create and update for store categories, rfq name, rules.........baseURL..

interface/
	//todo:  interface should be one, no separate for create, update ....






api Suite 

api env
// setup.describe(' setup environment', () => {

// 	//todo:  remove this after : replacing admin as vendor
// 	setup('setup store settings @lite @pro', async () => {
// 		const [response, ] = await apiUtils.put(endPoints.updateSettings, { data: payloads.setupStore });
// 		expect(response.ok()).toBeTruthy();
// 	});


settings 
// test.afterAll(async () => {
//todo:  remove after update setting cause disable selling fix
// 	const [response, responseBody] = await apiUtils.put(endPoints.updateSettings, { data: payloads.setupStore });
// 	expect(response.ok()).toBeTruthy();
// 	expect(responseBody).toBeTruthy();
// });


refunds
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, orderResponseBody,] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-processing', payloads.vendorAuth);
	[, refundId] = await dbUtils.createRefund(orderResponseBody);
	//todo:  dokan get all refunds dont recognize refunded by woocommerce, find out why & try to use refund by api instead of db
	// [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund); // via woocommerce
});

reversewithdrawal

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	// check reverse withdrawal payment product exists //todo: add reverse withdraw check on setup
	// await apiUtils.getReverseWithdrawalProductId(); //todo:  failed on git action. payment product not created
	//todo:  add create product via admin after feature merged with pro
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, 'wc-completed', payloads.vendorAuth);
});



apiutils

//todo:  gather all interfaces in one place

interface auth {
	[key: string]: string;
 }

 interface user {
	username: string;
	password: string;


























dbquery

	// execute db query
	async dbQuery(query: string): Promise<any> {
		const dbContext: DbContext = new DbContext(mySql);
		return await dbContext.inTransactionAsync(async (dbContext) => { //todo:  grab connection failed actual reason, ambiguous error message
			try{
				const result = await dbContext.executeAsync(query);
				const res = JSON.parse(JSON.stringify(result));
				expect(res).not.toHaveProperty('errno'); //todo:  ADD Actual ASSERT DB_QUERY IS SUCCESSES, update it
				return res;
			}
			catch(err: unknown){
				// console.log('dbError:', err);
				return err;
			}
		});
	},

dbdata
generalSettings: {

	//site settings
	site_options: '', //todo: WHY EMPTY , value exists find out what

	// vendor store settings
	vendor_store_options: '', //todo: WHY EMPTY
}



basepage

	// TODO: apply pseudo-style
//TODo: add assertion to every base-page function
//todo: update every page method with locator method
	// returns whether the element is visible
	async isVisible(selector: string): Promise<boolean> {
		// return await this.isVisibleViaPage(selector);  //todo:  keep which one is better ; also update every page method with locator
		return await this.isVisibleLocator(selector);
	}

	// upload file
	async uploadFile(selector: string, files: string | string[]): Promise<void> {
		// await this.page.setInputFiles(selector, files, { noWaitAfter: true });
		await this.page.setInputFiles(selector, files);
		await this.wait(2); //todo:  need to handle wait gracefully
	}

// assert element to contain text
async toContainText(selector: string, text: string){
	await expect(this.page.locator(selector)).toContainText(text); //todo:  add lowercase for both expected and received


	// assert element to be visible
	// any of them , out of all,	
async toBeVisibleAnyOfThem(selectors: string[],){
	const res = [];
	for (const selector of selectors) {
		res.push(await this.isVisible(selector));
	}
	const result = res.includes(true);
	expect(result).toBeTruthy();
	//todo: which elements are true for further operation
}

async multipleElementVisible(selectors: any){

	// TODO: can also be merge with isVisible method and this method should support single selector too
	//todo:  implement for arrays
	// selectors = Object.values(selectors);
	// selectors.forEach( async (selector: string) => {
	// 	// console.log(selector);
	// await expect(this.page.locator(selector)).toBeVisible();
	// });

	for (const selector in selectors ) {
		// console.log(selectors[selector]);
		// await expect(this.page.locator(selectors[selector])).toBeVisible();
		await this.toBeVisible(selectors[selector]);
	}

}


	// delete element if exist (only first will delete) : dokan rma,report abuse
	async deleteIfExists(selector: string): Promise<void> {
		//todo:  there may be alternative solution, this method might not needed
		const elementExists = await this.isVisible(selector);
		if (elementExists) {
			const element = this.page.locator(selector);
			await element.click();
		}
	}

	// async clearInputField2(selector): Promise<void>  { //todo:  fix this method
	// 	let element = await this.getElement(selector)
	// 	await this.page.evaluate(element => element.value = '', element)
	// }

		// get element property value: background color
		async getElementColor(selector: string): Promise<string> {
			// TODO: All promise<string> should be Promise<string | null> , after refactor check for any conflict
			const element = this.page.locator(selector);
			const value = await element.evaluate((element) =>
				window.getComputedStyle(element).getPropertyValue('color'),
			);
			// console.log(value)
			return value;
		}

	// TODO: urgent : update wait for multiple different response
	// TODO: urgent : update wait for multiple same response

	// // click & wait for multiple responses
	// async clickAndWaitForResponses(subUrls:   string[][], selector: string, code = 200): Promise<void | Response[]> {
	// 	// 		// // const qrs: string[][] = [[data.subUrls.backend.quotes, '200'], [data.subUrls.backend.products, '200']];
	// 	// // const qrs: string[][] = [[data.subUrls.backend.quotes, '200']];
	// 	// await this.clickAndWaitForResponses(qrs, selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule);
	// 	// const promises = [];
	// 	// subUrls.forEach((subUrl) => {
	// 	// 	console.log('subUls: ', subUrl[0], ' code: ', subUrl[1]);
	// 	// 	// const promise = this.page.waitForResponse((resp) => resp.url().includes(subUrl[0] as string ) && resp.status() ===  (subUrl[1] ?? code));
	// 	// 	const promise = this.page.waitForResponse((resp) => resp.url().includes(subUrl[0]) && resp.status() ===  (subUrl[1]));
	// 	// 	promises.push(promise);
	// 	// });
	// 	// // promises.push(this.page.locator(selector).click());
	// 	// // const response = await Promise.all(promises);
	// 	// await Promise.all([
	// 	// 	...promises,
	// 	// 	this.page.locator(selector).click()
	// 	// ]);
	// 	// return response;
	// }

	// upload files when input file element is missing
	async uploadFileViaListener(selector: string, files: string | string[]): Promise<void> {
		this.page.on('filechooser', async (fileChooser) => { await fileChooser.setFiles(files); });
		await this.page.locator(selector).click(); // invokes the filechooser  //todo: convert with pormise all
	}


// test data

	customerInfo: {
		// emailDomain: '_' + faker.string.alphanumeric(5) + '@email.com',
		emailDomain: '@email.com',
		email: () => faker.internet.email(),
		password: String(process.env.USER_PASSWORD),
		password1: String(process.env.USER_PASSWORD) + '1',
		firstName: () => faker.person.firstName('male'),
		lastName: () => faker.person.lastName('male'),
		// username: () => this.customer.customerInfo.firstName, //todo:  handel callback  & not works
		// storename: () => this.customer.customerInfo.firstName + 'store',



		customerInfo: {
			// emailDomain: '_' + faker.string.alphanumeric(5) + '@email.com',
			emailDomain: '@email.com',
			email: () => faker.internet.email(),
			password: String(process.env.USER_PASSWORD),
			password1: String(process.env.USER_PASSWORD) + '1',
			firstName: () => faker.person.firstName('male'),
			lastName: () => faker.person.lastName('male'),
			// username: () => this.customer.customerInfo.firstName,
			// storename: () => this.customer.customerInfo.firstName + 'store',
			role: 'customer',
			username: () => faker.person.firstName('male'),
			storename: () => faker.person.firstName('male') + 'store',
			companyName: faker.company.name(),
			companyId: faker.string.alphanumeric(5),
			vatNumber: faker.string.alphanumeric(10),
			bankIban: faker.finance.iban(),
			phone: faker.phone.number('(###) ###-####'),
			street1: 'abc street', //todo:  address should be global or not
			street2: 'xyz street',
			country: 'United States (US)',
			countrySelectValue: 'US',
			stateSelectValue: 'NY',
			city: 'New York',


			quoteRule: {
				title: 'test quote rule',  //todo:  title must be  used with uuid, tests are failing because of that
				userRole: '',
				product: 'p1_v1 (simple)',
				category: 'Uncategorized',
				hidePrice: '1',
				hidePriceText: 'Price is hidden',
				hideAddToCartButton: 'keep_and_add_new', // replace, keep_and_add_new
				customButtonLabel: 'Add to quote',
				order: '0',
			},

			updateQuote:{
				title: 'test quote', // title should be same as create, cause search by title //todo:  updatedTitle:  can be added
				user: 'customer1',
				fullName: 'Jhon Doe',
				email: 'customer1@g.com',
				companyName: 'abc',
				phoneNumber: '0123456789',
				product: 'p1_v1 (simple)',
				quantity: '', //todo:  because of interface, resolve interface issue
				offerPrice: '70',
				offerProductQuantity: '20',
			},


			convertedQuote:{
				title: 'converted quote ' + faker.string.uuid(),  //todo:  more test date need to be unique, apply this
			}
	