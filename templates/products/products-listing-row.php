<tr<?php echo $tr_class; ?>>
    <td class="dokan-product-select">
        <label for="cb-select-<?php echo esc_attr( $post->ID ); ?>"></label>
        <input class="cb-select-items dokan-checkbox" type="checkbox" name="bulk_products[]" value="<?php echo esc_attr( $post->ID ); ?>">
    </td>
    <td data-title="<?php _e( 'Image', 'dokan-lite' ); ?>">
        <?php if ( current_user_can( 'dokan_edit_product' ) ): ?>
            <a href="<?php echo dokan_edit_product_url( $post->ID ); ?>"><?php echo $product->get_image(); ?></a>
        <?php else: ?>
            <?php echo $product->get_image(); ?>
        <?php endif ?>
    </td>
    <td data-title="<?php _e( 'Name', 'dokan-lite' ); ?>">
        <?php if ( current_user_can( 'dokan_edit_product' ) ): ?>
            <p><a href="<?php echo dokan_edit_product_url( $post->ID ); ?>"><?php echo $product->get_title(); ?></a></p>
        <?php else: ?>
            <p><a href=""><?php echo $product->get_title(); ?></a></p>
        <?php endif ?>

        <?php if ( !empty( $row_actions ) ): ?>
            <div class="row-actions">
                <?php echo $row_actions; ?>
            </div>
        <?php endif ?>
    </td>
    <td class="post-status" data-title="<?php _e( 'Status', 'dokan-lite' ); ?>">
        <label class="dokan-label <?php echo dokan_get_post_status_label_class( $post->post_status ); ?>"><?php echo dokan_get_post_status( $post->post_status ); ?></label>
    </td>
    <td data-title="<?php _e( 'SKU', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_sku() ) {
            echo $product->get_sku();
        } else {
            echo '<span class="na">&ndash;</span>';
        }
        ?>
    </td>
    <td data-title="<?php _e( 'Stock', 'dokan-lite' ); ?>">
        <?php
        if ( $product->is_in_stock() ) {
            echo '<mark class="instock">' . __( 'In stock', 'dokan-lite' ) . '</mark>';
        } else {
            echo '<mark class="outofstock">' . __( 'Out of stock', 'dokan-lite' ) . '</mark>';
        }

        if ( $product->managing_stock() ) :
            echo ' &times; ' . $product->get_stock_quantity();
        endif;
        ?>
    </td>
    <td data-title="<?php _e( 'Price', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_price_html() ) {
            echo $product->get_price_html();
        } else {
            echo '<span class="na">&ndash;</span>';
        }
        ?>
    </td>
    <td data-title="<?php _e( 'Earning', 'dokan-lite' ); ?>">
        <?php
        if ( $product->get_type() == 'simple' ) {
            echo wc_price( dokan_get_earning_by_product( $product->get_id(), get_current_user_id() ) );
        } else {
            echo dokan_get_variable_product_earning( $product->get_id(), get_current_user_id() );
        }
        ?>
    </td>
    <td data-title="<?php _e( 'Type', 'dokan-lite' ); ?>">
        <?php
        if( dokan_get_prop( $product, 'product_type' , 'get_type') == 'grouped' ):
            echo '<span class="product-type tips grouped" title="' . __( 'Grouped', 'dokan-lite' ) . '"></span>';
        elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'external' ):
            echo '<span class="product-type tips external" title="' . __( 'External/Affiliate', 'dokan-lite' ) . '"></span>';
        elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'simple' ):

            if ( $product->is_virtual() ) {
                echo '<span class="product-type tips virtual" title="' . __( 'Virtual', 'dokan-lite' ) . '"></span>';
            } elseif ( $product->is_downloadable() ) {
                echo '<span class="product-type tips downloadable" title="' . __( 'Downloadable', 'dokan-lite' ) . '"></span>';
            } else {
                echo '<span class="product-type tips simple" title="' . __( 'Simple', 'dokan-lite' ) . '"></span>';
            }

            elseif ( dokan_get_prop( $product, 'product_type' , 'get_type') == 'variable' ):
                echo '<span class="product-type tips variable" title="' . __( 'Variable', 'dokan-lite' ) . '"></span>';
            else:
                // Assuming that we have other types in future
                echo '<span class="product-type tips ' . dokan_get_prop( $product, 'product_type' , 'get_type') . '" title="' . ucfirst( dokan_get_prop( $product, 'product_type' , 'get_type') ) . '"></span>';
        endif;
        ?>
    </td>
    <td data-title="<?php _e( 'Views', 'dokan-lite' ); ?>">
        <?php echo (int) get_post_meta( $post->ID, 'pageview', true ); ?>
    </td>
    <td class="post-date" data-title="<?php _e( 'Date', 'dokan-lite' ); ?>">
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

        echo '<abbr title="' . dokan_date_time_format( $t_time ) . '">' . apply_filters( 'post_date_column_time', dokan_date_time_format( $h_time, true ), $post, 'date', 'all' ) . '</abbr>';
        echo '<div class="status">';
        if ( 'publish' == $post->post_status ) {
            _e( 'Published', 'dokan-lite' );
        } elseif ( 'future' == $post->post_status ) {
            if ( $time_diff > 0 ) {
                echo '<strong class="attention">' . __( 'Missed schedule', 'dokan-lite' ) . '</strong>';
            } else {
                _e( 'Scheduled', 'dokan-lite' );
            }
        } else {
            _e( 'Last Modified', 'dokan-lite' );
        }
        ?>
        </div>
    </td>
    <td class="diviader"></td>
</tr>
