<?php


class CustomerRegistrationCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function registrationAsCustomer(AcceptanceTester $I,
                                \Page\Acceptance\AccountPage $customer)
    {
    	$customer->registration('sk2@g.c');
      $I->dontSee('Error: An account is already registered with your email address. Please log in.');
      $I->see('dashboard');
    }
}
