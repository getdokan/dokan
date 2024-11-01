<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container;

use WeDevs\Dokan\ThirdParty\Packages\League\Container\Definition\DefinitionInterface;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\Inflector\InflectorInterface;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\ServiceProvider\ServiceProviderInterface;
use WeDevs\Dokan\ThirdParty\Packages\Psr\Container\ContainerInterface;

interface DefinitionContainerInterface extends ContainerInterface
{
    public function add(string $id, $concrete = null): DefinitionInterface;
    public function addServiceProvider(ServiceProviderInterface $provider): self;
    public function addShared(string $id, $concrete = null): DefinitionInterface;
    public function extend(string $id): DefinitionInterface;
    public function getNew($id);
    public function inflector(string $type, callable $callback = null): InflectorInterface;
}
