exports.config = {
    tests: 'core-tests/**/*_test.js',
    output: './output',
    helpers: {
        WebDriver: {
            url: 'add your project url',

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
        autoLogin: {
            enabled: true,
            saveToFile: false,
            inject: 'loginAs',
            users: {
                admin: {
                    login: (I) => {
                        I.amOnPage('/wp-admin/');
                        I.fillField('#user_login', 'admin');
                        I.fillField('#user_pass', secret('admin'));
                        I.click('Log In');
                    },
                    check: (I) => {
                        I.seeCurrentUrlEquals('/wp-admin/');
                    },
                },
                Vendor: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', 'Username');
                        I.fillField('password', secret('Password'));
                        I.click('login');
                    },
                },
                VendorTwo: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', 'Username');
                        I.fillField('password', secret('Password'));
                        I.click('login');
                    },
                },
                Customer: {
                    login: (I) => {
                        I.amOnPage('/my-account/');
                        I.fillField('username', 'username');
                        I.fillField('password', secret('password'));
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