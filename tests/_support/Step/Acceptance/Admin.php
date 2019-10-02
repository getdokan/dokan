<?php
namespace Step\Acceptance;

class Admin extends \AcceptanceTester
{
	public function loginAsAdmin()
    {
        $I = $this;
        $I->amOnPage('/wp-admin');
        // $I->click('Log in');        
        $I->fillField('#loginform #user_login', 'admin');
        $I->fillField('#loginform #user_pass', 'admin');
        $I->checkOption('rememberme');
        $I->click('Log In');
       
    }
    public function refundOrderItemQuantity()
    {
        $I = $this;
        $I->fillField('.refund_order_item_qty','1');
    }
    public function changeRefundRequestStatus()
    {
        $I = $this;
        $I->checkOption('item[]', '#99');
        $I->selectOption('#bulk-action-selector-top','Approve Refund');
    }
}