<?php
namespace Page\Acceptance;

class AdminPage
{
    // include url of current page
    public static $URL = '/wp-admin';

    public static $products ='Products';
    public static $category ='//*[@id="menu-posts-product"]/ul/li[4]/a';
    public static $categoryName ='tag-name';
    public static $addCategory ='#submit';
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
    public function category($name)
    {
        $I = $this->acceptanceTester;

        // $I->amOnPage(self::$URL);
        $I->click(self::$products);
        $I->click(self::$category);
        $I->fillField(self::$categoryName, $name);
        $I->click(self::$addCategory);

        return $this;
    }

}
