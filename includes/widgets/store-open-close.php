<?php

/**
 * Dokan Store Open Close Widget
 *
 * @since 2.7.3
 *
 * @package dokan
 */
class Dokan_Store_Open_Close extends WP_Widget {
    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        $widget_ops = array( 'classname' => 'dokan-store-open-close', 'description' => __( 'Dokan Store Open Close', 'dokan-lite' ) );
        parent::__construct( 'dokan-store-open-close-widget', __( 'Dokan: Store Open Close Widget', 'dokan-lite' ), $widget_ops );
    }

    /**
     * Outputs the HTML for this widget.
     *
     * @param array  An array of standard parameters for widgets in this theme
     * @param array  An array of settings for this widget instance
     *
     * @return void Echoes it's output
     **/
    function widget( $args, $instance ) {

        if ( dokan_is_store_page() ) {
            extract( $args, EXTR_SKIP );
            $title      = apply_filters( 'widget_title', $instance['title'] );
            $seller_id  = (int) get_query_var( 'author' );

            if ( empty( $seller_id ) ) {
                return;
            }

            $store_info = dokan_get_store_info( $seller_id );
            $dokan_store_time = isset ( $store_info['dokan_store_time'] ) ? $store_info['dokan_store_time'] : '';
            $dokan_store_time_enabled = isset( $store_info['dokan_store_time_enabled'] ) ? $store_info['dokan_store_time_enabled'] : '';

            if ( $dokan_store_time_enabled != 'yes' || empty( $dokan_store_time ) ) {
                return;
            }

            echo $before_widget;

            if ( ! empty( $title ) ) {
                echo $args['before_title'] . $title . $args['after_title'];
            }

            dokan_get_template_part( 'widgets/store-open-close', '', array(
                'seller_id' => $seller_id,
                'dokan_store_time' => $dokan_store_time,
            ) );

            echo $after_widget;
        }
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
    function update( $new_instance, $old_instance ) {

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
    function form( $instance ) {
        $instance = wp_parse_args( (array) $instance, array(
            'title' => __( 'Store Time', 'dokan-lite' ),
        ) );

        $title = $instance['title'];
        ?>
        <p>
            <label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
        </p>
        <?php
    }
}
