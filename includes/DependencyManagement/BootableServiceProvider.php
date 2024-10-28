<?php
/**
 * AbstractServiceProvider class file.
 */

namespace WeDevs\Dokan\DependencyManagement;

use WeDevs\Dokan\ThirdParty\Packages\League\Container\ServiceProvider\BootableServiceProviderInterface;

/**
 * Base class for the service providers used to register classes in the container or/and to register the other service providers.
 *
 * See the documentation of the original class this one is based on (https://container.thephpleague.com/4.x/service-providers)
 * for basic usage details. What this class adds is:
 * Note that `AbstractInterfaceServiceProvider` likely serves as a better base class for service providers
 * tasked with registering classes that implement interfaces.
 *
 * @since 3.13.0
 */
abstract class BootableServiceProvider extends BaseServiceProvider implements BootableServiceProviderInterface {
}
