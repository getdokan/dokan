Feature('explore Frontend Functionality');

Before(({ I }) => { // or Background
    // loginAs('user');
    const loginBtnText = 'login';
    
    I.amOnPage('/my-account/');
    I.fillField('username', 'jones');
    I.fillField('password', 'aa');
    I.checkOption('Remember me');
    I.click(loginBtnText);
    I.dontSeeElement('.woocommerce-error');
  });

Scenario('Preview and Explore Vendor Dashboard', ({ I }) => {
        I.seeInCurrentUrl('/dashboard');
            I.waitForElement('.dokan-dashboard-content');
            I.checkError();
                I.seeElement('.dokan-progress');
                I.see('Sales');
                I.see('Sales this Month');
                I.see('Orders');
                I.see('Latest Announcement');
                I.see('Reviews');
                I.see('Products');
        I.click('Products');
        I.seeInCurrentUrl('/dashboard/products/');
            I.waitForElement('.dokan-product-listing-area');
            I.checkError();
                I.seeElement('.active');
                I.seeElement('.active','All');
                I.see('Online');
                I.seeElement('.dokan-add-product-link','Add new Product');
                I.seeElement('.dokan-add-product-link','Import');
                I.seeElement('.dokan-add-product-link','Export');
                I.seeElement('form','All dates');
                I.seeElement('form','Select a category');
                I.seeElement('form','Filter');
                I.seeElement('form','Search Products');
                I.seeElement('form','Search');
                I.seeElement('form','Bulk Actions');
                I.seeElement('form','Apply');
                I.seeElement('table','.dokan-checkbox');
                I.seeElement('table','Image');
                I.seeElement('table','Name');
                I.seeElement('table','Status');
                I.seeElement('table','SKU');
                I.seeElement('table','Stock');
                I.seeElement('table','Price');
                I.seeElement('table','Earning');
                I.seeElement('table','Type');
                I.seeElement('table','Views');
                I.seeElement('table','Date');    
        I.click('Orders');
            I.waitForElement('.dokan-orders-area');
            I.checkError();
        I.click('Coupons');
            I.waitForElement('.dashboard-coupons-area');
            I.checkError();
        I.click('Reports');
            I.waitForElement('.dokan-dashboard-content.dokan-reports-content');
            I.checkError();
                I.click('Sales by day');
                I.checkError();
                I.click('Top selling');
                I.checkError();
                I.click('Top earning');
                I.checkError();
                I.click('Statement');
                I.checkError();
        I.click('Reviews');
            I.waitForElement('.dokan-comments-wrap');
            I.checkError();
        I.click('Withdraw');
            I.waitForElement('.dokan-withdraw-area');
            I.checkError();
        I.click('Return Request');
            I.waitForElement('.dokan-rma-request-area');
            I.checkError();
        I.click('Staff');
            I.waitForElement('.dokan-staffs-area');
            I.checkError();
        I.click('Followers');
            I.waitForElement('.dashboard-content-area');
            I.checkError();
            // commit off her
		// I.click('Subscription');
		// 	I.waitForElement('.dokan-dashboard-content');
        //     // I.checkError();
        //     I.dontSee('Warning');
	    //     I.dontSee('Fatal error');
	    //     I.dontSee('Notice:');
		// I.click('Analytics');
		// I.waitForElement('.dokan-reports-area');
		I.click('Tools');
            I.waitForElement('#post-6');
            I.checkError();
				I.click('Export');
                I.waitForElement('#post-6');
                I.checkError();
		I.click('.support');
            I.waitForElement('.dokan-support-topics-list');
            I.checkError();
		I.click('Settings');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
		I.click('Payment');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
		I.click('Verification');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
		// I.click('Shipping');
        //     I.waitForElement('.dokan-settings-area');
        //     I.checkError();
		I.click('ShipStation');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
		I.click('Social Profile');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
		I.click('RMA');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
		I.click('Store SEO');
            I.waitForElement('.dokan-settings-area');
            I.checkError();
});


Scenario('Preview and Explore Vendor Account Page', ({ I }) => {
		I.amOnPage('/dashboard/settings/store/');
		I.click('a.tips');
        I.waitForElement('.content-area');
        I.checkError();
    // I.switchToPreviousTab();         //Switch prevoius Tab
    I.closeCurrentTab();                // Close  urrent Tab

	I.amOnPage('/cart');
        I.waitForElement('#content');
        I.checkError();
	I.amOnPage('/checkout');
        I.waitForElement('#content');
        I.checkError();
	I.amOnPage('/shop');
        I.waitForElement('#content');
        // I.checkError();
	I.amOnPage('/store-listing');
		I.waitForElement('#content');
		I.checkError();
	// I.lastBrowserTab();*/

});

Scenario('Preview and Explore Vendor Store Page', ({ I }) => {
	I.amOnPage('/my-account');
        I.waitForElement('#content');
        I.checkError();
        I.click('Orders');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        I.click('Downloads');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        I.click('Addresses');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        I.click('Account details');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        I.click('RMA Requests');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        I.click('Vendors');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        I.click('Seller Support Ticket');
            I.waitForElement('.woocommerce-MyAccount-content');
            I.checkError();
        // I.dontSee('.woocommerce','Notice');
        I.click('Logout');	
});


