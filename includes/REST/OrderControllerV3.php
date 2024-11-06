<?php

namespace WeDevs\Dokan\REST;

use WC_Data_Store;
use WP_Error;
use WP_REST_Server;

/**
* Dokan Order ControllerV3 Class
*
* @since DOKAN_SINCE
*
* @package dokan
*/
class OrderControllerV3 extends OrderControllerV2 {

    /**
     * Endpoint namespace
     *
     * @since DOKAN_SINCE
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Get Order Downloads.
     *
     * @since DOKAN_SINCE
     *
     * @param  \WP_REST_Request $requests Request object.
     *
     * @return WP_Error|\WP_HTTP_Response|\WP_REST_Response
     */
    public function get_order_downloads( $requests ) {
        $response = parent::get_order_downloads( $requests );
        $data = $response->get_data();
        $downloads = $data['downloads'];
        $updated_response = [];

        foreach ( $downloads as $download ) {
            $product = dokan()->product->get( $download->product_id );
            $download->product = [
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'slug' => $product->get_slug(),
                'link' => $product->get_permalink(),
            ];

            /**
             * @var $file \WC_Product_Download
             */
            $file = $product->get_file( $download->download_id );
            $download->file_data = $file->get_data();
            $download->file_data['file_title'] = wc_get_filename_from_url( $product->get_file_download_path( $download->download_id ) );

            $updated_response[] = $download;
        }

        return rest_ensure_response( $updated_response );
    }
}
