<?php
//namespace Vendor;
use  Page\Acceptance\AccountPage as Vendor;


class VendorRegistrationCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function registrationAsVendor(AcceptanceTester $I,
                                          \Page\Acceptance\AccountPage $vendor)
    {
      $I->amOnPage(Vendor::$URL);
      $I->click(Vendor::$registrationLink);
      $I->fillField(Vendor::$emailField, 'sk1@g.c');
      $I->click(Vendor::$userRol);
      $I->waitForElement('.show_if_seller', 30);
      $I->fillField(Vendor::$firstName, 'sk1');
      $I->fillField(Vendor::$lastName,  'sk12');
      $I->fillField(Vendor::$companyName,'sk2');
      $I->fillField(Vendor::$shopUrl,     'sk2');
      $I->fillField(Vendor::$phoneNumber,  '02334452');
      $I->click(Vendor::$registrationButton);
      // $I->grabTextFrom(Vendor::$welcomeMessage, 'Welcome to the Marketplace!');
      $I->click(Vendor::$ignoreWizard);
    }
}
