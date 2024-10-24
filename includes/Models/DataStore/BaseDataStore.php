<?php

namespace WeDevs\Dokan\Models\DataStore;

use Automattic\WooCommerce\Admin\API\Reports\SqlQuery;
use Automattic\WooCommerce\Pinterest\API\Base;
use Exception;
use WeDevs\Dokan\Models\BaseModel;

abstract class BaseDataStore extends SqlQuery implements DataStoreInterface {
    protected $selected_columns = [ '*' ];

	/**
	 * Get the fields with format as an array where key is the db field name and value is the format.
	 *
	 * @return array
	 */
	abstract protected function get_fields_with_format(): array;

	/**
	 * Get the table name with or without prefix
	 *
	 * @return string
	 */
	abstract public function get_table_name(): string;

	/**
	 * Create a new record in the database using the provided model data.
	 *
	 * @param BaseModel $model The model object containing the data to be inserted.
	 */
	public function create( BaseModel &$model ) {
		$data = $this->get_fields_data( $model );

		$inserted_id = $this->insert( $data );

		if ( $inserted_id ) {
			$model->set_id( $inserted_id );
			$model->apply_changes();
		}

		do_action( $this->get_hook_prefix() . 'created', $inserted_id, $data );

		return $inserted_id;
	}


	/**
     * Method to read a download permission from the database.
     *
     * @param BaseModel $model BaseModel object.
     *
     * @phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
     *
     * @throws Exception Throw exception if invalid entity is passed.
     */
	public function read( BaseModel &$model ) {
		global $wpdb;

		if ( ! $model->get_id() ) {
            $message = $this->get_hook_prefix() . ' : ' . __( 'Invalid entity item.', 'dokan-lite' );

			throw new Exception( esc_html( $message ) );
		}

		$model->set_defaults();

        $id_field_name = $this->get_id_field_name();
        $format = $this->get_id_field_format();

        $this->clear_all_clauses();
        $this->add_sql_clause( 'select', $this->get_selected_columns() );
        $this->add_sql_clause( 'from', $this->get_table_name_with_prefix() );

        $this->add_sql_clause(
            'where',
            $wpdb->prepare(
                " AND {$id_field_name} = $format",
                $model->get_id()
            )
		);

		$raw_item = $wpdb->get_row(
            $this->get_query_statement()
		);

		if ( ! $raw_item ) {
            $message = $this->get_hook_prefix() . ' : ' . __( 'Invalid entity item.', 'dokan-lite' );

			throw new Exception( esc_html( $message ) );
		}

		$model->set_props( $this->format_raw_data( $raw_item ) );
		$model->set_object_read( true );

		return $raw_item;
	}

    /**
	 * Method to update a download in the database.
	 *
	 * @param BaseModel $model WC_Customer_Download object.
	 */
	public function update( BaseModel &$model ) {
		global $wpdb;

		$data = $this->get_fields_data( $model );

		$format = $this->get_fields_format();

		$result = $wpdb->update(
			$this->get_table_name_with_prefix(),
			$data,
			array(
				$this->get_id_field_name() => $model->get_id(),
			),
			$format
		);

		$model->apply_changes();

		return $result;
	}

    /**
	 * Method to delete a download permission from the database.
	 *
	 * @param BaseModel $model BaseModel object.
	 * @param array                $args Array of args to pass to the delete method.
	 */
	public function delete( BaseModel &$model, $args = array() ) {
		$model_id = $model->get_id();
		$this->delete_by_id( $model_id );

		$model->set_id( 0 );
	}

    /**
	 * Method to delete a download permission from the database by ID.
	 *
	 * @param int $id permission_id of the download to be deleted.
     *
     * @phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	 */
	public function delete_by_id( $id ) {
		global $wpdb;

        $table_name = $this->get_table_name_with_prefix();
        $id_field_name = $this->get_id_field_name();
        $format = $this->get_id_field_format();

		$result = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$table_name}
				WHERE $id_field_name = $format",
				$id
			)
		);

        do_action( $this->get_hook_prefix() . 'deleted', $id, $result );

		return $result;
	}

    /**
	 * Create download permission for a user, from an array of data.
	 * Assumes that all the keys in the passed data are valid.
	 *
	 * @param array $data Data to create the permission for.
	 * @return int The database id of the created permission, or false if the permission creation failed.
	 */
	protected function insert( array $data ) {
		global $wpdb;

		$format = $this->get_fields_format();

        $table_name = $this->get_table_name_with_prefix();

        $hook_prefix = $this->get_hook_prefix();

		$result = $wpdb->insert(
            $table_name,
			apply_filters( $hook_prefix . 'insert_data', $data ),
			apply_filters( $hook_prefix . 'insert_data_format', $format, $data )
		);

        do_action( $hook_prefix . 'after_insert', $result, $data );

		return $result ? $wpdb->insert_id : 0;
	}

	protected function get_fields_data( BaseModel &$model ): array {
		$data = array();

		foreach ( $this->get_fields() as $db_field_name ) {
			if ( method_exists( $this, 'get_' . $db_field_name ) ) {
				$data[ $db_field_name ] = call_user_func( array( $this, 'get_' . $db_field_name ), $model, 'edit' );
			} else {
				$data[ $db_field_name ] = call_user_func( array( $model, 'get_' . $db_field_name ), 'edit' );
			}
		}

		return $data;
	}

    /**
	 * Returns a list of columns selected by the query_args formatted as a comma separated string.
	 *
	 * @return string
	 */
	protected function get_selected_columns(): string {
		$selections = apply_filters( $this->get_hook_prefix() . 'selected_columns', $this->selected_columns );

		$selections = implode( ', ', $selections );

		return $selections;
	}


    protected function format_raw_data( $raw_data ): array {
        $data = array();

        foreach ( $this->get_fields() as $db_field_name ) {
			$data[ $db_field_name ] = $raw_data->{$db_field_name};
		}

        return apply_filters( $this->get_hook_prefix() . 'format_raw_data', $data, $raw_data );
    }

    protected function get_hook_prefix(): string {
        global $wpdb;

        $table_name = $this->get_table_name();

        $hook_prefix = str_replace( $wpdb->prefix, '', $table_name );

        return "dokan_{$hook_prefix}_";
    }

    protected function get_table_name_with_prefix(): string {
        global $wpdb;

        $table_name = $this->get_table_name();

        if ( ! str_starts_with( $table_name, $wpdb->prefix ) ) {
            $table_name = $wpdb->prefix . $table_name;
		}

        return $table_name;
    }

    protected function get_id_field_name(): string {
        return apply_filters( $this->get_hook_prefix() . 'id_field_name', 'id' ); // 'id';
    }


    protected function get_id_field_format(): string {
        return apply_filters( $this->get_hook_prefix() . 'id_field_format', '%d' ); // 'id';
    }

	/**
	 * Get the fields.
	 *
	 * @return array The filtered array of fields.
	 */
    protected function get_fields(): array {
		$fields = array_keys( $this->get_fields_with_format() );

        return apply_filters(
            $this->get_hook_prefix() . 'fields',
            $fields,
            $this->get_fields_with_format()
		);
    }

    /**
     * Get the fields with format.
     *
     * @return array The filtered array of format of the fields.
     */
	protected function get_fields_format(): array {
		$format = array_values( $this->get_fields_with_format() );

        return apply_filters(
			$this->get_hook_prefix() . 'fields_format',
			$format,
            $this->get_fields_with_format()
        );
    }
}
