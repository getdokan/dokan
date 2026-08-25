<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading" style="overflow: hidden;">
        <?php
        // Was a Bootstrap collapse toggle, but the plugin loads on neither surface, so the accordion never worked and the href only pushed `#collapse-…` into the address bar.
        $permission_product_name = apply_filters( 'woocommerce_admin_download_permissions_title', $product->get_title(), $download->product_id, $download->order_id, $download->order_key, $download->download_id );

        // Pending, draft and private products 404 on `get_permalink()`, so those titles stay plain text rather than linking nowhere.
        $permission_product_url  = is_post_publicly_viewable( $product->get_id() ) ? $product->get_permalink() : '';
        $permission_product_html = $permission_product_url
            ? '<a href="' . esc_url( $permission_product_url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $permission_product_name ) . '</a>'
            : esc_html( $permission_product_name );

        // Named but not linked, as WooCommerce's own permissions metabox does: under the default Force Downloads method WooCommerce writes `deny from all` over the upload directory, so a direct link to the asset is dead on any server that honours it.
        $permission_file_name = wc_get_filename_from_url( $product->get_file_download_path( $download->download_id ) );

        $permission_title = '#'
            . absint( $product->get_id() )
            . ' &mdash; '
            . $permission_product_html
            . ' &mdash; '
            . sprintf(
                // translators: 1) download count, 2) download file name
                __( 'File %1$s: %2$s', 'dokan-lite' ),
                esc_html( $file_count ),
                esc_html( $permission_file_name )
            );
        ?>

        <span class="title"><?php echo wp_kses_post( $permission_title ); ?></span>

        <button
            rel="<?php echo esc_attr( absint( $download->product_id ) ) . ',' . esc_attr( $download->download_id ); ?>"
            class="revoke_access btn btn-danger btn-sm pull-right"
            data-order-id="<?php echo esc_attr( $download->order_id ); ?>"
            data-permission-id="<?php echo esc_attr( $download->get_id() ); ?>"
            data-nonce="<?php echo esc_attr( wp_create_nonce( 'revoke-access' ) ); ?>"
        >
            <?php esc_html_e( 'Revoke Access', 'dokan-lite' ); ?>
        </button>
    </div>

    <div class="panel-collapse">
        <div class="panel-body">
            <table class="wc-metabox-content" style="table-layout: fixed;">
                <tbody>
                    <tr>
                        <td style="width: 60%">
                            <label><?php esc_html_e( 'Downloaded', 'dokan-lite' ); ?></label>
                            <?php
                            echo wp_kses_post(
                                sprintf(
                                    // translators: 1) file download counter
                                    _n( '%s time', '%s times', intval( $download->download_count ), 'dokan-lite' ),
                                    number_format_i18n( $download->download_count )
                                )
                            );
                            ?>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label><?php esc_html_e( 'Downloads Remaining', 'dokan-lite' ); ?>:</label>
                            <input type="hidden" name="product_id[<?php echo esc_attr( $loop ); ?>]" value="<?php echo esc_attr( absint( $download->product_id ) ); ?>" />
                            <input type="hidden" name="download_id[<?php echo esc_attr( $loop ); ?>]" value="<?php echo esc_attr( $download->download_id ); ?>" />
                            <input type="number" step="1" min="0" style="width: 150px;" class="form-input" name="downloads_remaining[<?php echo esc_attr( $loop ); ?>]" value="<?php echo esc_attr( $download->downloads_remaining ); ?>" placeholder="<?php esc_attr_e( 'Unlimited', 'dokan-lite' ); ?>" />
                        </td>
                        <td>
                            <label><?php esc_html_e( 'Access Expires', 'dokan-lite' ); ?>:</label>
                            <?php
                            // ISO, matching WooCommerce's own permissions metabox and the format the date picker on this field reads and writes.
                            $expire_date = $download->access_expires ? dokan_current_datetime()->modify( $download->access_expires )->format( 'Y-m-d' ) : '';
                            ?>

                            <input type="text" style="width: 150px;" class="short datepicker" name="access_expires[<?php echo esc_attr( $loop ); ?>]" value="<?php echo esc_attr( $expire_date ); ?>" maxlength="10" placeholder="<?php esc_attr_e( 'Never', 'dokan-lite' ); ?>" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
