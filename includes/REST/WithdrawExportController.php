<?php

namespace WeDevs\Dokan\REST;

use Automattic\WooCommerce\Admin\API\Reports\GenericController;
use Automattic\WooCommerce\Admin\API\Reports\ExportableInterface;
use WeDevs\Dokan\Withdraw\Withdraw;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Dokan Withdraw Export Controller
 *
 * Handles withdraw report exports by implementing ExportableInterface
 * and extending WooCommerce's GenericController.
 *
 * @since 4.1.3
 */
class WithdrawExportController extends GenericController implements ExportableInterface {

    protected $namespace = 'dokan/v1';
    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = '/reports/withdraws';

    /**
     * Get the column names for export.
     *
     * @return array Key value pair of Column ID => Label.
     */
    public function get_export_columns() {
        return array(
            'id'             => __( 'Withdraw ID', 'dokan-lite' ),
            'user_id'        => __( 'Vendor ID', 'dokan-lite' ),
            'vendor_name'    => __( 'Vendor Name', 'dokan-lite' ),
            'amount'         => __( 'Amount', 'dokan-lite' ),
            'payable'        => __( 'Payable', 'dokan-lite' ),
            'date'           => __( 'Date', 'dokan-lite' ),
            'status'         => __( 'Status', 'dokan-lite' ),
            'payment_method' => __( 'Payment Method', 'dokan-lite' ),
            'details'        => __( 'Details', 'dokan-lite' ),
            'note'           => __( 'Note', 'dokan-lite' ),
        );
    }

    /**
     * Get the column values for export.
     *
     * @param array $item Single report item/row.
     * @return array Key value pair of Column ID => Value.
     */
    public function prepare_item_for_export( $item ) {
        $vendor = dokan()->vendor->get( $item['user_id'] );

        return array(
            'id'             => $item['id'],
            'user_id'        => $item['user_id'],
            'vendor_name'    => $vendor->get_name(),
            'amount'         => $item['amount'],
            'payable'        => $item['payable'],
            'date'           => $item['date'],
            'status'         => $item['status'],
            'payment_method' => $item['method'],
            'details'        => $item['details'],
            'note'           => $item['note'],
        );
    }

    /**
     * Get withdraw items for export.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_items( $request ) {
        $args = array(
            'paginate' => true,
        );

        // Parse request parameters
        if ( ! empty( $request['user_id'] ) ) {
            $args['user_id'] = absint( $request['user_id'] );
        }

        if ( ! empty( $request['status'] ) ) {
            $args['status'] = $request['status'];
        }

        if ( ! empty( $request['payment_method'] ) ) {
            $args['method'] = $request['payment_method'];
        }

        if ( ! empty( $request['after'] ) ) {
            $args['after'] = $request['after'];
        }

        if ( ! empty( $request['before'] ) ) {
            $args['before'] = $request['before'];
        }

        // Set pagination
        $args['limit'] = $request['per_page'] ?? 20;
        $args['page'] = $request['page'] ?? 1;

        if ( ! empty( $request['ids'] ) ) {
            $args['ids'] = $request['ids'];
        }

        // Get withdraws
        $withdraws_obj = dokan()->withdraw->all( $args );
        /**
         * @var Withdraw[] $withdraws Withdraws.
         */
        $withdraws = $withdraws_obj->withdraws;
        $total_withdraws = $withdraws_obj->total;

        $data = array();
        foreach ( $withdraws as $withdraw ) {
            $data[] = array(
                'id'      => $withdraw->get_id(),
                'user_id' => $withdraw->get_user_id(),
                'amount'  => $withdraw->get_amount(),
                'payable' => $withdraw->get_receivable_amount(),
                'date'    => $withdraw->get_date(),
                'status'  => $withdraw->get_status(),
                'method'  => $withdraw->get_method(),
                'details' => $withdraw->get_details(),
                'note'    => $withdraw->get_note(),
            );
        }

        $response = rest_ensure_response( $data );

        // Add pagination headers
        $response->header( 'X-WP-Total', absint( $total_withdraws ) );
        $response->header( 'X-WP-TotalPages', absint( $withdraws_obj->max_num_pages ) );

        return $response;
    }

    /**
     * Get the query params for collections.
     *
     * @return array
     */
    public function get_collection_params() {
        $params = parent::get_collection_params();

        $params['user_id'] = array(
            'description'       => __( 'Vendor ID to filter withdraws.', 'dokan-lite' ),
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'validate_callback' => 'rest_validate_request_arg',
        );

        $params['status'] = array(
            'description'       => __( 'Withdraw status to filter by.', 'dokan-lite' ),
            'type'              => 'string',
            'enum'              => array( 'pending', 'approved', 'cancelled' ),
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
        );

        $params['payment_method'] = array(
            'description'       => __( 'Payment method to filter by.', 'dokan-lite' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => 'rest_validate_request_arg',
        );

        $params['after'] = array(
            'description'       => __( 'Date after which to filter withdraws (ISO 8601 format).', 'dokan-lite' ),
            'type'              => 'string',
            'format'            => 'date-time',
            'validate_callback' => 'rest_validate_request_arg',
        );

        $params['before'] = array(
            'description'       => __( 'Date before which to filter withdraws (ISO 8601 format).', 'dokan-lite' ),
            'type'              => 'string',
            'format'            => 'date-time',
            'validate_callback' => 'rest_validate_request_arg',
        );

        return $params;
    }

    /**
     * Check if a given request has access to read items.
     *
     * @param  \WP_REST_Request $request Full details about the request.
     * @return \WP_Error|boolean
     */
    public function get_items_permissions_check( $request ) {
        if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'dokan_view_reports' ) ) {
            return new \WP_Error( 'woocommerce_rest_cannot_view', __( 'Sorry, you cannot list resources.', 'dokan-lite' ), array( 'status' => rest_authorization_required_code() ) );
        }

        return true;
    }
}
