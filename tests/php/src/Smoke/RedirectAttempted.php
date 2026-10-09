<?php

namespace WeDevs\Dokan\Test\Smoke;

use RuntimeException;

/**
 * Thrown by the smoke walkers in place of a `wp_redirect()` so the probe returns
 * instead of the template calling `exit`.
 *
 * @since DOKAN_SINCE
 */
class RedirectAttempted extends RuntimeException {
}
