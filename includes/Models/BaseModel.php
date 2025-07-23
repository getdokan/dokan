<?php

namespace WeDevs\Dokan\Models;

use WC_Data;

abstract class BaseModel extends WC_Data {
	/**
	 * Save should create or update based on object existence.
	 *
	 * @return int
	 */
	public function save() {
		// wc_get_product()
		if ( ! $this->data_store ) {
			return $this->get_id();
		}

		/**
		 * Trigger action before saving to the DB. Allows you to adjust object props before save.
		 *
		 * @param WC_Data          $this The object being saved.
		 * @param WC_Data_Store_WP $data_store THe data store persisting the data.
		 */
		do_action( 'dokan_before_' . $this->object_type . '_object_save', $this, $this->data_store );

		if ( $this->get_id() ) {
			$this->data_store->update( $this );
		} else {
			$this->data_store->create( $this );
		}

		/**
		 * Trigger action after saving to the DB.
		 *
		 * @param WC_Data          $this The object being saved.
		 * @param WC_Data_Store_WP $data_store THe data store persisting the data.
		 */
		do_action( 'dokan_after_' . $this->object_type . '_object_save', $this, $this->data_store );

		return $this->get_id();
	}

    /**
	 * Delete an object, set the ID to 0, and return result.
	 *
	 * @param  bool $force_delete Should the date be deleted permanently.
	 * @return bool result
	 */
	public function delete( $force_delete = false ) {
		/**
		 * Filters whether an object deletion should take place. Equivalent to `pre_delete_post`.
		 *
		 * @param mixed   $check Whether to go ahead with deletion.
		 * @param Data $this The data object being deleted.
		 * @param bool    $force_delete Whether to bypass the trash.
		 *
		 * @since 8.1.0.
		 */
		$check = apply_filters( "dokan_pre_delete_$this->object_type", null, $this, $force_delete );

		if ( null !== $check ) {
			return $check;
		}

		if ( $this->data_store ) {
			$this->data_store->delete( $this, array( 'force_delete' => $force_delete ) );
			$this->set_id( 0 );
			return true;
		}

		return false;
	}

	/**
	 * Delete raws from the database.
	 *
	 * @param array $data Array of args to delete an object, e.g. `array( 'id' => 1, status => ['draft', 'cancelled'] )` or `array( 'id' => 1, 'status' => 'publish' )`.
	 * @return bool result
	 */
	public static function delete_by( array $data ) {
		$object = new static();
		return $object->data_store->delete_by( $data );
	}

	/**
	 * Prefix for action and filter hooks on data.
	 *
	 * @return string
	 */
	protected function get_hook_prefix() {
		return 'dokan_' . $this->object_type . '_get_';
	}

	/**
	 * Get All Meta Data.
	 *
	 * @since 2.6.0
	 * @return array of objects.
	 */
	public function get_meta_data() {
		return apply_filters( $this->get_hook_prefix() . 'meta_data', array() );
	}
}
