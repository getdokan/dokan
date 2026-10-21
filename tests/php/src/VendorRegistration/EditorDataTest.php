<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\EditorData;

/**
 * Covers the data the block's editor receives.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class EditorDataTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    public function test_rows_keep_callbacks_on_the_server_and_off_rows_stay_reserved() {
        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
                    'id'              => 'eu_fields',
                    'section'         => 'store',
                    'label'           => 'EU business fields',
                    'render_callback' => '__return_empty_string',
                ];

                return $rows;
            }
        );
        add_filter(
            'dokan_vendor_registration_row_available',
            function ( $available, $row ) {
                return 'phone' === $row['id'] ? false : $available;
            },
            10,
            2
        );

        $data = dokan_get_container()->get( EditorData::class )->get_data();
        $rows = array_column( $data['rows'], null, 'id' );

        $this->assertArrayNotHasKey( 'render_callback', $rows['eu_fields'] );
        $this->assertArrayNotHasKey( 'phone', $rows );
        $this->assertContains( 'phone', $data['registeredRowIds'] );
        $this->assertSame( 'dokan_vreg_', $data['metaPrefix'] );
        $this->assertArrayHasKey( 'usesCheckoutBlock', $data['woocommerce'] );
    }
}
