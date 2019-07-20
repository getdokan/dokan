<?php 
//namespace Scenario;
use Codeception\Util\Locator;
use Codeception\Util\ActionSequence;

class AddProductAndUpdateCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function addProductAndUpdate(\Step\Acceptance\Vendor $I,
    										\Step\Acceptance\Admin $A)
    {
    	$I->loginAsVendor();  
        $I->dontSee('Error! Your account is not enabled for selling, please contact the admin');
        $I->click('Add new product');
        $I->seeCurrentURLEquals('/dokan/dashboard/new-product/');             
        $I->selectOption('#product_cat','demo');
        $I->fillField('post_title', 'black cap');
        $I->fillField('_regular_price', '35');        
        // $I->fillField('_sale_price', '20');      
        $I->fillField('post_excerpt', 'this is unique');        
        $I->click('add_product');
        $I->click('//*[@id="page"]/nav/div/div/div[2]/div/ul/li[4]/a');
	        $A->loginAsAdmin();
	        $I->click('Products');  
	       	$I->moveMouseOver(Locator::firstElement('//input[@name="post[]"]'));
	       	$I->wait(5);  
	       	$I->click('//span[3]/button');
	        $I->selectOption('_status','Published');         
	        $I->click('Update'); 
	        $I->wait(5);


    }
}
