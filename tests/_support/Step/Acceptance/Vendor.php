<?php
namespace Step\Acceptance;
// use \Codeception\Step\Argument\PasswordArgument;

class Vendor extends \AcceptanceTester
{
	public function loginAsVendor()
    {
        $I = $this;
         // $I = new AcceptanceTester($scenario);
         $I->amOnPage('/');
       //  $I->amOnPage(homePage::$URL);
         $I->click('Log in');
         $I->fillField('username', 'vendor');
         //$I->fillField('password', '123456');

         //Hiding Sensitive Data
         // $I->fillField('password', new PasswordArgument('123456'));
        $I->fillField('password', 'vendor');
         $I->checkOption('rememberme');
         $I->click('login');
         //$I->seeCurrentURLEquals('/wpbddtesting/dashboard/');
         $I->see('dashboard');
         $I->expect('the form is sucessfully submitted');
         $I->wait(5);
         
        /* $I->click('.settings');
         $abc = $I->grabTextFrom('#dokan_address[street_1]');
         $I->fillField('dokan_address[street_2]', $abc);
         $I->click('Update Settings');
         $I->wait(5);*/         
    }
    public function orderNumberTest()
    {
        $I = $this;
        $I->click('Orders');        
        $I->click('Order 269');
    }
    public function orderStatusTest()
    {
        $I = $this;
        $I->selectOption('#order_status','Pending payment');
    }
    public function productSellingTest(){
        $I = $this;
    }
}