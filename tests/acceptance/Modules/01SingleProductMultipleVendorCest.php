<?php


class SingleProductMultipleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }


    public function adminEnableModule(\Step\Acceptance\Login $I)
    {
    	



       $I->loginAsAdmin();
       $I->click('Dokan');
       $I->wait(3);
       $I->click('Settings');
       $I->wait(5);
       $I->click('Single Product MultiVendor');
       $I->selectOption('dokan_spmv[available_vendor_list_position]','Above Single Product Tabs');
       $I->selectOption('dokan_spmv[show_order]','min_price');
       $I->click('//div[@id="dokan_spmv"]/form/p/input');

         $CustomerViewForMinPrice = $I->haveFriend('CustomerViewForMinPrice');
         $CustomerViewForMinPrice->does(function(AcceptanceTester $I){
              $I->loginAsCustomer();
              $I->click('Shop');
              $I->wait(5);
         });
        $CustomerViewForMinPrice->leave();

       $I->selectOption('dokan_spmv[available_vendor_list_position]','Above Single Product Tabs');
       $I->selectOption('dokan_spmv[show_order]','max_price');
       $I->click('//div[@id="dokan_spmv"]/form/p/input');

         $CustomerViewForMaxPrice = $I->haveFriend('CustomerViewForMaxPrice');
               $CustomerViewForMaxPrice->does(function(AcceptanceTester $I){
                    $I->loginAsCustomer();
                    $I->click('Shop');
                    $I->wait(5);
         });
        $CustomerViewForMaxPrice->leave();

      $I->selectOption('dokan_spmv[available_vendor_list_position]','Above Single Product Tabs');
      $I->selectOption('dokan_spmv[show_order]','top_rated_vendor');
      $I->click('//div[@id="dokan_spmv"]/form/p/input');

           $CustomerViewTopratedView = $I->haveFriend('CustomerViewTopratedView');
             $CustomerViewTopratedView->does(function(AcceptanceTester $I){
                  $I->loginAsCustomer();
                  $I->click('Shop');
                  $I->wait(5);
       });
        $CustomerViewTopratedView->leave();
    }
}