<?php 
// namespace Commissions;


class GlobalCommissionCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function commissionCalculation(\Step\Acceptance\MultiSteps $I, 
    								\Step\Acceptance\Commissions $Admin )
    {
      	$I->loginAsAdmin();
      	$Admin->chooseGlobalCommission();
      	$Admin->setFlatCommission();

      	$flatCommission = $I->haveFriend('flatCommission');
  			$flatCommission->does(function(AcceptanceTester $I) 
        {
    		    $I->loginAsCustomer();
    		    $I->viewSingleProduct();
          		$I->placeOrder();
          		// $I->click('Log out');
          		// $I->loginAsVendor();
          		// $I->updateOrderStatus();
  		  });	
    		$flatCommission->leave();
    		$Admin->setPercentageCommission();

  		  $percentageCommission = $I->haveFriend('percentageCommission');
  			$percentageCommission->does(function(AcceptanceTester $I) 
        {
    		    $I->loginAsCustomer();
    		    $I->viewMultipleProduct();
          		$I->placeOrder();
          		// $I->click('Log out');
          		// $I->loginAsVendor();
          		// $I->updateOrderStatus();
  		  });	
    		$percentageCommission->leave();  
    		$Admin->setCombineCommission();

  		  $combineCommission = $I->haveFriend('combineCommission');
  			$combineCommission->does(function(AcceptanceTester $I) 
        {
    		    $I->loginAsCustomer();
    		    $I->viewMultipleProduct();
          		$I->placeOrder();
          		$I->click('Log out');
          		$I->loginAsVendor();
          		$I->updateOrderStatus();
  		  });	
  		  $combineCommission->leave();

    }
}
