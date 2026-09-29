<?php

namespace WeDevs\Dokan\Test\REST;

use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Test\DokanTestCase;
use WP_REST_Request;
use WP_REST_Response;

/**
 * @group admin-settings
 * @group rest-api
 * @group rest-api-admin-settings
 *
 * @covers \WeDevs\Dokan\REST\AdminSettingsController
 */
class AdminSettingsDependencyValidationTest extends DokanTestCase {

    public function set_up() {
        parent::set_up();

        get_user_by( 'id', $this->admin_id )->add_cap( 'manage_woocommerce' );
        wp_set_current_user( $this->admin_id );

        // Commission settings were never saved.
        ( new SettingsRepository() )->replace( [] );
        delete_option( 'dokan_selling' );
    }

    public function test_fixed_commission_saves_while_the_category_field_is_hidden_and_empty(): void {
        $response = $this->save_commission(
            [
                'commission_type'                  => 'fixed',
                'admin_commission'                 => [
                    'admin_percentage' => '16',
                    'additional_fee'   => '10',
                ],
                'commission_category_based_values' => '',
            ]
        );

        $this->assertSame( 200, $response->get_status() );
        $this->assertSame( '16', get_option( 'dokan_admin_settings' )['admin_commission']['admin_percentage'] );
    }

    public function test_shown_field_is_still_validated(): void {
        $response = $this->save_commission(
            [
                'commission_type'                  => 'category_based',
                'admin_commission'                 => '',
                'commission_category_based_values' => '',
            ]
        );

        $this->assertSame( 400, $response->get_status() );
        $this->assertSame( [ 'commission_category_based_values' ], array_keys( $response->get_data()['data']['errors'] ) );
    }

    public function test_fixed_commission_has_no_value_until_it_is_saved(): void {
        $field = current( wp_list_filter( ( new SettingsRegistry() )->get_schema(), [ 'id' => 'admin_commission' ] ) );

        $this->assertSame( '', $field['value'] );
        $this->assertArrayNotHasKey( 'admin_percentage', $field );
    }

    public function test_withdraw_charges_are_zero_until_they_are_saved(): void {
        delete_option( 'dokan_withdraw' );

        $field = current( wp_list_filter( ( new SettingsRegistry() )->get_schema(), [ 'id' => 'paypal_withdraw_charges' ] ) );

        $this->assertSame( '0.00', $field['value']['admin_percentage'] );
        $this->assertSame( '0.00', $field['value']['additional_fee'] );
    }

    private function save_commission( array $values ): WP_REST_Response {
        $request = new WP_REST_Request( 'PUT', '/dokan/v1/admin/settings/commission' );
        $request->set_body_params( [ 'values' => $values ] );

        return rest_do_request( $request );
    }
}
