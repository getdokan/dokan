<?php
require_once dirname( __FILE__ ) . '/../../../vendor/autoload.php';
// namespace Vendor;
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
      $I->fillField(Vendor::$emailField, pmfk()->email );
      $I->click(Vendor::$userRol);
      $I->waitForElement('.show_if_seller', 30);
      $I->fillField(Vendor::$firstName, pmfk()->firstName);
      $I->fillField(Vendor::$lastName,  pmfk()->lastName);
      $I->fillField(Vendor::$companyName, pmfk()->firstName);
      $I->fillField(Vendor::$shopUrl,     pmfk()->firstName);
      $I->fillField(Vendor::$phoneNumber,  pmfk()->phoneNumber);
      $I->click(Vendor::$registrationButton);
      // $I->grabTextFrom(Vendor::$welcomeMessage, 'Welcome to the Marketplace!');
      $I->click(Vendor::$ignoreWizard);
    }
}

function pmfk() {
  return \Faker\Factory::create();
}
