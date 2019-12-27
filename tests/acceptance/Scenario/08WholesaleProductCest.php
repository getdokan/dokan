<?php 
// namespace Modules;
use \Codeception\Util\Locator;


class WholesaleProductCest
{
    public function _before(\Step\Acceptance\MultiSteps $I)
    {
      $I->loginAsAdmin();
      $I->click('Dokan');
      $I->wait(3);
      $I->click('Settings');
      $I->wait(5);
      $I->click('Wholesale');
      $I->scrollTo('.dokan-settings', 0,0);
 
    }

    public function displayPriceToAllUsers(\Step\Acceptance\MultiSteps $I)
    {
      
      //Display wholesale price to all users
      $I->selectOption('#dokan_wholesale[wholesale_price_display][all_user]', 'Display wholesale price to all users');
      $I->seeCheckboxIsChecked('#dokan_wholesale[display_price_in_shop_archieve]');
      $I->click('//div[19]/form/p/input');
      $I->waitForElementVisible('#setting-message_updated', 5);

      $CustomerView = $I->haveFriend('CustomerView');
        $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsVendor();
              $I->addProduct();
              $I->wait(5);
              $I->selectOption('#wholesale[enable_wholesale]','Enable wholesale for this product');
              $I->wait(5);
              $I->fillField('#dokan-wholesale-price', 450);
              $I->fillField('#dokan-wholesale-qty', 5);
              $I->click('Save Product');
              $I->waitForElementVisible('.dokan-message', 5);
            $I->click('Log out');
            // $I->click('Log in');
            $I->loginAsCustomer();
            $I->amOnPage('/shop/');
            $I->selectOption('//select[@name="orderby"]','Sort by latest');
            $I->click('//main[@id="main"]/ul/li/a/img');
            $I->placeOrder();
            $I->wait(5);
       });
        $CustomerView->leave();
    }

    public function displayPriceToWholesaleCustomer(\Step\Acceptance\MultiSteps $I)
    {

       //Display wholesale price to Wholesale customer only
        $I->selectOption('#dokan_wholesale[wholesale_price_display][wholesale_customer]', 'Display wholesale price to Wholesale customer only');
        $I->selectOption('#dokan_wholesale[need_approval_for_wholesale_customer]', 'Yes');
        $I->click('//div[19]/form/p/input');
        $I->waitForElementVisible('#setting-message_updated', 5);

          $CustomerView = $I->haveFriend('CustomerView');
            $CustomerView->does(function(AcceptanceTester $I){
                $I->loginAsCustomer();
                $I->amOnPage('/shop/');
                $I->selectOption('//select[@name="orderby"]','Sort by latest');
                $I->wait(5);

                //Become a Wholesale Customer
                $I->amOnPage('/my-account/');
                $I->click(['css' => '#dokan-become-wholesale-customer-btn']);
                $I->waitForElementVisible('.dokan-wholesale-migration-wrapper', 5);
                $I->wait(5);
           });
            $CustomerView->leave();

            $I->reloadPage();
            $I->amOnPage('/wp-admin/admin.php?page=dokan#/wholesale-customer');
            $I->wait(5);
            $I->click(Locator::elementAt('//th/input', 1));
            $I->selectOption('#bulk-action-selector-top', 'Active');
            $I->click('Apply');
            $I->wait(5);
            $CustomerView1 = $I->haveFriend('CustomerView1');
              $CustomerView1->does(function(AcceptanceTester $I){
                  $I->loginAsCustomer();
                  $I->amOnPage('/shop/');
                  $I->selectOption('//select[@name="orderby"]','Sort by latest');
                  $I->wait(5);
                  $I->click('//main[@id="main"]/ul/li/a/img');
                  $I->fillField('//div[2]/form/div/input', '5');
                  // $I->click('Add to cart');
                  $I->placeOrder();

             });
              $CustomerView->leave();
    }
      

}
