<?php
global $wpdb;
?>
<div class="order_download_permissions wc-metaboxes-wrapper">

    <div class="panel-group" id="accordion">
        <?php
        $data_store           = WC_Data_Store::load( 'customer-download' );
        $download_permissions = array();
        if ( 0 !== $order->get_id() ) {
            $download_permissions = $data_store->get_downloads(
                array(
                    'order_id' => $order->get_id(),
                    'orderby'  => 'product_id',
                )
            );
        }

        $product      = null;
        $loop         = 0;
        $file_counter = 1;

        if ( $download_permissions && count( $download_permissions ) > 0 ) {
            foreach ( $download_permissions as $download ) {
                if ( ! $product || $product->get_id() !== $download->get_product_id() ) {
                    $product      = wc_get_product( $download->get_product_id() );
                    $file_counter = 1;
                }

                // don't show permissions to files that have since been removed.
                if ( ! $product || ! $product->exists() || ! $product->has_file( $download->get_download_id() ) ) {
                    continue;
                }

                // Show file title instead of count if set.
                $file = $product->get_file( $download->get_download_id() );
                // translators: file name.
                $file_count = number_format_i18n( $file_counter );

                include 'order-download-permission-html.php';

                ++$loop;
                ++$file_counter;
            }
        }
        ?>
    </div>

    <div class="toolbar dokan-clearfix">

        <div class="dokan-w12" style="margin-bottom: 5px;">
            <select
                id="grant_access_id"
                class="grant_access_id dokan-form-control"
                name="grant_access_id[]"
                multiple="multiple"
                style="width: 100%;"
                data-placeholder="<?php esc_attr_e( 'Search for a downloadable product&hellip;', 'dokan-lite' ); ?>">
            </select>
        </div>

        <div class="dokan-w4">
            <button type="button" class="dokan-btn dokan-btn-success grant_access"
                    data-order-id="<?php echo esc_attr( $order->get_id() ); ?>"
                    data-nonce="<?php echo esc_attr( wp_create_nonce( 'grant-access' ) ); ?>">
                <?php esc_html_e( 'Grant Access', 'dokan-lite' ); ?>
            </button>
        </div>

    </div> <!-- .toolbar -->
</div> <!-- .order_download_permissions -->
