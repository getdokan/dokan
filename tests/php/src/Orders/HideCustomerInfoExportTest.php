<?php

namespace WeDevs\Dokan\Test\Orders;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * Covers the "Hide Customer Info" selling option as applied to the vendor order CSV export.
 *
 * @since DOKAN_SINCE
 *
 * @group orders
 * @group order-export
 */
class HideCustomerInfoExportTest extends DokanTestCase {

    /**
     * Columns that survive when the setting is on.
     *
     * @var string[]
     */
    private $expected_visible_columns = [
        'order_id',
        'order_items',
        'order_shipping',
        'order_shipping_cost',
        'order_payment_method',
        'order_total',
        'earnings',
        'order_status',
        'order_date',
        'customer_note',
    ];

    /**
     * Set the "Hide Customer Info" selling option.
     *
     * @param string $value Either on or off.
     *
     * @return void
     */
    private function set_hide_customer_info( string $value ) {
        $selling_options                       = get_option( 'dokan_selling', [] );
        $selling_options['hide_customer_info'] = $value;

        update_option( 'dokan_selling', $selling_options );
    }

    public function test_headers_are_untouched_when_the_setting_is_off() {
        $this->set_hide_customer_info( 'off' );

        $headers = dokan_order_csv_headers();

        $this->assertArrayHasKey( 'billing_email', $headers );
        $this->assertArrayHasKey( 'billing_full_name', $headers );
        $this->assertArrayHasKey( 'shipping_address_1', $headers );
        $this->assertArrayHasKey( 'customer_ip', $headers );
    }

    public function test_customer_columns_are_dropped_when_the_setting_is_on() {
        $this->set_hide_customer_info( 'on' );

        $headers = dokan_order_csv_headers();

        $this->assertSame( $this->expected_visible_columns, array_keys( $headers ) );
    }

    /**
     * The columns are matched by prefix, so a column a third party registers before this
     * callback runs is treated the same as a core one.
     */
    public function test_third_party_customer_columns_are_dropped_by_prefix() {
        $this->set_hide_customer_info( 'on' );

        $add_columns = function ( $headers ) {
            $headers['billing_vat_number']        = 'Billing VAT Number';
            $headers['shipping_tracking_number']  = 'Shipping Tracking Number';
            $headers['vendor_internal_reference'] = 'Vendor Internal Reference';

            return $headers;
        };

        add_filter( 'dokan_csv_export_headers', $add_columns, 10 );
        $headers = dokan_order_csv_headers();
        remove_filter( 'dokan_csv_export_headers', $add_columns, 10 );

        $this->assertArrayNotHasKey( 'billing_vat_number', $headers );
        $this->assertArrayNotHasKey( 'shipping_tracking_number', $headers );
        $this->assertArrayHasKey( 'vendor_internal_reference', $headers );
    }

    /**
     * A shipping_* column is not always customer data, so the list has to stay adjustable.
     */
    public function test_hidden_columns_can_be_filtered_back_in() {
        $this->set_hide_customer_info( 'on' );

        $add_column = function ( $headers ) {
            $headers['shipping_tracking_number'] = 'Shipping Tracking Number';

            return $headers;
        };

        $keep_tracking_number = function ( $hidden_columns ) {
            return array_diff( $hidden_columns, [ 'shipping_tracking_number' ] );
        };

        add_filter( 'dokan_csv_export_headers', $add_column, 10 );
        add_filter( 'dokan_hidden_customer_info_csv_columns', $keep_tracking_number );
        $headers = dokan_order_csv_headers();
        remove_filter( 'dokan_hidden_customer_info_csv_columns', $keep_tracking_number );
        remove_filter( 'dokan_csv_export_headers', $add_column, 10 );

        $this->assertArrayHasKey( 'shipping_tracking_number', $headers );
        $this->assertArrayNotHasKey( 'billing_email', $headers );
    }
}
