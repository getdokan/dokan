<?php 


class indiviualproductaddonCest
{
    public function _before(AcceptanceTester $I)
    {
    }
// tests
    public function individualAddon(\Step\Acceptance\MultiSteps $I, 
                                    \Page\Acceptance\AccountPage $vendor,
                                      \Page\Acceptance\ProductPage $product)
    {
      $I->loginAsVendor();
      $product->create('Burger','250','Uncategorized');
      $I->wait(5);
      $I->click('Add Field');
      $I->wait(5);
      $I->CheckOption('//*[@id="wc-pao-addon-content-type-0"]','Checkboxes');
     // $I->appendfield('//*[@id="wc-pao-addon-content-display-0"]','Radio Buttons');
      //$I->checkOption('//*[@id="wc-pao-addon-content-name-0"]');
      $I->fillField('#wc-pao-addon-content-name-0','SAusage');
      //$I->fillField('.wc-pao-addon-description show','cheese');
      $I->CheckOption('#wc-pao-addon-content-title-format','Heading');
      $I->checkOption('#wc-pao-addon-description-enable-0');
      $I->fillField('#wc-pao-addon-description-0','SAusage');
      //$I->checkOption('#wc-pao-addon-required-0');
      $I->fillField('product_addon_option_label[0][]','SAusage');
      $I->checkOption('.wc-pao-addon-option-price-type','quantity_based');
      $I->fillField('product_addon_option_price[0][]','10');
      $I->click('Save Product');
      // $I->wait(3);
      // $I->click('Add new product');
      // $I->click('//table[@id="dokan-product-list-table"]/tbody/tr/td[3]/p/a');
       $CustomerView = $I->haveFriend('CustomerView');
        $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            $I->click('Shop');
            $I->selectOption('//select[@name="orderby"]','Sort by latest');
            $I->wait(5);
            $I->click('//main[@id="main"]/ul/li/a/img');
            $I->click('.wc-pao-addon-field');
            $I->selectOption('//form/div/p','SAusage (+£10.00)');
            $I->wait(3);
           //$I->click('.wc-pao-addon-field wc-pao-addon-select');
          //  $I->fillField('//select');
            //$I->appendfield('//select','SAusage(+£10.00)');
            // $I->click('add-to-cart');
            // $I->click('View cart');
            $I->placeOrder();
            $I->wait(3);
       });
       $CustomerView->leave();
    // tests
 /*   public function indiviualAddon(\Step\Acceptance\MultiSteps $I, 
                                    \Page\Acceptance\AccountPage $vendor,
                                      \Page\Acceptance\ProductPage $product)
      
    {
       $I->loginAsVendor();
      //$I->click('Dashboard');
      // $vendor->login('vendor','vendor');
      $product->create('Green Watch','250','Uncategorized');
      $I->wait(5);
      $I->click('Add Field');
      $I->wait(5);
      $I->CheckOption('//*[@id="wc-pao-addon-content-type-0"]','Checkboxes');
     // $I->appendfield('//*[@id="wc-pao-addon-content-display-0"]','Radio Buttons');
    	//$I->checkOption('//*[@id="wc-pao-addon-content-name-0"]');
    	$I->fillField('#wc-pao-addon-content-name-0','SAusage');
    	//$I->fillField('.wc-pao-addon-description show','cheese');
    	$I->CheckOption('#wc-pao-addon-content-title-format','Heading');
    	$I->checkOption('#wc-pao-addon-description-enable-0');
    	$I->fillField('#wc-pao-addon-description-0','SAusage');
    	//$I->checkOption('#wc-pao-addon-required-0');
    	$I->fillField('product_addon_option_label[0][]','SAusage');
    	$I->checkOption('.wc-pao-addon-option-price-type','quantity_based');
    	$I->fillField('product_addon_option_price[0][]','10');
    	$I->click('Save Product');
      $I->wait(2);
      $I->click('Add new product');
     $I->click('//table[@id="dokan-product-list-table"]/tbody/tr/td[3]/p/a');
    	
    	 $CustomerView = $I->haveFriend('CustomerView');
        $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            $I->click('Store List');
            $I->wait(5);
            $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
            $I->wait(3);
            $I->click('/html/body/div[1]/div/div/div/div/main/div[2]/div/div[3]/ul/li[1]/a');
            $I->wait(3);
            $I->click('.wc-pao-addon-field');
            $I->click('//option[2]');
            // $I->appendfield('//select','SAusage(+£10.00)');
            $I->wait(3);
            $I->click('add-to-cart');
            $I->click('View cart');
            $I->wait(3);

       });
       $CustomerView->leave();

      $product->create('Green Watch','250','Uncategorized');
      $I->wait(5);
      $I->click('Add Field');
      $I->wait(5);
      $I->appendfield('//*[@id="wc-pao-addon-content-type-0"]','Customer Defined Price');
      // $I->selectOption('//div[2]/div/div[2]/div/div/select','Customer Defined Price');
      $I->wait(3);
     // $I->appendfield('//*[@id="wc-pao-addon-content-display-0"]','Radio Buttons');
    	//$I->checkOption('//*[@id="wc-pao-addon-content-name-0"]');
    	$I->fillField('#wc-pao-addon-content-name-0','Mashroom');
    	//$I->fillField('.wc-pao-addon-description show','cheese');
    	$I->wait(2);
    	$I->CheckOption('#wc-pao-addon-content-title-format','Heading');
    	$I->checkOption('#wc-pao-addon-description-enable-0');
    	$I->fillField('#wc-pao-addon-description-0','SAusage');
    	$I->checkOption('product_addon_restrictions[0]');
    	$I->fillField('product_addon_min[0]','1');
    	$I->fillField('product_addon_max[0]','20');
    	// $I->checkOption('.wc-pao-addon-option-price-type','quantity_based');
    	// $I->fillField('product_addon_option_price[0][]','10');
    	$I->checkOption('_product_addons_exclude_global');
    	$I->click('Save Product');


    	$CustomerView = $I->haveFriend('CustomerView');
        $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            $I->click('Store List');
            $I->wait(5);
            $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
            $I->wait(3);
            $I->click('/html/body/div[1]/div/div/div/div/main/div[2]/div/div[3]/ul/li[1]/a');
            $I->wait(3);
           // $I->click('.wc-pao-addon-field');
            //$I->fillField('//*[@id="product-170"]/div[2]/form/div[1]/p/input','3');
            $I->click('//p/input');
            $I->click('add-to-cart');
            $I->click('View cart');
            $I->wait(3);

       });
       $CustomerView->leave();

    }*/
  }
}
