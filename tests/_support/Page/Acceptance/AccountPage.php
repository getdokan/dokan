<?php
namespace Page\Acceptance;

class AccountPage
{
    // include url of current page
    public static $URL = '/';

    // Customer Sign Up
    public static $registrationLink = 'Sign Up';
    public static $emailField ='.register #reg_email';
    public static $registrationButton = '#register button[type=submit]';

    // Customer Login
    public static $userLoginLink = 'Log in';
    public static $usernameField = '.login #username';
    public static $passwordField = '.login input[name=password]';
    public static $loginButton = '.login button[type=submit]';

    // Vendor Sign up
    public static $vendorPasswordField = '.register #reg_password';
    public static $userRol = '(//input[@name="role"])[2]';
    public static $firstName = '.show_if_seller #first-name';
    public static $lastName = '.show_if_seller #last-name';
    public static $companyName = '.show_if_seller #company-name';
    public static $shopUrl = '.show_if_seller #seller-url';
    public static $phoneNumber = '.register #shop-phone';
    public static $welcomeMessage = '.wc-setup-content';

    // Wizard Set Up
    public static $setupWizard = '.wc-setup-actions.step';
    public static $ignoreWizard = '/html/body/div[1]/p[3]/a[2]';

    //Logout
    public static $logout ='//*[@id="page"]/nav/div/div/div[2]/div/ul/li[4]/a';

// $I->click('(//input[@name="role"])[2]');

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

    public function login($name, $password)
    {
        $I = $this->acceptanceTester;

        $I->amOnPage(self::$URL);
        $I->click(self::$userLoginLink);
        $I->fillField(self::$usernameField, $name);
        $I->fillField(self::$passwordField, $password);
        $I->click(self::$loginButton);

        return $this;
    }
    public function registration($email)
    {
        $I = $this->acceptanceTester;

        $I->amOnPage(self::$URL);
        $I->click(self::$registrationLink);
        $I->fillField(self::$emailField, randomGenerate()->email);
        $I->click(self::$registrationButton);

        return $this;
    }

}

function randomGenerate() {
  return \Faker\Factory::create();
}
