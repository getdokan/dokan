<?php 


class VariableProductCest
{
    public function _before(AcceptanceTester $I)
    {
    }

   
   // tests
    public function createVariableProduct(\Step\Acceptance\MultiSteps $I, \Page\Acceptance\AccountPage $vendor,
                                  \Page\Acceptance\ProductPage $product)
    {
       $I->loginAsVendor();
       $product->create('Red Shoe','1500','Uncategorized');
       $I->wait(5);
       $I->appendfield('#product_type','variable');
       $I->wait(2);
       // $I->scrollTo(['css' => '.add_new_attribute'], 20, 60);
       // $I->wait(3);
       $I->click('Add attribute');
       $I->wait(3);
       $I->fillfield('attribute_names[0]','colour');
       $I->pressKey('//li/div[2]/div[2]/span/span/span/ul/li/input', 'orange', WebDriverKeys::ENTER);
       $I->pressKey('//li/div[2]/div[2]/span/span/span/ul/li/input','green', WebDriverKeys::ENTER);
       $I->checkOption('attribute_visibility[0]');
       $I->checkOption('attribute_variation[0]');
       $I->click('Save attribute ');
       $I->wait(4);
       $I->click('Go');
       $I->wait(3);
      // $I->click('/html/body/div[1]/div/div/div/div[1]/div[2]/div/form/div[9]/div[2]/div[2]/div/div/div[1]/div[1]/div/a');
       $I->click('//div[@id="dokan-variable-product-options-inner"]/div/div/div/a');
       $I->click('//div[@id="dokan-variable-product-options-inner"]/div[2]/div/h3/select/option[2]');
       $I->fillfield('variable_sku[0]','10');
      // $I->click('variable_stock_status[0]');
       $I->fillfield('variable_regular_price[0]','400');
       $I->wait(3);
       $I->checkOption('//div[2]/div[2]/div/div[11]/div/label/input[2]');
       $I->wait(2);
       $I->fillfield('variable_wholesale_price[0]','120');
       $I->fillfield('variable_wholesale_quantity[0]','10');
       $I->click('Save Variations');
       $I->wait(2);
       $I->click('Save Product');
        $CustomerView = $I->haveFriend('CustomerView');
         $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            $I->amOnPage('/store-listing');
            // $I->click('Store List');
            // $I->wait(5);
            $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
            $I->wait(3);
            $I->click('/html/body/div[1]/div/div/div/div/main/div[2]/div/div[3]/ul/li[1]/a');
            $I->wait(3);
         //   $I->fillfield('//*[@id="colour"]','red');
            $I->selectOption('#colour','orange');
            $I->wait(5);
           // $I->click('red');
            $I->click('Add to cart');
       });
       $CustomerView->leave();
    }
}
