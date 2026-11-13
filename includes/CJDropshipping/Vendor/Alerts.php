<?php

namespace WeDevs\Dokan\CJDropshipping\Vendor;

/**
 * Things a vendor must act on for their CJ products, shown on the CJ page and emailed.
 *
 * @since DOKAN_SINCE
 */
class Alerts {

    public const META = 'dokan_cj_alerts';

    // Keep the newest alerts only.
    private const LIMIT = 50;

    /**
     * Add an alert once per product and type, and email the vendor.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $vendor_id  Vendor id.
     * @param string $type       removed, loss, sync_failed, ...
     * @param int    $product_id Product id.
     * @param string $message    What happened and what to do.
     *
     * @return void
     */
    public static function add( int $vendor_id, string $type, int $product_id, string $message ): void {
        $alerts = self::all( $vendor_id );
        $key    = $type . ':' . $product_id;

        if ( isset( $alerts[ $key ] ) ) {
            return;
        }

        $alerts[ $key ] = [
            'type'       => $type,
            'product_id' => $product_id,
            'message'    => $message,
            'created_at' => time(),
        ];

        update_user_meta( $vendor_id, self::META, array_slice( $alerts, -self::LIMIT, null, true ) );

        self::email( $vendor_id, $message );
    }

    /**
     * Clear an alert once the problem is gone.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $vendor_id  Vendor id.
     * @param string $type       Alert type.
     * @param int    $product_id Product id.
     *
     * @return void
     */
    public static function clear( int $vendor_id, string $type, int $product_id ): void {
        $alerts = self::all( $vendor_id );

        if ( isset( $alerts[ $type . ':' . $product_id ] ) ) {
            unset( $alerts[ $type . ':' . $product_id ] );
            update_user_meta( $vendor_id, self::META, $alerts );
        }
    }

    /**
     * A vendor's alerts, newest last.
     *
     * @since DOKAN_SINCE
     *
     * @param int $vendor_id Vendor id.
     *
     * @return array<string, array>
     */
    public static function all( int $vendor_id ): array {
        $alerts = get_user_meta( $vendor_id, self::META, true );

        return is_array( $alerts ) ? $alerts : [];
    }

    /**
     * Email the vendor in WooCommerce's template.
     *
     * @since DOKAN_SINCE
     *
     * @param int    $vendor_id Vendor id.
     * @param string $message   Body text.
     *
     * @return void
     */
    protected static function email( int $vendor_id, string $message ): void {
        $user = get_userdata( $vendor_id );

        if ( ! $user || ! function_exists( 'WC' ) || ! apply_filters( 'dokan_cj_email_vendor_alerts', true, $vendor_id ) ) {
            return;
        }

        $subject = __( 'A CJ product in your store needs attention', 'dokan-lite' );
        $mailer  = WC()->mailer();
        $link    = dokan_get_navigation_url( 'cj-dropshipping', true );

        $mailer->send( $user->user_email, $subject, $mailer->wrap_message( $subject, wpautop( esc_html( $message ) ) . '<p><a href="' . esc_url( $link ) . '">' . esc_html__( 'Open CJ Dropshipping', 'dokan-lite' ) . '</a></p>' ) );
    }
}
