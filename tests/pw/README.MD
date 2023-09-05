#  Dokan E2E-API Tests :test_tube:  (Playwright :performing_arts:)

### :fire: Automated E2E and API tests for Dokan plugin. :fire:
<br/> 

## :bookmark: Table of contents
-   [Pre-requisites :pushpin:](#pre-requisites) 
    - [Install Node](#install-node) 
    - [Install NVM](#install-nvm) 
    - [Install Docker](#install-docker)  

 <br/> 

 -   [Prep for tests :construction:](#prep-for-tests)
        -   [Install Dependencies](#install-dependencies)
        -   [Start Wordpress Environment](#start-wordpress-environment)
        -   [Create Env file](#create-env-file)
        
<br/> 

-   [Running tests :test_tube:  ](#running-tests)
    -   [How to run test projects](#how-to-run-test-projects)
    -   [How to serve reports](#how-to-serve-reports)

<br/>

## :pushpin: Pre-requisites 

#### :o: Install Node

&emsp;Follow instructions on the [Node site](https://nodejs.org/en/download/) to install Node.

#### :o: Install NVM

&emsp;Follow instructions in the [NVM repository](https://github.com/nvm-sh/nvm) to install NVM.


#### :o: Install Docker

&emsp;Follow instructions on the [Docker Desktop](https://docs.docker.com/docker-for-mac/install/) to install Docker.

<br/>

## :construction:  Prep for tests

Preparation for running tests involves conducting necessary tasks and arrangements to ensure a smooth and efficient testing process. This may include setting up the testing environment, configuring dependencies, initializing resources, and performing any required setup actions.

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

## :test_tube: Running tests

Running tests involves executing the predefined test cases or scripts to evaluate the functionality, performance, or other aspects of a system or software application. By running tests, potential issues, bugs, or errors can be identified, providing insights into the quality and behavior of the system under test. The results obtained from running tests contribute to validating the system's compliance with requirements, verifying expected outcomes, and supporting the overall quality assurance process.

<br/>

### :o: How to run test projects
<br/>

:radio_button: Run E2E test project Lite

    npx playwright test --project=e2e_tests --grep @lite --config=e2e.config.ts
<br/>

:radio_button: Run API test project Lite

    npx playwright test --project=api_tests --grep @lite --config=api.config.ts 
<br/>


:radio_button: Run E2E test project Pro

    npx playwright test --project=e2e_tests --grep @lite --config=e2e.config.ts
<br/>

:radio_button: Run API test project Pro

    npx playwright test --project=api_tests --grep '@lite|@pro' --config=api.config.ts 
<br/>



### :o: How to serve reports
<br/>

:radio_button:  Server test report

    npx playwright show-report


