<?php
/**
 * Test fixture: a global-namespace class whose wake-up magic method flips a static flag.
 *
 * Lives in the global namespace (no backslashes in its serialized class name, which
 * WordPress's update_metadata() would otherwise strip) and in its own file so it is not
 * PSR-4 autoloaded; the test require_once's it.
 *
 * @package WeDevs\Dokan\Test
 */

/**
 * Flips a static flag from its wake-up magic method so a test can detect unserialization.
 */
class Dokan_Object_Injection_Probe {

    /**
     * Set to true if an instance is ever woken from serialized data.
     *
     * @var bool
     */
    public static $woke = false;

    /**
     * Records that an instance was unserialized.
     */
    public function __wakeup() {
        self::$woke = true;
    }
}
