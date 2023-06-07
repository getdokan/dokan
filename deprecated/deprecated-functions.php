<?php

/**
 * Wrapper for wc_doing_it_wrong.
 *
 * @since 3.0.0
 *
 * @param string $function Function used.
 * @param string $message Message to log.
 * @param string $version Version the message was added in.
 *
 * @return void
 */
function dokan_doing_it_wrong( $function, $message, $version ) {
    $message .= ' Backtrace: ' . wp_debug_backtrace_summary();

    if ( wp_doing_ajax() || WC()->is_rest_api_request() ) {
        do_action( 'doing_it_wrong_run', $function, $message, $version );
        error_log( "{$function} was called incorrectly. {$message}. This message was added in version {$version}." );
    } else {
        _doing_it_wrong( $function, $message, $version );
    }
}

/**
 * Dokan get product status
 *
 * @since 2.5
 *
 * @deprecated 2.5.1
 *
 * @return string|array
 **/
function dokan_get_product_status( $status ) {
    _deprecated_function( 'dokan_get_product_status', '2.5', 'dokan_get_product_types' );
    return dokan_get_product_types( $status );
}

/**
 * Load depericated widget class dynamically
 *
 * @since 3.0.0
 *
 * @return void
 */
function dokan_depricated_widget_classes() {
    global $wp_widget_factory;

    $widget_classes = [
        'Dokan_Best_Selling_Widget' => \WeDevs\Dokan\Widgets\BestSellingProducts::class,
        'Dokan_Store_Contact_Form'  => \WeDevs\Dokan\Widgets\StoreContactForm::class,
        'Dokan_Store_Location'      => \WeDevs\Dokan\Widgets\StoreLocation::class,
        'Dokan_Store_Category_Menu' => \WeDevs\Dokan\Widgets\StoreCategoryMenu::class,
        'Dokan_Store_Open_Close'    => \WeDevs\Dokan\Widgets\StoreOpenClose::class,
        'Dokan_Toprated_Widget'     => \WeDevs\Dokan\Widgets\TopratedProducts::class,
    ];

    foreach ( $widget_classes as $deprecated_class => $new_class ) {
        $wp_widget_factory->widgets[ $deprecated_class ] = $wp_widget_factory->widgets[ $new_class ];
    }
}

add_action( 'woocommerce_before_main_content', 'dokan_depricated_widget_classes' );

/**
 * Depricated function for render seller metabox in product
 *
 * @param object $post
 *
 * @return void|html
 */
function dokan_seller_meta_box( $post ) {
    \WeDevs\Dokan\Admin\Hooks::seller_meta_box_content( $post );
}
