<?php

namespace WeDevs\Dokan\Test\Helpers;

use Exception;

/**
 * Carries the setup wizard's redirect target out of a save handler before its
 * `exit` runs — a `wp_redirect` filter throws this so tests survive the call.
 */
class SetupWizardRedirectInterrupt extends Exception {
}
