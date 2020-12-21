const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: 'tests/e2e/**/*_test.js',
  output: './output',
  helpers: {
    WebDriver: {
      url: 'https://dokan.ajaira.website/',
      browser: 'chrome',
      waitForTimeout: 5000, // wait for 5 seconds, by default it's wait 1 sec
      smartWait: 5000
    }
  },
  include: {
    I: './steps_file.js'
  },
  bootstrap: null,
  mocha: {},
  name: 'dokan',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true
    },
    tryTo: {
      enabled: true
    },
    screenshotOnFail: {
      enabled: true
    }
  }
}