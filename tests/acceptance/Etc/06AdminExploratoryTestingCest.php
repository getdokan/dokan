<?php 
// namespace Etc;


class AdminExploratoryTestingCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Admin Exploratory testing 
    public function adminExploratoryTesting(\Step\Acceptance\MultiSteps $I)
    {
    	$I->loginAsAdmin();
    	$I->click('Dokan');
    	   $I->waitForElementVisible('.widgets-wrapper', 30);
           $I->checkError();
    	$I->click('Withdraw');
            $I->waitForElementVisible('.withdraw-requests', 30);
            $I->checkError();
    	$I->click('Vendors');
            $I->waitForElementVisible('.vendor-list', 30);
            $I->checkError();
    	$I->click('Abuse Reports');
            $I->waitForElementVisible('#vue-backend-app', 30);
            $I->checkError();
    	$I->amOnPage('/wp-admin/admin.php?page=dokan#/store-reviews');
    	// $I->click('//li[@id="toplevel_page_dokan"]/ul/li[6]/a','Store Reviews');
    	// $I->waitForElement('.dokan-store-reviews', 30);
            $I->waitForElementVisible('.dokan-store-reviews', 30);
            $I->checkError();
    	$I->click('Announcements');
            $I->waitForElementVisible('.dokan-announcement-wrapper', 30);
            $I->checkError();
    	$I->click('Refunds');
            $I->waitForElementVisible('.dokan-refund-wrapper', 30);
            $I->checkError();
    	$I->click('Reports');
            $I->waitForElementVisible('#vue-backend-app', 30);
            $I->checkError();
            $I->click('All Logs');
                $I->waitForElementVisible('#vue-backend-app', 30);
                $I->checkError();
    	$I->click('Modules');
            $I->waitForElementVisible('.module-content', 30);
            $I->checkError();
    	$I->click('Tools');
            $I->waitForElementVisible('.tools-page', 30);
            $I->checkError();
    	$I->click('Subscriptions');
            $I->waitForElementVisible('.subscription-list', 30);
            $I->checkError();
    	$I->click('Verifications');
            $I->waitForElementVisible('#wpbody-content', 30);
            $I->checkError();
    	$I->click('Wholesale Customer');
            $I->waitForElementVisible('.wholesale-customer-list', 30);
            $I->checkError();
    	$I->click('Help');
            $I->waitForElementVisible('#wpbody-content', 30);
            $I->checkError();
        // $I->amOnPage('/wp-admin/admin.php?page=dokan#/settings');
    	$I->click('Settings');
            $I->waitForElementVisible('#dokan_general', 30);
            $I->checkError();
            // $I->click('Save Changes');
            // $I->waitForElementVisible('#setting-message_updated', 5);
    	$I->click('Selling Options');
    		$I->waitForElementVisible('#dokan_selling', 30);
            $I->checkError();
            // $I->click('Save Changes'); 
            // $I->waitForElementVisible('#setting-message_updated', 5);
    	$I->click('Withdraw Options');
            $I->waitForElementVisible('#dokan_withdraw', 30);
            $I->checkError();
            // $I->click('Save Changes');
            // $I->waitForElementVisible('#setting-message_updated', 5);
    	$I->click('Page Settings');
	    	$I->waitForElementVisible('#dokan_pages', 30);
            $I->checkError();
        $I->click('//a[5]');
            $I->waitForElementVisible('#dokan_appearance', 30);
            $I->checkError();
        $I->click('Privacy Policy');
            $I->waitForElementVisible('#dokan_privacy', 30);
            $I->checkError();
        $I->click('Seller Verification');
            $I->waitForElementVisible('#dokan_verification', 30);
            $I->checkError();
        $I->click('Verification SMS Gateways');
            $I->waitForElementVisible('#dokan_verification_sms_gateways', 30);
            $I->checkError();
        $I->click('Colors');
            $I->waitForElementVisible('#dokan_colors', 30);
            $I->checkError();
        $I->click('Email Verification');
            $I->waitForElementVisible('#dokan_email_verification', 30);
            $I->checkError();
        $I->click('Social API');
            $I->waitForElementVisible('#dokan_social_api', 30);
            $I->checkError();        
        $I->click('Live Chat');
            $I->waitForElementVisible('#dokan_live_chat', 30);
            $I->checkError();
        $I->click('RMA');
            $I->waitForElementVisible('#dokan_rma', 30);
            $I->checkError();
        $I->click('Wholesale');
            $I->waitForElementVisible('#dokan_wholesale', 30);
            $I->checkError();
        $I->click('Geolocation');
            $I->waitForElementVisible('#dokan_geolocation', 30);
            $I->checkError();
        $I->click('Product Report Abuse');
            $I->waitForElementVisible('#dokan_report_abuse', 30);
            $I->checkError();
        $I->click('Single Product MultiVendor');
            $I->waitForElementVisible('#dokan_spmv', 30);
            $I->checkError();
        $I->click('Product Subscription');
            $I->waitForElementVisible('#dokan_product_subscription', 30);
            $I->checkError();
        $I->click('Vendor Analytics');
            $I->waitForElementVisible('#dokan_vendor_analytics', 30);
            $I->checkError();
    }
}
