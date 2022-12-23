# Dokan API Tests (Playwright)

Automated API tests for Dokan API endpoints.

## Table of contents

-   [Pre-requisites](#pre-requisites) - [Install Node.js](#install-node.js) - [Install NVM](#install-nvm) - [Install Docker](#install-docker)  
    &nbsp;
-   [Running tests](#running-tests)

    -   [Prep work for running tests](#prep-work-for-running-tests)
    -   [How to run tests](#how-to-run-tests)
    -   [How to skip tests](#how-to-skip-tests)

## Pre-requisites

### Install Node.js

Follow instructions on the [node.js site](https://nodejs.org/en/download/) to install Node.js.

### Install NVM

Follow instructions in the [NVM repository](https://github.com/nvm-sh/nvm) to install NVM.

### Install Docker

Follow instructions on the [Docker Desktop](https://docs.docker.com/docker-for-mac/install/) to install Docker.

## Running tests

### Prep work for running tests

Run the following in a terminal/command line window to install dependencies.

    cd test/api

```
npm i
```

### How to run tests

Running all tests

    npx playwright test

Running a single test file

    npx playwright test coupons.spec.ts

Run a set of test files

    npx playwright test tests/products/ tests/customers/

Run files that have report or customer in the file name

    npx playwright test report customer

Run the test with the title

    npx playwright test -g "get summary report"

Run group of tests with certain tag

    npx playwright test --grep @pro

Skip the tests with a certain tag:

    npx playwright test --grep-invert @pro
