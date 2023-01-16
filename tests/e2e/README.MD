# Dokan E2E Tests (Playwright)

Automated e2e tests for Dokan plugin.

## Table of contents

-   [Pre-requisites](#pre-requisites) 
    - [Install Node.js](#install-node.js) 
    - [Install NVM](#install-nvm) 
    - [Install Docker](#install-docker)  
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

    cd test/e2e

```
npm i
```

### How to run tests

Running all tests

    npx playwright test

Running a single test file

    npx playwright test customers.spec.ts

Run a set of test files

    npx playwright test tests/customers/

Run files that have report or customer in the file name

    npx playwright test report customers

Run the test with the title

    npx playwright test -g "customer add customer details"

Run group of tests with certain tag

    npx playwright test --grep @pro

Run multiple groups of tags 

    npx playwright test --grep @lite | @pro

Skip the tests with a certain tag:

    npx playwright test --grep-invert @pro
