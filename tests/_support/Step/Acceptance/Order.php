<?php
namespace Step\Acceptance;

class Order extends \AcceptanceTester
{
	public function singleOrder()
	{
		$I = $this;
    	$I->click('Black Cap');
    	$I->click('Add to cart');
    	$I->click('View cart');
    	$I->click('Proceed to checkout');
    	
	}
	public function multipleOrder()
	{
		$I = $this;
		$I->click('Yellow Cap');
		$I->click('Add to cart');
		$I->click('Home');
		// $I->amOnpage('/');
		$I->click('cap');
    	$I->click('Add to cart');
    	$I->click('View cart');
    	$I->click('Proceed to checkout');
    	$I->click('Place order');
    	
	}
	public function multipleVendorMultipleOrder()
	{
		$I = $this;
		$I->click('Cap');
		$I->click('Add to cart');
		$I->click('Home');
		$I->click('Yellow Cap');
    	$I->click('Add to cart');
    	$I->click('View cart');
    	$I->click('Proceed to checkout');
    	
	}
	public function orderNumber()
    {
        $I = $this;
        $I->click('Orders');        
        $I->click('Order 269');
    }
}