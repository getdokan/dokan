<?php

namespace WeDevs\Dokan\Vendor;

use WeDevs\Dokan\Utilities\VendorUtil;

/**
 * ApiMeta Class.
 *
 * Handles Dokan vendor user meta registration for the REST API.
 */
class ApiMeta {
	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_user_data' ) );
	}

	/**
	 * Registers Dokan specific user data to the WordPress user API.
	 *
	 * @since 4.2.5
	 *
	 * @return void
	 */
	public function register_user_data() {
		register_rest_field(
			'user',
			'dokan_meta',
			array(
				'get_callback'    => array( $this, 'get_user_data_values' ),
				'schema'          => null,
			)
		);
	}

	/**
	 * Fetches the vendor-specific user data values for returning via the REST API.
	 *
	 * @since 4.2.5
	 *
	 * @param array $user Current user data from REST API.
	 * @return array Vendor-specific user data including vendor_id.
	 */
	public function get_user_data_values( $user ) {
		$values = [
            'vendor_id' => VendorUtil::get_vendor_id_for_user( (int) $user['id'] ),
        ];

		foreach ( $this->get_user_data_fields() as $field ) {
			$values[ $field ] = self::get_user_data_field( $user['id'], $field );
		}

		/**
		 * Filter the user data values exposed over the WordPress user endpoint.
		 *
		 * @since 4.2.5
		 *
		 * @param array $values Array of user data values.
		 * @param array $user Current user data from REST API.
		 */
		return apply_filters( 'dokan_vendor_api_meta_get_user_data_values', $values, $user );
	}

	/**
	 * We store some Dokan specific user meta attached to users endpoint,
	 * so that we can track certain preferences or values for vendors.
	 * Additional fields can be added in the function below, and then used via Dokan's currentUser data.
	 *
	 * @since 4.2.5
	 *
	 * @return array Fields to expose over the WP user endpoint.
	 */
	public function get_user_data_fields() {
		/**
		 * Filter user data fields exposed over the WordPress user endpoint.
		 *
		 * @since 4.2.5
		 *
		 * @param array $fields Array of fields to expose over the WP user endpoint.
		 */
		return apply_filters( 'dokan_vendor_get_user_data_fields', [] );
	}

	/**
	 * Helper to retrieve user data fields.
	 *
	 * @since 4.2.5
	 *
	 * @param int    $user_id  User ID.
	 * @param string $field Field name.
	 * @return mixed The user field value.
	 */
	public static function get_user_data_field( $user_id, $field ) {
		$meta_value = get_user_meta( $user_id, $field, true );

		return $meta_value;
	}
}
