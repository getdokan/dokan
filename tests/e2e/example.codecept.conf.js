require('dotenv').config()
const env = require('./env');
exports.config = {

    tests: 'core-tests/**/*_test.js',

    output: './output',
    helpers: {
        WebDriver: {
            url: env('URL'),
            browser: 'chrome',
            desiredCapabilities: {
                // chromeOptions: {
                //     args: ["--headless","--window-size=1200,1600", "--disable-gpu", "--no-sandbox"]
                // }

            },
        },
    },
    include: {
        I: './steps_file.js',
        product: './pages/product.js',
        helpers: './pages/helpers.js',
        locator: './pages/locator.js',
        explore: './pages/explore.js',
    },
    mocha: {},
    bootstrap: null,
    teardown: null,
    hooks: [],
    gherkin: {
        features: './features/*.feature',
        steps: [
            './step_definitions/simpleProduct.js',
        ]
    },
    plugins: {
        screenshotOnFail: {
            enabled: true
        },
        pauseOnFail: {},
        retryFailedStep: {
            enabled: true
        },
        tryTo: {
            enabled: true
        },
        allure: {
            enabled: 'true'
        },
        autoLogin: {
            enabled: true,
            saveToFile: false,
            inject: 'loginAs',
            users: {
                admin: {
                    login: (I) => {
                        I.amOnPage('/wp-admin/');
                        I.fillField('#user_login', env('ADMIN'));
                        I.fillField('#user_pass', env(secret('ADMIN_PASSWORD')));
                        I.click('Log In');
                    },
                    check: (I) => {
                        I.seeCurrentUrlEquals('/wp-admin/');
                    },
                },
                Vendor: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', env('VENDOR_ONE'));
                        I.fillField('password', env(secret('VENDOR_ONE_PASSWORD')));
                        I.click('login');
                    },
                },
                VendorTwo: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', env('VENDOR_TWO'));
                        I.fillField('password', env(secret('VENDOR_TWO_PASSWORD')));
                        I.click('login');
                    },
                },
                Customer: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', env('CUSTOMER_ONE'));
                        I.fillField('password', env(secret('CUSTOMER_ONE_PASSWORD')));
                        I.click('login');
                    }
                },
                CustomerTwo: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', env('CUSTOMER_TWO'));
                        I.fillField('password', env(secret('CUSTOMER_TWO_PASSWORD')));
                        I.click('login');
                    }
                }
            }
        },
    }

    // tests:'core-tests/**/*_test.js',
    // // tests: './core-tests/*_test.js',
    // name: 'e2e'
}