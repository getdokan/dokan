<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Settings\DefaultSetting;

class DefaultStrategy extends AbstractStrategy {

    /**
     * Global commission strategy source.
     *
     * @since 3.14.0
     */
    const SOURCE = 'default';

    /**
     * Returns global strategy source.
     *
     * @since 3.14.0
     *
     * @return string
     */
    public function get_source(): string {
        return self::SOURCE;
    }

    /**
     * @inheritDoc
     */
    public function set_next(): AbstractStrategy {
        $this->next = null;

        return $this;
    }

    /**
     * Returns global commission settings.
     *
     * @since 3.14.0
     *
     * @return void
     */
    public function set_settings() {
        $default_setting = new DefaultSetting();
        $setting = $default_setting->get();

        $setting->set_type( DefaultSetting::TYPE )
            ->set_flat( 0 )
            ->set_percentage( 0 );

        $this->settings = $setting;
    }
}
