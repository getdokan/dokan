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
      $I->fillField(Vendor::$emailField, 'david123@g.c');
      $I->click(Vendor::$userRol);
      $I->waitForElement('.show_if_seller', 30);
      $I->fillField(Vendor::$firstName, 'david123');
      $I->fillField(Vendor::$lastName,  'bakon123');
      $I->fillField(Vendor::$companyName,'david123');
      $I->fillField(Vendor::$shopUrl,     'david123');
      $I->fillField(Vendor::$phoneNumber,  '0167697344541');
      $I->click(Vendor::$registrationButton);
      $I->grabTextFrom(Vendor::$welcomeMessage, 'Welcome to the Marketplace!');
      $I->click(Vendor::$ignoreWizard);
    }
}
