<?php 
//namespace Vendor;


class LoginCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function tryToTest(\Step\Acceptance\Login $I)
    {
    	$I->loginAsVendor();
    }
}
