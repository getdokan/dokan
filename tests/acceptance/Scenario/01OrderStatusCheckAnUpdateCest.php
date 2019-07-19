<?php 
//namespace Scenario;


class OrderStatusCheckAnUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function orderStatusCheckAnUpdate(\Step\Acceptance\Vendor $I,
    											\Step\Acceptance\Admin $A)
    {
    	/*Scenarion 1: If Vendor have no permission to change the order status. 
                            Then So admin will enbale vendor can update order status */
        $I->loginAsVendor();
        $I->click('Orders');       
        $I->click('Order 269');
        $I->dontSee('edit');                
        $I->click('Log out');
            $A->loginAsAdmin();                   
            $I->click('Dokan');
            $I->click('Settings');
            $I->wait(5);
            $I->click('Selling Options');                   
            $I->checkOption('dokan_selling[order_status_change]');
            $I->click('(//input[@id="submit"])[2]');
            $I->moveMouseOver('#wp-admin-bar-top-secondary');
            $I->wait(5);
            $I->click('Log Out');

        /* Scenario 2: Vendor can update order status */
        $I->loginAsVendor();
        $I->click('Orders');        
        $I->click('Order 269');
        $I->see('edit');
        $I->click('.dokan-edit-status');
        // $I->orderStatusTest();
        $I->selectOption('#order_status','Pending payment');                
        $I->click('Update');
        $I->wait('5'); 

    }
}
