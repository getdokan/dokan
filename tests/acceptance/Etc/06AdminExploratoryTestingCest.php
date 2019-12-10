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
    	$I->waitForElement('.widgets-wrapper', 30);
    	$I->click('Withdraw');
    	$I->click('Vendors');
    	$I->click('Abuse Reports');
    	$I->amOnPage('/wp-admin/admin.php?page=dokan#/store-reviews');
    	// $I->click('//li[@id="toplevel_page_dokan"]/ul/li[6]/a','Store Reviews');
    	// $I->waitForElement('.dokan-store-reviews', 30);
    	$I->click('Announcements');
    	$I->click('Refunds');
    	$I->click('Reports');
    	$I->click('Modules');
    	$I->click('Tools');
    	$I->click('Subscriptions');
    	$I->click('Verifications');
    	$I->click('Wholesale Customer');
    	$I->click('Help');
    	$I->click('Settings');
    	// $I->waitForElement('.dokan-settings', 30);
    	$I->wait(5);
    		// $I->click('General');
    		$I->click('Selling Options');
    			$I->click('//div[2]/form/p/input');
	      		$I->waitForElementVisible('#setting-message_updated', 5);
    		    $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
    		$I->click('Withdraw Options');
    			$I->click('//div[3]/form/p/input');
	      		$I->waitForElementVisible('#setting-message_updated', 5);
    			$I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
                $I->wait(5);
    		$I->click('Page Settings');
	    		$I->click('//div[4]/form/p/input');
	      		$I->waitForElementVisible('#setting-message_updated', 5);
	    		$I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            // $I->click('Appearance');
            //     $I->click('//div[5]/form/p/input');
            //     $I->waitForElementVisible('#setting-message_updated', 5);
            //     $I->waitForElement('.metabox-holder', 30);
            //     $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Privacy Policy');
                $I->click('//div[6]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Seller Verification');
                $I->click('//div[7]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Verification SMS Gateways');
                $I->click('//div[8]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Colors');
                $I->click('//div[9]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Email Verification');
                $I->click('//div[10]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Social API');
                $I->click('//div[11]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Live Chat');
                $I->click('//div[12]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('RMA');
                $I->click('//div[13]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Wholesale');
                $I->click('//div[14]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Geolocation');
                $I->click('//div[15]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Product Report Abuse');
                $I->click('//div[16]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Single Product MultiVendor');
                $I->click('//div[17]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
            $I->click('Product Subscription');
                $I->click('//div[18]/form/p/input');
                $I->waitForElementVisible('#setting-message_updated', 5);
                $I->waitForElement('.metabox-holder', 30);
                $I->scrollTo('.dokan-settings', 0,0);
    }
}
