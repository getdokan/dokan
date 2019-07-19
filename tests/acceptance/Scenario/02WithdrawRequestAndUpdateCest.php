<?php 
//namespace Scenario;
use Codeception\Util\Locator;
use Codeception\Util\ActionSequence;


class WithdrawRequestAndUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function tryToTest(\Step\Acceptance\Vendor $I,
    							\Step\Acceptance\Admin $A)
    {
    	// $I->loginAsVendor();
     //    //$I->wait(10);
     //    $I->click('Withdraw');
     //    $I->fillField('#withdraw-amount','80');
     //    $I->selectOption('#withdraw-method','Bank Transfer');
     //    $I->click('Submit Request');
     //    $I->wait('5');
     //    $I->click('Log out');
	        $A->loginAsAdmin();
	        $I->click('Dokan');
	        $I->click('#toplevel_page_dokan');
	        $I->click('Withdraw');
	        // $I->click('item[]','4');


			$I->checkOption(Locator::firstElement('//input[@name="item[]"]'));
			// $I->fillField(Locator::combine('form input[type=text]','//form/textarea[2]'), 'qwerty');


	       // $I->click('vendor-one');
	        $I->selectOption('#bulk-action-selector-top','Approve');
	        $I->click('Apply');
    }
}
