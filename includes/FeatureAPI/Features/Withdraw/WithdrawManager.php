<?php
/**
 * Withdraw Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Withdraw
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Withdraw;

use WeDevs\Dokan\FeatureAPI\Schemas\WithdrawSchema;
use WeDevs\Dokan\FeatureAPI\Validators\WithdrawValidator;
use WeDevs\Dokan\FeatureAPI\Permissions\AdminPermissions;
use WP_Feature as FeatureTypes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Withdraw Manager
 *
 * @since 4.0.0
 */
class WithdrawManager {

    /**
     * Register withdraw features
     */
    public function register_features() {
        $this->register_withdraw_resources();
        $this->register_withdraw_tools();
    }

    /**
     * Register withdraw resource features (read-only)
     */
    private function register_withdraw_resources() {
        // List withdrawals
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/list',
				'name' => __( 'List Withdrawals', 'dokan-lite' ),
				'description' => __( 'Get a list of all withdrawals with filtering options', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_withdrawals_list' ],
				'permission_callback' => [ AdminPermissions::class, 'can_manage_withdrawals' ],
				'input_schema' => WithdrawSchema::get_withdrawals_list_schema(),
				'output_schema' => WithdrawSchema::get_withdrawals_list_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );

        // Get single withdrawal
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/get',
				'name' => __( 'Get Withdrawal', 'dokan-lite' ),
				'description' => __( 'Get details of a specific withdrawal', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_withdrawal' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_withdrawal' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Withdrawal ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawal_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );

        // Get vendor withdrawals
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/vendor-withdrawals',
				'name' => __( 'Get Vendor Withdrawals', 'dokan-lite' ),
				'description' => __( 'Get withdrawals for a specific vendor', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_vendor_withdrawals' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_vendor_withdrawals' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
						'number' => [
							'type' => 'integer',
							'description' => __( 'Number of withdrawals to return', 'dokan-lite' ),
							'minimum' => 1,
							'maximum' => 100,
							'default' => 10,
						],
						'offset' => [
							'type' => 'integer',
							'description' => __( 'Number of withdrawals to skip', 'dokan-lite' ),
							'minimum' => 0,
							'default' => 0,
						],
						'status' => [
							'type' => 'string',
							'enum' => [ 'pending', 'approved', 'cancelled' ],
							'description' => __( 'Withdrawal status', 'dokan-lite' ),
						],
						'date_from' => [
							'type' => 'string',
							'format' => 'date',
							'description' => __( 'Start date (YYYY-MM-DD)', 'dokan-lite' ),
						],
						'date_to' => [
							'type' => 'string',
							'format' => 'date',
							'description' => __( 'End date (YYYY-MM-DD)', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawals_list_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'vendor', 'marketplace' ],
			]
        );

        // Get withdrawal methods
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/methods',
				'name' => __( 'Get Withdrawal Methods', 'dokan-lite' ),
				'description' => __( 'Get available withdrawal methods', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_withdrawal_methods' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_withdrawal_methods' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Filter by vendor ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawal_methods_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );
    }

    /**
     * Register withdraw tool features (update, modify)
     */
    private function register_withdraw_tools() {
        // Create withdrawal request
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/create',
				'name' => __( 'Create Withdrawal Request', 'dokan-lite' ),
				'description' => __( 'Create a new withdrawal request', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'create_withdrawal' ],
				'permission_callback' => [ AdminPermissions::class, 'can_create_withdrawal' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'vendor_id', 'amount', 'method' ],
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Vendor ID', 'dokan-lite' ),
						],
						'amount' => [
							'type' => 'number',
							'description' => __( 'Withdrawal amount', 'dokan-lite' ),
							'minimum' => 0,
						],
						'method' => [
							'type' => 'string',
							'description' => __( 'Withdrawal method', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Withdrawal note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawal_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );

        // Update withdrawal
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/update',
				'name' => __( 'Update Withdrawal', 'dokan-lite' ),
				'description' => __( 'Update withdrawal details', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_withdrawal' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_withdrawal' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Withdrawal ID', 'dokan-lite' ),
						],
						'amount' => [
							'type' => 'number',
							'description' => __( 'Withdrawal amount', 'dokan-lite' ),
							'minimum' => 0,
						],
						'status' => [
							'type' => 'string',
							'enum' => [ 'pending', 'approved', 'cancelled' ],
							'description' => __( 'Withdrawal status', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Withdrawal note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawal_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );

        // Approve withdrawal
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/approve',
				'name' => __( 'Approve Withdrawal', 'dokan-lite' ),
				'description' => __( 'Approve a withdrawal request', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'approve_withdrawal' ],
				'permission_callback' => [ AdminPermissions::class, 'can_approve_withdrawal' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Withdrawal ID', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Approval note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawal_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );

        // Cancel withdrawal
        wp_register_feature(
            [
				'id' => 'dokan/withdrawals/cancel',
				'name' => __( 'Cancel Withdrawal', 'dokan-lite' ),
				'description' => __( 'Cancel a withdrawal request', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'cancel_withdrawal' ],
				'permission_callback' => [ AdminPermissions::class, 'can_cancel_withdrawal' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Withdrawal ID', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Cancellation note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => WithdrawSchema::get_withdrawal_output_schema(),
				'categories' => [ 'dokan', 'withdraw', 'marketplace' ],
			]
        );
    }

    /**
     * Get withdrawals list
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_withdrawals_list( $context ) {
        $validator = new WithdrawValidator();
        $args = $validator->validate_list_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        $query_args = [
            'post_type' => 'dokan_withdraw',
            'post_status' => $args['status'] ?? 'any',
            'posts_per_page' => $args['number'] ?? 10,
            'paged' => ( $args['offset'] ?? 0 ) / ( $args['number'] ?? 10 ) + 1,
            'orderby' => $args['orderby'] ?? 'date',
            'order' => $args['order'] ?? 'DESC',
        ];

        // Add vendor filter if specified
        if ( ! empty( $args['vendor_id'] ) ) {
            $query_args['author'] = $args['vendor_id'];
        }

        // Add date range filter
        if ( ! empty( $args['date_from'] ) || ! empty( $args['date_to'] ) ) {
            $date_query = [];
            if ( ! empty( $args['date_from'] ) ) {
                $date_query['after'] = $args['date_from'];
            }
            if ( ! empty( $args['date_to'] ) ) {
                $date_query['before'] = $args['date_to'];
            }
            $query_args['date_query'] = $date_query;
        }

        $query = new \WP_Query( $query_args );
        $withdrawals = [];

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $withdrawal = $this->get_withdrawal_data( get_the_ID() );
                if ( $withdrawal ) {
                    $withdrawals[] = $withdrawal;
                }
            }
        }

        wp_reset_postdata();

        return [
            'withdrawals' => $withdrawals,
            'total' => $query->found_posts,
            'total_pages' => $query->max_num_pages,
            'current_page' => $query->get( 'paged' ),
        ];
    }

    /**
     * Get single withdrawal
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_withdrawal( $context ) {
        $withdrawal_id = absint( $context['id'] );
        $withdrawal = $this->get_withdrawal_data( $withdrawal_id );

        if ( ! $withdrawal ) {
            return new \WP_Error( 'withdrawal_not_found', __( 'Withdrawal not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $withdrawal;
    }

    /**
     * Get vendor withdrawals
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_vendor_withdrawals( $context ) {
        $vendor_id = absint( $context['vendor_id'] );

        // Check if vendor exists
        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $context['vendor_id'] = $vendor_id;
        return $this->get_withdrawals_list( $context );
    }

    /**
     * Get withdrawal methods
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_withdrawal_methods( $context ) {
        $vendor_id = isset( $context['vendor_id'] ) ? absint( $context['vendor_id'] ) : 0;

        // Get available withdrawal methods
        $methods = dokan_withdraw_get_methods();
        $available_methods = [];

        foreach ( $methods as $method_key => $method_label ) {
            $available_methods[] = [
                'key' => $method_key,
                'label' => $method_label,
                'enabled' => dokan_withdraw_is_method_enabled( $method_key ),
            ];
        }

        return [
            'methods' => $available_methods,
            'vendor_id' => $vendor_id,
        ];
    }

    /**
     * Create withdrawal
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function create_withdrawal( $context ) {
        $validator = new WithdrawValidator();

        error_log( 'Request Params' . print_r( $context, true ) );
        $args = $validator->validate_create_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        // Check if vendor exists
        if ( ! dokan_is_user_seller( $args['vendor_id'] ) ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Check if method is enabled
        // if ( ! dokan_withdraw_is_method_enabled( $args['method'] ) ) {
        //     return new \WP_Error( 'method_disabled', __( 'Withdrawal method is disabled', 'dokan-lite' ), [ 'status' => 400 ] );
        // }

        // Create withdrawal post
        $withdrawal_data = [
            'post_title' => sprintf( __( 'Withdrawal request for vendor %d', 'dokan-lite' ), $args['vendor_id'] ),
            'post_content' => $args['note'] ?? '',
            'post_status' => 'pending',
            'post_type' => 'dokan_withdraw',
            'post_author' => $args['vendor_id'],
        ];

        $withdrawal_id = wp_insert_post( $withdrawal_data );

        if ( is_wp_error( $withdrawal_id ) ) {
            return $withdrawal_id;
        }

        // Save withdrawal meta
        update_post_meta( $withdrawal_id, '_withdraw_amount', $args['amount'] );
        update_post_meta( $withdrawal_id, '_withdraw_method', $args['method'] );

        // Send notification
        do_action( 'dokan_withdrawal_created', $withdrawal_id, $args );

        return $this->get_withdrawal_data( $withdrawal_id );
    }

    /**
     * Update withdrawal
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_withdrawal( $context ) {
        $withdrawal_id = absint( $context['id'] );
        $withdrawal = get_post( $withdrawal_id );

        if ( ! $withdrawal || $withdrawal->post_type !== 'dokan_withdraw' ) {
            return new \WP_Error( 'withdrawal_not_found', __( 'Withdrawal not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $validator = new WithdrawValidator();
        $args = $validator->validate_update_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        // Update withdrawal data
        if ( isset( $args['amount'] ) ) {
            update_post_meta( $withdrawal_id, '_withdraw_amount', $args['amount'] );
        }

        if ( isset( $args['status'] ) ) {
            wp_update_post(
                [
					'ID' => $withdrawal_id,
					'post_status' => $args['status'],
				]
            );
        }

        if ( isset( $args['note'] ) ) {
            wp_update_post(
                [
					'ID' => $withdrawal_id,
					'post_content' => $args['note'],
				]
            );
        }

        // Send notification
        do_action( 'dokan_withdrawal_updated', $withdrawal_id, $args );

        return $this->get_withdrawal_data( $withdrawal_id );
    }

    /**
     * Approve withdrawal
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function approve_withdrawal( $context ) {
        $withdrawal_id = absint( $context['id'] );
        $note = isset( $context['note'] ) ? sanitize_textarea_field( $context['note'] ) : '';

        $withdrawal = get_post( $withdrawal_id );
        if ( ! $withdrawal || $withdrawal->post_type !== 'dokan_withdraw' ) {
            return new \WP_Error( 'withdrawal_not_found', __( 'Withdrawal not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Update status to approved
        wp_update_post(
            [
				'ID' => $withdrawal_id,
				'post_status' => 'approved',
				'post_content' => $note,
			]
        );

        // Send notification
        do_action( 'dokan_withdrawal_approved', $withdrawal_id, $note );

        return $this->get_withdrawal_data( $withdrawal_id );
    }

    /**
     * Cancel withdrawal
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function cancel_withdrawal( $context ) {
        $withdrawal_id = absint( $context['id'] );
        $note = isset( $context['note'] ) ? sanitize_textarea_field( $context['note'] ) : '';

        $withdrawal = get_post( $withdrawal_id );
        if ( ! $withdrawal || $withdrawal->post_type !== 'dokan_withdraw' ) {
            return new \WP_Error( 'withdrawal_not_found', __( 'Withdrawal not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Update status to cancelled
        wp_update_post(
            [
				'ID' => $withdrawal_id,
				'post_status' => 'cancelled',
				'post_content' => $note,
			]
        );

        // Send notification
        do_action( 'dokan_withdrawal_cancelled', $withdrawal_id, $note );

        return $this->get_withdrawal_data( $withdrawal_id );
    }

    /**
     * Get withdrawal data
     *
     * @param int $withdrawal_id
     * @return array|null
     */
    private function get_withdrawal_data( $withdrawal_id ) {
        $withdrawal = get_post( $withdrawal_id );
        if ( ! $withdrawal || $withdrawal->post_type !== 'dokan_withdraw' ) {
            return null;
        }

        $vendor_id = $withdrawal->post_author;
        $amount = get_post_meta( $withdrawal_id, '_withdraw_amount', true );
        $method = get_post_meta( $withdrawal_id, '_withdraw_method', true );

        return [
            'id' => $withdrawal_id,
            'vendor_id' => $vendor_id,
            'vendor_name' => dokan_get_store_info( $vendor_id, 'store_name' ),
            'amount' => $amount,
            'method' => $method,
            'method_label' => dokan_withdraw_get_method_label( $method ),
            'status' => $withdrawal->post_status,
            'date_created' => $withdrawal->post_date,
            'date_modified' => $withdrawal->post_modified,
            'note' => $withdrawal->post_content,
        ];
    }
}
