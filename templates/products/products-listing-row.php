<?php

/**
 * Template Name: Product listing row template
 *
 * @since 2.9.0
 *
 * @package Dokan
 *
 * @var WP_Post $post Product post object
 * @var WC_Product $product Product object
 * @var string $tr_class Table row class
 * @var string $row_actions Row actions HTML
 * @var string $product_type Product type
 * @var string $product_status Product status
 */


/**
 * Filter the product image attributes
 *
 * @since 3.11
 *
 * @param array $img_kses Image attributes
 */
$img_kses = apply_filters(
    'dokan_product_image_attributes',
    [
        'img' => [
            'alt'         => [],
            'class'       => [],
            'height'      => [],
            'src'         => [],
            'width'       => [],
            'srcset'      => [],
            'data-srcset' => [],
            'data-src'    => [],
        ],
    ]
);

/**
 * Filter the row actions
 *
 * @since 2.9.13
 *
 * @param array $row_actions Row actions HTML
 */
$row_actions_kses = apply_filters(
    'dokan_row_actions_kses',
    [
        'span' => [
            'class' => [],
        ],
        'a' => [
            'href'    => [],
            'onclick' => [],
        ],
    ]
);

/**
 * Filter the price HTML
 *
 * @since 2.9.13
 *
 * @param array $price_kses Price HTML
 */
$price_kses = apply_filters(
    'dokan_price_kses',
    [
        'span' => [
            'class' => [],
        ],
    ]
);
?>
<tr class="<?php echo esc_attr( $tr_class ); ?>">
    <th class="dokan-product-select check-column">
        <label for="cb-select-<?php echo esc_attr( $post->ID ); ?>"></label>
        <input class="cb-select-items dokan-checkbox" type="checkbox" data-product-name="<?php echo esc_attr( $product->get_title() ); ?>" name="bulk_products[]" value="<?php echo esc_attr( $post->ID ); ?>">
    </th>
    <td data-title="<?php esc_attr_e( 'Image', 'dokan-lite' ); ?>" class="column-thumb">
        <?php if ( current_user_can( 'dokan_edit_product' ) ) { ?>
            <a href="<?php echo esc_url( dokan_edit_product_url( $post->ID ) ); ?>"><?php echo wp_kses( $product->get_image( 'thumbnail' ), $img_kses ); ?></a>
        <?php } else { ?>
            <?php echo wp_kses( $product->get_image( 'thumbnail' ), $img_kses ); ?>
        <?php } ?>
        <?php
            /**
             * Fire an action to add extra content after product image column in product listing table
             *
             * @since 3.11.5
             *
             * @param \WC_Product $product Current product.
             */
            do_action( 'dokan_product_list_table_after_column_content_image', $product );
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Name', 'dokan-lite' ); ?>" class="column-primary">
        <?php if ( current_user_can( 'dokan_edit_product' ) ) { ?>
            <strong><a href="<?php echo esc_url( dokan_edit_product_url( $post->ID ) ); ?>"><?php echo esc_html( $product->get_title() ); ?></a></strong>
        <?php } else { ?>
            <strong><a href=""><?php echo esc_html( $product->get_title() ); ?></a></strong>
        <?php } ?>

        <?php
            /**
             * Fire an action to add extra content after product name column in product listing table
             *
             * @since 3.11.5
             *
             * @param \WC_Product $product Current product.
             */
            do_action( 'dokan_product_list_table_after_column_content_name', $product );
        ?>

        <?php if ( ! empty( $row_actions ) ) { ?>
            <div class="row-actions">
                <?php echo wp_kses( $row_actions, $row_actions_kses ); ?>
            </div>
        <?php } ?>

        <button type="button" class="toggle-row"></button>
        <?php
            /**
             * Fire an action to add extra content after product name column in product listing table
             *
             * @since 3.11.5
             *
             * @param \WC_Product $product Current product.
             */
            do_action( 'dokan_product_list_table_after_column_content_name_row_actions', $product );
        ?>
    </td>
    <td class="post-status" data-title="<?php esc_attr_e( 'Status', 'dokan-lite' ); ?>">
        <label class="dokan-label <?php echo esc_attr( dokan_get_post_status_label_class( $post->post_status ) ); ?>"><?php echo esc_html( dokan_get_post_status( $post->post_status ) ); ?></label>

        <?php
            /**
             * Fire an action to add extra content after product status column in product listing table
             *
             * @since 3.11.5
             *
             * @param \WC_Product $product Current product.
             *
             * @return void
             */
            do_action( 'dokan_product_list_table_after_column_content_status', $product );
        ?>
    </td>

    <?php
        /**
         * Fire an action to add extra content after product status column in product listing table
         *
         * @since 2.9.4
         *
         * @param \WP_Post $post Current post.
         * @param \WC_Product $product Current product.
         * @param string $tr_class Table row class.
         * @param string $row_actions Row actions HTML.
         */
        do_action( 'dokan_product_list_table_after_status_table_data', $post, $product, $tr_class, $row_actions );
    ?>

    <td data-title="<?php esc_attr_e( 'SKU', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_sku() ) {
            echo esc_html( $product->get_sku() );
        } else {
            echo '<span class="na">&ndash;</span>';
        }

        /**
         * Fire an action to add extra content after product sku column in product listing table
         *
         * @since 3.11.5
         *
         * @param \WC_Product $product Current product.
         */
        do_action( 'dokan_product_list_table_after_column_content_sku', $product );
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Stock', 'dokan-lite' ); ?>">
        <?php
        echo '<mark class="' . esc_attr( $product->get_stock_status() ) . '">' . esc_html( dokan_get_translated_product_stock_status( $product->get_stock_status() ) ) . '</mark>';

        if ( $product->managing_stock() ) {
            echo ' &times; ' . esc_html( $product->get_stock_quantity() );
        }

        /**
         * Fire an action to add extra content after product stock column in product listing table
         *
         * @since 3.11.5
         *
         * @param \WC_Product $product Current product.
         */
        do_action( 'dokan_product_list_table_after_column_content_stock', $product );
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Price', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_price_html() ) {
            echo wp_kses_post( $product->get_price_html() );
        } else {
            echo '<span class="na">&ndash;</span>';
        }

        /**
         * Fire an action to add extra content after product price column in product listing table
         *
         * @since 3.11.5
         *
         * @param \WC_Product $product Current product.
         */
        do_action( 'dokan_product_list_table_after_column_content_price', $product );
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Type', 'dokan-lite' ); ?>">
        <?php
        if ( dokan_get_prop( $product, 'product_type', 'get_type' ) === 'grouped' ) {
            echo '<span class="product-type tips grouped" title="' . esc_html__( 'Grouped', 'dokan-lite' ) . '"></span>';
        } elseif ( dokan_get_prop( $product, 'product_type', 'get_type' ) === 'external' ) {
            echo '<span class="product-type tips external" title="' . esc_html__( 'External/Affiliate', 'dokan-lite' ) . '"></span>';
        } elseif ( dokan_get_prop( $product, 'product_type', 'get_type' ) === 'simple' ) {
            if ( $product->is_virtual() ) {
                echo '<span class="product-type tips virtual" title="' . esc_html__( 'Virtual', 'dokan-lite' ) . '"></span>';
            } elseif ( $product->is_downloadable() ) {
                echo '<span class="product-type tips downloadable" title="' . esc_html__( 'Downloadable', 'dokan-lite' ) . '"></span>';
            } else {
                echo '<span class="product-type tips simple" title="' . esc_html__( 'Simple', 'dokan-lite' ) . '"></span>';
            }
        } elseif ( dokan_get_prop( $product, 'product_type', 'get_type' ) === 'variable' ) {
            echo '<span class="product-type tips variable" title="' . esc_html__( 'Variable', 'dokan-lite' ) . '"></span>';
        } else {
            // Assuming that we have other types in future
            echo '<span class="product-type tips ' . esc_attr( dokan_get_prop( $product, 'product_type', 'get_type' ) ) . '" title="' . esc_attr( ucfirst( dokan_get_prop( $product, 'product_type', 'get_type' ) ) ) . '"></span>';
        }

        /**
         * Fire an action to add extra content after product type column in product listing table
         *
         * @since 3.11.5
         *
         * @param \WC_Product $product Current product.
         *
         * @return void
         */
        do_action( 'dokan_product_list_table_after_column_content_type', $product );
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Views', 'dokan-lite' ); ?>">
        <?php
            echo (int) get_post_meta( $post->ID, 'pageview', true );

            /**
             * Fire an action to add extra content after product views column in product listing table
             *
             * @since 3.11.5
             *
             * @param \WC_Product $product Current product.
             */
            do_action( 'dokan_product_list_table_after_column_content_views', $product );
        ?>
    </td>
    <td class="post-date" data-title="<?php esc_attr_e( 'Date', 'dokan-lite' ); ?>">
        <?php

        if ( '0000-00-00 00:00:00' === $post->post_date ) {
            $post_published_date = __( 'Unpublished', 'dokan-lite' );
            $human_readable_time = __( 'Unpublished', 'dokan-lite' );
            $time_diff = 0;
        } else {
            // get current time
            $current_time = dokan_current_datetime();
            // set timezone to gmt
            $gmt_time = $current_time->setTimezone( new DateTimeZone( 'UTC' ) );
            // read post gmt time
            $post_time_gmt = $gmt_time->modify( $post->post_date_gmt );

            $format = apply_filters( 'dokan_date_time_format', wc_date_format() . ' ' . wc_time_format() );
            // currently dokan_format_date doesn't support time format, will update this soon,
            // right now we need to send $format from our end.
            // if you need date only remove $format from dokan_format_date function parameter
            $human_readable_time = dokan_format_date( $post_time_gmt->getTimestamp(), $format );
            $post_published_date = apply_filters( 'post_date_column_time', dokan_format_date( $post_time_gmt->getTimestamp() ), $post, 'date', 'all' );

            // get human readable time
            $time_diff = $current_time->getTimestamp() - $post_time_gmt->getTimestamp();
            if ( $time_diff > 0 && $time_diff < 24 * 60 * 60 ) {
                /* translators: %s: time difference */
                $human_readable_time = sprintf( __( '%s ago', 'dokan-lite' ), human_time_diff( $post_time_gmt->getTimestamp() ) );
            }
        }

        echo '<abbr title="' . esc_attr( $human_readable_time ) . '">' . esc_html( $post_published_date ) . '</abbr>';
        echo '<div class="status">';

        if ( 'publish' === $post->post_status ) {
            esc_html_e( 'Published', 'dokan-lite' );
        } elseif ( 'future' === $post->post_status ) {
            if ( $time_diff > 0 ) {
                echo '<strong class="attention">' . esc_html__( 'Missed schedule', 'dokan-lite' ) . '</strong>';
            } else {
                esc_html_e( 'Scheduled', 'dokan-lite' );
            }
        } else {
            esc_html_e( 'Last Modified', 'dokan-lite' );
        }

        /**
         * Fire an action to add extra content after product date column in product listing table
         *
         * @since 3.11.5
         *
         * @param \WC_Product $product Current product.
         */
        do_action( 'dokan_product_list_table_after_column_content_date', $product );
        ?>
        </div>
    </td>
</tr>
