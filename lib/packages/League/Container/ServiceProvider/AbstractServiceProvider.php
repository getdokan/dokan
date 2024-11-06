<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container\ServiceProvider;

use WeDevs\Dokan\ThirdParty\Packages\League\Container\ContainerAwareTrait;

abstract class AbstractServiceProvider implements ServiceProviderInterface
{
    use ContainerAwareTrait;

    /**
     * @var string
     */
    protected $identifier;

    public function getIdentifier(): string
    {
        return $this->identifier ?? get_class($this);
    }

    public function setIdentifier(string $id): ServiceProviderInterface
    {
        $this->identifier = $id;
        return $this;
    }
}
