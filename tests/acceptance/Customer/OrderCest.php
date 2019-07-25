<?php 
//namespace Customer;


class OrderCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function tryToTest(\Step\Acceptance\Login $I,
    							\Step\Acceptance\Order $O)
    {
    	$I->loginAsCustomer();
    	$I->amOnpage('/');

        //Scenario 1: Single vendor single order
    	   $O->singleOrder();
    	   $I->click('Place order');

        //Scenario 2: Single vendor Multiple Order
            // $O->multipleOrder();
    	   	//$I->click('Place order');

        //Scenario 3: Multiple vendor multiple order
           // $O->multipleVendorMultipleOrder();
           // $I->click('Place order');

    }
}
