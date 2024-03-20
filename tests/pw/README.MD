# Dokan E2E-API Tests :test_tube: (Playwright :performing_arts:)

### :fire: Automated E2E and API tests for Dokan plugin. :fire:

<br/>

## :bookmark: Table of contents

-   [Pre-requisites :pushpin:](#pre-requisites)
    -   [Install Node](#install-node)
    -   [Install NVM](#install-nvm)
    -   [Install Docker](#install-docker)

 <br/>

-   [Prep for tests :construction:](#prep-for-tests)
    -   [Build Dokan plugin](#build-dokan-plugin)
    -   [Install Dependencies](#install-dependencies)
    -   [Start Wordpress Environment](#start-wordpress-environment)
    -   [Create Env file](#create-env-file)

<br/>

-   [Running tests :test_tube: ](#running-tests)
    -   [How to run test projects](#how-to-run-test-projects)
    -   [How to run tests](#how-to-run-tests)
    -   [How to skip tests](#how-to-skip-tests)
    -   [How to debug tests](#how-to-debug-tests)
    -   [How to serve reports](#how-to-serve-reports)

<br/>

-   [Contributing to Dokan-e2e-api-test](#Contributing-to-dokan-e2e-api-test)
    -   [How to wright tests](#how-to-run-tests)

<br/>

## :pushpin: Pre-requisites

#### :o: Install Node

&emsp;Follow instructions on the [Node site](https://nodejs.org/en/download/) to install Node.

#### :o: Install NVM

&emsp;Follow instructions in the [NVM repository](https://github.com/nvm-sh/nvm) to install NVM.

#### :o: Install Docker

&emsp;Follow instructions on the [Docker Desktop](https://docs.docker.com/docker-for-mac/install/) to install Docker.

<br/>

## :construction: Prep for tests

Preparation for running tests involves conducting necessary tasks and arrangements to ensure a smooth and efficient testing process. This may include setting up the testing environment, configuring dependencies, initializing resources, and performing any required setup actions.

<br/>

### :o: Build Dokan plugin

<br/>

:radio_button: Go to dokan project root directory and run

    composer i --no-dev && composer du -o && npm i && npm run build

<br/>

### :o: Install Dependencies

<br/>

:radio_button: Go to project directory

    cd tests/pw

<br/>

:radio_button: Install dependencies

```
npm i
```

<br/>

:radio_button: Install browser

```
npx playwright install chromium
```

<br/>

### :o: Start Wordpress Environment

<br/>

:radio_button: Go to project directory

    cd tests/pw

<br/>

:radio_button: Start Environment

    npm run wp-env start

<br/>

### :o: Create Env file

Environment (env) file is used for storing configuration settings and variables specific to the testing environment. It allows managing and customizing the testing environment settings easily without modifying the test code. It provides flexibility and enables seamless configuration changes between different testing environments, ensuring efficient and effective testing of the project.

<br/>

Create .env file according to .env.example file

<br/>

```
# Plugin Configuration
ADMIN=John_Doe                          [Admin username]
ADMIN_PASSWORD=AdminPass123             [Password for the admin account]
VENDOR=David_Johnson                    [Vendor username]
VENDOR2=jhonathon_Smith                 [Vendor username]
CUSTOMER=Michael_Williams               [Customer username]
USER_PASSWORD=Passw0rd123               [Password for all other users]
GMAP=ABCD1234EFGH5678                   [Google Maps API key]
LICENSE_KEY=ABCD1234EFGH5678            [Dokan License key]
DOKAN_PRO=true                          [Dokan pro active status]

# Playwright Configuration
BASE_URL=https://example.com            [Base URL of the test site]
CI=true                                 [CI/CD environment indicator]
SLOWMO=10                               [Slow down test execution by provided seconds] [optional]
NO_SETUP=true                           [Whether not to run setup tests before actual tests] [optional]
SITE_PATH=/users/rk/sites/dokan         [Path of the local test site][only for local testing]

# Database Configuration
DB_HOST_NAME=localhost                  [Database server hostname or IP address]
DB_USER_NAME=dbuser                     [Database username]
DB_USER_PASSWORD=dbpassword             [Database user password]
DATABASE=mywpdb                         [Database name]
DB_PORT=3306                            [Database connection port]
DB_PREFIX=wp                            [Prefix for database tables]
```

<br/>
<br/>

## :test_tube: Running tests

Running tests involves executing the predefined test cases or scripts to evaluate the functionality, performance, or other aspects of a system or software application. By running tests, potential issues, bugs, or errors can be identified, providing insights into the quality and behavior of the system under test. The results obtained from running tests contribute to validating the system's compliance with requirements, verifying expected outcomes, and supporting the overall quality assurance process.

<br/>

### :o: How to run test projects

<br/>

:radio_button: Run E2E test project Lite

    npx playwright test --project=e2e_tests --grep '@lite|@liteOnly' --config=e2e.config.ts

<br/>

:radio_button: Run API test project Lite

    npx playwright test --project=api_tests --grep '@lite|@liteOnly' --config=api.config.ts

<br/>

:radio_button: Run E2E test project Pro

    npx playwright test --project=e2e_tests --grep '@lite|@pro' --config=e2e.config.ts

<br/>

:radio_button: Run API test project Pro

    npx playwright test --project=api_tests --grep '@lite|@pro' --config=api.config.ts

<br/>

### :o: How to run tests

<br/>

:radio_button: Run all tests

    npx playwright test

<br/>

:radio_button: Run tests in UI Mode

    npx playwright test --ui

<br/>

:radio_button: Run a single test file

    npx playwright test customers.spec.ts

<br/>

:radio_button: Run a set of test files

    npx playwright test tests/products/ tests/customers/

<br/>

:radio_button: Run files that have report or customer in the file name

    npx playwright test report customers

<br/>

:radio_button: Run the test with the title

    npx playwright test -g "customer add customer details"

<br/>

:radio_button: Run a single project

    npx playwright test --project=e2e_tests

<br/>

:radio_button: Run group of tests with certain tag

    npx playwright test --grep @pro

<br/>

:radio_button: Run multiple groups of tags

    npx playwright test --grep @lite | @pro

<br/>

:radio_button: Skip the tests with a certain tag:

    npx playwright test --grep-invert @pro

<br/>

:radio_button: Run tests on specific browser

    npx playwright test --project=chromium

<br/>

:radio_button: Run tests in headed mode

    npx playwright test --headed

<br/>

### :o: How to debug tests

<br/>

:radio_button: Run all tests with debug flag

    npx playwright test --debug

<br/>

:radio_button: Run a single test with debug flag

    npx playwright test customers.spec.ts --debug

<br/>

:radio_button: Debug start form specific test line number [where the test(.. is defined]

    npx playwright test customers.spec.ts:20 --debug

<br/>

### :o: How to serve reports

<br/>

:radio_button: Server test report

    npx playwright show-report

## Contributing to playwright-api-test
