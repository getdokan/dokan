<?php
namespace Page\Acceptance;

class ProductPage
{
    // include url of current page
    public static $URL = '/';

    public static $viewProducts ='.products';
    public static $alartMessage ='.dokan-alert.dokan-alert-warning';
    public static $addProducts ='.dokan-add-product-link a';
    public static $productTitle ='.dokan-form-control';
    public static $productPrice ='_regular_price';
    // public static $fileUpload ='#dokan-feat-image-upload a';
    public static $productCategory ='#product_cat';
    public static $createProduct ='#dokan-create-new-product-btn';


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
    public function create($title, $price, $category)
    {
        $I = $this->acceptanceTester;

        $I->click(self::$viewProducts);
        $I->dontSee(self::$alartMessage);
        $I->click(self::$addProducts);
        $I->fillField(self::$productTitle, $title);
        $I->fillField(self::$productPrice, $price);
        // $I->fillField(self::$fileUpload, $upload);
        $I->selectOption(self::$productCategory, $category);
        $I->click(self::$createProduct);

        return $this;
    }

}
