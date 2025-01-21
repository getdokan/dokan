<?php

namespace WeDevs\Dokan\REST;

/**
 * Dokan Order ControllerV3 Class
 *
 * @since   DOKAN_SINCE
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
     * @param               $downloads
     * @param \WC_Product[] $products
     *
     * @return array
     */
    protected function format_downloads_data( $downloads, $products ) {
        $updated_response = [];

        foreach ( $downloads as $download ) {
            $product = array_filter(
                $products, function ( $product_item ) use ( $download ) {
					return ! empty( $product_item->get_id() ) && ! empty( $download->product_id ) && absint( $product_item->get_id() ) === absint( $download->product_id );
				}
            );
            $product = reset( $product );

            $download->product = [
                'id'   => $product->get_id(),
                'name' => $product->get_name(),
                'slug' => $product->get_slug(),
                'link' => $product->get_permalink(),
            ];

            /**
             * @var $file \WC_Product_Download
             */
            $file                              = $product->get_file( $download->download_id );
            $download->file_data               = $file->get_data();
            $download->file_data['file_title'] = wc_get_filename_from_url( $product->get_file_download_path( $download->download_id ) );

            $updated_response[] = $download;
        }

        return $updated_response;
    }
}
