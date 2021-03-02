exports.config = {
  output: './output',
  helpers: {
    WebDriver: {
      url: 'http://localhost:10003/',
      browser: 'chrome',
      desiredCapabilities: {
        chromeOptions: {
          args: [ "--headless", "--disable-gpu", "--no-sandbox" ]
        }
      },
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
  tests: './core-tests/*_test.js',
  name: 'e2e'
}