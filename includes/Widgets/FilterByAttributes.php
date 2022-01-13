<?php

namespace WeDevs\Dokan\Widgets;

use WP_Widget;

class FilterByAttributes extends WP_Widget {

    /**
     * Register widget with WordPress.
     */
    public function __construct() {
        parent::__construct(
            'dokan-filter-product', __( 'Dokan: Filter Products by Attribute Widget', 'dokan-lite' ), // Name
            array(
				'description' => __( 'A Widget for displaying products by attribute for dokan', 'dokan-lite' ),
				'classname' => 'woocommerce widget_products dokan-top-rated',
            ) // Args
        );
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
        extract( $args, EXTR_SKIP );

        $title         = isset( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';
        $no_of_product = isset( $instance['no_of_product'] ) ? $instance['no_of_product'] : 8;
        $show_rating   = isset( $instance['show_rating'] ) ? $instance['show_rating'] : false;

        $r = dokan_get_top_rated_products( $no_of_product );

        echo $args['before_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        if ( ! empty( $title ) ) {
            echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        }

        dokan_get_template_part(
            'widgets/widget-content-product', '', array(
				'r'           => $r,
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
        if ( isset( $instance['title'] ) ) {
            $title = esc_attr( $instance['title'] );
        } else {
            $title = __( 'Filter by', 'dokan-lite' );
        }
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
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
        $instance                  = array();
        $instance['title']         = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
        return $instance;
    }

}
