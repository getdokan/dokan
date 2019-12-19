<?php 
// namespace Scenario;
use Codeception\Util\Locator;
use Codeception\Util\ActionSequence;

class RefundRequestAndUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function refundRequest(\Step\Acceptance\Login $I)
    {
    	$I->loginAsVendor();
    	$I->click('Orders');
        $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 1));
        $I->wait(5);
        $I->click('Request Refund');
        $I->fillField('.refund_order_item_qty','1');       
        $I->click('#woocommerce-order-items');
        $I->click('Submit Refund Request');
        $I->acceptPopup();
        $I->wait(5);
        $I->acceptPopup();
        // $I->click('Log out');
        // $I->waitForElement('.dokan-panel dokan-panel-default', 30);
    }
    public function approveRequest(\Step\Acceptance\Admin $I)
    {
        $I->loginAsAdmin();
        $I->click('#toplevel_page_dokan');
        $I->click('Refunds');
        $I->wait(5);
        $I->checkOption(Locator::firstElement('//input[@name="item[]"]'));
        $I->selectOption('#bulk-action-selector-top','Approve Refund');
        $I->click('Apply');       
        $I->wait(10);
    }
}
