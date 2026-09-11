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

    /**
     * Register export columns the way a third party would.
     *
     * @param array $columns  Column key to label.
     * @param int   $priority Hook priority to register on.
     *
     * @return void
     */
    private function add_export_columns( array $columns, int $priority = 10 ) {
        add_filter(
            'dokan_csv_export_headers',
            function ( $headers ) use ( $columns ) {
                return array_merge( $headers, $columns );
            },
            $priority
        );
    }

    /**
     * The export keeps every column while the setting is off.
     *
     * @return void
     */
    public function test_headers_are_untouched_when_the_setting_is_off() {
        $this->set_hide_customer_info( 'off' );

        $headers = dokan_order_csv_headers();

        $this->assertArrayHasKey( 'billing_email', $headers );
        $this->assertArrayHasKey( 'billing_full_name', $headers );
        $this->assertArrayHasKey( 'shipping_address_1', $headers );
        $this->assertArrayHasKey( 'customer_ip', $headers );
    }

    /**
     * Anything but an explicit off hides: a missing column is an annoyance where a present one is a leak.
     *
     * @dataProvider hiding_setting_values
     *
     * @param string $value Setting value that should result in hiding.
     *
     * @return void
     */
    public function test_customer_columns_are_dropped_when_the_setting_is_on( string $value ) {
        $this->set_hide_customer_info( $value );

        $headers = dokan_order_csv_headers();

        foreach ( array_keys( $headers ) as $column_key ) {
            $this->assertStringStartsNotWith( 'billing_', $column_key );
            $this->assertStringStartsNotWith( 'shipping_', $column_key );
        }

        $this->assertArrayNotHasKey( 'customer_ip', $headers );

        // The order columns survive, including the two order-level shipping ones the prefix must not catch.
        $this->assertArrayHasKey( 'order_id', $headers );
        $this->assertArrayHasKey( 'order_total', $headers );
        $this->assertArrayHasKey( 'order_shipping', $headers );
        $this->assertArrayHasKey( 'order_shipping_cost', $headers );

        // Kept on purpose, matching the vendor order details page.
        $this->assertArrayHasKey( 'customer_note', $headers );
    }

    /**
     * Setting values that must all result in customer data being withheld.
     *
     * @return array
     */
    public function hiding_setting_values(): array {
        return [
            'on'           => [ 'on' ],
            'empty string' => [ '' ],
            'yes'          => [ 'yes' ],
            'numeric one'  => [ '1' ],
        ];
    }

    /**
     * The columns are matched by prefix, so a column a third party registers is treated the
     * same as a core one, on the default priority and on a later one.
     *
     * @return void
     */
    public function test_third_party_customer_columns_are_dropped_by_prefix() {
        $this->set_hide_customer_info( 'on' );

        $this->add_export_columns(
            [
                'billing_vat_number'        => 'Billing VAT Number',
                'vendor_internal_reference' => 'Vendor Internal Reference',
            ]
        );
        // 999 is the house "run late" priority, so a column registered there is the likely collision.
        $this->add_export_columns( [ 'shipping_tracking_number' => 'Shipping Tracking Number' ], 999 );

        $headers = dokan_order_csv_headers();

        $this->assertArrayNotHasKey( 'billing_vat_number', $headers );
        $this->assertArrayNotHasKey( 'shipping_tracking_number', $headers );
        $this->assertArrayHasKey( 'vendor_internal_reference', $headers );
    }

    /**
     * The filter is third-party input, and by the time it runs the CSV headers are already on the wire.
     *
     * @dataProvider malformed_filter_returns
     *
     * @param mixed $return_value What a misbehaving callback hands back.
     *
     * @return void
     */
    public function test_a_malformed_filter_return_still_hides_customer_columns( $return_value ) {
        $this->set_hide_customer_info( 'on' );

        add_filter(
            'dokan_hidden_customer_info_csv_columns',
            function () use ( $return_value ) {
                return $return_value;
            }
        );

        $headers = dokan_order_csv_headers();

        $this->assertArrayNotHasKey( 'billing_email', $headers );
        $this->assertArrayNotHasKey( 'customer_ip', $headers );
        $this->assertArrayHasKey( 'order_id', $headers );
    }

    /**
     * Return values a misbehaving filter callback might hand back.
     *
     * @return array
     */
    public function malformed_filter_returns(): array {
        return [
            'null'   => [ null ],
            'string' => [ 'billing_email' ],
        ];
    }

    /**
     * An array is the filter's contract, so its usable entries are honoured and a stray one is skipped.
     *
     * @return void
     */
    public function test_a_filter_return_with_a_junk_entry_honours_the_valid_ones() {
        $this->set_hide_customer_info( 'on' );

        add_filter(
            'dokan_hidden_customer_info_csv_columns',
            function () {
                return [ 'billing_email', [ 'billing_phone' ] ];
            }
        );

        $headers = dokan_order_csv_headers();

        $this->assertArrayNotHasKey( 'billing_email', $headers );
        $this->assertArrayHasKey( 'billing_phone', $headers );
        $this->assertArrayHasKey( 'order_id', $headers );
    }

    /**
     * A shipping_* column is not always customer data, so the list has to stay adjustable.
     *
     * @return void
     */
    public function test_hidden_columns_can_be_filtered_back_in() {
        $this->set_hide_customer_info( 'on' );

        $this->add_export_columns( [ 'shipping_tracking_number' => 'Shipping Tracking Number' ] );

        add_filter(
            'dokan_hidden_customer_info_csv_columns',
            function ( $hidden_columns ) {
                return array_diff( $hidden_columns, [ 'shipping_tracking_number' ] );
            }
        );

        $headers = dokan_order_csv_headers();

        $this->assertArrayHasKey( 'shipping_tracking_number', $headers );
        $this->assertArrayNotHasKey( 'billing_email', $headers );
    }

    /**
     * The column list is handed to the filter as a plain list, not a sparse array.
     *
     * @return void
     */
    public function test_hidden_columns_are_passed_to_the_filter_as_a_list() {
        $this->set_hide_customer_info( 'on' );

        $received = null;
        add_filter(
            'dokan_hidden_customer_info_csv_columns',
            function ( $hidden_columns ) use ( &$received ) {
                $received = $hidden_columns;

                return $hidden_columns;
            }
        );

        dokan_order_csv_headers();

        $this->assertSame( range( 0, count( $received ) - 1 ), array_keys( $received ) );
        $this->assertContains( 'billing_email', $received );
        $this->assertContains( 'customer_ip', $received );
    }
}
