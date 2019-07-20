<?php 
//namespace Scenario;
use Codeception\Util\Locator;
use Codeception\Util\ActionSequence;


class WithdrawRequestAndUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    /*Scenario 3: Vendor submit Refund request 
                and Admin will change refund request status*/
    public function withdrawRequestAndUpdate(\Step\Acceptance\Vendor $I,
    							\Step\Acceptance\Admin $A)
    {
    	$I->loginAsVendor();
        //$I->wait(10);
        $I->click('Withdraw');
        $I->fillField('#withdraw-amount','80');
        $I->selectOption('#withdraw-method','Bank Transfer');
        $I->click('Submit Request');
        $I->wait('5');
        $I->click('Log out');
	        $A->loginAsAdmin();
	        $I->click('Dokan');
	        $I->click('#toplevel_page_dokan');
	        $I->click('Withdraw');
	        $I->wait(5);
			$I->checkOption(Locator::firstElement('//input[@name="item[]"]'));
	        $I->selectOption('#bulk-action-selector-top','Approve');
	        $I->click('Apply');
    }
}
