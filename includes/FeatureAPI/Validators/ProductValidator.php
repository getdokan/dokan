<?php
/**
 * Product Validator for Feature API
 *
 * @package WeDevs\Dokan\FeatureAPI\Validators
 * @since 4.0.0
 */

namespace WeDevs\Dokan\FeatureAPI\Validators;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Product Validator
 *
 * @since 4.0.0
 */
class ProductValidator {

    /**
     * Validate list parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_list_params( $context ) {
        $args = [];

        // Validate number
        if ( isset( $context['number'] ) ) {
            $number = absint( $context['number'] );
            if ( $number < 1 || $number > 100 ) {
                return new \WP_Error( 'invalid_number', __( 'Number must be between 1 and 100', 'dokan-lite' ) );
            }
            $args['number'] = $number;
        }

        // Validate offset
        if ( isset( $context['offset'] ) ) {
            $offset = absint( $context['offset'] );
            if ( $offset < 0 ) {
                return new \WP_Error( 'invalid_offset', __( 'Offset must be non-negative', 'dokan-lite' ) );
            }
            $args['offset'] = $offset;
        }

        // Validate orderby
        if ( isset( $context['orderby'] ) ) {
            $valid_orderby = [ 'date', 'title', 'price', 'popularity', 'rating' ];
            if ( ! in_array( $context['orderby'], $valid_orderby, true ) ) {
                return new \WP_Error( 'invalid_orderby', __( 'Invalid orderby value', 'dokan-lite' ) );
            }
            $args['orderby'] = $context['orderby'];
        }

        // Validate order
        if ( isset( $context['order'] ) ) {
            $valid_order = [ 'ASC', 'DESC' ];
            if ( ! in_array( strtoupper( $context['order'] ), $valid_order, true ) ) {
                return new \WP_Error( 'invalid_order', __( 'Invalid order value', 'dokan-lite' ) );
            }
            $args['order'] = strtoupper( $context['order'] );
        }

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'publish', 'pending', 'draft', 'private' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate vendor_id
        if ( isset( $context['vendor_id'] ) ) {
            $vendor_id = absint( $context['vendor_id'] );
            if ( $vendor_id > 0 && ! dokan_is_user_seller( $vendor_id ) ) {
                return new \WP_Error( 'invalid_vendor_id', __( 'Invalid vendor ID', 'dokan-lite' ) );
            }
            $args['vendor_id'] = $vendor_id;
        }

        // Validate category
        if ( isset( $context['category'] ) ) {
            $category_id = absint( $context['category'] );
            if ( $category_id > 0 && ! term_exists( $category_id, 'product_cat' ) ) {
                return new \WP_Error( 'invalid_category', __( 'Invalid category ID', 'dokan-lite' ) );
            }
            $args['category'] = $category_id;
        }

        // Validate search
        if ( isset( $context['search'] ) ) {
            $args['search'] = sanitize_text_field( $context['search'] );
        }

        return $args;
    }

    /**
     * Validate create parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_create_params( $context ) {
        $args = [];

        // Validate name
        if ( empty( $context['name'] ) ) {
            return new \WP_Error( 'missing_name', __( 'Product name is required', 'dokan-lite' ) );
        }

        $name = sanitize_text_field( $context['name'] );
        if ( strlen( $name ) > 200 ) {
            return new \WP_Error( 'invalid_name', __( 'Product name must be 200 characters or less', 'dokan-lite' ) );
        }

        $args['name'] = $name;

        // Validate vendor_id
        if ( empty( $context['vendor_id'] ) ) {
            return new \WP_Error( 'missing_vendor_id', __( 'Vendor ID is required', 'dokan-lite' ) );
        }

        $vendor_id = absint( $context['vendor_id'] );
        if ( ! dokan_is_user_seller( $vendor_id ) ) {
            return new \WP_Error( 'invalid_vendor_id', __( 'Invalid vendor ID', 'dokan-lite' ) );
        }

        $args['vendor_id'] = $vendor_id;

        // Validate description
        if ( isset( $context['description'] ) ) {
            $args['description'] = wp_kses_post( $context['description'] );
        }

        // Validate short_description
        if ( isset( $context['short_description'] ) ) {
            $args['short_description'] = wp_kses_post( $context['short_description'] );
        }

        // Validate regular_price
        if ( isset( $context['regular_price'] ) ) {
            $regular_price = sanitize_text_field( $context['regular_price'] );
            if ( ! empty( $regular_price ) && ! is_numeric( $regular_price ) ) {
                return new \WP_Error( 'invalid_regular_price', __( 'Invalid regular price', 'dokan-lite' ) );
            }
            $args['regular_price'] = $regular_price;
        }

        // Validate sale_price
        if ( isset( $context['sale_price'] ) ) {
            $sale_price = sanitize_text_field( $context['sale_price'] );
            if ( ! empty( $sale_price ) && ! is_numeric( $sale_price ) ) {
                return new \WP_Error( 'invalid_sale_price', __( 'Invalid sale price', 'dokan-lite' ) );
            }
            $args['sale_price'] = $sale_price;
        }

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'publish', 'pending', 'draft' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate categories
        if ( isset( $context['categories'] ) && is_array( $context['categories'] ) ) {
            $categories = [];
            foreach ( $context['categories'] as $category_id ) {
                $category_id = absint( $category_id );
                if ( $category_id > 0 && term_exists( $category_id, 'product_cat' ) ) {
                    $categories[] = $category_id;
                }
            }
            $args['categories'] = $categories;
        }

        // Validate tags
        if ( isset( $context['tags'] ) && is_array( $context['tags'] ) ) {
            $tags = [];
            foreach ( $context['tags'] as $tag_id ) {
                $tag_id = absint( $tag_id );
                if ( $tag_id > 0 && term_exists( $tag_id, 'product_tag' ) ) {
                    $tags[] = $tag_id;
                }
            }
            $args['tags'] = $tags;
        }

        // Validate SKU
        if ( isset( $context['sku'] ) ) {
            $sku = sanitize_text_field( $context['sku'] );
            if ( ! empty( $sku ) ) {
                // Check if SKU already exists
                $existing_product = wc_get_product_id_by_sku( $sku );
                if ( $existing_product ) {
                    return new \WP_Error( 'sku_exists', __( 'SKU already exists', 'dokan-lite' ) );
                }
            }
            $args['sku'] = $sku;
        }

        // Validate manage_stock
        if ( isset( $context['manage_stock'] ) ) {
            $args['manage_stock'] = (bool) $context['manage_stock'];
        }

        // Validate stock_quantity
        if ( isset( $context['stock_quantity'] ) ) {
            $stock_quantity = absint( $context['stock_quantity'] );
            if ( $stock_quantity < 0 ) {
                return new \WP_Error( 'invalid_stock_quantity', __( 'Stock quantity must be non-negative', 'dokan-lite' ) );
            }
            $args['stock_quantity'] = $stock_quantity;
        }

        // Validate stock_status
        if ( isset( $context['stock_status'] ) ) {
            $valid_stock_statuses = [ 'instock', 'outofstock', 'onbackorder' ];
            if ( ! in_array( $context['stock_status'], $valid_stock_statuses, true ) ) {
                return new \WP_Error( 'invalid_stock_status', __( 'Invalid stock status', 'dokan-lite' ) );
            }
            $args['stock_status'] = $context['stock_status'];
        }

        // Validate featured_image
        if ( isset( $context['featured_image'] ) ) {
            $image_id = absint( $context['featured_image'] );
            if ( $image_id > 0 && ! wp_attachment_is_image( $image_id ) ) {
                return new \WP_Error( 'invalid_featured_image', __( 'Invalid featured image ID', 'dokan-lite' ) );
            }
            $args['featured_image'] = $image_id;
        }

        // Validate gallery_images
        if ( isset( $context['gallery_images'] ) && is_array( $context['gallery_images'] ) ) {
            $gallery_images = [];
            foreach ( $context['gallery_images'] as $image_id ) {
                $image_id = absint( $image_id );
                if ( $image_id > 0 && wp_attachment_is_image( $image_id ) ) {
                    $gallery_images[] = $image_id;
                }
            }
            $args['gallery_images'] = $gallery_images;
        }

        return $args;
    }

    /**
     * Validate update parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_update_params( $context ) {
        $args = [];

        // Validate name
        if ( isset( $context['name'] ) ) {
            $name = sanitize_text_field( $context['name'] );
            if ( strlen( $name ) > 200 ) {
                return new \WP_Error( 'invalid_name', __( 'Product name must be 200 characters or less', 'dokan-lite' ) );
            }
            $args['name'] = $name;
        }

        // Validate description
        if ( isset( $context['description'] ) ) {
            $args['description'] = wp_kses_post( $context['description'] );
        }

        // Validate short_description
        if ( isset( $context['short_description'] ) ) {
            $args['short_description'] = wp_kses_post( $context['short_description'] );
        }

        // Validate regular_price
        if ( isset( $context['regular_price'] ) ) {
            $regular_price = sanitize_text_field( $context['regular_price'] );
            if ( ! empty( $regular_price ) && ! is_numeric( $regular_price ) ) {
                return new \WP_Error( 'invalid_regular_price', __( 'Invalid regular price', 'dokan-lite' ) );
            }
            $args['regular_price'] = $regular_price;
        }

        // Validate sale_price
        if ( isset( $context['sale_price'] ) ) {
            $sale_price = sanitize_text_field( $context['sale_price'] );
            if ( ! empty( $sale_price ) && ! is_numeric( $sale_price ) ) {
                return new \WP_Error( 'invalid_sale_price', __( 'Invalid sale price', 'dokan-lite' ) );
            }
            $args['sale_price'] = $sale_price;
        }

        // Validate status
        if ( isset( $context['status'] ) ) {
            $valid_statuses = [ 'publish', 'pending', 'draft', 'private' ];
            if ( ! in_array( $context['status'], $valid_statuses, true ) ) {
                return new \WP_Error( 'invalid_status', __( 'Invalid status value', 'dokan-lite' ) );
            }
            $args['status'] = $context['status'];
        }

        // Validate categories
        if ( isset( $context['categories'] ) && is_array( $context['categories'] ) ) {
            $categories = [];
            foreach ( $context['categories'] as $category_id ) {
                $category_id = absint( $category_id );
                if ( $category_id > 0 && term_exists( $category_id, 'product_cat' ) ) {
                    $categories[] = $category_id;
                }
            }
            $args['categories'] = $categories;
        }

        // Validate tags
        if ( isset( $context['tags'] ) && is_array( $context['tags'] ) ) {
            $tags = [];
            foreach ( $context['tags'] as $tag_id ) {
                $tag_id = absint( $tag_id );
                if ( $tag_id > 0 && term_exists( $tag_id, 'product_tag' ) ) {
                    $tags[] = $tag_id;
                }
            }
            $args['tags'] = $tags;
        }

        // Validate SKU
        if ( isset( $context['sku'] ) ) {
            $sku = sanitize_text_field( $context['sku'] );
            if ( ! empty( $sku ) ) {
                // Check if SKU already exists for another product
                $existing_product = wc_get_product_id_by_sku( $sku );
                if ( $existing_product && $existing_product !== absint( $context['id'] ) ) {
                    return new \WP_Error( 'sku_exists', __( 'SKU already exists', 'dokan-lite' ) );
                }
            }
            $args['sku'] = $sku;
        }

        // Validate manage_stock
        if ( isset( $context['manage_stock'] ) ) {
            $args['manage_stock'] = (bool) $context['manage_stock'];
        }

        // Validate stock_quantity
        if ( isset( $context['stock_quantity'] ) ) {
            $stock_quantity = absint( $context['stock_quantity'] );
            if ( $stock_quantity < 0 ) {
                return new \WP_Error( 'invalid_stock_quantity', __( 'Stock quantity must be non-negative', 'dokan-lite' ) );
            }
            $args['stock_quantity'] = $stock_quantity;
        }

        // Validate stock_status
        if ( isset( $context['stock_status'] ) ) {
            $valid_stock_statuses = [ 'instock', 'outofstock', 'onbackorder' ];
            if ( ! in_array( $context['stock_status'], $valid_stock_statuses, true ) ) {
                return new \WP_Error( 'invalid_stock_status', __( 'Invalid stock status', 'dokan-lite' ) );
            }
            $args['stock_status'] = $context['stock_status'];
        }

        // Validate featured_image
        if ( isset( $context['featured_image'] ) ) {
            $image_id = absint( $context['featured_image'] );
            if ( $image_id > 0 && ! wp_attachment_is_image( $image_id ) ) {
                return new \WP_Error( 'invalid_featured_image', __( 'Invalid featured image ID', 'dokan-lite' ) );
            }
            $args['featured_image'] = $image_id;
        }

        // Validate gallery_images
        if ( isset( $context['gallery_images'] ) && is_array( $context['gallery_images'] ) ) {
            $gallery_images = [];
            foreach ( $context['gallery_images'] as $image_id ) {
                $image_id = absint( $image_id );
                if ( $image_id > 0 && wp_attachment_is_image( $image_id ) ) {
                    $gallery_images[] = $image_id;
                }
            }
            $args['gallery_images'] = $gallery_images;
        }

        return $args;
    }

    /**
     * Validate search parameters
     *
     * @param array $context
     * @return array|\WP_Error
     */
    public function validate_search_params( $context ) {
        $args = [];

        // Validate search term
        if ( empty( $context['search'] ) ) {
            return new \WP_Error( 'missing_search', __( 'Search term is required', 'dokan-lite' ) );
        }

        $search = sanitize_text_field( $context['search'] );
        if ( strlen( $search ) < 2 ) {
            return new \WP_Error( 'invalid_search', __( 'Search term must be at least 2 characters', 'dokan-lite' ) );
        }

        $args['search'] = $search;

        // Validate number
        if ( isset( $context['number'] ) ) {
            $number = absint( $context['number'] );
            if ( $number < 1 || $number > 50 ) {
                return new \WP_Error( 'invalid_number', __( 'Number must be between 1 and 50', 'dokan-lite' ) );
            }
            $args['number'] = $number;
        }

        // Validate offset
        if ( isset( $context['offset'] ) ) {
            $offset = absint( $context['offset'] );
            if ( $offset < 0 ) {
                return new \WP_Error( 'invalid_offset', __( 'Offset must be non-negative', 'dokan-lite' ) );
            }
            $args['offset'] = $offset;
        }

        // Validate vendor_id
        if ( isset( $context['vendor_id'] ) ) {
            $vendor_id = absint( $context['vendor_id'] );
            if ( $vendor_id > 0 && ! dokan_is_user_seller( $vendor_id ) ) {
                return new \WP_Error( 'invalid_vendor_id', __( 'Invalid vendor ID', 'dokan-lite' ) );
            }
            $args['vendor_id'] = $vendor_id;
        }

        // Validate category
        if ( isset( $context['category'] ) ) {
            $category_id = absint( $context['category'] );
            if ( $category_id > 0 && ! term_exists( $category_id, 'product_cat' ) ) {
                return new \WP_Error( 'invalid_category', __( 'Invalid category ID', 'dokan-lite' ) );
            }
            $args['category'] = $category_id;
        }

        return $args;
    }
} 