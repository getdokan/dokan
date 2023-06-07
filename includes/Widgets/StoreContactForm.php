<?php

namespace WeDevs\Dokan\Widgets;

use WP_Widget;

/**
 * Dokan Store Contact Seller Widget
 *
 * @since 1.0
 *
 * @package dokan
 */
class StoreContactForm extends WP_Widget {

    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        $widget_ops = array(
			'classname' => 'dokan-store-contact',
			'description' => __( 'Dokan Vendor Contact Form', 'dokan-lite' ),
		);
        parent::__construct( 'dokan-store-contact-widget', __( 'Dokan: Store Contact Form', 'dokan-lite' ), $widget_ops );
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
        if ( dokan_is_store_page() || is_product() ) {
            $defaults = array(
                'title' => __( 'Contact Vendor', 'dokan-lite' ),
            );

            $instance = wp_parse_args( $instance, $defaults );

            $title = isset( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';

            if ( is_product() ) {
                global $post;
                $seller_id = get_post_field( 'post_author', $post->ID );
            }

            if ( dokan_is_store_page() ) {
                $seller_id = (int) get_query_var( 'author' );
            }

            if ( empty( $seller_id ) ) {
                return;
            }

            $store_info = dokan_get_store_info( $seller_id );

            echo $args['before_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

            if ( ! empty( $title ) ) {
                echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
            }

            $username = '';
            $email    = '';

            if ( is_user_logged_in() ) {
                $user     = wp_get_current_user();
                $username = $user->display_name;
                $email    = $user->user_email;
            }

            dokan_get_template_part(
                'widgets/store-contact-form', '', array(
					'seller_id'  => $seller_id,
					'store_info' => $store_info,
					'username'   => $username,
					'email'      => $email,
                )
            );

            echo $args['after_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        }

        do_action( 'dokan_widget_store_contact_form_render', $args, $instance, $this );
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
				'title' => __( 'Contact Vendor', 'dokan-lite' ),
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
