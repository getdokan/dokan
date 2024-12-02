<?php

namespace WeDevs\Dokan\Commission\Strategies;

use WeDevs\Dokan\Commission\Model\Setting;
use WeDevs\Dokan\Commission\Settings\Builder;

class GlobalStrategy extends AbstractStrategy {

    /**
     * Global commission strategy source.
     *
     * @since 3.14.0
     */
    const SOURCE = 'global';

    /**
     * Catgory id for category commission.
     *
     * @since 3.14.0
     *
     * @var mixed
     */
    protected $category_id;

    /**
     * Class constructor.
     *
     * @since 3.14.0
     *
     * @param $category_id
     */
    public function __construct( $category_id ) {
        $this->category_id = $category_id;
    }

    /**
     * Returns category id.
     *
     * @since 3.14.0
     *
     * @return mixed
     */
    public function get_category_id() {
        return $this->category_id;
    }

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
     * Returns global commission settings.
     *
     * @since 3.14.0
     *
     * @return \WeDevs\Dokan\Commission\Model\Setting
     */
    public function get_settings(): Setting {
        $setting = Builder::build( Builder::TYPE_GLOBAL, $this->get_category_id() );

        return $setting->get();
    }
}
