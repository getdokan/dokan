var base64 = require('base-64');
var encode = base64.encode("admin:admin");
exports.config = {
    output: './output',
    helpers: {
        // WebDriver: {
        //     url: 'http://localhost:10003/',
        //     browser: 'chrome',
        //     desiredCapabilities: {
        //         chromeOptions: {
        //             args: ["--headless", "--disable-gpu", "--no-sandbox"]
        //         }
        //     },
        // },
        REST: {
            endpoint: 'http://dokan-pro.test/',
            onRequest: (request) => {
                //request.headers.auth = { Username: 'admin', Password: 'admin' };
            },
            defaultHeaders: {
                "accept": 'application/json',
                "authorization": 'Basic ' + encode

            }
        },
        "ChaiWrapper": {
            "require": "codeceptjs-chai"
        },
    },
    include: {
        I: './steps_file.js',
        product: './pages/product.js',
        helpers: './pages/helpers.js',
        locator: './pages/locator.js'
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
        }
    },
    tests: './core-tests/*_test.js', //tests/**/*_test.js
    name: 'e2e'
}