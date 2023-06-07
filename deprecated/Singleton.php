<?php

namespace Dokan\Traits;

/**
 * Singleton Trait
 *
 * @since 1.0.0
 */
trait Singleton {

    /**
     * Singleton class instance holder
     *
     * @since 1.0.0
     *
     * @var object
     */
    protected static $instance;

    /**
     * Make a class instance
     *
     * @since 1.0.0
     *
     * @return object
     */
    public static function instance() {
        if ( ! isset( static::$instance ) && ! ( static::$instance instanceof static ) ) {
            static::$instance = new static();

            if ( method_exists( static::$instance, 'boot' ) ) {
                static::$instance->boot();
            }
        }

        return static::$instance;
    }
}
