<?php
namespace Step\Acceptance;

class Customer extends \AcceptanceTester
{
	 public function loginAsCustomer()
    {
        
        $I = $this;
        $I->amOnPage('/');
        $I->click('Log in');
        //$I->click('//a[contains(text(),"Log in")]');
        // $I->click(Locator::elementAt('//a[contains(text(),"Log in")]', 2));
         //$I->seeCurrentURLEquals('/wpbddtesting/my-account/');
         //$I->click(['Log in' => '.nav > li:nth-child(2) > a:nth-child(1)']);
         $I->fillField('username', 'customer');
         $I->fillField('password', '123456');
         $I->checkOption('rememberme');
         $I->click('login');
         $I->seeCurrentURLEquals('/wpbddtesting/my-account/');
    }
}