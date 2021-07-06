exports.config = {
    output: './output',
    helpers: {
        WebDriver: {
            url: 'https://dokan.ajaira.website/',
            
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
            './step_definitions/steps.js',
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
                      I.fillField('#user_pass', secret('tAFRK@QNiPaJm5knQtrmVT#r'));
                      I.click('Log In');
                  },
                  check: (I) => {
                    I.seeCurrentUrlEquals('/wp-admin/');
                  },
                },
                vendor: {
                  login: (I) => {
                    I.amOnPage('/my-account/');
                      I.fillField('username', 'vendor-one');
                      I.fillField('password', secret('123456'));
                      I.click('login');
          },
           },
           vendorTwo: {
                login: (I) => {
                  I.amOnPage('/my-account/');
                  I.fillField('username', 'vendor-two');
                  I.fillField('password', secret('123456'));
                  I.click('login');
          },
           },
          customer: {
                login: (I) => {
                  I.amOnPage('/my-account/');
                      I.fillField('username', 'customer');
                      I.fillField('password', secret('123456'));
                      I.click('login');
          },
           },
           },
           },
    },
    tests: './core-tests/*_test.js',
    name: 'e2e'
}