<?php
use Codeception\Util\Locator;

class MultipleOrderFromSingleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Customer add to cart multiple order
    public function multipleOrderFromSingleVendor(\Step\Acceptance\MultiSteps $I)
    {
      $I->loginAsCustomer();
      $I->viewMultipleProduct();
      $I->placeOrder();

    }

    //Vendore update multiple order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();
    }

    //TESTING DYNAMIC DATA WITH SNAPSHOTS https://codeception.com/docs/09-Data
    public function productsAreSame(\Step\Acceptance\MultiSteps $I,  
                        \Step\Acceptance\Vendor $vendor, \Snapshot\Products $snapshot)
    {
        $I->loginAsAdmin();
        // $I->amOnPage('/wp-admin/admin.php?page=dokan#/reports?tab=logs');
        $I->amOnPage('/wp-admin/admin.php?page=dokan#/reports');
        $I->click('All Logs');
        $I->waitForElement('.logs-area', 30);
        $I->wait(5);
        // $I->click('//tbody//tr[1]');
        // $I->loginAsVendor();
        // $I->click('Orders');
        // $vendor->updateOrderStatus();
        
        // if previously saved array of users does not match current set, test will fail
        // to update data in snapshot run test with --debug flag
        $snapshot->assert();
    }
}
