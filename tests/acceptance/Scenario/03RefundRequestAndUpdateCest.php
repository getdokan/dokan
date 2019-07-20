<?php 
//namespace Scenario;
use Codeception\Util\Locator;
use Codeception\Util\ActionSequence;

class RefundRequestAndUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function refundRequestAndUpdate(\Step\Acceptance\Vendor $I,
    										\Step\Acceptance\Admin $A)
    {
    	$I->loginAsVendor();
        $I->click('Orders');
            //Refund Order ID select        
        $I->click('Order 268');
        $I->click('.dokan-edit-status');
        $I->click('Request Refund');
        $I->fillField('.refund_order_item_qty','1');       
        $I->click('#woocommerce-order-items');
        $I->click('Submit Refund Request');
        $I->acceptPopup();
        $I->wait(5);
        $I->acceptPopup();
        $I->click('Log out');

            //Admin Permission
        $A->loginAsAdmin();
        $I->click('#toplevel_page_dokan');
        $I->click('Refunds');
        $I->wait(5);
		$I->checkOption(Locator::firstElement('//input[@name="item[]"]'));
        $I->selectOption('#bulk-action-selector-top','Approve Refund');
        $I->click('Apply');       
        $I->wait(10);
    }
}
