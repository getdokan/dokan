<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FieldRegistry;

/**
 * Covers the built-in sections and rows of the vendor registration form and how extensions add rows.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class FieldRegistryTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var FieldRegistry */
    protected $registry;

    public function set_up() {
        parent::set_up();

        $this->registry = dokan_get_container()->get( FieldRegistry::class );
    }

    public function test_default_sections_and_their_flags() {
        $sections = array_column( $this->registry->get_sections(), null, 'id' );

        $this->assertSame( [ 'account', 'store', 'address', 'additional', 'agreement' ], array_keys( $sections ) );
        $this->assertTrue( $sections['account']['locked'] );
        $this->assertTrue( $sections['store']['locked'] );
        $this->assertTrue( $sections['address']['hidden'] );
        $this->assertFalse( $sections['additional']['hidden'] );
    }

    public function test_default_rows_keep_dokans_input_names_and_locks() {
        $rows = $this->registry->get_rows();

        $this->assertSame(
            [ 'first_name', 'last_name', 'username', 'email', 'password', 'shop_name', 'shop_url', 'phone', 'street_1', 'street_2', 'city', 'zip', 'country', 'state', 'terms' ],
            array_keys( $rows )
        );
        $this->assertSame( 'shopurl', $rows['shop_url']['input_name'] );
        $this->assertSame( 'dokan_address[street_1]', $rows['street_1']['input_name'] );
        $this->assertTrue( $rows['shop_url']['locked'] );
        $this->assertTrue( $rows['shop_url']['required'] );
        $this->assertFalse( $rows['phone']['locked'] );
        $this->assertFalse( $rows['street_2']['required'] );
        $this->assertSame( 'woocommerce_registration_generate_username', $rows['username']['woocommerce_setting'] );
    }

    public function test_an_extension_row_lands_in_its_section_by_position() {
        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
                    'id'       => 'eu_fields',
                    'section'  => 'store',
                    'position' => 30,
                    'label'    => 'EU business fields',
                ];

                return $rows;
            }
        );

        $store_rows = array_values(
            array_filter(
                $this->registry->get_rows(),
                function ( $row ) {
                    return 'store' === $row['section'];
                }
            )
        );

        $this->assertSame( [ 'shop_name', 'shop_url', 'eu_fields', 'phone' ], wp_list_pluck( $store_rows, 'id' ) );
        $this->assertSame( 'extension', $store_rows[2]['source'] );
    }

    public function test_an_unavailable_row_is_left_out_but_stays_registered() {
        add_filter(
            'dokan_vendor_registration_row_available',
            function ( $available, $row ) {
                return 'phone' === $row['id'] ? false : $available;
            },
            10,
            2
        );

        $this->assertArrayNotHasKey( 'phone', $this->registry->get_rows() );
        $this->assertContains( 'phone', wp_list_pluck( $this->registry->get_registered_rows(), 'id' ) );
    }

    public function test_rows_missing_an_id_section_or_label_are_dropped() {
        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
					'id' => 'no_section',
					'label' => 'x',
				];
                $rows[] = [
					'section' => 'store',
					'label' => 'x',
				];
                $rows[] = 'not-an-array';

                return $rows;
            }
        );

        $this->assertCount( 15, $this->registry->get_rows() );
    }

    public static function meta_key_provider(): array {
        return [
            'valid'            => [ 'dokan_vreg_business_type', true ],
            'prefix only'      => [ 'dokan_vreg_', false ],
            'wrong prefix'     => [ 'business_type', false ],
            'not sanitized'    => [ 'dokan_vreg_Business Type', false ],
            'another dokan key' => [ 'dokan_profile_settings', false ],
            'reserved key'      => [ 'dokan_vreg_signup_page', false ],
        ];
    }

    /**
     * @dataProvider meta_key_provider
     */
    public function test_custom_meta_keys_need_the_prefix( string $meta_key, bool $expected ) {
        $this->assertSame( $expected, $this->registry->is_custom_meta_key( $meta_key ) );
    }
}
