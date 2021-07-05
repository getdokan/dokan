exports.config = {
    output: './output',
    helpers: {
        WebDriver: {
            url: 'http://localhost:10003/',
            // url: 'http://dokan-pro.test/',
            // url: 'https://dokan.ajaira.website/', 
            browser: 'chrome',
            // windowSize: "maximize",

            desiredCapabilities: {
                chromeOptions: {
                    args: ["--headless","--window-size=1200,1600", "--disable-gpu", "--no-sandbox"]
                }
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
        }
    },
    tests: './core-tests/*_test.js',
    name: 'e2e'
}