# Get Started
- [Introduction](#intorduction)
    - [Recommendation](#recommendations-for-writing-effective-test-cases)
    - [Organize Test Cases](#organize-test-cases)
    - [Unit Test and Integration Test](#when-to-use-unit-test-and-integration-test)
- [Write Test Case](#write-test-case)
    - [API Test](#api-test)
    - [AJAX Test](#ajax-test)
    - [Unit Test](#unit-test)
    - [Grouping Test Cases](#grouping-test-cases-in-phpunit)
- [Custom Assertion](#available-custom-assertion)
    - [Database Assertion](#database-assertion)
    - [Nested Array Assertion](#nested-array-assertion)
- [Mocking](./mocking.md)

## Introduction
   
Our test case class should extend the [DokanTestCase](./../../tests/php/src/DokanTestCase.php#L14) class.

### Recommendations for Writing Effective Test Cases

1. **Isolate the SUT**: Ensure that your tests are isolated and only test the SUT (*System under test*) without external dependencies.
2. **Use Meaningful Test Names**: Use descriptive names for your test methods to indicate what they are testing.
3. **Test Edge Cases**: Include test cases for edge conditions and potential error scenarios.
4. **Maintain Readability**: Write clean and readable test code. Use comments if necessary to explain complex logic.
5. **Keep Tests Independent**: Ensure that each test is independent of others and does not rely on any shared state.

### Organize Test Cases

A well-organized directory structure is crucial for maintaining clarity and manageability. Here’s an example structure:

```
plugin-dir/
│
├── tests/
│   ├── php/
│   │   ├── src/
│   │   │   ├── Unit/
│   │   │   │   └── ClassTest.php
│   │   │   ├── Integration/
│   │   │   │   └── ClassIntegrationTest.php
│   │   │   └── TestCase.php
│   │   └── bootstrap.php
│   │
│   └── pw/
│       └── Files and folders for the Playwright tests
│
└── ... Other files
```

We can follow the same file path of the source. For example, the test case file for `includes/Services/MyService.php` could be `tests/php/src/Unit/MyServiceTest.php` or `tests/php/src/Integration/MyServiceTest.php`.

### When to Use Unit Test and Integration Test

#### Unit Tests

- Use unit tests for core logic, utility functions, and isolated classes.
- Aim to cover as much of your code as possible with unit tests.
- Run unit tests frequently during development to catch issues early.

#### Integration Tests

- Use integration tests for verifying interactions between components.
- Test scenarios that involve multiple units working together.
- Run integration tests to ensure that different parts of your system work well together, especially after major changes or before releases.

#### Best Practices

- **Balance**: Maintain a good balance between unit tests and integration tests. Both are crucial for comprehensive test coverage.
- **Mocking**: Use mocking frameworks (e.g., Mockery, Brain Monkey) to isolate components during unit testing.
- **Environment**: Set up a controlled environment for integration testing to avoid side effects and ensure repeatability.


## Write Test Case

To write unit tests in Dokan smoothly, your test class should extend the `WeDevs\Dokan\Test\DokanTestCase` abstract class. For example

```php
<?php

namespace WeDevs\Dokan\Test\Unit;

use WeDevs\Dokan\Test\DokanTestCase;

class SampleTest extends DokanTestCase {
    protected $is_unit_test = true; // For unit test.

    public function test_sample_method() {
        $this->assertTrue( true );
    }
}
```
> If `$is_unit_test` is `true` then `DokanTestCase` will not create utility for the API and Database.

### API Test

There are two utility methods named `get_request` and `post_request` in the `DokanTestCase` class.

```php

<?php

namespace WeDevs\Dokan\Test\Integration;

use WeDevs\Dokan\Test\DokanTestCase;

class SampleTest extends DokanTestCase {
    // Ensure route is registered.
    public function test_ensure_my_route_is_registered()
    {
        $routes = $this->server->get_routes( $this->namespace );
        $full_route = $this->get_route(  'my-route' );

        // Assert route is registered.
        $this->assertArrayHasKey( $full_route, $routes );

        // Assert route is registered only for GET method.
        $this->assertNestedContains( [ 'methods' => [ 'GET' => true ] ], $routes[ $full_route ] );
    }

    // GET & POST request test.
    public function test_sample_method() {
        // GET request.
        $response = $this->get_request( 'route', $filter_params );
        $data  = $response->get_data();
        $status_code = $response->get_status();

        // POST request.
        $response = $this->post_request( 'route', $request_params );
        $data  = $response->get_data();
        $status_code = $response->get_status();

        // PUT request
        $response = $this->put_request( 'route', $update_params );
        $data  = $response->get_data();
        $status_code = $response->get_status();

        // DELETE request
        $response = $this->delete_request( 'route', $delete_params );
        $data  = $response->get_data();
        $status_code = $response->get_status();
    }
}
```
`$filter_params` and `$request_params` are the array of `key => value`.

### Ajax Test
You should extend the `DokanAjaxTestCase` to write the the ajax test.

```php

<?php

namespace WeDevs\Dokan\Test\Integration;

use WeDevs\Dokan\Test\DokanAjaxTestCase;
use WPAjaxDieContinueException;

class SampleTest extends DokanAjaxTestCase {
    public function test_sample_method() {
        $user = $this->factory()->seller->create();
        // Set the current user to the created seller
        wp_set_current_user( $user );

        // Set up POST variables
        $_POST['nonce']  = wp_create_nonce( 'dokan_withdraw_make_default' );
        $_POST['action'] = 'dokan_withdraw_handle_make_default_method';
        $_POST['method'] = 'paypal';

        // Handle the AJAX request
        try {
            $this->_handleAjax( 'dokan_withdraw_handle_make_default_method' );
        } catch ( WPAjaxDieContinueException $e ) {
            // Catch the die() statement in AJAX handling
            $this->fail( $e->getMessage() );
        }
        wp_set_current_user( $user );

        // Get the last response
        $response = $this->_last_response;

        if ( empty( $response ) ) {
            $this->fail( 'No response from AJAX handler' );
        }

        // Decode the JSON response
        $data = json_decode( $response, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            $this->fail( 'Invalid JSON response: ' . json_last_error_msg() );
        }
    }
}
```

### Unit Test

Unit tests should be independent of external sources such as databases, APIs, etc. They must always return the expected result. Set the `$is_unit_test` property to `true` when writing unit tests by extending the `DokanTestCase` class.

```php
<?php

namespace WeDevs\Dokan\Test\Unit; // Unit test namespace.

use WeDevs\Dokan\Test\DokanTestCase;

class SampleTest extends DokanTestCase {
    /**
     * Indicates if the test is a unit test.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    public function test_sample_method() {
        // Your test cases.
    }
}
```
### Grouping Test Cases in PHPUnit

Grouping test cases in PHPUnit allows you to organize and execute specific sets of tests conveniently. You can use the `@group` annotation to tag methods or entire classes with a group name. This makes it easier to run only the relevant test cases without executing the entire test suite.

> In our case, We may group our test cases by `module-name`.

#### How to Group Test Cases

To group test cases, simply add the `@group your-group-name` annotation above your test method or class. Here's an example:

```php
<?php

namespace WeDevs\Dokan\Test\Unit; // Unit test namespace.

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * @group my-module
 */
class SampleTest extends DokanTestCase {
    /**
     * Indicates if the test is a unit test.
     *
     * @var bool
     */
    protected $is_unit_test = true;

    public function test_sample_method() {
        // Your test cases.
    }
}
```

In this example, the `SampleTest` class is grouped under the `my-module` group.

#### Running Grouped Test Cases

To run test cases for a specific group, use the following command in your terminal:

```bash
./vendor/bin/phpunit --group my-module
```

This command will execute all the test cases tagged with the `my-module` group.

#### Additional Resources

For more detailed information on using groups in PHPUnit, refer to the official documentation:
- [WordPress PHPUnit Docs](https://make.wordpress.org/core/handbook/testing/automated-testing/writing-phpunit-tests/#annotations)
- [PHPUnit Annotations Documentation](https://docs.phpunit.de/en/9.6/annotations.html#group)

This approach helps you organize your tests more efficiently, especially in larger projects where running the entire test suite might be time-consuming.
## Available Custom Assertion

Since `WeDevs\Dokan\Test\DokanTestCase` class composes the [PHPUnit](https://docs.phpunit.de/en/9.6/), [Mockery](http://docs.mockery.io/en/latest/) and [Brain Monkey](https://giuseppe-mazzapica.gitbook.io/brain-monkey) so all methods of these packages are available in your test class. 

 - [PHPUnit](https://docs.phpunit.de/en/9.6/) for general assertion.
 - [Brain Monkey](https://giuseppe-mazzapica.gitbook.io/brain-monkey) for **WordPress** assertion.
 
#### Database Assertion
`WeDevs\Dokan\Test\DokanTestCase` also use the [DBAssertionTrait]((./../../tests/php/src/DBAssertionTrait.php)) which contains the following methods to assert the database records.

- `assertDatabaseHas( string $table, array $data = [] )`: Assert that a table contains at least one row matching the specified criteria.
- `assertDatabaseCount( string $table, int $count, array $data = [] )`: Assert that a table contains the specified number of rows matching the criteria.

```php
$product_id = $this->factory()->product->create(
    [
        'status' =>'publish'
    ]
);

$this->assertDatabaseHas( 'posts', [ 'status' => 'publish' ] );
$this->assertDatabaseCount( 'posts', 1, [ 'ID' => $product_id ] );
```

 
#### Nested Array Assertion

We may use `assertNestedContains` if It is required to assert value to a nested Array.

```php
$array = [
    'key1' => [
        'subkey1' => 'value1',
        'subkey2' => 'value2'
    ],
    'key2' => 'value3'
];

// Use the custom assertion method
$this->assertNestedContains( [ 'subkey1' => 'value1' ], $array );
$this->assertNestedContains( [ 'key2' => 'value3' ], $array );
```
