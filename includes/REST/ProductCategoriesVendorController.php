<?php
namespace WeDevs\Dokan\REST;

use WeDevs\Dokan\Abstracts\DokanRESTVendorController;
use WP_Error;
use WP_REST_Request;
use WP_Term;

class ProductCategoriesVendorController extends DokanRESTVendorController {

	protected $rest_base = 'product-categories';

	public function register_routes() {
		register_rest_route(
			$this->namespace, '/' . $this->rest_base, [
				[
					'methods'             => 'GET',
					'callback' => array( $this, 'get_product_categories' ),
					'permission_callback' => [ $this, 'check_permission' ],
					'args' => $this->get_collection_params(),

				],
			]
		);

		// get single category
		register_rest_route(
			$this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
				[
					'methods'             => 'GET',
					'callback' => array( $this, 'get_product_category' ),
					'permission_callback' => [ $this, 'check_permission' ],
					'args' => $this->get_collection_params(),
				],
			]
		);
	}

	/**
	 * Get a single product category
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return \WP_REST_Response | \WP_Error Response object on success, or WP_Error object on failure.
	 */

	public function get_product_category( WP_REST_Request $request ) {
		try {
			$category_id = (int) $request->get_param( 'id' );
			$category = get_term( $category_id, 'product_cat' );

			if ( ! $category || is_wp_error( $category ) ) {
				return new WP_Error(
					'rest_category_invalid_id',
					__( 'Invalid category ID.', 'dokan-lite' ),
					array( 'status' => 404 )
				);
			}

			$response = $this->prepare_category_for_response( $category, $request );
			$fields = $request->get_param( '_fields' );
			if ( $fields ) {
				$response = $this->filter_response_by_fields( $response, $fields );
			}
			$response['_links'] = $this->prepare_links( $category, $request );

			return new \WP_REST_Response( $response );
		} catch ( Exception $e ) {
			return new WP_Error(
				'rest_category_error',
				__( 'Error retrieving product category.', 'dokan-lite' ),
				array( 'status' => 400 )
			);
		}
	}
	/**
	 * Get the product categories
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response | \WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_product_categories( $request ) {
		// Get parameters from request
		$per_page = min( $request->get_param( 'per_page' ) ? (int) $request->get_param( 'per_page' ) : 10, 100 );
		$page = $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1;
		$search = $request->get_param( 'search' );
		$exclude = $request->get_param( 'exclude' );
		$include = $request->get_param( 'include' );
		$order = $request->get_param( 'order' );
		$orderby = $request->get_param( 'orderby' );
		$hide_empty = $request->get_param( 'hide_empty' );
		$parent = $request->get_param( 'parent' );
		$fields = $request->get_param( '_fields' );
		// Set up query arguments
		$args = array(
			'taxonomy' => 'product_cat',
			'number' => $per_page,
			'offset' => ( $page - 1 ) * $per_page,
			'hide_empty' => $hide_empty === 'true',
			'orderby' => $orderby ? $orderby : 'name',
			'order' => $order ? $order : 'ASC',
		);

		// Add conditional parameters
		if ( $search ) {
			$args['search'] = $search;
		}
		if ( $exclude ) {
			$args['exclude'] = array_map( 'absint', explode( ',', $exclude ) );
		}
		if ( $include ) {
			$args['include'] = array_map( 'absint', explode( ',', $include ) );
		}
		if ( $parent ) {
			$args['parent'] = absint( $parent );
		}

		// Get categories
		$categories = get_terms( $args );

		if ( is_wp_error( $categories ) ) {
			return new WP_Error(
				'rest_category_error',
				__( 'Error retrieving product categories.', 'dokan-lite' ),
				array( 'status' => 400 )
			);
		}

		// Get total count for pagination
		unset( $args['number'] );
		unset( $args['offset'] );
		$total_categories = wp_count_terms( $args );

		// Format the response data
		$data = array();
		foreach ( $categories as $category ) {
			$response = $this->prepare_category_for_response( $category, $request );
			if ( $fields ) {
				$response = $this->filter_response_by_fields( $response, $fields );
			}
			$response['_links'] = $this->prepare_links( $category, $request );

			$data[] = $response;
		}

		// Create response with pagination headers
		$response = new \WP_REST_Response( $data );
		$response->header( 'X-WP-Total', (int) $total_categories );
		$response->header( 'X-WP-TotalPages', ceil( $total_categories / $per_page ) );
		return $response;
	}

	/**
	 * Prepare category data for REST response
	 *
	 * @param WP_Term $category The category object.
	 * @param WP_REST_Request $request Request object.
	 * @return array Formatted category data.
	 */
	protected function prepare_category_for_response( $category, $request ): array {
		// Get category display type.
		$display_type = get_term_meta( $category->term_id, 'display_type', true );

		// Get category order.
		$menu_order = get_term_meta( $category->term_id, 'order', true );

		$data = array(
			'id'          => (int) $category->term_id,
			'name'        => $category->name,
			'slug'        => $category->slug,
			'parent'      => (int) $category->parent,
			'description' => $category->description,
			'display'     => $display_type ? $display_type : 'default',
			'image'       => null,
			'menu_order'  => (int) $menu_order,
			'count'       => (int) $category->count,
		);

		// Get category image.
		$image_id = get_term_meta( $category->term_id, 'thumbnail_id', true );
		if ( $image_id ) {
			$attachment = get_post( $image_id );

			$data['image'] = array(
				'id'                => (int) $image_id,
				'date_created'      => wc_rest_prepare_date_response( $attachment->post_date ),
				'date_created_gmt'  => wc_rest_prepare_date_response( $attachment->post_date_gmt ),
				'date_modified'     => wc_rest_prepare_date_response( $attachment->post_modified ),
				'date_modified_gmt' => wc_rest_prepare_date_response( $attachment->post_modified_gmt ),
				'src'               => wp_get_attachment_url( $image_id ),
				'name'              => get_the_title( $attachment ),
				'alt'               => get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
			);
		}

		$context = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data    = $this->add_additional_fields_to_object( $data, $request );
		$response    = $this->filter_response_by_context( $data, $context );
		return apply_filters( 'dokan_rest_prepare_product_category_object', $response, $category, $request );
	}

	/**
	 * Filter response data by requested fields
	 *
	 * @param array $response Response data.
	 * @param string $fields Requested fields.
	 * @return array Filtered response data.
	 */
	protected function filter_response_by_fields( $response, $fields ) {
		$fields = explode( ',', $fields );
		return array_intersect_key( $response, array_flip( $fields ) );
	}
	/**
	 * Prepare links for the request.
	 *
	 * @param object          $term   Term object.
	 * @param WP_REST_Request $request Full details about the request.
	 * @return array Links for the given term.
	 */
	protected function prepare_links( $term, $request ) {
		$base = '/' . $this->namespace . '/' . $this->rest_base;

		if ( ! empty( $request['attribute_id'] ) ) {
			$base = str_replace( '(?P<attribute_id>[\d]+)', (int) $request['attribute_id'], $base );
		}

		$links = array(
			'self'       => array(
				'href' => rest_url( trailingslashit( $base ) . $term->term_id ),
			),
			'collection' => array(
				'href' => rest_url( $base ),
			),
		);

		if ( $term->parent ) {
			$parent_term = get_term( (int) $term->parent, $term->taxonomy );
			if ( $parent_term ) {
				$links['up'] = array(
					'href' => rest_url( trailingslashit( $base ) . $parent_term->term_id ),
				);
			}
		}

		return $links;
	}
}
