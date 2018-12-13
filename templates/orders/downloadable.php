<?php
global $wpdb;
?>
<div class="order_download_permissions wc-metaboxes-wrapper">

    <div class="panel-group" id="accordion">
        <?php
            $download_permissions = $wpdb->get_results( $wpdb->prepare( "
                SELECT * FROM {$wpdb->prefix}woocommerce_downloadable_product_permissions
                WHERE order_id = %d ORDER BY product_id
            ", dokan_get_prop( $order, 'id' ) ) );

            $product = null;
            $loop    = 0;

            if ( $download_permissions && sizeof( $download_permissions ) > 0 ) foreach ( $download_permissions as $download ) {

                if ( ! $product || dokan_get_prop( $product, 'id' ) != $download->product_id ) {
                    $product = wc_get_product( absint( $download->product_id ) );
                    $file_count = 0;
                }

                // don't show permissions to files that have since been removed
                if ( ! $product || ! $product->exists() || ! $product->has_file( $download->download_id ) )
                    continue;

                include( 'order-download-permission-html.php' );

                $loop++;
                $file_count++;
            }
        ?>
    </div>

    <div class="toolbar dokan-clearfix">

        <div class="dokan-w7" style="margin-right: 5px;">
            <select name="grant_access_id" class="grant_access_id dokan-select2 dokan-form-control" data-placeholder="<?php esc_attr_e( 'Choose a downloadable product&hellip;', 'dokan-lite' ) ?>" multiple="multiple">
                <?php
                    echo '<option value=""></option>';
                    global $wpdb;
                    $user_id = dokan_get_current_user_id();

                    $products = $wpdb->get_results( $wpdb->prepare( "SELECT $wpdb->posts.* FROM $wpdb->posts
                        INNER JOIN $wpdb->postmeta
                            ON ( $wpdb->posts.ID = $wpdb->postmeta.post_id )
                        WHERE $wpdb->posts.post_author=%d
                            AND ( $wpdb->postmeta.meta_key = '_downloadable' AND $wpdb->postmeta.meta_value = 'yes' )
                            AND $wpdb->posts.post_type IN ( 'product', 'product_variation' )
                            AND $wpdb->posts.post_status = 'publish'
                        GROUP BY $wpdb->posts.ID
                        ORDER BY $wpdb->posts.post_parent ASC, $wpdb->posts.post_title ASC", $user_id
                    ) );

                    if ( $products ) foreach ( $products as $product ) {

                        $product_object = wc_get_product( $product->ID );
                        $product_name   = $product_object->get_formatted_name();

                        echo '<option value="' . esc_attr( $product->ID ) . '">' . esc_html( $product_name ) . '</option>';
                    }
                ?>
            </select>
        </div>

        <div class="dokan-w4">
            <button type="button" class="dokan-btn dokan-btn-success grant_access" data-order-id="<?php esc_attr_e( dokan_get_prop( $order, 'id' ) ); ?>" data-nonce="<?php esc_attr_e( wp_create_nonce( 'grant-access' ) ); ?>"><?php esc_html_e( 'Grant Access', 'dokan-lite' ); ?></button>
        </div>

    </div> <!-- .toolbar -->
</div> <!-- .order_download_permissions -->
