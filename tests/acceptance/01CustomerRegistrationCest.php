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
    	$customer->registration('luka.bonche10@g.c');
      $I->dontSee('Error: An account is already registered with your email address. Please log in.');
      $I->see('dashboard');
    }
}
