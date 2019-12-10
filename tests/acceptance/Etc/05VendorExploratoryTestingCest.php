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
    	// $I->amOnPage('/dashboard');
    	$I->waitForElement('.dashboard-content-area', 30);
    	$I->click('Products');
    	$I->waitForElement('.dokan-product-listing-area', 30);
    	$I->click('Orders');
    	$I->waitForElement('.dokan-orders-area', 30);
    	$I->click('Coupons');
    	$I->waitForElement('.dashboard-coupons-area', 30);
    	$I->click('Reports');
    	$I->waitForElement('.dokan-dashboard-content.dokan-reports-content', 30);
    		$I->click('Sales by day');
    		$I->click('Top selling');
    		$I->click('Top earning');
    		$I->click('Statement');
    	$I->click('Reviews');
    	$I->waitForElement('.dokan-comments-wrap', 30);
    	$I->click('Withdraw');
    	$I->waitForElement('.dokan-withdraw-area', 30);
    	$I->click('Return Request');
    	$I->waitForElement('.dokan-rma-request-area', 30);
    	$I->click('Staff');
    	$I->waitForElement('.dokan-staffs-area', 30);
    	$I->click('Followers');
    	$I->waitForElement('.dashboard-content-area', 30);
		$I->click('Subscription');
		$I->waitForElement('.dokan-dashboard-content', 30);
		// $I->click('Analytics');
		// $I->waitForElement('.dokan-reports-area', 30);
		$I->click('Tools');
		$I->waitForElement('#post-5', 30);
			$I->click('Export');
			$I->waitForElement('#post-5', 30);
		$I->click('Support');
		$I->waitForElement('.dokan-support-topics-list', 30);
		$I->click('Settings');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('Payment');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('Verification');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('Shipping');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('ShipStation');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('Social Profile');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('RMA');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('Store SEO');
		$I->waitForElement('.dokan-settings-area', 30);
		$I->click('//a[2]/i');
		$I->waitForElement('.edit-account', 30);
		$I->click('//div[@id="dokan-navigation"]/ul/li[15]/a/i');
		$I->wait(5);
		// $I->switchToPreviousTab();
		$I->lastBrowserTab();
		// $I->waitForElement('.dokan-info', 30);
		// $I->scrollTo('#dokan-content', 100,100);
			$I->amOnPage('/my-account');
			// $I->wait(5);
			$I->click('Orders');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			$I->click('Downloads');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			$I->click('Addresses');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			$I->click('Account details');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			$I->click('RMA Requests');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			$I->click('Vendors');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			$I->click('Seller Support Ticket');
			$I->waitForElement('.woocommerce-MyAccount-content', 30);
			// $I->dontSee('.woocommerce','Notice');
			$I->click('Log out');
    }
}
