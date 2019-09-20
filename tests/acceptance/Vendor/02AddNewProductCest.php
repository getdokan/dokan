<?php
// namespace Vendor;


class AddNewProductCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // Vendor Add New Product
    public function addNewProduct(\Step\Acceptance\Login $I, \Page\Acceptance\AccountPage $vendor,
                                  \Page\Acceptance\ProductPage $product)
    {
      $I->loginAsVendor();
      // $vendor->login('vendor','vendor');
      $product->create('Green Watch','250','watch');

    }
}
