<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Model\Setting;

abstract class AbstractStrategy {

    protected ?AbstractStrategy $next = null;
    protected ?Setting $settings;

    public function __construct() {
        $this->set_settings();
    }

    /**
     * Returns commission strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    abstract public function get_source(): string;

    /**
     * Returns commission settings.
     *
     * @since 3.14.0
     *
     * @return void
     */
    abstract public function set_settings();

    /**
     * Returns commission settings.
     *
     * @since 3.14.0
     *
     * @return Setting
     */
	public function get_settings(): ?Setting {
        $this->settings->set_source( $this->get_source() );

        if ( $this->settings->is_applicable() ) {
            return $this->settings;
        }
    
        return $this->get_next() ? $this->get_next()->get_settings() : null;
    }


    public function get_next(): ?AbstractStrategy {
        return $this->next;
    }

    public function set_next( AbstractStrategy $next ): AbstractStrategy {
        $this->next = $next;

        return $this;
    }
}
