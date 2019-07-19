<?php 
//namespace Vendor;


class RegistrationCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function tryToTest(AcceptanceTester $I)
    {
    	$I->amOnPage('/');    
        $I->click('Sign Up');   
        $I->fillField('//*[@id="reg_email"]', 'vendor@yahoo.com');
        $I->click('(//input[@name="role"])[2]');
        $I->fillField('//div/p/input', 'vendor');
        
        //$I->fillField('fname', 'henry1');
        $I->fillField('lname', 'one');
        $I->fillField('#company-name', 'vendorone-shop');
        $I->fillField('phone', '01785643897543');
        $I->click('register');
        $I->see('dashboard');
        $I->expect('the form is not submitted');
       // $I->wait(3);
    }
}
