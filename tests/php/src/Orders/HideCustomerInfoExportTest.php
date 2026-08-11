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
     * The columns are matched by prefix, so a column a third party registers is treated the
     * same as a core one — on any priority, since this callback runs last.
     */
    public function test_third_party_customer_columns_are_dropped_by_prefix() {
        $this->set_hide_customer_info( 'on' );

        $this->add_export_columns(
            [
                'billing_vat_number'        => 'Billing VAT Number',
                'vendor_internal_reference' => 'Vendor Internal Reference',
            ]
        );
        $this->add_export_columns( [ 'shipping_tracking_number' => 'Shipping Tracking Number' ], 999 );

        $headers = dokan_order_csv_headers();

        $this->assertArrayNotHasKey( 'billing_vat_number', $headers );
        $this->assertArrayNotHasKey( 'shipping_tracking_number', $headers );
        $this->assertArrayHasKey( 'vendor_internal_reference', $headers );
    }

    /**
     * A shipping_* column is not always customer data, so the list has to stay adjustable.
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

        $this->assertNotNull( $received );
        $this->assertSame( range( 0, count( $received ) - 1 ), array_keys( $received ) );
        $this->assertContains( 'billing_email', $received );
        $this->assertContains( 'customer_ip', $received );
    }
}
