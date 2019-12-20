<?php 
// namespace Etc;


class VendorExploratoryTestingCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Exploratory testing for vendor dashboard
    public function vendorExploratoryTesting(\Step\Acceptance\MultiSteps $I)
    {
    	$I->loginAsVendor();
    	$I->seeInCurrentUrl('/dashboard');
    		$I->waitForElementVisible('.dashboard-content-area', 30);
    		$I->checkError();
    	$I->click('Products');
    		$I->waitForElementVisible('.dokan-product-listing-area', 30);
    		$I->checkError();
    	$I->click('Orders');
    		$I->waitForElementVisible('.dokan-orders-area', 30);
    		$I->checkError();
    	$I->click('Coupons');
    		$I->waitForElementVisible('.dashboard-coupons-area', 30);
    		$I->checkError();
    	$I->click('Reports');
	    	$I->waitForElementVisible('.dokan-dashboard-content.dokan-reports-content', 30);
	    	$I->checkError();
	    		$I->click('Sales by day');
	    			$I->checkError();
	    		$I->click('Top selling');
	    			$I->checkError();
	    		$I->click('Top earning');
	    			$I->checkError();
	    		$I->click('Statement');
	    			$I->checkError();
    	$I->click('Reviews');
    		$I->waitForElementVisible('.dokan-comments-wrap', 30);
    		$I->checkError();
    	$I->click('Withdraw');
    		$I->waitForElementVisible('.dokan-withdraw-area', 30);
    		$I->checkError();
    	$I->click('Return Request');
    		$I->waitForElementVisible('.dokan-rma-request-area', 30);
    		$I->checkError();
    	$I->click('Staff');
    		$I->waitForElementVisible('.dokan-staffs-area', 30);
    		$I->checkError();
    	$I->click('Followers');
    		$I->waitForElementVisible('.dashboard-content-area', 30);
    		$I->checkError();
		$I->click('Subscription');
			$I->waitForElementVisible('.dokan-dashboard-content', 30);
			$I->checkError();
		// $I->click('Analytics');
		// $I->waitForElement('.dokan-reports-area', 30);
		$I->click('Tools');
			$I->waitForElementVisible('#post-5', 30);
			$I->checkError();
				$I->click('Export');
				$I->waitForElementVisible('#post-5', 30);
				$I->checkError();
		$I->click('Support');
			$I->waitForElementVisible('.dokan-support-topics-list', 30);
			$I->checkError();
		$I->click('Settings');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('Payment');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('Verification');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('Shipping');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('ShipStation');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('Social Profile');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('RMA');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		$I->click('Store SEO');
			$I->waitForElementVisible('.dokan-settings-area', 30);
			$I->checkError();
		// $I->amOnPage('/dashboard/settings/store/');
		$I->click('a.tips');
			$I->waitForElementVisible('.content-area', 30);
			$I->checkError();

		$I->lastBrowserTab();

		$I->amOnPage('/cart');
			$I->waitForElementVisible('#content', 30);
			$I->checkError();
		$I->amOnPage('/checkout');
			$I->waitForElementVisible('#content', 30);
			$I->checkError();
		$I->amOnPage('/shop');
			$I->waitForElementVisible('#content', 30);
			$I->checkError();
		$I->amOnPage('/store-listing');
			$I->waitForElementVisible('#content', 30);
			$I->checkError();
		// $I->lastBrowserTab();
		$I->amOnPage('/my-account');
			$I->waitForElementVisible('#content', 30);
			$I->checkError();
			// $I->wait(5);
			$I->click('Orders');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->click('Downloads');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->click('Addresses');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->click('Account details');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->click('RMA Requests');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->click('Vendors');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->click('Seller Support Ticket');
				$I->waitForElementVisible('.woocommerce-MyAccount-content', 30);
				$I->checkError();
			$I->dontSee('.woocommerce','Notice');
			$I->click('Log out');
			$logs = $I->getJsLog();
    }
}
