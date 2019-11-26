<?php
// namespace Module;


class VendorVacationCest
{
    public function _before(AcceptanceTester $I)
    {
    }


    public function vendorsetVacationSetttings(\Step\Acceptance\MultiSteps $I)
      {
        $I->loginAsVendor();
        $I->click('Settings');
        $I->checkOption('#dokan-seller-vacation-activate');
        $I->selectOption('settings_closing_style','datewise');
        $I->click('//*[@id="dokan-seller-vacation-date-from"]');
        $I->pressKey('//*[@id="dokan-seller-vacation-date-from"]','2019-11-22');
        $I->wait(3);
        $I->click('//*[@id="dokan-seller-vacation-date-to"]');
        $I->pressKey('//*[@id="dokan-seller-vacation-date-to"]','2019-11-22');
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

     public function customerviewVendorVacation(\Step\Acceptance\MultiSteps $I)
        {
          $I->loginAsCustomer();
          $I->click('Store List');
          $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
          $I->scrollTo('#primary', 100,600);
          $I->wait(5);
        }
}
