<?php 
//namespace Commissions;


class GlobalFlatCommissionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function setCommission(\Step\Acceptance\Login $I, \Step\Acceptance\Commissions $Admin)
    {
    	$I->loginAsAdmin();
    	$Admin->chooseGlobalCommission();
    	$Admin->setFlatCommission();
    	// $I->click('Dokan');
     //    $I->click('Settings');
     //    $I->wait(5);
     //    $I->click(['link' => 'Selling Options']);
        // $I->wait(5);
        // $I->fillField('#dokan_selling[admin_percentage]', '15');
        // $I->click('#dokan_selling #submit');
    }
    //Customer add to cart single order
    public function singleOrder(AcceptanceTester $I,
                                \Step\Acceptance\Login $customer,
                                \Step\Acceptance\Order $customerSingle)
    {
      $customer->loginAsCustomer();
      $I->amOnPage('store-listing/');
      $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
      $I->click('//div[@id="dokan-content"]/div[4]/ul/li/a/img');
      // $I->amOnPage('/');
      // $I->click('//div[@id="content"]/div[3]/div/div/ul/li/a/img');
      $customerSingle->orderProcessing();
    }

    //Vendor Update order status
    public function orderStatusChange(\Step\Acceptance\Login $I,
                                        \Step\Acceptance\Vendor $vendor)
    {
      $I->loginAsVendor();
      $vendor->updateOrderStatus();

    }
}
