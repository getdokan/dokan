<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Class Order
 *
 * @since 3.5.1
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class Order {

    /**
     * Marks an order whose payment was resolved without writing a ledger row.
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    const PAYMENT_SETTLED_META = '_dokan_reverse_withdrawal_payment_processed';

    /**
     * Order constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        // replace meta text with formatted text
        add_filter( 'woocommerce_order_item_display_meta_key', [ $this, 'hide_order_item_meta_key' ], 999, 3 );
        add_filter( 'woocommerce_order_item_display_meta_value', [ $this, 'hide_order_item_meta_value' ], 999, 3 );

        // return if reverse withdrawal feature is disabled
        if ( ! SettingsHelper::is_enabled() ) {
            return;
        }

        // store required metas
        add_action( 'woocommerce_checkout_create_order_line_item', [ $this, 'store_line_item_metas' ], 10, 3 );

        // after payment complete
        add_action( 'woocommerce_payment_complete', [ $this, 'process_payment' ], 10, 1 );

        // after order status changed
        add_action( 'woocommerce_order_status_changed', [ $this, 'process_order_status_changed' ], 10, 3 );
    }

    /**
     * Insert reverse withdrawal payment info into database after order status has been completed.
     *
     * @since 3.5.1
     *
     * @param int    $order_id of the $order_id .
     * @param string $old_status old status of the order.
     * @param string $new_status this is new status of the order.
     *
     * @return void
     */
    public function process_order_status_changed( $order_id, $old_status, $new_status ) {
        if ( $old_status === $new_status ) {
            return;
        }

        if ( 'completed' !== $new_status ) {
            return;
        }

        // add payment data into database
        $this->insert_payment( $order_id );
    }

    /**
     * Insert reverse withdrawal payment into database after order status has been completed
     *
     * @since 3.5.1
     *
     * @param int $order_id
     *
     * @return void
     */
    public function process_payment( $order_id ) {
        // add reverse withdrawal payment data into database
        $this->insert_payment( $order_id );
    }

    /**
     * This method will insert reverse withdrawal payment record into database
     *
     * @since 3.5.1
     *
     * @param int $order_id
     *
     * @return void
     */
    protected function insert_payment( $order_id ) {
        $order = wc_get_order( $order_id );
        // check if we got a valid order object
        if ( ! $order instanceof \WC_Abstract_Order ) {
            return;
        }

        if ( ! Helper::has_reverse_withdrawal_payment_in_order( $order ) ) {
            return;
        }

        $manager = new Manager();

        // check if payment already exists in database, this is to prevent duplicate entry
        if ( $manager->is_payment_inserted( $order_id ) ) {
            return;
        }

        /*
         * An order settled with nothing left to credit writes no ledger row, so `is_payment_inserted()` can never
         * recognise it. Without this marker a completed → refunded → completed cycle would reconsider it against a
         * fresh debt and hand out that credit for free.
         */
        if ( 'yes' === $order->get_meta( self::PAYMENT_SETTLED_META ) ) {
            return;
        }

        // get payment data from order
        $amount = Helper::get_balance_from_order( $order );
        if ( empty( $amount ) || $amount <= 0 ) {
            return;
        }

        $vendor_id = $order->get_customer_id();

        /*
         * The amount was reconciled when the order was placed, but the debt can shrink before it completes — another
         * payment landing first, or an order created before this reconciliation existed. Clamp again here so the
         * ledger can never take more credit than the vendor actually owes.
         */
        $balance_data = Helper::get_vendor_balance( $vendor_id );

        if ( ! is_wp_error( $balance_data ) ) {
            // Clamp against the unrounded balance, otherwise half-up rounding lets the credit overshoot the real debt.
            $due   = (float) $balance_data['balance'];
            $scale = 10 ** wc_get_price_decimals();

            if ( $amount > $due ) {
                // Only a shortfall the vendor can actually see is worth a note — anything smaller is display rounding.
                if ( (int) round( $amount * $scale ) > (int) round( $due * $scale ) ) {
                    $order->add_order_note(
                        sprintf(
                            /* translators: 1: amount paid in the order, 2: amount actually credited to the ledger */
                            __( 'Reverse withdrawal payment of %1$s exceeded the outstanding balance, so %2$s was credited.', 'dokan-lite' ),
                            // Notes are read as plain text in exports and emails, so keep the prices free of markup.
                            wp_strip_all_tags( html_entity_decode( wc_price( $amount ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ),
                            wp_strip_all_tags( html_entity_decode( wc_price( max( 0, $due ) ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) )
                        )
                    );
                }

                $amount = max( 0, $due );
            }
        }

        if ( $amount <= 0 ) {
            $order->update_meta_data( self::PAYMENT_SETTLED_META, 'yes' );
            // Only the meta needs persisting, and a full save() here runs inside the status-change hook.
            $order->save_meta_data();

            return;
        }

        // prepare item for database
        $args = [
            'trn_id'    => $order_id,
            'trn_type'  => 'vendor_payment',
            'vendor_id' => $vendor_id,
            'credit'    => $amount,
        ];

        // finally insert payment data into database
        $manager->insert( $args ); // debug log is added in insert method
    }

    /**
     * Stores reverse withdrawal payment amount under the line item meta.
     *
     * @since 3.5.1
     *
     * @param \WC_Order_Item_Product $line_item     The line item added to the order.
     * @param string                 $cart_item_key The key of the cart item being added to the cart.
     * @param array                  $cart_item     The cart item data.
     */
    public static function store_line_item_metas( $line_item, $cart_item_key, $cart_item ) {
        if ( isset( $cart_item['dokan_reverse_withdrawal_balance'] ) ) {
            $line_item->add_meta_data( '_dokan_reverse_withdrawal_balance', $cart_item['dokan_reverse_withdrawal_balance'] );
        }
    }

    /**
     * Hide meta key in the order.
     *
     * @since 3.5.1
     *
     * @param  string $display_key of the key.
     * @param  object $meta for the meta data.
     * @param  array $item array.
     *
     * @return string
     */
    public function hide_order_item_meta_key( $display_key, $meta, $item ) {
        switch ( $display_key ) {
            case '_dokan_reverse_withdrawal_balance':
                $display_key = esc_html__( 'Payment Amount', 'dokan-lite' );
                break;
        }

        return $display_key;
    }

    /**
     * Hide meta key in the order.
     *
     * @since 3.5.1
     *
     * @param  mixed $display_value for the display item.
     * @param  object $meta data of the order.
     * @param  array $item item array.
     *
     * @return string
     */
    public function hide_order_item_meta_value( $display_value, $meta, $item ) {
        switch ( $meta->key ) {
            case '_dokan_reverse_withdrawal_balance':
                $display_value = wc_price( $display_value );
                break;
        }

        return $display_value;
    }
}
