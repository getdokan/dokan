<?php

namespace WeDevs\Dokan\Widgets;

use WeDevs\Dokan\Vendor\Vendor;
use WP_Widget;

class FilterByAttributes extends WP_Widget {

    /**
     * Register widget with WordPress.
     */
    public function __construct() {
        parent::__construct(
            'dokan-filter-product', __( 'Dokan: Filter Products by Attribute Widget', 'dokan-lite' ),
            [
                'description' => __( 'A Widget for displaying products by attribute for dokan', 'dokan-lite' ),
                'classname'   => 'dokan-lite widget_products dokan-top-rated',
            ]
        );
    }

    /**
     * Front-end display of widget.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param array $args     Widget arguments.
     * @param array $instance Saved values from database.
     *
     * @see WP_Widget::widget()
     */
    public function widget( $args, $instance ) {
        if ( ! dokan_is_store_listing() && ! dokan_is_store_page() ) {
            return;
        }

        // load frontend script
        wp_enqueue_script( 'dokan-frontend' );

        $taxonomy     = $this->get_instance_taxonomy( $instance );
        $seller_id = empty( $seller_id ) ? get_query_var( 'author' ) : $seller_id;
        $vendor    = dokan()->vendor->get( $seller_id );

        if ( ! $vendor instanceof Vendor ) {
            return;
        }

        $terms = $vendor->get_vendor_used_terms_list( $seller_id, $taxonomy );
        if ( empty( $terms ) ) {
            return;
        }

        $title        = isset( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';
        $query_type   = isset( $instance['query_type'] ) ? apply_filters( 'widget_query_type', $instance['query_type'] ) : '';

        echo $args['before_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        if ( ! empty( $title ) ) {
            echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
        }

        $seller_id = empty( $seller_id ) ? get_query_var( 'author' ) : $seller_id;

        dokan_store_term_menu_list( $seller_id, $taxonomy, $query_type );

        echo $args['after_widget']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

        wp_reset_postdata();
    }

    /**
     * Back-end widget form.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param array $instance Previously saved values from database.
     *
     * @see WP_Widget::form()
     */
    public function form( $instance ) {
        if ( isset( $instance['title'] ) ) {
            $title = esc_attr( $instance['title'] );
        } else {
            $title = __( 'Filter by', 'dokan-lite' );
        }

        $attribute_array      = [];
        $std_attribute        = '';
        $attribute_taxonomies = wc_get_attribute_taxonomies();

        if ( ! empty( $attribute_taxonomies ) ) {
            foreach ( $attribute_taxonomies as $tax ) {
                if ( taxonomy_exists( wc_attribute_taxonomy_name( $tax->attribute_name ) ) ) {
                    $attribute_array[ $tax->attribute_name ] = $tax->attribute_name;
                }
            }
            $std_attribute = current( $attribute_array );
        }

        $attribute_value = isset( $instance['attribute'] ) ? $instance['attribute'] : $std_attribute;
        $query_type  = [
            'and' => __( 'AND', 'dokan-lite' ),
            'or'  => __( 'OR', 'dokan-lite' ),
        ];
        $query_value = isset( $instance['query_type'] ) ? $instance['query_type'] : '';

        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'attribute' ) ); ?>"><?php echo __( 'Attribute', 'dokan-lite' ); ?></label>
            <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'attribute' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'attribute' ) ); ?>">
                <?php foreach ( $attribute_array as $option_key => $option_value ) : ?>
                    <option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( $option_key, $attribute_value ); ?>><?php echo esc_html( $option_value ); ?></option>
                <?php endforeach; ?>
            </select>
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'query_type' ) ); ?>"><?php echo __( 'Query Type', 'dokan-lite' ); ?></label>
            <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'query_type' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'query_type' ) ); ?>">
                <?php foreach ( $query_type as $option_key => $option_value ) : ?>
                    <option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( $option_key, $query_value ); ?>><?php echo esc_html( $option_value ); ?></option>
                <?php endforeach; ?>
            </select>
        </p>
        <?php
    }

    /**
     * Sanitize widget form values as they are saved.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param array $new_instance Values just sent to be saved.
     * @param array $old_instance Previously saved values from database.
     *
     * @see WP_Widget::update()
     *
     * @see WP_Widget::update()
     *
     * @return array Updated safe values to be saved.
     */
    public function update( $new_instance, $old_instance ) {
        $instance               = [];
        $instance['title']      = ( ! empty( $new_instance['title'] ) ) ? wp_strip_all_tags( $new_instance['title'] ) : '';
        $instance['attribute']  = ( ! empty( $new_instance['attribute'] ) ) ? wp_strip_all_tags( $new_instance['attribute'] ) : '';
        $instance['query_type'] = ( ! empty( $new_instance['query_type'] ) ) ? wp_strip_all_tags( $new_instance['query_type'] ) : '';

        return $instance;
    }

    /**
     * Get this widget taxonomy.
     *
     * @since DOKAN_PRO_SINCE
     *
     * @param array $instance Array of instance options.
     *
     * @return string
     */
    protected function get_instance_taxonomy( $instance ) {
        if ( isset( $instance['attribute'] ) ) {
            return wc_attribute_taxonomy_name( $instance['attribute'] );
        }

        $attribute_taxonomies = wc_get_attribute_taxonomies();

        if ( ! empty( $attribute_taxonomies ) ) {
            foreach ( $attribute_taxonomies as $tax ) {
                if ( taxonomy_exists( wc_attribute_taxonomy_name( $tax->attribute_name ) ) ) {
                    return wc_attribute_taxonomy_name( $tax->attribute_name );
                }
            }
        }

        return '';
    }

}
