<?php
use Codeception\Util\Locator;

class SellerStoreSupportCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function sellerStoreSupport(\Step\Acceptance\Login $I)
    {   
      $I->loginAsVendor();
      $I->click('Settings');
      $I->click('Store');
      $I->wait(3);
      $I->checkOption('#support_checkbox');
      $I->scrollTo('#dokan_support_btn_name',20,40);
      $I->fillfield('#dokan_support_btn_name','Want to need support');
      $I->click('Update Settings');
      $I->wait(5);
       $CustomerView = $I->haveFriend('CustomerView');
        $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            $I->click('Store List');
            $I->wait(2);
            $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
            $I->wait(5);
           // $I->scrollTo('Want to need support',30,40);
            $I->click('Want to need support');
            $I->wait(5);
            $I->fillfield('#dokan-support-subject','need support');
            $I->click('//select[@name="order_id"]');
            $I->click(Locator::elementAt('//option[2]', 1));
            $I->fillfield('#dokan-support-msg','This product is too bad');
            $I->click('Submit');
            $I->wait(5);
       });
       $CustomerView->leave();
       $I->amOnPage('/dashboard/support/');
       $I->wait(2);
       $I->click(Locator::elementAt('//td/a', 1));
       $I->wait(2);
       $I->fillfield('comment','ok done');
       $I->appendfield('dokan-topic-status-change','Close Ticket');
       $I->click('Submit Reply');
       $I->wait(5);
    $CustomerView1 = $I->haveFriend('CustomerView1');
        $CustomerView1->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            //$I->click('Store List');
            $I->wait(2);
            $I->click('My account');
            $I->wait(2);
            $I->click('Seller Support Tickets');
            $I->click('All Tickets');
            $I->click(Locator::elementAt('//td/a', 1));
            $I->scrollTo('.woocommerce-MyAccount-content', 50,50);
            $I->wait(5);
       });
       $CustomerView1->leave();
    }
}
