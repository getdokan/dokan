<?php
namespace Step\Acceptance;

class Login extends \AcceptanceTester
{
	public function loginAsAdmin()
	{
		$I = $this;
		$I->amOnPage('/wp-admin');
         //$I->click('Log in');
         $I->fillField('#user_login', 'admin');
         $I->fillField('#user_pass', 'admin');
         $I->click('Log In');
	}
	public function loginAsVendor()
	{
		$I = $this;
		$I->amOnPage('/');
        $I->click('Log in');
        $I->fillField('username', 'vendor-one');
        $I->fillField('password', '123456');
        $I->click('login');
	}
	public function loginAsVendorTwo()
	{
		$I = $this;
		$I->amOnPage('/');
        $I->click('Log in');
        $I->fillField('username', 'vendor');
        $I->fillField('password', 'vendor');
        $I->click('login');
	}
	public function loginAsCustomer()
	{
		$I = $this;
		$I->amOnPage('/');
        $I->click('Log in');
        $I->fillField('username', 'customer');
        $I->fillField('password', 'customer');
        $I->click('login');
	}

}
