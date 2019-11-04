<?php
// require_once dirname( __FILE__ ) . '/../../../vendor/autoload.php';
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
      $I->fillField(Vendor::$emailField, randomGenerate()->email );
      $I->click(Vendor::$userRol);
      $I->waitForElement('.show_if_seller', 30);
      $I->fillField(Vendor::$firstName, randomGenerate()->firstName);
      $I->fillField(Vendor::$lastName,  randomGenerate()->lastName);
      $I->fillField(Vendor::$companyName, randomGenerate()->firstName);
      $I->fillField(Vendor::$shopUrl,     randomGenerate()->firstName);
      $I->fillField(Vendor::$phoneNumber,  randomGenerate()->phoneNumber);
      $I->click(Vendor::$registrationButton);
      // $I->grabTextFrom(Vendor::$welcomeMessage, 'Welcome to the Marketplace!');
      $I->click(Vendor::$ignoreWizard);
    }
}

function randomGenerate() {
  return \Faker\Factory::create();
}
