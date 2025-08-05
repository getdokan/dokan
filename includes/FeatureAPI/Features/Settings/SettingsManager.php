<?php
/**
 * Settings Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Settings
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Settings;

use WeDevs\Dokan\FeatureAPI\Permissions\AdminPermissions;
use WP_Feature as FeatureTypes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Settings Manager
 *
 * @since 4.0.0
 */
class SettingsManager {

    /**
     * Register settings features
     */
    public function register_features() {
        $this->register_settings_resources();
        $this->register_settings_tools();
    }

    /**
     * Register settings resource features (read-only)
     */
    private function register_settings_resources() {
        // Get general settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/general',
				'name' => __( 'Get General Settings', 'dokan-lite' ),
				'description' => __( 'Get Dokan general settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_general_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [],
				],
				'output_schema' => $this->get_general_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );

        // Get selling settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/selling',
				'name' => __( 'Get Selling Settings', 'dokan-lite' ),
				'description' => __( 'Get Dokan selling settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_selling_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [],
				],
				'output_schema' => $this->get_selling_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );

        // Get withdrawal settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/withdrawal',
				'name' => __( 'Get Withdrawal Settings', 'dokan-lite' ),
				'description' => __( 'Get Dokan withdrawal settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_withdrawal_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [],
				],
				'output_schema' => $this->get_withdrawal_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );

        // Get commission settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/commission',
				'name' => __( 'Get Commission Settings', 'dokan-lite' ),
				'description' => __( 'Get Dokan commission settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_commission_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [],
				],
				'output_schema' => $this->get_commission_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );
    }

    /**
     * Register settings tool features (update, modify)
     */
    private function register_settings_tools() {
        // Update general settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/general/update',
				'name' => __( 'Update General Settings', 'dokan-lite' ),
				'description' => __( 'Update Dokan general settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_general_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'custom_store_url' => [
							'type' => 'string',
							'description' => __( 'Custom store URL', 'dokan-lite' ),
						],
						'setup_wizard_logo' => [
							'type' => 'string',
							'description' => __( 'Setup wizard logo URL', 'dokan-lite' ),
						],
						'disable_welcome_wizard' => [
							'type' => 'boolean',
							'description' => __( 'Disable welcome wizard', 'dokan-lite' ),
						],
						'disable_tracking' => [
							'type' => 'boolean',
							'description' => __( 'Disable tracking', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => $this->get_general_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );

        // Update selling settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/selling/update',
				'name' => __( 'Update Selling Settings', 'dokan-lite' ),
				'description' => __( 'Update Dokan selling settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_selling_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'new_seller_enable_selling' => [
							'type' => 'boolean',
							'description' => __( 'Enable selling for new sellers', 'dokan-lite' ),
						],
						'product_status' => [
							'type' => 'string',
							'enum' => [ 'publish', 'pending', 'draft' ],
							'description' => __( 'Default product status', 'dokan-lite' ),
						],
						'product_style' => [
							'type' => 'string',
							'enum' => [ 'old', 'new' ],
							'description' => __( 'Product form style', 'dokan-lite' ),
						],
						'product_add_mail' => [
							'type' => 'boolean',
							'description' => __( 'Send email on product add', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => $this->get_selling_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );

        // Update withdrawal settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/withdrawal/update',
				'name' => __( 'Update Withdrawal Settings', 'dokan-lite' ),
				'description' => __( 'Update Dokan withdrawal settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_withdrawal_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'withdraw_methods' => [
							'type' => 'array',
							'description' => __( 'Enabled withdrawal methods', 'dokan-lite' ),
							'items' => [
								'type' => 'string',
							],
						],
						'withdraw_limit' => [
							'type' => 'number',
							'description' => __( 'Minimum withdrawal amount', 'dokan-lite' ),
							'minimum' => 0,
						],
						'withdraw_order_status' => [
							'type' => 'array',
							'description' => __( 'Order status for withdrawal', 'dokan-lite' ),
							'items' => [
								'type' => 'string',
							],
						],
					],
				],
				'output_schema' => $this->get_withdrawal_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );

        // Update commission settings
        wp_register_feature(
            [
				'id' => 'dokan/settings/commission/update',
				'name' => __( 'Update Commission Settings', 'dokan-lite' ),
				'description' => __( 'Update Dokan commission settings', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_commission_settings' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_settings' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'commission_type' => [
							'type' => 'string',
							'enum' => [ 'percentage', 'flat' ],
							'description' => __( 'Commission type', 'dokan-lite' ),
						],
						'admin_percentage' => [
							'type' => 'number',
							'description' => __( 'Admin commission percentage', 'dokan-lite' ),
							'minimum' => 0,
							'maximum' => 100,
						],
						'additional_fee' => [
							'type' => 'number',
							'description' => __( 'Additional fee', 'dokan-lite' ),
							'minimum' => 0,
						],
					],
				],
				'output_schema' => $this->get_commission_settings_output_schema(),
				'categories' => [ 'dokan', 'settings', 'marketplace' ],
			]
        );
    }

    /**
     * Get general settings
     *
     * @param array $context
     * @return array
     */
    public function get_general_settings( $context ) {
        return [
            'custom_store_url' => dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ),
            'setup_wizard_logo' => dokan_get_option( 'setup_wizard_logo', 'dokan_general', '' ),
            'disable_welcome_wizard' => dokan_get_option( 'disable_welcome_wizard', 'dokan_general', 'off' ) === 'on',
            'disable_tracking' => dokan_get_option( 'disable_tracking', 'dokan_general', 'off' ) === 'on',
        ];
    }

    /**
     * Get selling settings
     *
     * @param array $context
     * @return array
     */
    public function get_selling_settings( $context ) {
        return [
            'new_seller_enable_selling' => dokan_get_option( 'new_seller_enable_selling', 'dokan_selling', 'off' ) === 'on',
            'product_status' => dokan_get_option( 'product_status', 'dokan_selling', 'pending' ),
            'product_style' => dokan_get_option( 'product_style', 'dokan_selling', 'old' ),
            'product_add_mail' => dokan_get_option( 'product_add_mail', 'dokan_selling', 'off' ) === 'on',
        ];
    }

    /**
     * Get withdrawal settings
     *
     * @param array $context
     * @return array
     */
    public function get_withdrawal_settings( $context ) {
        return [
            'withdraw_methods' => dokan_get_option( 'withdraw_methods', 'dokan_withdraw', [] ),
            'withdraw_limit' => dokan_get_option( 'withdraw_limit', 'dokan_withdraw', 0 ),
            'withdraw_order_status' => dokan_get_option( 'withdraw_order_status', 'dokan_withdraw', [ 'wc-completed' ] ),
        ];
    }

    /**
     * Get commission settings
     *
     * @param array $context
     * @return array
     */
    public function get_commission_settings( $context ) {
        return [
            'commission_type' => dokan_get_option( 'commission_type', 'dokan_selling', 'percentage' ),
            'admin_percentage' => dokan_get_option( 'admin_percentage', 'dokan_selling', 10 ),
            'additional_fee' => dokan_get_option( 'additional_fee', 'dokan_selling', 0 ),
        ];
    }

    /**
     * Update general settings
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_general_settings( $context ) {
        $args = $this->validate_general_settings_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        foreach ( $args as $key => $value ) {
            \dokan_update_option( $key, 'dokan_general', $value );
        }

        // Send notification
        do_action( 'dokan_general_settings_updated', $args );

        return $this->get_general_settings( [] );
    }

    /**
     * Update selling settings
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_selling_settings( $context ) {
        $args = $this->validate_selling_settings_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        foreach ( $args as $key => $value ) {
            dokan_update_option( $key, 'dokan_selling', $value );
        }

        // Send notification
        do_action( 'dokan_selling_settings_updated', $args );

        return $this->get_selling_settings( [] );
    }

    /**
     * Update withdrawal settings
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_withdrawal_settings( $context ) {
        $args = $this->validate_withdrawal_settings_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        foreach ( $args as $key => $value ) {
            dokan_update_option( $key, 'dokan_withdraw', $value );
        }

        // Send notification
        do_action( 'dokan_withdrawal_settings_updated', $args );

        return $this->get_withdrawal_settings( [] );
    }

    /**
     * Update commission settings
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_commission_settings( $context ) {
        $args = $this->validate_commission_settings_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        foreach ( $args as $key => $value ) {
            dokan_update_option( $key, 'dokan_selling', $value );
        }

        // Send notification
        do_action( 'dokan_commission_settings_updated', $args );

        return $this->get_commission_settings( [] );
    }

    /**
     * Validate general settings parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_general_settings_params( $context ) {
        $args = [];

        // Validate custom_store_url
        if ( isset( $context['custom_store_url'] ) ) {
            $args['custom_store_url'] = sanitize_title( $context['custom_store_url'] );
        }

        // Validate setup_wizard_logo
        if ( isset( $context['setup_wizard_logo'] ) ) {
            $args['setup_wizard_logo'] = esc_url_raw( $context['setup_wizard_logo'] );
        }

        // Validate boolean fields
        $boolean_fields = [ 'disable_welcome_wizard', 'disable_tracking' ];
        foreach ( $boolean_fields as $field ) {
            if ( isset( $context[ $field ] ) ) {
                $args[ $field ] = $context[ $field ] ? 'on' : 'off';
            }
        }

        return $args;
    }

    /**
     * Validate selling settings parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_selling_settings_params( $context ) {
        $args = [];

        // Validate product_status
        if ( isset( $context['product_status'] ) ) {
            $valid_statuses = [ 'publish', 'pending', 'draft' ];
            if ( ! in_array( $context['product_status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_product_status', __( 'Invalid product status', 'dokan-lite' ) );
            }
            $args['product_status'] = $context['product_status'];
        }

        // Validate product_style
        if ( isset( $context['product_style'] ) ) {
            $valid_styles = [ 'old', 'new' ];
            if ( ! in_array( $context['product_style'], $valid_styles, true ) ) {
                return new \WP_Error( 'invalid_product_style', __( 'Invalid product style', 'dokan-lite' ) );
            }
            $args['product_style'] = $context['product_style'];
        }

        // Validate boolean fields
        $boolean_fields = [ 'new_seller_enable_selling', 'product_add_mail' ];
        foreach ( $boolean_fields as $field ) {
            if ( isset( $context[ $field ] ) ) {
                $args[ $field ] = $context[ $field ] ? 'on' : 'off';
            }
        }

        return $args;
    }

    /**
     * Validate withdrawal settings parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_withdrawal_settings_params( $context ) {
        $args = [];

        // Validate withdraw_methods
        if ( isset( $context['withdraw_methods'] ) ) {
            if ( ! is_array( $context['withdraw_methods'] ) ) {
                return new \WP_Error( 'invalid_withdraw_methods', __( 'Withdraw methods must be an array', 'dokan-lite' ) );
            }
            $args['withdraw_methods'] = array_map( 'sanitize_text_field', $context['withdraw_methods'] );
        }

        // Validate withdraw_limit
        if ( isset( $context['withdraw_limit'] ) ) {
            $limit = floatval( $context['withdraw_limit'] );
            if ( $limit < 0 ) {
                return new \WP_Error( 'invalid_withdraw_limit', __( 'Withdraw limit must be non-negative', 'dokan-lite' ) );
            }
            $args['withdraw_limit'] = $limit;
        }

        // Validate withdraw_order_status
        if ( isset( $context['withdraw_order_status'] ) ) {
            if ( ! is_array( $context['withdraw_order_status'] ) ) {
                return new \WP_Error( 'invalid_withdraw_order_status', __( 'Withdraw order status must be an array', 'dokan-lite' ) );
            }
            $args['withdraw_order_status'] = array_map( 'sanitize_text_field', $context['withdraw_order_status'] );
        }

        return $args;
    }

    /**
     * Validate commission settings parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    private function validate_commission_settings_params( $context ) {
        $args = [];

        // Validate commission_type
        if ( isset( $context['commission_type'] ) ) {
            $valid_types = [ 'percentage', 'flat' ];
            if ( ! in_array( $context['commission_type'], $valid_types, true ) ) {
                return new \WP_Error( 'invalid_commission_type', __( 'Invalid commission type', 'dokan-lite' ) );
            }
            $args['commission_type'] = $context['commission_type'];
        }

        // Validate admin_percentage
        if ( isset( $context['admin_percentage'] ) ) {
            $percentage = floatval( $context['admin_percentage'] );
            if ( $percentage < 0 || $percentage > 100 ) {
                return new \WP_Error( 'invalid_admin_percentage', __( 'Admin percentage must be between 0 and 100', 'dokan-lite' ) );
            }
            $args['admin_percentage'] = $percentage;
        }

        // Validate additional_fee
        if ( isset( $context['additional_fee'] ) ) {
            $fee = floatval( $context['additional_fee'] );
            if ( $fee < 0 ) {
                return new \WP_Error( 'invalid_additional_fee', __( 'Additional fee must be non-negative', 'dokan-lite' ) );
            }
            $args['additional_fee'] = $fee;
        }

        return $args;
    }

    /**
     * Get general settings output schema
     *
     * @return array
     */
    private function get_general_settings_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'custom_store_url' => [
                    'type' => 'string',
                    'description' => __( 'Custom store URL', 'dokan-lite' ),
                ],
                'setup_wizard_logo' => [
                    'type' => 'string',
                    'description' => __( 'Setup wizard logo URL', 'dokan-lite' ),
                ],
                'disable_welcome_wizard' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether welcome wizard is disabled', 'dokan-lite' ),
                ],
                'disable_tracking' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether tracking is disabled', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get selling settings output schema
     *
     * @return array
     */
    private function get_selling_settings_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'new_seller_enable_selling' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether new sellers can sell immediately', 'dokan-lite' ),
                ],
                'product_status' => [
                    'type' => 'string',
                    'description' => __( 'Default product status', 'dokan-lite' ),
                ],
                'product_style' => [
                    'type' => 'string',
                    'description' => __( 'Product form style', 'dokan-lite' ),
                ],
                'product_add_mail' => [
                    'type' => 'boolean',
                    'description' => __( 'Whether to send email on product add', 'dokan-lite' ),
                ],
            ],
        ];
    }

    /**
     * Get withdrawal settings output schema
     *
     * @return array
     */
    private function get_withdrawal_settings_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'withdraw_methods' => [
                    'type' => 'array',
                    'description' => __( 'Enabled withdrawal methods', 'dokan-lite' ),
                    'items' => [
                        'type' => 'string',
                    ],
                ],
                'withdraw_limit' => [
                    'type' => 'number',
                    'description' => __( 'Minimum withdrawal amount', 'dokan-lite' ),
                ],
                'withdraw_order_status' => [
                    'type' => 'array',
                    'description' => __( 'Order status for withdrawal', 'dokan-lite' ),
                    'items' => [
                        'type' => 'string',
                    ],
                ],
            ],
        ];
    }

    /**
     * Get commission settings output schema
     *
     * @return array
     */
    private function get_commission_settings_output_schema() {
        return [
            'type' => 'object',
            'properties' => [
                'commission_type' => [
                    'type' => 'string',
                    'description' => __( 'Commission type', 'dokan-lite' ),
                ],
                'admin_percentage' => [
                    'type' => 'number',
                    'description' => __( 'Admin commission percentage', 'dokan-lite' ),
                ],
                'additional_fee' => [
                    'type' => 'number',
                    'description' => __( 'Additional fee', 'dokan-lite' ),
                ],
            ],
        ];
    }
}
