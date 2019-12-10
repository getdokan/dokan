<?php 


class ProductAddonCest
{
    public function _before(AcceptanceTester $I)
    {
        
    }

    // tests
    public function globalAddons(\Step\Acceptance\MultiSteps $I, 
                                    \Step\Acceptance\Module $vendor )
    {
        $I->loginAsVendor();
        // $vendor->productAddonForAllProduct();
        //     $CustomerView = $I->haveFriend('CustomerView');
        //     $CustomerView->does(function(AcceptanceTester $I)
        //         {
        //             $I->loginAsCustomer();
        //             $I->click('Shop');
        //             $I->selectOption('//select[@name="orderby"]','Sort by latest');
        //             $I->wait(5);
        //             $I->click('//main[@id="main"]/ul/li/a/img');
        //             $I->placeOrder();
        //             $I->wait(3);

        //         });
        //     $CustomerView->leave();
        
        $vendor->productAddonForCategory();
            $CustomerView1 = $I->haveFriend('CustomerView1');
            $CustomerView1->does(function(AcceptanceTester $I)
                {
                    $I->loginAsCustomer();
                    $I->click('Shop');
                    $I->selectOption('//select[@name="orderby"]','Sort by latest');
                    $I->wait(5);
                    $I->click('//main[@id="main"]/ul/li/a/img');
                    $I->click('.wc-pao-addon-field');
                    $I->appendfield('.wc-pao-addon-field','SAusage (+£10.00)');
                    $I->wait(3);
                    $I->placeOrder();
                    $I->wait(3);

                });
            $CustomerView1->leave();
      
    }
    // public function individualAddons()
    // {

    // }
}
