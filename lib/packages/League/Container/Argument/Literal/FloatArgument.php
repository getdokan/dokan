<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container\Argument\Literal;

use WeDevs\Dokan\ThirdParty\Packages\League\Container\Argument\LiteralArgument;

class FloatArgument extends LiteralArgument
{
    public function __construct(float $value)
    {
        parent::__construct($value, LiteralArgument::TYPE_FLOAT);
    }
}
