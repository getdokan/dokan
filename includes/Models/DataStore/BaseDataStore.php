<?php

namespace WeDevs\Dokan\Models\DataStore;

use Automattic\WooCommerce\Admin\API\Reports\SqlQuery;
use Automattic\WooCommerce\Pinterest\API\Base;
use Exception;
use WeDevs\Dokan\Models\BaseModel;

/**
 * Base data store class.
 *
 * @since 4.0.4
 */
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
		$data = $this->map_model_to_db_data( $model );

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
     * @phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
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

		$model->set_props( $this->map_db_raw_to_model_data( $raw_item ) );
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

		$data = $this->map_model_to_db_data( $model );

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
     * @phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	 *
	 * @return int Number of affected rows.
	 */
	public function delete_by_id( $id ): int {
		$result = $this->delete_by( [ $this->get_id_field_name() => $id ] );

        do_action( $this->get_hook_prefix() . 'deleted', $id, $result );

		return $result;
	}

	/**
	 * Delete raws from the database.
	 *
	 * @param array $data Array of args to delete an object, e.g. `array( 'id' => 1, status => ['draft', 'cancelled'] )` or `array( 'id' => 1, 'status' => 'publish' )`.
     *
	 * @phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	 *
	 * @return int Number of affected rows.
	 */
	public function delete_by( array $data ): int {
		global $wpdb;

        $table_name = $this->get_table_name_with_prefix();

		$where_clause = $this->prepare_where_clause( $data );

		$result = $wpdb->query(
            "DELETE FROM {$table_name}
				WHERE {$where_clause}"
		);

		if ( $result === false ) {
			throw new Exception( esc_html__( 'Failed to delete.', 'dokan-lite' ) );
		}

		return (int) $result;
	}

	/**
	 * Updates rows in the database.
	 *
	 * @param array $where Array of args to identify the object to be updated, e.g. `array( 'id' => 1, 'status' => 'draft' )`.
	 * @param array $data_to_update Array of args to update the object, e.g. `array( 'status' => 'publish' )`.
	 *
	 * @return int Number of affected rows.
	 */
	public function update_by( array $where, array $data_to_update ) {
		global $wpdb;

		$fields_format = $this->get_fields_with_format();
		$field_format[ $this->get_id_field_name() ] = $this->get_id_field_format();

		$data_format = [];

		foreach ( $data_to_update as $key => $value ) {
			$data_format[] = $fields_format[ $key ];
		}

		$where_format = [];

		foreach ( $where as $key => $value ) {
			$where_format[] = $fields_format[ $key ];
		}

		$result = $wpdb->update(
            $this->get_table_name_with_prefix(),
            $data_to_update,
           	$where,
			$data_format,
            $where_format
        );

		if ( $result === false ) {
			throw new Exception( esc_html__( 'Failed to update.', 'dokan-lite' ) );
		}

		return (int) $result;
	}

	/**
	 * Prepares a SQL WHERE clause from an associative array of data.
	 *
	 * This method takes an array of data where keys are column names and values
	 * are the values to filter by. It generates a secure SQL WHERE clause using
	 * prepared statements to protect against SQL injection.
	 *
	 * If a value in the data array is an array itself, it generates an IN clause
	 * with multiple placeholders. Otherwise, it generates a simple equality check.
	 *
	 * @param array $data Associative array of column names and values to filter by.
	 * @return string The generated WHERE clause.
	 */
	protected function prepare_where_clause( array $data ): string {
		global $wpdb;

		$where = [ '1=1' ];

		$field_format = $this->get_fields_with_format();

		// Add ID field format for the WHERE clause.
		$field_format[ $this->get_id_field_name() ] = $this->get_id_field_format();

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				// Fill format array based on the number of values and specified format for the key.
				$placeholders = implode( ',', array_fill( 0, count( $value ), '%s' ) );

				// Generate the WHERE clause securely using $wpdb->prepare() with placeholders.
				$where[] = $wpdb->prepare( "{$key} IN ({$placeholders})", ...$value );
			} else {
				$format = $field_format[ $key ];
				$where[] = $wpdb->prepare( "{$key} = {$format}", $value );
			}
		}

		return implode( ' AND ', $where );
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

	/**
	 * Prepare data for saving a BaseModel to the database.
	 *
	 * @param BaseModel $model The model to prepare.
	 * @return array Array of data to save.
	 */
	protected function map_model_to_db_data( BaseModel &$model ): array {
		$data = array();

		foreach ( $this->get_fields() as $db_field_name ) {
			if ( method_exists( $this, 'get_' . $db_field_name ) ) {
				$val = call_user_func( array( $this, 'get_' . $db_field_name ), $model, 'edit' );
			} else {
				$val = call_user_func( array( $model, 'get_' . $db_field_name ), 'edit' );
			}

			if ( is_a( $val, 'WC_DateTime' ) ) {
				$val = $val->date( $this->get_date_format_for_field( $db_field_name ) );
			}

			$data[ $db_field_name ] = $val;
		}

		return $data;
	}



	/**
	 * Read meta data for the given model. Generally, We may not need this method.
	 *
	 * @param BaseModel $model The model for which to read meta data.
	 */
	public function read_meta( BaseModel &$model ): void {
	}

	/**
	 * Maps database raw data to model data.
	 *
	 * @param object $raw_data The raw data object retrieved from the database.
	 * @return array An array of model data mapped from the database fields.
	 */
    protected function map_db_raw_to_model_data( $raw_data ): array {
        $data = array();

        foreach ( $this->get_fields() as $db_field_name ) {
			$data[ $db_field_name ] = $raw_data->{$db_field_name};
		}

        return apply_filters( $this->get_hook_prefix() . 'map_db_raw_to_model_data', $data, $raw_data );
    }

	/**
	 * Get the date format for a specific database field.
	 *
	 * @param string $db_field_name The name of the database field.
	 * @return string The format in which the date is returned.
	 */
	protected function get_date_format_for_field( string $db_field_name ): string {
		return 'Y-m-d H:i:s';
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

    /**
     * Generates a hook prefix.
     *
     * @return string The hook prefix.
     */
    protected function get_hook_prefix(): string {
        global $wpdb;

        $table_name = $this->get_table_name();

        $hook_prefix = str_replace( $wpdb->prefix, '', $table_name );

        return "dokan_{$hook_prefix}_";
    }

    /**
     * Gets the table name with the WordPress table prefix.
     *
     * @return string The table name with the WordPress table prefix.
     */
    protected function get_table_name_with_prefix(): string {
        global $wpdb;

        $table_name = $this->get_table_name();

        if ( ! str_starts_with( $table_name, $wpdb->prefix ) ) {
            $table_name = $wpdb->prefix . $table_name;
		}

        return $table_name;
    }

    /**
     * Get the name of the id field.
     *
     * @return string The name of the id field.
     */
    protected function get_id_field_name(): string {
        return apply_filters( $this->get_hook_prefix() . 'id_field_name', 'id' ); // 'id';
    }

    /**
     * Gets the format of the id field.
     *
     * @return string The format of the id field.
     */
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
