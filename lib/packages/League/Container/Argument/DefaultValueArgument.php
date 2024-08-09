<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container\Argument;

class DefaultValueArgument extends ResolvableArgument implements DefaultValueInterface
{
    protected $defaultValue;

    public function __construct(string $value, $defaultValue = null)
    {
        $this->defaultValue = $defaultValue;
        parent::__construct($value);
    }

    /**
     * @return mixed|null
     */
    public function getDefaultValue()
    {
        return $this->defaultValue;
    }
}
