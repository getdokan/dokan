- [Installation](#installation)
- [Method Expectations](#method-expectations)
- [Partial Mocking](#partial-mocking)
- [Argument Expectations](#argument-expectations)
- [Return Values](#return-values)
- [Method Call "Count" Expectations](#method-call-count-expectations)

> **Most of following documentation is copied from https://github.com/pestphp/docs/blob/master/mocking.md**

# Mocking
> **Requirements:** [Mockery 1.0+](https://github.com/mockery/mockery/)

When testing your applications, you may want to "mock" specific classes to prevent them from actually being invoked during a particular test. For instance, if your application interacts with an API that initiates a payment, you likely want to "mock" the API client locally to prevent the actual payment from being made.

Before getting started, you will need to install a mocking library. We recommend [Mockery](https://github.com/mockery/mockery/), but you are free to choose any other library that suits your needs.

## Installation
To begin using Mockery, require it using the Composer package manager.

```bash
composer require mockery/mockery --dev
```

While comprehensive documentation for Mockery can be found on the [Mockery website](https://docs.mockery.io), this section will discuss the most common use cases for mocking.


## Method Expectations

Mock objects are essential for isolating the code being tested and simulating specific behaviors or conditions from other pieces of the application. After creating a mock using the `Mockery::mock()` method, we can indicate that we expect a certain method to be invoked by calling the `shouldReceive()` method.

```php
use Dokan\Repositories\BookRepository;
use Mockery;

class SampleTest extends DokanTestCase {
    public function test_sample_method() {
        $client = Mockery::mock(PaymentClient::class);
        $client->shouldReceive('post');

        $books = new BookRepository($client);
        $books->buy(); // The API is not actually invoked since `$client->post()` has been mocked...
    }
}
```

It is possible to mock multiple method calls using the same syntax shown above.

```php
$client->shouldReceive('post');
$client->shouldReceive('delete');
```


## Partial Mocking

```php
class BigParentClass
{
    public function doesEverything()
    {
        // sets up database connections
        // writes to log files
    }
}

class ChildClass extends BigParentClass
{
    public function doesOneThing()
    {
        // but calls on BigParentClass methods
        $result = $this->doesEverything();
        // does something with $result
        return $result;
    }
}
```
We can create a runtime partial test double of the ChildClass itself and mock only the parent’s doesEverything() method:
```php
$childClass = \Mockery::mock('ChildClass')->makePartial();
$childClass->shouldReceive('doesEverything')
    ->andReturn('some result from parent');

$childClass->doesOneThing(); // string("some result from parent");
```
With this approach we mock out only the `doesEverything()` method, and all the unmocked methods are called on the actual ChildClass instance. Please visit [Big Parent Class](http://docs.mockery.io/en/latest/cookbook/big_parent_class.html) for details.

[**Generated Partial Test Doubles**](http://docs.mockery.io/en/latest/reference/partial_mocks.html)

```php
$mock = \Mockery::mock('MyClass[foo,bar]');
```
In the above example, the `foo()` and `bar()` methods of *MyClass* will be mocked but no other *MyClass* methods are touched. We will need to define expectations for the `foo()` and `bar()` methods to dictate their mocked behaviour.


## Argument Expectations

In order to make our expectations for a method more specific, we can use constraints to limit the expected argument list for a method call. This can be done by utilizing the `with()` method, as demonstrated in the following example.

```php
$client->shouldReceive('post')
    ->with($firstArgument, $secondArgument);
```

In order to increase the flexibility of argument matching, Mockery provides built-in matcher classes that can be used in place of specific values. For example, instead of using specific values, we can use `Mockery::any()` to match any argument.

```php
$client->shouldReceive('post')
    ->with($firstArgument, Mockery::any());
```

It is important to note that expectations defined using `shouldReceive()` and `with()` only apply when the method is invoked with the exact arguments that you expected. Otherwise, Mockery will throw an exception.

```php
$client->shouldReceive('post')->with(1);

$client->post(2); // fails, throws a `NoMatchingExpectationException`
```

In certain cases, it may be more appropriate to use a closure to match all passed arguments simultaneously, rather than relying on built-in matchers for each individual argument. The `withArgs()` method accepts a closure that receives all of the arguments passed to the expected method call. As a result, this expectation will only be applied to method calls in which the passed arguments cause the closure to evaluate to true.

```php
$client->shouldReceive('post')->withArgs(function ($arg) {
    return $arg === 1;
});

$client->post(1); // passes, matches the expectation
$client->post(2); // fails, throws a `NoMatchingExpectationException`
```

## Return Values

When working with mock objects, we can use the `andReturn()` method to tell Mockery what to return from the mocked methods.

```php
$client->shouldReceive('post')->andReturn('post response');
```

We can define a sequence of return values by passing multiple return values to the `andReturn()` method.

```php
$client->shouldReceive('post')->andReturn(1, 2);

$client->post(); // int(1)
$client->post(); // int(2)
```

Sometimes, we may need to calculate the return results of method calls based on the arguments passed to the method. This can be accomplished using the `andReturnUsing()` method, which accepts one or more closures.

```php
$mock->shouldReceive('post')
    ->andReturnUsing(
        fn () => 1,
        fn () => 2,
    );
```

In addition, we can instruct mocked methods to throw exceptions.

```php
$client->shouldReceive('post')->andThrow(new Exception);
```

## Method Call "Count" Expectations

Along with specifying expected arguments and return values for method calls, we can also set expectations for how many times a particular method should be invoked.

```php
$mock->shouldReceive('post')->once();
$mock->shouldReceive('put')->twice();
$mock->shouldReceive('delete')->times(3);
// ...
```

To specify a minimum number of times a method should be called, we may use the `atLeast()` method.

```php
$mock->shouldReceive('delete')->atLeast()->times(3);
```

Mockery's `atMost()` method allows us to specify the maximum number of times a method can be called.

```php
$mock->shouldReceive('delete')->atMost()->times(3);
```

---

The primary objective of this section is to provide you with an introduction to Mockery, the mocking library we prefer. However, for a more comprehensive understanding of Mockery, we suggest checking out its [official documentation](https://docs.mockery.io).
