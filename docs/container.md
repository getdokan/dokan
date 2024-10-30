## Container Documentation

- [Register Service Provider](#register-service-provider)
- [Register Services in the Service Provider](#register-services-in-the-service-provider)
- [Add Services to the Container](#add-services-to-the-container)
- [Get Service from the Container](#get-service-from-the-container)
- [Override the Existing Service](#override-the-existing-service)
- [Check if a Service is Registered](#check-service-is-registered-or-not)

### Register Service Provider

1. **Step 1:** Create a service provider inside `includes/DependencyManagement/Providers` that extends `WeDevs\Dokan\DependencyManagement\BaseServiceProvider`.
2. **Step 2:** Register the service provider in the `boot` method of `includes/DependencyManagement/Providers/ServiceProvider.php`.

You can see the already registered service providers inside the `boot` method of the [ServiceProvider](./../includes/DependencyManagement/Providers/ServiceProvider.php#L46) class.

### Register Services in the Service Provider

1. **Step 1:** Register the services inside the `register` method of your service provider.
2. **Step 2:** Implement a `provides` method that returns `true` or `false` when the container invokes it with a service name.

```php
namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class SomeServiceProvider extends BaseServiceProvider
{
    /**
     * The provides method lets the container know
     * which services are provided by this provider.
     * The alias must be added to this array or it will
     * be ignored.
     */
    public function provides(string $id): bool
    {
        $services = [
            'key',
            Some\Controller::class,
            Some\Model::class,
            Some\Request::class,
        ];

        return in_array($id, $services);
    }

    /**
     * The register method defines services in the container.
     * Services must have an alias in the `provides` method
     * or they will be ignored.
     */
    public function register(): void
    {
        $this->getContainer()->add('key', 'value');

        $this->getContainer()
            ->add(Some\Controller::class)
            ->addArgument(Some\Request::class)
            ->addArgument(Some\Model::class);

        $this->getContainer()->add(Some\Request::class);
        $this->getContainer()->add(Some\Model::class);
    }
}
```

### Add Services to the Container

- Add a service:

```php
$this->getContainer()->add(ServiceClass::class);
```

- Add a shared service (one instance per request lifecycle):

```php
$this->getContainer()->addShared(ServiceClass::class);
```

- Add a service with constructor parameters:

```php
$this->getContainer()->addShared(ServiceClass::class, function () { 
    return new ServiceClass($params); 
});
```

- Add a shared service with constructor parameters and tag it:

```php
$this->getContainer()->addShared(ServiceClass::class, function () { 
    return new ServiceClass($params); 
})->addTag('tag_name');
```

- Add a service and tag all implemented interfaces:

```php
$this->getContainer()->share_with_implements_tags(ServiceClass::class);
```

### Get Service from the Container

- Get a single instance:

```php
$service = dokan()->get_container()->get(ServiceClass::class);
```

- Get an array of instances by tag:

```php
$service_list = dokan()->get_container()->get('tag-name');
```

### Override the Existing Service

```php
dokan()->get_container()->extend(ServiceClass::class)->setConcrete(new OtherServiceClass());
```

### Check if a Service is Registered

```php
$is_registered = dokan()->get_container()->has(ServiceClass::class);
```

For more details, visit the [League Container documentation](https://container.thephpleague.com/4.x/service-providers).