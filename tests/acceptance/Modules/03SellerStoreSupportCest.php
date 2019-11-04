<?php


class SellerStoreSupportCest
{
    public function _before(AcceptanceTester $I)
    {
    }

    // tests
    public function sellerStoreSupport(\Step\Acceptance\Login $I)
    {   

    	$I->loginAsVendor();
    	$I->click('Settings');
    	$I->click('Store');
    	$I->wait(3);
    	$I->checkOption('#support_checkbox');
    	$I->fillfield('#dokan_support_btn_name','Want to need support');
    	$I->click('Update Settings');


    	 $CustomerView = $I->haveFriend('CustomerView');
        $CustomerView->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            $I->click('Store List');
            $I->wait(2);
            $I->click('//div[@id="dokan-seller-listing-wrap"]/div/ul/li/div/div[2]/a');
            $I->wait(3);
            $I->click('Want to need support');
            $I->wait(2);
            $I->fillfield('#dokan-support-subject','need support');
            $I->fillfield('#dokan-support-msg','Replace it soon it has some defects');
            $I->click('Submit');

       });
       $CustomerView->leave();

       $I->click('Store');
       $I->click('Back to Dashboard');
       $I->wait(3);
       $I->click('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[1]/div/ul/li[13]/a');
       $I->wait(2);
       $I->click('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/div/table/tbody/tr/td[1]/a');
       $I->wait(2);
       $I->fillfield('comment','ok done');
       $I->appendfield('dokan-topic-status-change','Close Ticket');
       $I->click('Submit Reply');


    $CustomerView1 = $I->haveFriend('CustomerView1');
        $CustomerView1->does(function(AcceptanceTester $I){
            $I->loginAsCustomer();
            //$I->click('Store List');
            $I->wait(2);
            $I->click('My account');
            $I->wait(2);
            $I->click('Seller Support Tickets');
            $I->wait(2);
    

       });
       $CustomerView1->leave();

    }
}
