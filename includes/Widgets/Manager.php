<?php

namespace WeDevs\Dokan\Widgets;

use WeDevs\Dokan\Traits\ChainableContainer;

class Manager {

    use ChainableContainer;

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        $dokan_widgets = apply_filters(
            'dokan_widgets', [
				'best_selling_products' => 'WeDevs\Dokan\Widgets\BestSellingProducts',
				'product_category_menu' => 'WeDevs\Dokan\Widgets\ProductCategoryMenu',
				'store_contact_form'    => 'WeDevs\Dokan\Widgets\StoreContactForm',
				'store_location'        => 'WeDevs\Dokan\Widgets\StoreLocation',
				'store_category_menu'   => 'WeDevs\Dokan\Widgets\StoreCategoryMenu',
				'toprated_products'     => 'WeDevs\Dokan\Widgets\TopratedProducts',
				'store_open_close'      => 'WeDevs\Dokan\Widgets\StoreOpenClose',
			]
        );

        foreach ( $dokan_widgets as $widget_id => $widget_class ) {
            register_widget( $widget_class );
        }

        $this->container = $dokan_widgets;
    }

    /**
     * Check if widget class exists
     *
     * @since 3.0.0
     *
     * @param string $widget_id
     *
     * @return bool
     */
    public function is_exists( $widget_id ) {
        return isset( $this->container[ $widget_id ] ) && class_exists( $this->container[ $widget_id ] );
    }

    /**
     * Get widget id from widget class
     *
     * @since 3.0.0
     *
     * @param string $widget_class
     *
     * @return bool|string Returns widget id if found, outherwise returns false
     */
    public function get_id( $widget_class ) {
        return array_search( $widget_class, $this->container );
    }
}
