<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container\Inflector;

use IteratorAggregate;
use WeDevs\Dokan\ThirdParty\Packages\League\Container\ContainerAwareInterface;

interface InflectorAggregateInterface extends ContainerAwareInterface, IteratorAggregate
{
    public function add(string $type, callable $callback = null): Inflector;
    public function inflect(object $object);
}
