- [Introduction](#introduction)
- [TDD Workflow](#basic-tdd-workflow)
- [Factories](./factories.md)
- [How to Run](#how-to-run)
- [Writing Tests for PHPUnit](https://docs.phpunit.de/en/9.6/writing-tests-for-phpunit.html)
- [Why Not Latest PHPUnit](#why-not-latest-phpunit)

### Introduction
You should write the test cases for your code. This ensures code quality, proper implementation of business logic, and easy refactoring.

#### Basic TDD Workflow

1. __Write a Test__: Define the desired functionality.
2. __Run the Test:__ Ensure it fails (functionality not yet implemented).
3. __Write Code:__ Implement the minimum code to pass the test.
4. __Run Tests:__ Verify all tests pass.
5. __Refactor:__ Improve code structure while ensuring tests pass.
6. __Repeat:__ Continue for each new feature

### How to Run
There are two ways to run the test cases from the plugin's root directory terminal.

__Option 1:__

Run tests using the `./vendor/bin/phpunit` command:

```bash
./vendor/bin/phpunit
./vendor/bin/phpunit --filter={your-filter-key}
```

__Option 2:__

Use the custom commands `test` and `test-f` added to the composer script:

```bash
composer test
composer test-f {your-filter-key}
```

### Why Not Latest PHPUnit

We could only use PHPUnit versions those are supported by [WP PHPUnit](https://github.com/wp-phpunit/docs?tab=readme-ov-file#phpunit-compatibility).
