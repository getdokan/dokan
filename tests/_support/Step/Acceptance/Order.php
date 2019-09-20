<?php
namespace Step\Acceptance;

class Order extends \AcceptanceTester
{
	public function orderProcessing()
	{
		$I = $this;
		$I->click('Add to cart');
		$I->click('View cart');
		$I->click('Proceed to checkout');
		$I->wait(5);
		$I->click('//div[@id="payment"]/div/button');
	}
}
