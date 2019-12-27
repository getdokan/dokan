<?php
use  Page\Acceptance\AccountPage as Customer;

class CustomerRegistrationCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function registrationAsCustomer(AcceptanceTester $I,
                                \Page\Acceptance\AccountPage $customer)
    {
        $I->amOnPage(Customer::$URL);
        $I->click(Customer::$registrationLink);
        $I->fillField(Customer::$emailField, randomGenerateCustomer()->email );
        $I->dontSee('Error: An account is already registered with your email address. Please log in.');
        $I->click('Register');
        $I->see('dashboard');
     
    }
}

function randomGenerateCustomer() {
  return \Faker\Factory::create();
}