<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
?>
<div class="dokan-panel dokan-panel-default">
    <div class="dokan-panel-heading" style="overflow: hidden;">
        <a
            class="title"
            data-toggle="collapse"
            data-parent="#accordion"
            href="#collapse-<?php echo esc_attr( $download->download_id ); ?>">
            <?php
            echo wp_kses_post(
                '#'
                . esc_attr( absint( $product->get_id() ) )
                . ' &mdash; '
                . apply_filters( 'woocommerce_admin_download_permissions_title', $product->get_title(), $download->product_id, $download->order_id, $download->order_key, $download->download_id )
                . ' &mdash; '
                . sprintf(
                    // translators: 1) download count, 2) download file name
                    __( 'File %1$d: %2$s', 'dokan-lite' ),
                    $file_count,
                    wc_get_filename_from_url( $product->get_file_download_path( $download->download_id ) )
                )
            );
            ?>
        </a>

        <button
            rel="<?php echo esc_attr( absint( $download->product_id ) ) . ',' . esc_attr( $download->download_id ); ?>"
            class="revoke_access btn btn-danger btn-sm pull-right"
            data-order-id="<?php echo esc_attr( $download->order_id ); ?>"
            data-permission-id="<?php echo esc_attr( $download->permission_id ); ?>"
            data-nonce="<?php echo esc_attr( wp_create_nonce( 'revoke-access' ) ); ?>"
        >
            <?php esc_html_e( 'Revoke Access', 'dokan-lite' ); ?>
        </button>
    </div>

    <div id="collapse-<?php echo esc_attr( $download->download_id ); ?>" class="panel-collapse collapse">
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
                                    _n( '%d time', '%d times', intval( $download->download_count ), 'dokan-lite' ),
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
                            <input type="text" style="width: 150px;" class="short datepicker" name="access_expires[<?php echo esc_attr( $loop ); ?>]" value="<?php echo esc_attr( $download->access_expires ) ? dokan_current_datetime()->modify( $download->access_expires )->format( 'Y-m-d' ) : ''; ?>" maxlength="10" placeholder="<?php esc_attr_e( 'Never', 'dokan-lite' ); ?>" pattern="[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
