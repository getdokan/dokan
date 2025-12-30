<?php

namespace WeDevs\Dokan\REST;

use Automattic\WooCommerce\Admin\API\Reports\Export\Controller;
use Automattic\WooCommerce\Admin\ReportExporter;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Dokan Export Controller
 *
 * Extends WooCommerce's Export Controller to provide export functionality
 * for Dokan specific reports like withdraws.
 *
 * @since 4.1.3
 */
class ExportController extends Controller {
	protected $namespace = 'dokan/v1';
    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = '/reports/(?P<type>[a-z]+)/export';

    /**
     * Generate filename based on filters.
     *
     * @param array $filters
     * @return string
     */
    protected function generate_filename( $filters = [] ) {
        $parts = [ 'dokan-withdraw-log' ];

        // Add vendor name if filtered by user_id.
        if ( ! empty( $filters['user_id'] ) ) {
            $store_info = dokan_get_store_info( absint( $filters['user_id'] ) );
            $store_name = ! empty( $store_info['store_name'] )
                ? sanitize_title( $store_info['store_name'] )
                : 'vendor-' . absint( $filters['user_id'] );

            // Truncate if too long (max 50 chars for store name part).
            if ( strlen( $store_name ) > 50 ) {
                $store_name = substr( $store_name, 0, 44 ) . '-trunc';
            }

            $parts[] = $store_name;
        }

        // Add status if filtered.
        if ( ! empty( $filters['status'] ) ) {
            $parts[] = sanitize_title( $filters['status'] );
        }

        // Add payment method if filtered.
        if ( ! empty( $filters['payment_method'] ) ) {
            $parts[] = sanitize_title( $filters['payment_method'] );
        }

        // Add date range if both start and end dates are provided.
        $start_date = $filters['start_date'] ?? $filters['after'] ?? '';
        $end_date   = $filters['end_date'] ?? $filters['before'] ?? '';

        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $start_timestamp = strtotime( $start_date );
            $end_timestamp   = strtotime( $end_date );

            // Only add if both dates are valid timestamps.
            if ( $start_timestamp && $end_timestamp ) {
                $start   = strtolower( wp_date( 'Y-M-d', $start_timestamp ) );
                $end     = strtolower( wp_date( 'Y-M-d', $end_timestamp ) );
                $parts[] = $start . '_to_' . $end;
            }
        }

        return implode( '_', $parts );
    }

    /**
     * Export data based on user request params.
     *
     * @param  \WP_REST_Request $request Request data.
     * @return \WP_Error|\WP_REST_Response
     */
    public function export_items( $request ) {
        // Call parent to handle export queueing.
        $response = parent::export_items( $request );

        // Grab the ID and save our custom filename
        if ( ! is_wp_error( $response ) ) {
            $data = $response->get_data();

            if ( ! empty( $data['export_id'] ) ) {
                $report_args     = empty( $request['report_args'] ) ? array() : $request['report_args'];
                $custom_filename = $this->generate_filename( $report_args );

                // Store custom filename for retrieval during status check.
                set_transient( 'dokan_export_filename_' . $data['export_id'], $custom_filename, 24 * HOUR_IN_SECONDS );
            }
        }

        return $response;
    }

    /**
     * Register routes.
     *
     * @since 4.1.3
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'export_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                    'args'                => $this->get_export_collection_params(),
                ),
                'schema' => array( $this, 'get_export_public_schema' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/(?P<export_id>[a-z0-9]+)/status',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'export_status' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                'schema' => array( $this, 'get_export_status_public_schema' ),
            )
        );
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
    /**
     * Export status based on user request params.
     *
     * @param  \WP_REST_Request $request Request data.
     * @return \WP_Error|\WP_REST_Response
     */
    public function export_status( $request ) {
        $response = parent::export_status( $request );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $data = $response->get_data();

        if ( isset( $data['percent_complete'] ) && 100 === $data['percent_complete'] ) {
            $report_type = $request['type'];
            $export_id   = $request['export_id'];

            // Define filenames without extension for URL replacement.
            $default_filename = "wc-{$report_type}-report-export-{$export_id}";
            
            // Retrieve custom filename from transient or fall back to previous default
            $custom_base_name = get_transient( 'dokan_export_filename_' . $export_id );
            if ( ! $custom_base_name ) {
                $custom_base_name = "dokan-{$report_type}-report-export-{$export_id}";
            }
            
            $new_filename = $custom_base_name;


            // Get reports directory
            $reports_dir  = \Automattic\WooCommerce\Admin\ReportCSVExporter::get_reports_directory();
            $default_path = $reports_dir . $default_filename . '.csv';
            $new_path     = $reports_dir . $new_filename . '.csv';
            
            $default_headers_path = $reports_dir . $default_filename . '.csv.headers';
            $new_headers_path     = $reports_dir . $new_filename . '.csv.headers';

            // Check if already renamed
            if ( file_exists( $new_path ) ) {
                 if ( ! empty( $data['download_url'] ) ) {
                    $data['download_url'] = str_replace( $default_filename, $new_filename, $data['download_url'] );
                    $response->set_data( $data );
                }
            } elseif ( file_exists( $default_path ) ) {
                rename( $default_path, $new_path );
                
                if ( file_exists( $default_headers_path ) ) {
                    rename( $default_headers_path, $new_headers_path );
                }

                if ( ! empty( $data['download_url'] ) ) {
                    $data['download_url'] = str_replace( $default_filename, $new_filename, $data['download_url'] );
                    $response->set_data( $data );
                }
            }
        }

        return $response;
    }
}
