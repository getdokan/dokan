<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container\Argument\Literal;

use WeDevs\Dokan\ThirdParty\Packages\League\Container\Argument\LiteralArgument;

class ArrayArgument extends LiteralArgument
{
    public function __construct(array $value)
    {
        parent::__construct($value, LiteralArgument::TYPE_ARRAY);
    }
}
