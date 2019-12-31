<?php 
// namespace Etc;
use  Page\Acceptance\OrderPage as Customer;
use Codeception\Util\Locator;

class DemoCest
{
    public function _before(AcceptanceTester $I)
    {
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

    // seeInDatabase and snapshot
    // public function databaseAnalysis(\Step\Acceptance\MultiSteps $I, 
    //                                     \Step\Acceptance\Vendor $vendor, 
    //                                         \Snapshot\Orders $snapshot)
    // {
    //     $I->loginAsVendor();
    //     // $I->click('Orders');
    //     // $vendor->updateOrderStatus();
    //     // $I->see('Completed');
    //     $snapshot->assert();
    // }


    // //TESTING DYNAMIC DATA WITH SNAPSHOTS https://codeception.com/docs/09-Data
    // public function productsAreSame(\Step\Acceptance\MultiSteps $I, \Snapshot\Products $snapshot)
    // {
    //  $I->loginAsVendor();
    //  // $I->checkError();
    //  // $I->amOnPage('/dashboard/products');
    //     // if previously saved array of users does not match current set, test will fail
    //     // to update data in snapshot run test with --debug flag
    //     $snapshot->assert();
    // }




    //Scenario thinking
  //   public function demoTest(\Step\Acceptance\MultiSteps $I, 
  //   							\Step\Acceptance\Vendor $vendor, \Snapshot\Orders $snapshot)
  //   {
		// $I->loginAsCustomer();
  //           $I->click('Shop');
  //           $I->selectOption('//select[@name="orderby"]','Sort by latest');
  //           $I->wait(5);
  //           $I->click('//main[@id="main"]/ul/li/a/img');
  //           $I->click('Add to cart');
  //           $I->click('View cart');
  //           $I->click('Proceed to checkout');
  //           $I->wait(5);
  //           $I->click('//div[@id="payment"]/div/button');
  //           $I->waitForText('Thank you. Your order has been received.', 30, '.woocommerce-order');
		// 	$I->seeInDatabase('wp_dokan_orders', ['order_status' => 'wc-on-hold']);
		// 	$I->click('Log out');
		// $I->loginAsVendor();
  //     		$I->click('Orders');
  //           $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 1));
  //           $I->wait(5);
  //           $I->see('edit');
  //           $I->click('.dokan-edit-status');
  //           $I->selectOption('#order_status','Completed');
  //           $I->click('Update');
  //           $I->wait('5');
  //           $I->click('Orders');
  //           $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 2));
  //           $I->wait(5);
  //           $I->see('edit');
  //           $I->click('.dokan-edit-status');
  //           $I->selectOption('#order_status','Completed');
  //           $I->click('Update');
  //           $I->wait('5');
  //           $I->click('Orders');
  //           $I->click(Locator::elementAt('//table/tbody/tr/td[2]', 3));
  //           $I->wait(5);
  //           $I->see('edit');
  //           $I->click('.dokan-edit-status');
  //           $I->selectOption('#order_status','Completed');
  //           $I->click('Update');
  //           $I->wait('5');
  //     		$I->see('Completed');	        
		// 	$I->seeInDatabase('wp_dokan_orders', ['order_status' => 'wc-completed']);
  //   }
}
