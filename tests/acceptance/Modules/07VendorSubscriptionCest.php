<?php 
// namespace Modules;


class VendorSubscriptionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

	// public function vendorSubscription(\Step\Acceptance\Login $I)
 //    {
 //       $I->loginAsAdmin();
 //       $I->amOnPage('/wp-admin/index.php');
 //       $I->click('Dokan');
 //       // $I->click('Modules');
 //       $I->wait(3);
 //       $I->click('Settings');
 //       $I->wait(5);
 //       $I->click(' Product Subscription');
 //      // $I->checkOption('dokan_product_subscription[enable_pricing]');
 //       //$I->appendField('//div[@id="dokan_product_subscription"]/form/table/tbody/tr[2]/td/fieldset/label/input');
 //       $I->checkOption('dokan_product_subscription[enable_subscription_pack_in_reg]');
 //       $I->checkOption('dokan_product_subscription[notify_by_email]');
 //       $I->fillField('dokan_product_subscription[no_of_days_before_mail]','2');
 //      // $I->checkOption("//div[16]/form/table/tbody/tr[2]/td/fieldset/label");
 //       $I->click('Save Changes');
 //    }

    public function VendorProductSubscriptionPackage(\Step\Acceptance\Login $I)
    {
        $I->loginAsAdmin();
               $I->amOnPage('/wp-admin/index.php');

        $I->click('Products');
        $I->wait(5);
        $I->click('//*[@id="menu-posts-product"]/ul/li[3]/a');

        // $I->wait(3);
        // $I->click('//*[@id="wpbody-content"]/div[4]/a[1]');
        $I->wait(2);
        $I->fillField('#title','Gold Subcroption');
        $I->appendField('#product-type','Dokan Subscription');
        $I->fillField('_regular_price','260');
        $I->fillField('_no_of_product','500');
        $I->appendField('_subscription_product_admin_commission_type','Flat');
        // $I->appendField('//div[3]/div/div[5]/div/select','grocery');
        $I->click('#publishing-action','Publish');
    }
}
