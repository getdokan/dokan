<?php

namespace WeDevs\Dokan\DataStore;

use Exception;

/**
 * Abstract Dokan Model.
 *
 * Every model should extend this class.
 *
 * @since DOKAN_SINCE
 */
abstract class Model {

    protected int $id;
    protected string $object_type;

    public function __construct( int $id = 0 ) {
        $this->id = $id;
        try {
            $store = DataStore::load( $this->object_type );
            $this->data_store = $store->get_instance();
            $this->data_store->get( $this );
        } catch ( Exception $e ) {
            $this->id = 0;
        }
    }

    protected DataStoreInterface $data_store;

    /**
     * Get the model.
     *
     * @since DOKAN_SINCE
     *
     * @return Model
     */
    abstract public function get(): Model;

    /**
     * Store a new model data.
     *
     * @since DOKAN_SINCE
     *
     * @return Model
     */
    abstract public function create(): Model;

    /**
     * Update the model data.
     *
     * @since DOKAN_SINCE
     *
     * @return Model
     */
    abstract public function update(): Model;

    /**
     * Delete the model data.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    abstract public function delete(): bool;
}
