<?php

/**
 * Support for Elementor Store Widgets
 *
 * @since 3.0.0
 *
 * @param array             $default_widget_args
 * @param \Widget_WordPress $widget_wordpress
 *
 * @return array
 */
function dokan_depricated_elementor_store_widgets( $default_widget_args, $widget_wordpress ) {
    if ( ! defined( 'DOKAN_PRO_PLUGIN_VERSION' ) ) {
        return;
    }

    if ( version_compare( DOKAN_PRO_PLUGIN_VERSION, '3.0.0', '>' ) ) {
        return;
    }

    $widget_class_name = get_class( $widget_wordpress->get_widget_instance() );

    if ( 0 === strpos( $widget_class_name, 'WeDevs\\Dokan\\Widgets\\') ) {
        $widget = $widget_wordpress->get_widget_instance();

        $id = str_replace( 'REPLACE_TO_ID', $widget_wordpress->get_id(), $widget->id );
        $default_widget_args['before_widget'] = sprintf( '<aside id="%1$s" class="widget dokan-store-widget %2$s">', $id, $widget->widget_options['classname'] );
        $default_widget_args['after_widget']  = '</aside>';
        $default_widget_args['before_title']  = '<h3 class="widget-title">';
        $default_widget_args['after_title']   = '</h3>';
    }

    return $default_widget_args;
}

add_action( 'elementor/widgets/wordpress/widget_args', 'dokan_depricated_elementor_store_widgets', 10, 2 );
