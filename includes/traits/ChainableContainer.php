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
     * Magic getter to get chainable container instance
     *
     * @since DOKAN_LITE_SINCE
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
