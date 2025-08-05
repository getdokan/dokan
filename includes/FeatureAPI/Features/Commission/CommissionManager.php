<?php
/**
 * Commission Feature Manager
 *
 * @package WeDevs\Dokan\FeatureAPI\Features\Commission
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Features\Commission;

use WeDevs\Dokan\FeatureAPI\Schemas\CommissionSchema;
use WeDevs\Dokan\FeatureAPI\Validators\CommissionValidator;
use WeDevs\Dokan\FeatureAPI\Permissions\AdminPermissions;
use WP_Feature as FeatureTypes;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Commission Manager
 *
 * @since 4.0.0
 */
class CommissionManager {

    /**
     * Register commission features
     */
    public function register_features() {
        $this->register_commission_resources();
        $this->register_commission_tools();
    }

    /**
     * Register commission resource features (read-only)
     */
    private function register_commission_resources() {
        // List commissions
        wp_register_feature(
            [
				'id' => 'dokan/commissions/list',
				'name' => __( 'List Commissions', 'dokan-lite' ),
				'description' => __( 'Get a list of all commissions with filtering options', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_commissions_list' ],
				'permission_callback' => [ AdminPermissions::class, 'can_manage_commissions' ],
				'input_schema' => CommissionSchema::get_commissions_list_schema(),
				'output_schema' => CommissionSchema::get_commissions_list_output_schema(),
				'categories' => [ 'dokan', 'commission', 'marketplace' ],
			]
        );

        // Get single commission
        wp_register_feature(
            [
				'id' => 'dokan/commissions/get',
				'name' => __( 'Get Commission', 'dokan-lite' ),
				'description' => __( 'Get details of a specific commission', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_commission' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_commission' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Commission ID', 'dokan-lite' ),
						],
					],
				],
				'output_schema' => CommissionSchema::get_commission_output_schema(),
				'categories' => [ 'dokan', 'commission', 'marketplace' ],
			]
        );

        // Get vendor commissions
        wp_register_feature(
            [
				'id' => 'dokan/commissions/vendor-commission',
				'name' => __( 'Get Vendor Commissions', 'dokan-lite' ),
				'description' => __( 'Get commissions for a specific vendor', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_vendor_commissions' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_vendor_commissions' ],
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
							'description' => __( 'Number of commissions to return', 'dokan-lite' ),
							'minimum' => 1,
							'maximum' => 100,
							'default' => 10,
						],
						'offset' => [
							'type' => 'integer',
							'description' => __( 'Number of commissions to skip', 'dokan-lite' ),
							'minimum' => 0,
							'default' => 0,
						],
						'status' => [
							'type' => 'string',
							'enum' => [ 'pending', 'approved', 'cancelled' ],
							'description' => __( 'Commission status', 'dokan-lite' ),
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
				'output_schema' => CommissionSchema::get_commissions_list_output_schema(),
				'categories' => [ 'dokan', 'commission', 'vendor', 'marketplace' ],
			]
        );

        // Get commission summary
        wp_register_feature(
            [
				'id' => 'dokan/commissions/summary',
				'name' => __( 'Get Commission Summary', 'dokan-lite' ),
				'description' => __( 'Get commission summary statistics', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_RESOURCE,
				'callback' => [ $this, 'get_commission_summary' ],
				'permission_callback' => [ AdminPermissions::class, 'can_view_commission_summary' ],
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'vendor_id' => [
							'type' => 'integer',
							'description' => __( 'Filter by vendor ID', 'dokan-lite' ),
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
				'output_schema' => CommissionSchema::get_commission_summary_output_schema(),
				'categories' => [ 'dokan', 'commission', 'analytics', 'marketplace' ],
			]
        );
    }

    /**
     * Register commission tool features (update, modify)
     */
    private function register_commission_tools() {
        // Update commission
        wp_register_feature(
            [
				'id' => 'dokan/commissions/update',
				'name' => __( 'Update Commission', 'dokan-lite' ),
				'description' => __( 'Update commission details', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'update_commission' ],
				'permission_callback' => [ AdminPermissions::class, 'can_update_commission' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Commission ID', 'dokan-lite' ),
						],
						'amount' => [
							'type' => 'number',
							'description' => __( 'Commission amount', 'dokan-lite' ),
							'minimum' => 0,
						],
						'status' => [
							'type' => 'string',
							'enum' => [ 'pending', 'approved', 'cancelled' ],
							'description' => __( 'Commission status', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Commission note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => CommissionSchema::get_commission_output_schema(),
				'categories' => [ 'dokan', 'commission', 'marketplace' ],
			]
        );

        // Approve commission
        wp_register_feature(
            [
				'id' => 'dokan/commissions/approve',
				'name' => __( 'Approve Commission', 'dokan-lite' ),
				'description' => __( 'Approve a commission', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'approve_commission' ],
				'permission_callback' => [ AdminPermissions::class, 'can_approve_commission' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Commission ID', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Approval note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => CommissionSchema::get_commission_output_schema(),
				'categories' => [ 'dokan', 'commission', 'marketplace' ],
			]
        );

        // Cancel commission
        wp_register_feature(
            [
				'id' => 'dokan/commissions/cancel',
				'name' => __( 'Cancel Commission', 'dokan-lite' ),
				'description' => __( 'Cancel a commission', 'dokan-lite' ),
				'type' => FeatureTypes::TYPE_TOOL,
				'callback' => [ $this, 'cancel_commission' ],
				'permission_callback' => [ AdminPermissions::class, 'can_cancel_commission' ],
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'id' ],
					'properties' => [
						'id' => [
							'type' => 'integer',
							'description' => __( 'Commission ID', 'dokan-lite' ),
						],
						'note' => [
							'type' => 'string',
							'description' => __( 'Cancellation note', 'dokan-lite' ),
							'maxLength' => 500,
						],
					],
				],
				'output_schema' => CommissionSchema::get_commission_output_schema(),
				'categories' => [ 'dokan', 'commission', 'marketplace' ],
			]
        );
    }

    /**
     * Get commissions list
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_commissions_list( $context ) {
        $validator = new CommissionValidator();
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
        $commissions = [];

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $commission = $this->get_commission_data( get_the_ID() );
                if ( $commission ) {
                    $commissions[] = $commission;
                }
            }
        }

        wp_reset_postdata();

        return [
            'commissions' => $commissions,
            'total' => $query->found_posts,
            'total_pages' => $query->max_num_pages,
            'current_page' => $query->get( 'paged' ),
        ];
    }

    /**
     * Get single commission
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_commission( $context ) {
        $commission_id = absint( $context['id'] );
        $commission = $this->get_commission_data( $commission_id );

        if ( ! $commission ) {
            return new \WP_Error( 'commission_not_found', __( 'Commission not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        return $commission;
    }

    /**
     * Get vendor commissions
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_vendor_commissions( $context ) {
        $vendor_id = absint( $context['vendor_id'] );

        // Check if vendor exists
        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'vendor_not_found', __( 'Vendor not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $context['vendor_id'] = $vendor_id;
        return $this->get_commissions_list( $context );
    }

    /**
     * Get commission summary
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function get_commission_summary( $context ) {
        $vendor_id = isset( $context['vendor_id'] ) ? absint( $context['vendor_id'] ) : 0;
        $date_from = isset( $context['date_from'] ) ? sanitize_text_field( $context['date_from'] ) : '';
        $date_to = isset( $context['date_to'] ) ? sanitize_text_field( $context['date_to'] ) : '';

        // Get commission statistics
        $total_commission = $this->get_total_commission( $vendor_id, $date_from, $date_to );
        $pending_commission = $this->get_pending_commission( $vendor_id, $date_from, $date_to );
        $approved_commission = $this->get_approved_commission( $vendor_id, $date_from, $date_to );
        $cancelled_commission = $this->get_cancelled_commission( $vendor_id, $date_from, $date_to );

        return [
            'total_commission' => $total_commission,
            'pending_commission' => $pending_commission,
            'approved_commission' => $approved_commission,
            'cancelled_commission' => $cancelled_commission,
            'period' => [
                'from' => $date_from,
                'to' => $date_to,
            ],
            'vendor_id' => $vendor_id,
        ];
    }

    /**
     * Update commission
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function update_commission( $context ) {
        $commission_id = absint( $context['id'] );
        $commission = get_post( $commission_id );

        if ( ! $commission || $commission->post_type !== 'dokan_withdraw' ) {
            return new \WP_Error( 'commission_not_found', __( 'Commission not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        $validator = new CommissionValidator();
        $args = $validator->validate_update_params( $context );

        if ( is_wp_error( $args ) ) {
            return $args;
        }

        // Update commission data
        if ( isset( $args['amount'] ) ) {
            update_post_meta( $commission_id, '_withdraw_amount', $args['amount'] );
        }

        if ( isset( $args['status'] ) ) {
            wp_update_post(
                [
					'ID' => $commission_id,
					'post_status' => $args['status'],
				]
            );
        }

        if ( isset( $args['note'] ) ) {
            wp_update_comment(
                [
					'comment_ID' => $commission_id,
					'comment_content' => $args['note'],
				]
            );
        }

        // Send notification
        do_action( 'dokan_commission_updated', $commission_id, $args );

        return $this->get_commission_data( $commission_id );
    }

    /**
     * Approve commission
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function approve_commission( $context ) {
        $commission_id = absint( $context['id'] );
        $note = isset( $context['note'] ) ? sanitize_textarea_field( $context['note'] ) : '';

        $commission = get_post( $commission_id );
        if ( ! $commission || $commission->post_type !== 'dokan_withdraw' ) {
            return new \WP_Error( 'commission_not_found', __( 'Commission not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Update status to approved
        wp_update_post(
            [
				'ID' => $commission_id,
				'post_status' => 'approved',
			]
        );

        // Add note if provided
        if ( ! empty( $note ) ) {
            wp_insert_comment(
                [
					'comment_post_ID' => $commission_id,
					'comment_content' => $note,
					'comment_type' => 'withdraw_note',
					'user_id' => get_current_user_id(),
				]
            );
        }

        // Send notification
        do_action( 'dokan_commission_approved', $commission_id, $note );

        return $this->get_commission_data( $commission_id );
    }

    /**
     * Cancel commission
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function cancel_commission( $context ) {
        $commission_id = absint( $context['id'] );
        $note = isset( $context['note'] ) ? sanitize_textarea_field( $context['note'] ) : '';

        $commission = get_post( $commission_id );
        if ( ! $commission || $commission->post_type !== 'dokan_withdraw' ) {
            return new \WP_Error( 'commission_not_found', __( 'Commission not found', 'dokan-lite' ), [ 'status' => 404 ] );
        }

        // Update status to cancelled
        wp_update_post(
            [
				'ID' => $commission_id,
				'post_status' => 'cancelled',
			]
        );

        // Add note if provided
        if ( ! empty( $note ) ) {
            wp_insert_comment(
                [
					'comment_post_ID' => $commission_id,
					'comment_content' => $note,
					'comment_type' => 'withdraw_note',
					'user_id' => get_current_user_id(),
				]
            );
        }

        // Send notification
        do_action( 'dokan_commission_cancelled', $commission_id, $note );

        return $this->get_commission_data( $commission_id );
    }

    /**
     * Get commission data
     *
     * @param int $commission_id
     * @return array|null
     */
    private function get_commission_data( $commission_id ) {
        $commission = get_post( $commission_id );
        if ( ! $commission || $commission->post_type !== 'dokan_withdraw' ) {
            return null;
        }

        $vendor_id = $commission->post_author;
        $amount = get_post_meta( $commission_id, '_withdraw_amount', true );
        $method = get_post_meta( $commission_id, '_withdraw_method', true );

        return [
            'id' => $commission_id,
            'vendor_id' => $vendor_id,
            'vendor_name' => dokan_get_store_info( $vendor_id, 'store_name' ),
            'amount' => $amount,
            'method' => $method,
            'status' => $commission->post_status,
            'date_created' => $commission->post_date,
            'date_modified' => $commission->post_modified,
            'note' => $commission->post_content,
        ];
    }

    /**
     * Get total commission
     *
     * @param int $vendor_id
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_total_commission( $vendor_id = 0, $date_from = '', $date_to = '' ) {
        return $this->get_commission_sum( $vendor_id, 'any', $date_from, $date_to );
    }

    /**
     * Get pending commission
     *
     * @param int $vendor_id
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_pending_commission( $vendor_id = 0, $date_from = '', $date_to = '' ) {
        return $this->get_commission_sum( $vendor_id, 'pending', $date_from, $date_to );
    }

    /**
     * Get approved commission
     *
     * @param int $vendor_id
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_approved_commission( $vendor_id = 0, $date_from = '', $date_to = '' ) {
        return $this->get_commission_sum( $vendor_id, 'approved', $date_from, $date_to );
    }

    /**
     * Get cancelled commission
     *
     * @param int $vendor_id
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_cancelled_commission( $vendor_id = 0, $date_from = '', $date_to = '' ) {
        return $this->get_commission_sum( $vendor_id, 'cancelled', $date_from, $date_to );
    }

    /**
     * Get commission sum
     *
     * @param int $vendor_id
     * @param string $status
     * @param string $date_from
     * @param string $date_to
     * @return float
     */
    private function get_commission_sum( $vendor_id = 0, $status = 'any', $date_from = '', $date_to = '' ) {
        global $wpdb;

        $where_conditions = [ "p.post_type = 'dokan_withdraw'" ];

        if ( $vendor_id > 0 ) {
            $where_conditions[] = $wpdb->prepare( 'p.post_author = %d', $vendor_id );
        }

        if ( $status !== 'any' ) {
            $where_conditions[] = $wpdb->prepare( 'p.post_status = %s', $status );
        }

        if ( ! empty( $date_from ) ) {
            $where_conditions[] = $wpdb->prepare( 'p.post_date >= %s', $date_from );
        }

        if ( ! empty( $date_to ) ) {
            $where_conditions[] = $wpdb->prepare( 'p.post_date <= %s', $date_to );
        }

        $where_clause = implode( ' AND ', $where_conditions );

        $query = "
            SELECT SUM(CAST(pm.meta_value AS DECIMAL(10,2))) as total
            FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE pm.meta_key = '_withdraw_amount'
            AND {$where_clause}
        ";

        $result = $wpdb->get_var( $query );
        return $result ? floatval( $result ) : 0.0;
    }
}
