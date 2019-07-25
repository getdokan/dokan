<?php 
//namespace Vendor;


class AddProductCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function tryToTest(\Step\Acceptance\Login $I)
    {
    	$I->loginAsVendor();
    	$I->click('Products');  
        $I->dontSee('Error! Your account is not enabled for selling, please contact the admin');           
        $I->click('Add new product');
        //$I->seeCurrentURLEquals('/wpbddtesting/dashboard/new-product/');             
        
        $I->fillField('post_title', 'Green Cap');
        $I->fillField('_regular_price', '350');        
        //$I->fillField('_sale_price', '20');      
        $I->fillField('post_excerpt', 'this is unique for cap');
        $I->selectOption('#product_cat','demo');        
        $I->click('Create product');
    }
}
