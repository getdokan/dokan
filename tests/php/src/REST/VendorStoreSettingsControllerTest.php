<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * @group vendor-store-settings
 * @group rest-api
 *
 * @covers \WeDevs\Dokan\REST\VendorStoreSettingsController
 */
class VendorStoreSettingsControllerTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        update_option(
            'dokan_appearance',
            [
                'store_open_close' => 'on',
                'map_api_source'   => 'google_maps',
                'gmap_api_key'     => 'test_map_key_example',
            ]
        );
        update_option( 'dokan_general', [ 'seller_enable_terms_and_conditions' => 'on' ] );
        $this->flush_settings_caches();

        wp_set_current_user( $this->seller_id1 );
    }

    public function test_hidden_legacy_schedule_does_not_block_an_unrelated_save(): void {
        $this->store_profile( [ 'dokan_store_time_enabled' => 'no' ] + $this->schedule_with_monday( [ '9:00 am' ], [ '9:00 am' ] ) );

        $response = $this->save( [ 'phone' => '01700000000' ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( '01700000000', $this->profile()['phone'] );
        // The untouched schedule stays exactly as the legacy page saved it.
        $this->assertSame( [ '9:00 am' ], $this->profile()['dokan_store_time']['monday']['opening_time'] );
    }

    public function test_visible_schedule_is_still_validated(): void {
        $this->store_profile( [ 'dokan_store_time_enabled' => 'yes' ] + $this->schedule_with_monday( [ '9:00 am' ], [ '9:00 am' ] ) );

        $response = $this->save( [ 'phone' => '01700000000' ] );

        $this->assertSame( 400, $response->get_status() );
        $this->assertArrayHasKey( 'dokan_store_time', $response->get_data()['data']['errors'] );
    }

    /**
     * @dataProvider switch_flags
     */
    public function test_switch_reads_boolean_style_flags( $flag, string $expected ): void {
        $this->store_profile( [ 'show_email' => 'yes' === $expected ? 'no' : 'yes' ] );

        $this->assertSame( 200, $this->save( [ 'show_email' => $flag ] )->get_status() );
        $this->assertSame( $expected, $this->profile()['show_email'] );
    }

    public function switch_flags(): array {
        return [
            '"on"'    => [ 'on', 'yes' ],
            'int 1'   => [ 1, 'yes' ],
            'false'   => [ false, 'no' ],
            'garbage' => [ 'maybe', 'no' ],
        ];
    }

    public function test_true_keeps_switches_enabled(): void {
        $this->store_profile(
            [
                'enable_tnc' => 'on',
                'store_tnc'  => 'Returns accepted within 7 days.',
            ]
        );

        $response = $this->save(
            [
                'show_email' => true,
                'enable_tnc' => true,
            ]
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'yes', $this->profile()['show_email'] );
        $this->assertSame( 'on', $this->profile()['enable_tnc'] );
    }

    public function test_partial_map_keeps_the_sub_key_it_did_not_send(): void {
        $this->store_profile(
            [
                'location'     => '23.7,90.4',
                'find_address' => 'Gulshan, Dhaka',
            ]
        );

        $response = $this->save( [ 'store_map' => [ 'location' => '23.8,90.5' ] ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( '23.8,90.5', $this->profile()['location'] );
        $this->assertSame( 'Gulshan, Dhaka', $this->profile()['find_address'] );
    }

    public function test_partial_address_keeps_the_sub_keys_it_did_not_send(): void {
        $this->store_profile(
            [
                'address' => [
                    'street_1' => 'Road 1',
                    'city'     => 'Dhaka',
                    'country'  => 'BD',
                ],
            ]
        );

        $response = $this->save( [ 'address' => [ 'city' => 'Chattogram' ] ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'Road 1', $this->profile()['address']['street_1'] );
        $this->assertSame( 'Chattogram', $this->profile()['address']['city'] );
    }

    public function test_image_must_be_an_existing_attachment(): void {
        $response = $this->save(
            [
                'banner'   => 999999,
                'gravatar' => -5,
            ]
        );

        $this->assertSame( 400, $response->get_status() );
        $this->assertEqualsCanonicalizing( [ 'banner', 'gravatar' ], array_keys( $response->get_data()['data']['errors'] ) );
        $this->assertSame( 0, (int) ( $this->profile()['banner'] ?? 0 ) );
    }

    public function test_image_from_another_vendor_is_rejected(): void {
        $response = $this->save( [ 'banner' => $this->create_image( $this->seller_id2 ) ] );

        $this->assertSame( 400, $response->get_status() );
        $this->assertArrayHasKey( 'banner', $response->get_data()['data']['errors'] );
    }

    public function test_own_image_saves_and_clearing_is_allowed(): void {
        $image_id = $this->create_image( $this->seller_id1 );

        $this->assertSame( 200, $this->save( [ 'banner' => $image_id ] )->get_status() );
        $this->assertSame( $image_id, (int) $this->profile()['banner'] );

        $this->assertSame( 200, $this->save( [ 'banner' => 0 ] )->get_status() );
        $this->assertSame( 0, (int) $this->profile()['banner'] );
    }

    public function test_already_saved_image_never_blocks_a_save(): void {
        // A banner saved by the legacy page that no longer resolves must not block an unrelated change.
        $this->store_profile( [ 'banner' => 999999 ] );

        $response = $this->save(
            [
                'banner' => 999999,
                'phone'  => '01700000000',
            ]
        );

        $this->assertSame( 200, $response->get_status() );
    }

    private function save( array $values ): WP_REST_Response {
        $request = new WP_REST_Request( 'PUT', '/dokan/v1/vendor-settings/store' );
        $request->set_body_params( [ 'values' => $values ] );

        return rest_do_request( $request );
    }

    private function store_profile( array $settings ): void {
        update_user_meta( $this->seller_id1, 'dokan_profile_settings', array_merge( $this->profile(), $settings ) );
    }

    private function profile(): array {
        return (array) get_user_meta( $this->seller_id1, 'dokan_profile_settings', true );
    }

    private function schedule_with_monday( array $opening, array $closing ): array {
        $schedule = [];

        foreach ( array_keys( dokan_get_translated_days() ) as $day ) {
            $schedule[ $day ] = [
                'status'       => 'close',
                'opening_time' => [],
                'closing_time' => [],
            ];
        }

        $schedule['monday'] = [
            'status'       => 'open',
            'opening_time' => $opening,
            'closing_time' => $closing,
        ];

        return [ 'dokan_store_time' => $schedule ];
    }

    private function create_image( int $author_id ): int {
        return $this->factory()->attachment->create(
            [
                'post_author'    => $author_id,
                'post_mime_type' => 'image/jpeg',
                'file'           => 'store-banner.jpg',
            ]
        );
    }
}
