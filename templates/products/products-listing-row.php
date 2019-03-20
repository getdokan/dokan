<?php
    $img_kses = apply_filters( 'dokan_product_image_attributes', array(
        'img' => array(
            'alt'    => array(),
            'class'  => array(),
            'height' => array(),
            'src'    => array(),
            'width'  => array(),
        ),
    ) );

    $row_actions_kses = apply_filters( 'dokan_row_actions_kses', array(
        'span' => array(
            'class' => array(),
        ),
        'a' => array(
            'href'    => array(),
            'onclick' => array(),
        ),
    ) );

    $price_kses = apply_filters( 'dokan_price_kses', array(
        'span' => array(
            'class' => array()
        ),
    ) );
?>
<tr class="<?php echo esc_attr( $tr_class ); ?>">
    <td class="dokan-product-select">
        <label for="cb-select-<?php echo esc_attr( $post->ID ); ?>"></label>
        <input class="cb-select-items dokan-checkbox" type="checkbox" name="bulk_products[]" value="<?php echo esc_attr( $post->ID ); ?>">
    </td>
    <td data-title="<?php esc_attr_e( 'Image', 'dokan-lite' ); ?>">
        <?php if ( current_user_can( 'dokan_edit_product' ) ): ?>
            <a href="<?php echo esc_url( dokan_edit_product_url( $post->ID ) ); ?>"><?php echo wp_kses( $product->get_image(), $img_kses ); ?></a>
        <?php else: ?>
            <?php echo wp_kses( $product->get_image(), $img_kses ); ?>
        <?php endif ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Name', 'dokan-lite' ); ?>">
        <?php if ( current_user_can( 'dokan_edit_product' ) ): ?>
            <p><a href="<?php echo esc_url( dokan_edit_product_url( $post->ID ) ); ?>"><?php echo esc_html( $product->get_title() ); ?></a></p>
        <?php else: ?>
            <p><a href=""><?php echo esc_html( $product->get_title() ); ?></a></p>
        <?php endif ?>

        <?php if ( !empty( $row_actions ) ): ?>
            <div class="row-actions">
                <?php echo wp_kses( $row_actions, $row_actions_kses ); ?>
            </div>
        <?php endif ?>
    </td>
    <td class="post-status" data-title="<?php esc_attr_e( 'Status', 'dokan-lite' ); ?>">
        <label class="dokan-label <?php echo esc_attr( dokan_get_post_status_label_class( $post->post_status ) ); ?>"><?php echo esc_html( dokan_get_post_status( $post->post_status ) ); ?></label>
    </td>

    <?php do_action( 'dokan_product_list_table_after_status_table_data', $post, $product, $tr_class, $row_actions ); ?>

    <td data-title="<?php esc_attr_e( 'SKU', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_sku() ) {
            echo esc_html( $product->get_sku() );
        } else {
            echo '<span class="na">&ndash;</span>';
        }
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Stock', 'dokan-lite' ); ?>">
        <?php
        if ( $product->is_in_stock() ) {
            echo '<mark class="instock">' . esc_html__( 'In stock', 'dokan-lite' ) . '</mark>';
        } else {
            echo '<mark class="outofstock">' . esc_html__( 'Out of stock', 'dokan-lite' ) . '</mark>';
        }

        if ( $product->managing_stock() ) :
            echo ' &times; ' . esc_html( $product->get_stock_quantity() );
        endif;
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Price', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_price_html() ) {
            echo wp_kses( $product->get_price_html(), $price_kses );
        } else {
            echo '<span class="na">&ndash;</span>';
        }
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Earning', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_type() == 'simple' ) {
            $price = wc_price( dokan_get_earning_by_product( $product->get_id(), get_current_user_id() ) );
            echo wp_kses( $price, $price_kses );
        } else {
            $price = dokan_get_variable_product_earning( $product->get_id(), get_current_user_id() );
            echo wp_kses( $price, $price_kses );
        }
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Type', 'dokan-lite' ); ?>">
        <?php
        if( dokan_get_prop( $product, 'product_type' , 'get_type') == 'grouped' ):
            echo '<span class="product-type tips grouped" title="' . esc_html__( 'Grouped', 'dokan-lite' ) . '"></span>';
        elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'external' ):
            echo '<span class="product-type tips external" title="' . esc_html__( 'External/Affiliate', 'dokan-lite' ) . '"></span>';
        elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'simple' ):

            if ( $product->is_virtual() ) {
                echo '<span class="product-type tips virtual" title="' . esc_html__( 'Virtual', 'dokan-lite' ) . '"></span>';
            } elseif ( $product->is_downloadable() ) {
                echo '<span class="product-type tips downloadable" title="' . esc_html__( 'Downloadable', 'dokan-lite' ) . '"></span>';
            } else {
                echo '<span class="product-type tips simple" title="' . esc_html__( 'Simple', 'dokan-lite' ) . '"></span>';
            }

            elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'variable' ):
                echo '<span class="product-type tips variable" title="' . esc_html__( 'Variable', 'dokan-lite' ) . '"></span>';
            else:
                // Assuming that we have other types in future
                echo '<span class="product-type tips ' . esc_attr( dokan_get_prop( $product, 'product_type' , 'get_type') ) . '" title="' . esc_attr( ucfirst( dokan_get_prop( $product, 'product_type' , 'get_type') ) ) . '"></span>';
        endif;
        ?>
    </td>
    <td data-title="<?php esc_attr_e( 'Views', 'dokan-lite' ); ?>">
        <?php echo (int) get_post_meta( $post->ID, 'pageview', true ); ?>
    </td>
    <td class="post-date" data-title="<?php esc_attr_e( 'Date', 'dokan-lite' ); ?>">
        <?php
        if ( '0000-00-00 00:00:00' == $post->post_date ) {
            $t_time = $h_time = __( 'Unpublished', 'dokan-lite' );
            $time_diff = 0;
        } else {
            $t_time = get_the_time( __( 'Y/m/d g:i:s A', 'dokan-lite' ) );
            $m_time = $post->post_date;
            $time = get_post_time( 'G', true, $post );

            $time_diff = time() - $time;

            if ( $time_diff > 0 && $time_diff < 24 * 60 * 60 ) {
                $h_time = sprintf( __( '%s ago', 'dokan-lite' ), human_time_diff( $time ) );
            } else {
                $h_time = mysql2date( __( 'Y/m/d', 'dokan-lite' ), $m_time );
            }
        }

        $post_date_column_time = apply_filters( 'post_date_column_time', dokan_date_time_format( $h_time, true ), $post, 'date', 'all' );

        echo '<abbr title="' . esc_attr( dokan_date_time_format( $t_time ) ) . '">' . esc_html( $post_date_column_time ) . '</abbr>';
        echo '<div class="status">';
        if ( 'publish' == $post->post_status ) {
            esc_html_e( 'Published', 'dokan-lite' );
        } elseif ( 'future' == $post->post_status ) {
            if ( $time_diff > 0 ) {
                echo '<strong class="attention">' . esc_html__( 'Missed schedule', 'dokan-lite' ) . '</strong>';
            } else {
                esc_html_e( 'Scheduled', 'dokan-lite' );
            }
        } else {
            esc_html_e( 'Last Modified', 'dokan-lite' );
        }
        ?>
        </div>
    </td>
    <td class="diviader"></td>
</tr>
