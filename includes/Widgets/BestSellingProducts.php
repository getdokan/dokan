<?php

namespace WeDevs\Dokan\Widgets;

use WP_Widget;

class BestSellingProducts extends WP_Widget {

    /**
     * Constructor
     *
     * @return void
     **/
    public function __construct() {
        $widget_ops = array(
			'classname' => 'woocommerce widget_products dokan-best-selling',
			'description' => 'A Widget for displaying Best Selling Products for dokan',
		);
        parent::__construct( 'dokan-best-selling-widget', 'Dokan: Best Selling Widget', $widget_ops );
    }

    /**
     * Front-end display of widget.
     *
     * @see WP_Widget::widget()
     *
     * @param array $args     Widget arguments.
     * @param array $instance Saved values from database.
     */
    public function widget( $args, $instance ) {
        $title           = isset( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';
        $no_of_product   = isset( $instance['no_of_product'] ) ? $instance['no_of_product'] : 8;
        $show_rating     = isset( $instance['show_rating'] ) ? $instance['show_rating'] : false;
        $hide_outofstock = isset( $instance['hide_outofstock'] ) ? $instance['hide_outofstock'] : false;
        $paged           = 1;
        $vendor_id       = false;

        $r = dokan_get_best_selling_products( $no_of_product, $vendor_id, $paged, $hide_outofstock );

        echo $args['before_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        if ( ! empty( $title ) ) {
            echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        }

        dokan_get_template_part(
            'widgets/widget-content-product', '', array(
				'r' => $r,
				'show_rating' => $show_rating,
            )
        );

        echo $args['after_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

        wp_reset_postdata();
    }

    /**
     * Back-end widget form.
     *
     * @see WP_Widget::form()
     *
     * @param array $instance Previously saved values from database.
     */
    public function form( $instance ) {
        $title           = isset( $instance['title'] ) ? sanitize_text_field( $instance['title'] ) : __( 'Best Selling Product', 'dokan-lite' );
        $no_of_product   = isset( $instance['no_of_product'] ) ? intval( $instance['no_of_product'] ) : 8;
        $no_of_product   = -1 === $no_of_product ? '' : $no_of_product;
        $show_rating     = isset( $instance['show_rating'] ) ? sanitize_text_field( $instance['show_rating'] ) : false;
        $hide_outofstock = isset( $instance['hide_outofstock'] ) ? sanitize_text_field( $instance['hide_outofstock'] ) : false;
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'no_of_product' ) ); ?>"><?php esc_html_e( 'No of Product:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'no_of_product' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'no_of_product' ) ); ?>" type="text" value="<?php echo esc_attr( $no_of_product ); ?>">
        </p>
        <p>
            <input id="<?php echo esc_attr( $this->get_field_id( 'show_rating' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'show_rating' ) ); ?>" type="checkbox" value="1" <?php checked( '1', $show_rating ); ?> />
            <label for="<?php echo esc_attr( $this->get_field_id( 'show_rating' ) ); ?>"><?php esc_html_e( 'Show Product Rating', 'dokan-lite' ); ?></label>
        </p>
        <p>
            <input id="<?php echo esc_attr( $this->get_field_id( 'hide_outofstock' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'hide_outofstock' ) ); ?>" type="checkbox" value="1" <?php checked( '1', $hide_outofstock ); ?> />
            <label for="<?php echo esc_attr( $this->get_field_id( 'hide_outofstock' ) ); ?>"><?php esc_html_e( 'Hide Out of Stock', 'dokan-lite' ); ?></label>
        </p>
        <?php
    }

    /**
     * Sanitize widget form values as they are saved.
     *
     * @see WP_Widget::update()
     *
     * @param array $new_instance Values just sent to be saved.
     * @param array $old_instance Previously saved values from database.
     *
     * @return array Updated safe values to be saved.
     */
    public function update( $new_instance, $old_instance ) {
        $instance                    = [];
        $instance['title']           = ( ! empty( $new_instance['title'] ) ) ? sanitize_text_field( $new_instance['title'] ) : '';
        $instance['no_of_product']   = ( ! empty( $new_instance['no_of_product'] ) && is_numeric( $new_instance['no_of_product'] ) && $new_instance['no_of_product'] > 0 ) ? intval( $new_instance['no_of_product'] ) : 8;
        $instance['show_rating']     = ( ! empty( $new_instance['show_rating'] ) ) ? sanitize_text_field( $new_instance['show_rating'] ) : '';
        $instance['hide_outofstock'] = ( ! empty( $new_instance['hide_outofstock'] ) ) ? sanitize_text_field( $new_instance['hide_outofstock'] ) : '';

        return $instance;
    }
}
