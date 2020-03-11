<?php

namespace WeDevs\Dokan\Abstracts;

abstract class DokanShortcode {

    protected $shortcode = '';

    public function __construct() {
        if ( empty( $this->shortcode ) ) {
            dokan_doing_it_wrong( static::class, __( '$shortcode property is empty.', 'dokan-lite' ), '3.0.0' );
        }

        add_shortcode( $this->shortcode, [ $this, 'render_shortcode' ] );
    }

    public function get_shortcode() {
        return $this->shortcode;
    }

    abstract public function render_shortcode( $atts );
}
