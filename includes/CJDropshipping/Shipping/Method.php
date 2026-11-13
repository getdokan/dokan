<?php

namespace WeDevs\Dokan\CJDropshipping\Shipping;

use WeDevs\Dokan\CJDropshipping\Settings;
use WC_Shipping_Method;

/**
 * The single shipping line for a vendor's CJ items, priced live by CJ.
 *
 * @since DOKAN_SINCE
 */
class Method extends WC_Shipping_Method {

    public const ID = 'dokan_cj_shipping';

    /**
     * Constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param int $instance_id Instance id.
     */
    public function __construct( $instance_id = 0 ) {
        parent::__construct( $instance_id );

        $this->id                 = self::ID;
        $this->method_title       = __( 'CJ Dropshipping shipping', 'dokan-lite' );
        $this->method_description = __( 'Shipping for CJ products, priced by CJ for the buyer\'s address.', 'dokan-lite' );
        $this->title              = __( 'Standard shipping', 'dokan-lite' );
        $this->enabled            = 'yes';

        // Not a zone method: added only to CJ packages, like Printful's.
        $this->supports = [];
    }

    /**
     * Add the CJ rate for a CJ package.
     *
     * @since DOKAN_SINCE
     *
     * @param array $package Shipping package.
     *
     * @return void
     */
    public function calculate_shipping( $package = [] ) {
        if ( empty( $package[ Checkout::PACKAGE_KEY ] ) ) {
            return;
        }

        $quote = Checkout::quote_for_package( $package );

        if ( is_wp_error( $quote ) ) {
            return;
        }

        $rate_id = self::ID . ':' . (int) $package['seller_id'];

        $this->add_rate(
            [
                'id'      => $rate_id,
                'label'   => self::label( $quote ),
                'cost'    => wc_format_decimal( Settings::to_store_currency( (float) $quote['price_usd'] ), wc_get_price_decimals() ),
                'package' => $package,
            ]
        );

        // Description and delivery time are what the cart, checkout and Store API show buyers.
        if ( isset( $this->rates[ $rate_id ] ) ) {
            $this->rates[ $rate_id ]->set_description( self::notes( $quote ) );

            if ( $quote['days'][1] > 0 ) {
                $this->rates[ $rate_id ]->set_delivery_time(
                    sprintf(
                        /* translators: 1: fewest days, 2: most days */
                        __( '%1$d–%2$d days', 'dokan-lite' ),
                        $quote['days'][0],
                        $quote['days'][1]
                    )
                );
            }
        }
    }

    /**
     * Buyer notes: separate parcels and import duties; never warehouses or CJ (C1).
     *
     * @since DOKAN_SINCE
     *
     * @param array $quote Quote.
     *
     * @return string
     */
    public static function notes( array $quote ): string {
        $notes = [];

        if ( count( $quote['groups'] ) > 1 ) {
            $notes[] = __( 'May arrive in separate parcels.', 'dokan-lite' );
        }

        if ( $quote['cross_border'] ) {
            $notes[] = __( 'Import duties may apply.', 'dokan-lite' );
        }

        return implode( ' ', $notes );
    }

    /**
     * "Standard shipping", or "Ships from <country>" for one warehouse when the admin allows.
     *
     * @since DOKAN_SINCE
     *
     * @param array $quote Quote.
     *
     * @return string
     */
    public static function label( array $quote ): string {
        if ( Settings::shows_warehouse_country() && 1 === count( $quote['groups'] ) ) {
            $country = $quote['groups'][0]['warehouse'];
            $name    = WC()->countries->get_countries()[ $country ] ?? $country;

            /* translators: %s: country name */
            return sprintf( __( 'Ships from %s', 'dokan-lite' ), $name );
        }

        return __( 'Standard shipping', 'dokan-lite' );
    }
}
