<?php
// namespace Module;


class VendorVacationCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    // public function adminEnableModule(\Step\Acceptance\Login $I)
    // {
    //        $I->loginAsAdmin();
    //        $I->wait(2);
    //        $I->amonpage('/wp-admin/admin.php?page=dokan#/modules');
    //       // $I->waitForElement('//*[@id="vue-backend-app"]/div[6]/div[2]/div/div[12]/div/div[1]/h3/span',3);
          
    //        $I->waitForElementClickable('//*[@id="vue-backend-app"]/div[6]/div[2]/div/div[12]/div/div[1]/h3/span');
    //        $I->click('//*[@id="vue-backend-app"]/div[6]/div[2]/div/div[12]/div/div[1]/h3/span');
    //        $I->checkOption('//*[@id="vue-backend-app"]/div[6]/div[2]/div/div[12]/div/div[2]/ul/li/label/span');
    // }
   
public function vendorsetVacationSetttings(\Step\Acceptance\Login $I)
    {
          $I->loginAsVendor();
          $I->click('Settings');
          $I->checkOption('#dokan-seller-vacation-activate');
          $I->selectOption('settings_closing_style','datewise');
          $I->click('//*[@id="dokan-seller-vacation-date-from"]');
          $I->pressKey('//*[@id="dokan-seller-vacation-date-from"]','2019-10-02');
          $I->wait(3);
          $I->click('//*[@id="dokan-seller-vacation-date-to"]');
          $I->pressKey('//*[@id="dokan-seller-vacation-date-to"]','2019-10-03');
          $I->wait(4);
          $I->fillField('dokan_seller_vacation_datewise_message','vacation 2');
         // $I->waitForElement('#dokan-seller-vacation-save-edit',3);
         // $I->click('//*[@id="dokan-seller-vacation-save-edit"]');
          //$I->click(//button[contains(.,“Save”)]’);
          $I->click('//button[contains(.,"Save")]');
          $I->wait(3);
          $I->click('Update Settings');
          $I->wait(10);
    }

     // public function customerviewVendorVacation(\Step\Acceptance\Login $I)
     //  {
     //    $I->loginAsCustomer();
     //    $I->click('Store List');
     //    $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
     //    //$I->click('Visit Store');

     //  }
}
