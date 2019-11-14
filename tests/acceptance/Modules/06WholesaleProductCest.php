<?php 
// namespace Modules;


class WholesaleProductCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    public function wholeSaleProductForVendor(\Step\Acceptance\Login $I, 
    											\Page\Acceptance\AccountPage $vendor,
                                 				\Page\Acceptance\ProductPage $product)
   {
       $I->loginAsVendor();
       $product->create('Sharee','240','Uncategorized');
       $I->wait(3);
      // $I->performOn('//div[11]/div[2]/div/label/input[2]',Codeception\Util\ActionSequence::build()
        //->scrollTo('//div[11]/div[2]/div/label/input[2]',30,50)
        $I->checkOption('form input[id="wholesale[enable_wholesale]"]');
        $I->wait(3);
        $I->fillField('wholesale[price]','260');
        $I->fillField('wholesale[quantity]','10');
        $I->click('Save Product');
   }
}
