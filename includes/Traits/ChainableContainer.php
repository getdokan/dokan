<?php

namespace WeDevs\Dokan\Traits;

trait ChainableContainer {

    /**
     * Contains chainable class instances
     *
     * @var array
     */
    protected $container = [];

    /**
     * Cloning is forbidden.
     *
     * @since 3.7.21
     */
    public function __clone() {
        $message = ' Backtrace: ' . wp_debug_backtrace_summary();
        _doing_it_wrong( __METHOD__, $message . esc_html__( 'Cloning is forbidden.', 'dokan-lite' ), DOKAN_PLUGIN_VERSION );
    }

    /**
     * Unserializing instances of this class is forbidden.
     *
     * @since 3.7.21
     */
    public function __wakeup() {
        $message = ' Backtrace: ' . wp_debug_backtrace_summary();
        _doing_it_wrong( __METHOD__, $message . esc_html__( 'Unserializing instances of this class is forbidden.', 'dokan-lite' ), DOKAN_PLUGIN_VERSION );
    }

    /**
     * Magic getter to get chainable container instance
     *
     * @since 3.0.0
     *
     * @param string $prop
     *
     * @return mixed
     */
    public function __get( $prop ) {
        if ( array_key_exists( $prop, $this->container ) ) {
            return $this->container[ $prop ];
        }
    }
}
