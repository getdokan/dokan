# Overview

- [Introduction](#introduction)
    - [TDD Workflow](#basic-tdd-workflow)
    - [TDD Libraries](#tdd-libraries)
    - [How to Run](#how-to-run)
- [Factories](./factories.md)
- [Why Not Latest PHPUnit](#why-not-latest-phpunit)
- [Woocommerce Developer Blog](https://developer.woocommerce.com/testing-extensions-and-maintaining-quality-code/setting-up-a-local-environment-for-testing/)
- [Wordpress Writing PHP Tests](https://make.wordpress.org/core/handbook/testing/automated-testing/writing-phpunit-tests/)
- [Get Started](./get-started.md)
- [Mocking](./mocking.md)

### Introduction
Writing test cases for your code ensures code quality, proper implementation of business logic, and easy refactoring. It is an essential part of the development process.

#### Basic TDD Workflow

1. **Write a Test**: Define the desired functionality.
2. **Run the Test**: Ensure it fails (since the functionality is not yet implemented).
3. **Write Code**: Implement the minimum code required to pass the test.
4. **Run Tests**: Verify that all tests pass.
5. **Refactor**: Improve the code structure while ensuring that tests still pass.
6. **Repeat**: Continue this process for each new feature.

#### TDD Libraries
---
The following libraries are used for TDD. All methods and features of these libraries are available for writing test cases:

- [PHPUnit](https://docs.phpunit.de/en/9.6/writing-tests-for-phpunit.html)
- [Mockery](http://docs.mockery.io/en/latest/)
- [Brain Monkey](https://giuseppe-mazzapica.gitbook.io/brain-monkey): A unit test utility for PHP, specifically for mocking and testing WordPress code.

### How to Run
---
Run the test cases from the plugin's root directory.

**Prerequisites**

The suite needs built frontend assets. This is not optional — plugin bootstrap
`require`s generated files from `assets/js/` on the `init` hook, so an unbuilt checkout
dies with a PHP fatal before any test runs. See
[ADR-0005](../adr/0005-phpunit-requires-a-webpack-build.md) for the full chain.

```bash
composer install
npm install
npm run build
```

**Option 1 — wp-env (recommended)**

This is what CI runs, so a failure here reproduces a CI failure exactly:

```bash
npm run env:start          # boots WordPress + WooCommerce in Docker
npm run phpunit
npm run phpunit -- --filter {your-filter-key}
```

Or start the environment, run the suite, and tear it down in one go:

```bash
npm run test:phpunit
```

**Option 2 — direct binary**

`./vendor/bin/phpunit` and the `composer test` / `composer test-f` scripts invoke
PHPUnit directly, without wp-env:

```bash
./vendor/bin/phpunit
./vendor/bin/phpunit --filter {your-filter-key}

composer test
composer test-f {your-filter-key}
```

These only work if you have already provisioned the environment yourself: a WordPress
test install (`bin/install-wp-tests.sh`), a reachable MySQL matching
`tests/php/phpunit-wp-config.php`, and a WooCommerce checkout as a sibling directory of
this plugin (`bootstrap.php` resolves it as `../woocommerce`). If you have not done
that, use Option 1.

## Why Not Latest PHPUnit

We can only use PHPUnit versions that are supported by [WP PHPUnit](https://github.com/wp-phpunit/docs?tab=readme-ov-file#phpunit-compatibility).
