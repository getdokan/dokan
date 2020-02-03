<?php

namespace WeDevs\Dokan\Widgets;

use WP_Widget;

/**
 * Dokan Store Location Widget
 *
 * @since 1.0
 *
 * @package dokan
 */
class StoreLocation extends WP_Widget {

    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        $widget_ops = array( 'classname' => 'dokan-store-location', 'description' => __( 'Dokan Vendor Store Location', 'dokan-lite' ) );
        parent::__construct( 'dokan-store-location', __( 'Dokan: Store Location', 'dokan-lite' ), $widget_ops );
    }

    /**
     * Outputs the HTML for this widget.
     *
     * @param array  An array of standard parameters for widgets in this theme
     * @param array  An array of settings for this widget instance
     *
     * @return void Echoes it's output
     */
    public function widget( $args, $instance ) {

        if ( dokan_is_store_page() ) {
            extract( $args, EXTR_SKIP );

            $defaults = array(
                'title' => __( 'Store Location', 'dokan-lite' ),
            );

            $instance = wp_parse_args( $instance, $defaults );

            $title        = apply_filters( 'widget_title', $instance['title'] );
            $store_info   = dokan_get_store_info( get_query_var( 'author' ) );
            $map_location = isset( $store_info['location'] ) ? esc_attr( $store_info['location'] ) : '';

            if ( empty( $map_location ) ) {
                return;
            }

            echo $before_widget; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

            if ( ! empty( $title ) ) {
                echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            }
            do_action('dokan-store-widget-before-map' , get_query_var( 'author' ));

            dokan_get_template_part( 'widgets/store-map', '', array(
                'store_info' => $store_info,
                'map_location' => $map_location,
            ) );

            do_action('dokan-store-widget-after-map', get_query_var( 'author' ));

            echo $after_widget; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        }

        do_action( 'dokan_widget_store_location_render', $args, $instance, $this );
    }

    /**
     * Deals with the settings when they are saved by the admin. Here is
     * where any validation should be dealt with.
     *
     * @param array  An array of new settings as submitted by the admin
     * @param array  An array of the previous settings
     *
     * @return array The validated and (if necessary) amended settings
     */
    public function update( $new_instance, $old_instance ) {

        // update logic goes here
        $updated_instance = $new_instance;
        return $updated_instance;
    }

    /**
     * Displays the form for this widget on the Widgets page of the WP Admin area.
     *
     * @param array  An array of the current settings for this widget
     *
     * @return void Echoes it's output
     */
    public function form( $instance ) {
        $instance = wp_parse_args( (array) $instance, array(
            'title' => __( 'Store Location', 'dokan-lite' ),
        ) );

        $title = $instance['title'];
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
        </p>
        <?php
    }
}
