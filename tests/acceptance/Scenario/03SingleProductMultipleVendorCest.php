<?php

class SingleProductMultipleVendorCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    public function moduleConfiguration(\Step\Acceptance\MultiSteps $I)
    {

       $I->loginAsAdmin();
       $I->click('Dokan');
       $I->wait(3);
       $I->click('Settings');
       $I->wait(5);
       $I->click('Single Product MultiVendor');
       $I->scrollTo('#wpbody-content', 0,0);
       $I->seeCheckboxIsChecked('#dokan_spmv[enable_pricing]');
       // $I->fillfield('dokan_spmv[sell_item_btn]','sell this one');
       // $I->fillfield('dokan_spmv[available_vendor_list_title]','Available');
       // $I->selectOption('dokan_spmv[available_vendor_list_position]','Above Single Product Tabs');
       // $I->selectOption('dokan_spmv[show_order]','min_price');
       $I->click('//div[@id="dokan_spmv"]/form/p/input');
       // $I->wait(5);
       // $I->seeElement('#setting-message_updated','Setting has been saved successfully.');
    }

    public function vendorSettings(\Step\Acceptance\MultiSteps $I, 
                                    \Page\Acceptance\AccountPage $vendor,
                                    \Page\Acceptance\ProductPage $product)
    {
        $I->loginAsVendor();
          $product->create('Green Watch1','200','Uncategorized');
          $I->see('Online');
          $I->wait(5);
          $I->click('Log out');
        $I->click('Log in');
        $I->loginAsVendorTwo();
        $I->click('Shop');
        $I->selectOption('//select[@name="orderby"]','Sort by latest');
        $I->wait(5);
        $I->click('//main[@id="main"]/ul/li/a/img');
          // $I->click('Store List');
          // $I->click('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div/ul/li[1]/div/div[2]/a');
          // $I->click('/html/body/div[1]/div/div/div/div/main/div[2]/div/div[3]/ul/li/a/img');
          $I->click('dokan_sell_this_item');
          // $I->wait(3);
          $I->fillField('#_regular_price', '100');
          $I->click('dokan_update_product');
          $I->wait(5);
          $I->click('Log out');
        $I->click('Log in');
        $I->loginAsCustomer();
          $I->click('Shop');
        $I->selectOption('//select[@name="orderby"]','Sort by latest');
        $I->wait(5);
        $I->click('//main[@id="main"]/ul/li/a/img');
          $I->scrollTo('#primary', 100,500);
          $I->wait(10);
    }
}