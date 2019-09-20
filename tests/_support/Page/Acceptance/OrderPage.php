<?php
namespace Page\Acceptance;

class OrderPage
{
    // include url of current page
    public static $URL = '/';

    public static $viewProduct ='//div[@id="content"]/div[3]/div/div/ul/li/a/img';
    public static $addToCart ='//button[contains(.,"Add to cart")]';
    public static $viewOrder ='//a[contains(.,"View cart")]';
    public static $processOrder ='//a[contains(.,"Proceed to checkout")]';
    public static $placeOrder ='//div[@id="payment"]/div/button';


    // $I->click('.woocommerce-checkout-payment woocommerce_checkout_place_order','Place order');


    /**
     * Declare UI map for this page here. CSS or XPath allowed.
     * public static $usernameField = '#username';
     * public static $formSubmitButton = "#mainForm input[type=submit]";
     */

    /**
     * Basic route example for your current URL
     * You can append any additional parameter to URL
     * and use it in tests like: Page\Edit::route('/123-post');
     */
    public static function route($param)
    {
        return static::$URL.$param;
    }

    /**
     * @var \AcceptanceTester;
     */
    protected $acceptanceTester;

    public function __construct(\AcceptanceTester $I)
    {
        $this->acceptanceTester = $I;
    }
    public function singleOrder()
    {
        $I = $this->acceptanceTester;

        // $I->amOnPage(self::$URL);
        $I->click(self::$viewProduct);
        $I->click(self::$addToCart);
        $I->click(self::$viewOrder);
        $I->click(self::$processOrder);
        $I->click(self::$placeOrder);

        return $this;
    }

}
