<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Option-list fields accept only their options; media fields store only safe URLs.
 *
 * @group admin-settings
 * @group rest-api
 * @group rest-api-admin-settings
 *
 * @covers \WeDevs\Dokan\REST\AdminSettingsController
 */
class AdminSettingsFieldSanitizeTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        get_user_by( 'id', $this->admin_id )->add_cap( 'manage_woocommerce' );
        wp_set_current_user( $this->admin_id );
        ( new SettingsRepository() )->replace( [] );
    }

    public function tear_down() {
        ( new SettingsRepository() )->replace( [] );
        parent::tear_down();
    }

    private function put( string $page_id, array $values ): WP_REST_Response {
        $request = new WP_REST_Request( 'PUT', '/dokan/v1/admin/settings/' . $page_id );
        $request->set_body_params(
            [
                'page_id' => $page_id,
                'values'  => $values,
            ]
        );

        return rest_do_request( $request );
    }

    public function test_option_field_rejects_a_value_outside_its_options(): void {
        ( new SettingsRepository() )->update( [ 'map_api_source' => 'google_maps' ] );

        $response = $this->put( 'location', [ 'map_api_source' => 'evil_value' ] );

        $this->assertSame( 400, $response->get_status() );
        $this->assertArrayHasKey( 'map_api_source', $response->get_data()['data']['errors'] );
        $this->assertSame( 'google_maps', ( new SettingsRepository() )->get( 'map_api_source' ) );
    }

    public function test_option_field_accepts_a_declared_option(): void {
        $response = $this->put( 'location', [ 'map_api_source' => 'mapbox' ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( 'mapbox', ( new SettingsRepository() )->get( 'map_api_source' ) );
    }

    public function test_media_field_drops_a_javascript_url(): void {
        $response = $this->put( 'store', [ 'default_store_banner' => 'javascript:alert(document.cookie)' ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( '', ( new SettingsRepository() )->get( 'default_store_banner' ) );
    }

    public function test_media_field_keeps_an_image_url(): void {
        $url = 'https://example.com/wp-content/uploads/banner.jpg';

        $response = $this->put( 'store', [ 'default_store_banner' => $url ] );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( $url, ( new SettingsRepository() )->get( 'default_store_banner' ) );
    }
}
