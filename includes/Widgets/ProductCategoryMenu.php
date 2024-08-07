<?php

namespace WeDevs\Dokan\Widgets;

use WP_Widget;
use WeDevs\Dokan\Walkers\Category as CategoryWalker;

class ProductCategoryMenu extends WP_Widget {

    /**
     * Constructor
     *
     * @return void
     **/
    public function __construct() {
        $widget_ops = array(
			'classname' => 'dokan-category-menu',
			'description' => __( 'Dokan product category menu', 'dokan-lite' ),
		);
        parent::__construct( 'dokan-category-menu', 'Dokan: Product Category', $widget_ops );
    }

    /**
     * Outputs the HTML for this widget.
     *
     * @param array $args       An array of standard parameters for widgets in this theme
     * @param array $instance   An array of settings for this widget instance
     * @return void Echoes it's output
     **/
    public function widget( $args, $instance ) {
        // load frontend script
        wp_enqueue_script( 'dokan-frontend' );

        $title = isset( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';

        echo wp_kses_post( $args['before_widget'] );

        if ( ! empty( $title ) ) {
            echo wp_kses_post( $args['before_title'] . $title . $args['after_title'] );
        }
        ?>
            <div class="product-cat-stack-dokan cat-drop-stack">
                <?php
                $term_args = apply_filters(
                    'dokan_category_widget', array(
						'taxonomy' => 'product_cat',
						'hide_empty' => false,
						'orderby' => 'name',
						'depth' => 3,
                    )
                );

                $categories = get_terms( $term_args );

                $walker = new CategoryWalker();
                echo '<ul>';
                echo wp_kses_post( call_user_func_array( array( &$walker, 'walk' ), array( $categories, 0, array() ) ) );
                echo '</ul>';
                ?>
            </div>
        <?php

        echo wp_kses_post( ! empty( $args['after_widget'] ) ? $args['after_widget'] : '' );
    }

    /**
     * Deals with the settings when they are saved by the admin. Here is
     * where any validation should be dealt with.
     *
     * @param array $new_instance   An array of new settings as submitted by the admin
     * @param array $old_instance   An array of the previous settings
     * @return array The validated and (if necessary) amended settings
     **/
    public function update( $new_instance, $old_instance ) {
        // update logic goes here
        $updated_instance = $new_instance;
        return $updated_instance;
    }

    /**
     * Displays the form for this widget on the Widgets page of the WP Admin area.
     *
     * @param array $instance  array of the current settings for this widget
     * @return void Echoes it's output
     **/
    public function form( $instance ) {
        $instance = wp_parse_args(
            (array) $instance, array(
				'title' => __( 'Product Category', 'dokan-lite' ),
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
