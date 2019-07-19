<?php 
//namespace Customer;


class RegistrationCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function tryToTest(AcceptanceTester $I)
    {
    	$I->amOnPage('/my-account');
    	
    	//Require a validation is this user already exist in the database
    	//$I->dontSeeInDatabase('users', ['name' => 'customer', 'email' => 'Customer@yahoo.com']);
       
        $I->fillField('#reg_email', 'customertest@yahoo.com');
        $I->click('Register');
        $I->dontSee('Error: An account is already registered with your email address. Please log in.');
        $I->see('dashboard');
    }
}
