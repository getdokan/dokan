<?php

namespace WeDevs\Dokan\DataStore;

/**
 * Data Store interface.
 *
 * @since DOKAN_SINCE
 */
interface DataStoreInterface {

    /**
     * Create a new data.
     *
     * @since DOKAN_SINCE
     *
     * @param Model $model
     *
     * @return void
     */
    public function create( Model &$model );

    /**
     * Update a data.
     *
     * @since DOKAN_SINCE
     *
     * @param Model $model The model to update.
     *
     * @return void
     * @throw \Exception
     */
    public function update( Model &$model );

    /**
     * Delete a data.
     *
     * @since DOKAN_SINCE
     *
     * @param Model $model The model to delete.
     *
     * @return void
     * @throw \Exception
     */
    public function delete( Model &$model );

    /**
     * Get a data.
     *
     * @since DOKAN_SINCE
     *
     * @param Model $model The model to get.
     *
     * @return void
     * @throw \Exception
     */
    // public function get( Model &$model );

    /**
     * Query data.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return array
     */
    // public function query( array $args = [] ): array;

    /**
     * Count data.
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return int
     */
    // public function count( array $args = [] ): int;
}
