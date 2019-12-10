<?php 
// namespace Scenario;
use Codeception\Util\Locator;
use Codeception\Util\ActionSequence;

class WithdrawRequestAndUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    //Vendor request for withdraw
    public function withdrawRequest(\Step\Acceptance\MultiSteps $I)
    {
    	$I->loginAsVendor();
        //$I->wait(10);
        $I->click('Withdraw');
        $I->fillField('#withdraw-amount','200');
        $I->selectOption('#withdraw-method','Bank Transfer');
        $I->click('Submit Request');
        $I->wait('5');
        $I->see('Your request has been received successfully and being reviewed!');
        // $I->click('Log out');
        
    }
    //Admin approved the request 
    public function updateWithdraw(\Step\Acceptance\Admin $I)
    {
    	$I->loginAsAdmin();
        $I->click('Dokan');
        $I->click('#toplevel_page_dokan');
        $I->click('Withdraw');
        $I->wait(5);
		$I->checkOption(Locator::firstElement('//input[@name="item[]"]'));
        $I->selectOption('#bulk-action-selector-top','Approve');
        $I->click('Apply');
    }
}
