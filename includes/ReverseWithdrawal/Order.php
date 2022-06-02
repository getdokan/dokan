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

        // get payment data from order
        $amount = Helper::get_balance_from_order( $order );
        if ( empty( $amount ) || $amount <= 0 ) {
            return;
        }

        // prepare item for database
        $args = [
            'trn_id'    => $order_id,
            'trn_type'  => 'vendor_payment',
            'vendor_id' => $order->get_customer_id(),
            'credit'    => $amount,
        ];

        // finally insert payment data into database
        $manager = new Manager();
        $inserted = $manager->insert( $args ); // debug log is added in insert method
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
