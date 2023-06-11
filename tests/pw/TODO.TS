
//TODO ***** list all core tests and setup tests : plugins activated, wp settings, woocommerce settings, dokan modules activated , dokan settings for both e2e and api
//TODO: slack integration
//TODO: working-directory: ./path/to/tests
//TODO: update auth if expired instead of every-time
//TODO: solve reporter path conflict
//TODO: add color on git action
//TODO: separate two junit report showing on simple git-action summary
//TODO: separate everything for local & CI like: global setup, env, playwright config
//TODO: implement fixture for lite pro issue handle
//TODO: separate globalSetup for local & CI , cant reg user every time for local site or find another soln.
//TODO: #  // "no-unused-vars": "off" is enabled for now but remove before push
//TODO: test basic auth can be used instead of cookies for authentication
//TODO: # Configure projects for multiple environments : ci, local,
//TODO: # convert waitForNavigation to waitForUrl
//TODO: # why two pages are opening : fix that
//TODO: # test should run parallely
//TODO: # add fixture
//TODO: use extrahttpheaders: for grab storage.json  // not possible
//TODO: usr extrahttpheaders: for test describe and avoid storage.json all-together
//TODO: convert all expect parameter to correct way: left side received and right part expected
//TODO: convert all string assertion:
//TODO: remove all single events like waitforNavigation, waitForUrl, 
// filter received & expected test
// trim if necessary
// lowercase
//TODO: add system info after git action info via system status function, current theme should be there
//TODO: use only one password for every user FOR both suite e2e and api
//TODO: theme is not activating fix this
//TODO: test cli dont work
//TODO: fix permalink issue 
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:







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

//TODO: follow woocommerce project structure like global setup, teardown, ....

//TODO: Grab stateDir, baseURL from config
const { stateDir, baseURL, userAgent } = config.projects[ 0 ].use;

console.log( `State Dir: ${ stateDir }` );
console.log( `Base URL: ${ baseURL }` );


//TODO: try this for wait for navigation
// await page.waitForLoadState( 'networkidle' );


//TODO: file upload : plugin
// const [ fileChooser ] = await Promise.all( [
//     page.waitForEvent( 'filechooser' ),
//     page.click( '#pluginzip' ),
// ] );
// await fileChooser.setFiles( woocommerceZipPath );


//TODO: can implement test.step
// test( `can update WooCommerce to "${ UPDATE_WC }"`, async ( {
//     page,
//     baseURL,
// } ) => {

// await test.step(
//     'Choose the option "Replace current with uploaded"',
//     async () => { 


//     });

// });



//TODO: what is expect.poll

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

//TODO: try error.response.data

response = await axios( options ).catch( ( error ) => {
    if ( error.response ) {
        console.error( error.response.data );
    }
    throw new Error( error.message );
} );

//TODO: use this for plugin download and activate scenario
response.data.pipe( fs.createWriteStream( zipFilePath ) );



//TODO: use this for run command via code , built a utility function
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


    //TODO: what is page.dispatchEvent
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



//TODO: why waitUntil on goto , what is the default value
    await page.goto(
        'wp-admin/admin.php?page=wc-settings&tab=shipping&zone_id=new',
        { waitUntil: 'networkidle' }
    );

//TODO: ensure empty cart like this , try to use both clearCookies to clear cart & storagejson for authenticate user
// check clearcookies clear storagejson or not
	test.beforeEach( async ( { context, page } ) => {
		// Shopping cart is very sensitive to cookies, so be explicit
		await context.clearCookies();

		await page.goto( `/shop/?add-to-cart=${ productId }` );
		await page.waitForLoadState( 'networkidle' );
	} );


	//TODO: use this instead of networkidle
	// Start test
	await page.waitForLoadState( 'networkidle' );



//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:



// TODO: ********************api suite******************

//TODO: convert admin as vendor to vendor for whole suite
//TODO: fix rank math api
//TODO: create valid payload for every request : which doesn't cause php warning
//TODO: how customerID, vendorId will be feed in tests , from env_setup, from payload (might be cause circular error, or empty value 
// because import before call, on before-all)
//TODO: run every test separately and update if necessary
//TODO: run with parallel mode on , make tests independent if necessary
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO:
//TODO: USe this for global setup, reporter or use two separate file for both suite
To expand on the process.env solution:

// playwright.config.ts
const config = {
	globalSetup: process.env.MODE === 'test' ? './test-global-setup.ts' : './production-global-setup.ts',
  };
  export default config;
  Run it like this:
  
  MODE=production npx playwright test




//TODO: read every playwright github issue & playwright comment