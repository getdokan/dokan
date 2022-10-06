<?php

namespace WeDevs\Dokan\Widgets;

use WP_Widget;

/**
 * Dokan Store Open Close Widget
 *
 * @since 2.7.3
 *
 * @package dokan
 */
class StoreOpenClose extends WP_Widget {
    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        $widget_ops = array(
			'classname' => 'dokan-store-open-close',
			'description' => __( 'Dokan Store Opening Closing Time', 'dokan-lite' ),
		);
        parent::__construct( 'dokan-store-open-close-widget', __( 'Dokan: Store Opening Closing Time Widget', 'dokan-lite' ), $widget_ops );
    }

    /**
     * Outputs the HTML for this widget.
     *
     * @param array  An array of standard parameters for widgets in this theme
     * @param array  An array of settings for this widget instance
     *
     * @return void Echoes it's output
     **/
    public function widget( $args, $instance ) {
        if ( dokan_is_store_page() ) {
            $defaults = array(
                'title' => __( 'Store Time', 'dokan-lite' ),
            );

            $instance = wp_parse_args( $instance, $defaults );

            $title      = isset( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';
            $seller_id  = (int) get_query_var( 'author' );

            if ( empty( $seller_id ) ) {
                return;
            }

            $store_info               = dokan_get_store_info( $seller_id );
            $dokan_store_time         = isset( $store_info['dokan_store_time'] ) ? $store_info['dokan_store_time'] : [];
            $dokan_store_time_enabled = isset( $store_info['dokan_store_time_enabled'] ) ? $store_info['dokan_store_time_enabled'] : '';
            $show_store_open_close    = dokan_get_option( 'store_open_close', 'dokan_appearance', 'on' );

            if ( $show_store_open_close !== 'on' ) {
                return;
            }

            if ( $dokan_store_time_enabled !== 'yes' || empty( $dokan_store_time ) ) {
                return;
            }

            echo $args['before_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

            if ( ! empty( $title ) ) {
                echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            }

            dokan_get_template_part(
                'widgets/store-open-close', '', [
					'seller_id'        => $seller_id,
					'dokan_store_time' => $dokan_store_time,
                    'dokan_days'       => dokan_get_translated_days(),
                ]
            );

            echo $args['after_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        }

        do_action( 'dokan_widget_store_open_close_render', $args, $instance, $this );
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
        $instance = wp_parse_args(
            (array) $instance, array(
				'title' => __( 'Store Time', 'dokan-lite' ),
            )
        );

        $title = $instance['title'];
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
        </p>
        <?php
    }
}
