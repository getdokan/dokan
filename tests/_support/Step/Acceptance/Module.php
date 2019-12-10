<?php
namespace Step\Acceptance;

class Module extends \AcceptanceTester
{

    public function productAddonForAllProduct()
    {
        $I = $this;
        $I->click('Settings');
    	$I->click( 'Addons');
    	$I->click('Create New addon');
    	$I->wait(3);
    	$I->fillField('#addon-reference','Addon-Vendor1');
    	$I->fillField('addon-priority','10');
    	$I->checkOption('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/article/div[3]/form/table/tbody/tr[3]/td/span/span[1]/span/ul/li/input','All Products');
    	$I->click('Add Field');
    	$I->wait(2);
    	$I->CheckOption('//*[@id="wc-pao-addon-content-type-0"]','Multiple Choice');
    	$I->appendfield('//*[@id="wc-pao-addon-content-display-0"]','Radio Buttons');
    	//$I->checkOption('//*[@id="wc-pao-addon-content-name-0"]');
    	$I->fillField('#wc-pao-addon-content-name-0','cheese');
    	//$I->fillField('.wc-pao-addon-description show','cheese');
    	$I->CheckOption('#wc-pao-addon-content-title-format','Heading');
    	$I->checkOption('#wc-pao-addon-description-enable-0');
    	$I->fillField('#wc-pao-addon-description-0','Cottage cheese');
    	//$I->checkOption('#wc-pao-addon-required-0');
    	$I->fillField('product_addon_option_label[0][]','cheese');
    	$I->checkOption('.wc-pao-addon-option-price-type','quantity_based');
    	$I->fillField('product_addon_option_price[0][]','5.9');
    	$I->click('Publish');

    }


    public function productAddonForCategory()
    {   

        $I = $this;
        $I->click('Settings');
    	$I->click('Addons');
    	$I->click('Create New addon');
    	$I->wait(3);
    	$I->fillField('#addon-reference','Addon2-Vendor1');
    	$I->fillField('addon-priority','10');
        // $I->click('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/article/div[3]/form/table/tbody/tr[3]/td/span/span[1]/span/ul/li[1]/span');
       // $I->click('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/article/div[3]/form/table/tbody/tr[3]/td/span/span[1]/span/ul/li/input');
        // $I->appendfield('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/article/div[3]/form/table/tbody/tr[3]/td/span/span[1]/span/ul/li/input','Uncategorized');
         // $I->wait(2);
         // $I->pressKey('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/article/div[3]/form/table/tbody/tr[3]/td/span/span[1]/span/ul/li[1]',WebDriverKeys::TAB,'Uncategorized');

         // $I->appendField('/html/body/span/span/span/ul/li[2]/strong','Uncategorized');
         $I->click(['css' => '.select2-selection__rendered']);
         $I->wait(5);
         $I->selectOption('/html/body/span/span/span/ul/li[2]/strong','Uncategorized');
         // $I->fillField('Uncategorized');

         // $I->selectOption('/html/body/div[1]/div/div/div/div[1]/div/article/div/div/div[2]/article/div[3]/form/table/tbody/tr[3]/td/span/span[1]/span/ul/li[1]','Uncategorized');
    	 $I->click('Add Field');
    	 $I->wait(2);
         $I->CheckOption('//*[@id="wc-pao-addon-content-type-0"]','Checkboxes');
         $I->fillField('product_addon_option_label[0][]','Mashroom');
         $I->CheckOption('#wc-pao-addon-content-title-format','Heading');
         $I->checkOption('#wc-pao-addon-description-enable-0');
         $I->fillField('#wc-pao-addon-description-0','Mashroom with cheese');
         $I->fillField('product_addon_option_label[0][]','Mashroom');
         $I->checkOption('.wc-pao-addon-option-price-type','percentage_based');
         $I->fillField('product_addon_option_price[0][]','5');
    	 $I->click('Publish');
    }

}