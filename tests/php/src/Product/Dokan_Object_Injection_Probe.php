<?php
/**
 * Test fixture: a global-namespace class (no backslashes for update_metadata() to strip) whose __wakeup() flips a static flag.
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
