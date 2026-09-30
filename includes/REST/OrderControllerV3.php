<?php

namespace WeDevs\Dokan\REST;

/**
 * Dokan Order ControllerV3 Class
 *
 * @since   4.0.0
 *
 * @package dokan
 */
class OrderControllerV3 extends OrderControllerV2 {

    /**
     * Endpoint namespace
     *
     * @since 4.0.0
     *
     * @var string
     */
    protected $namespace = 'dokan/v3';

    /**
     * Attach product and file details to each download permission.
     *
     * @since 4.0.0
     * @since DOKAN_SINCE Skips permissions whose product or file is gone instead of fataling.
     *
     * @param \stdClass[]   $downloads Permissions already run through prepare_download_for_response(), so `product_id` lives in `product['id']`.
     * @param \WC_Product[] $products  Keyed by product ID.
     *
     * @return array
     */
    protected function format_downloads_data( $downloads, $products ) {
        $updated_response = [];

        foreach ( $downloads as $download ) {
            $product = $products[ absint( $download->product['id'] ?? 0 ) ] ?? null;
            $file    = $product ? $product->get_file( $download->download_id ) : false;

            if ( ! $file ) {
                continue;
            }

            $download->product = [
                'id'   => $product->get_id(),
                'name' => $product->get_name(),
                'slug' => $product->get_slug(),
                'link' => $product->get_permalink(),
            ];

            $download->file_data               = $file->get_data();
            $download->file_data['file_title'] = wc_get_filename_from_url( $product->get_file_download_path( $download->download_id ) );

            $updated_response[] = $download;
        }

        return $updated_response;
    }
}
