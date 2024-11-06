<?php

declare(strict_types=1);

namespace WeDevs\Dokan\ThirdParty\Packages\League\Container\Exception;

use WeDevs\Dokan\ThirdParty\Packages\Psr\Container\ContainerExceptionInterface;
use RuntimeException;

class ContainerException extends RuntimeException implements ContainerExceptionInterface
{
}
