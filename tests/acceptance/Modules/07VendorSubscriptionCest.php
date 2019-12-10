<?php 
// namespace Modules;

class VendorSubscriptionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

	 //Admin create vendor package
    public function createSubscriptionPackage(\Step\Acceptance\Login $I)
    {
        $I->loginAsAdmin();
        $I->click('Dokan');
        $I->wait(3);
        $I->click('Settings');
        $I->wait(3);
        $I->click('Product Subscription');
        $I->seeCheckboxIsChecked('dokan_product_subscription[enable_pricing]');
        $I->seeCheckboxIsChecked('#dokan_product_subscription[enable_subscription_pack_in_reg]');
        $I->seeCheckboxIsChecked('#dokan_product_subscription[notify_by_email]');
        $I->fillField('//*[@id="dokan_product_subscription[no_of_days_before_mail]"]','5');
        $I->selectOption('dokan_product_subscription[product_status_after_end]','Published');
        $I->wait(5);
        // $I->waitForElement('//div[18]/form/p/input',30);
        $I->click(['css' => '#dokan_product_subscription #submit']);
        // $I->click('Save Changes');
        $I->wait(3);
        $I->click('Products');
        $I->wait(3);
        $I->click('//div[3]/a');
        $I->wait(2);
        $I->fillField('#title','Bronze Subscription Pack');
        $I->selectOption('#product-type','Dokan Subscription');
        $I->fillField('_regular_price','400');
        $I->wait(3);
        $I->appendField('//input[@id="_no_of_product"]','500');
        $I->wait(3);
        $I->fillField('#_pack_validity','250');
        $I->selectOption('_subscription_product_admin_commission_type','Flat');
        $I->fillField('#admin_commission','15');
        $I->selectOption('dokan_product_author_override','admin');
        $I->wait(3);
        $I->scrollTo('#wpbody-content', 0, 0);
        $I->click(['name' => 'publish']);
        $I->wait(3);
    }
    public function vendorBuySubscription(\Step\Acceptance\Login $I ,\Page\Acceptance\AccountPage $vendor,\Page\Acceptance\ProductPage $product)
    {
        $I->loginAsVendor();
        $I->click('Products');
        $I->seeLink('update your package');
        $I->click(['css' => '.dokan-info > a']);
        $I->wait(5);
        $I->click(['css' => '.product_pack_item:nth-child(1) .dokan-btn']);
        $I->wait(3);
        //Form Field
        $I->click('//*[@id="place_order"]');
        $I->dontSee('.woocommerce-NoticeGroup.woocommerce-NoticeGroup-checkout');
        $I->wait(5);
        ///Admin Approver Vendor Subscription Request
        $AdminApprove = $I->haveFriend('AdminApprove');
        $AdminApprove->does(function(AcceptanceTester $I){
            $I->loginAsAdmin();
            $I->click('WooCommerce');
            $I->wait(3);
            $I->click('//td/a');
            $I->wait(3);
            $I->click('Completed');
        });
        $AdminApprove->leave();        
        $I->click('Dashboard');
        $I->click('Products');
        $product->create('Red Shoe','1500','Uncategorized');
        $I->wait(5);
    }
}

/*
Scenario required:
    -Write subscription cancel scenario
    -Need to write more scennario about vendor request warranty fro subscription
    -
*/











