<?php

namespace WeDevs\Dokan\Models\DataStore;

use WeDevs\Dokan\Models\BaseModel;

/**
 * Data Store interface.
 *
 * @since 4.0.4
 */
interface DataStoreInterface {

    /**
     * Create a new data.
     *
     * @since 4.0.4
     *
     * @param BaseModel $model
     *
     * @return void
     */
    public function create( BaseModel &$model );

    /**
     * Method to read a download permission from the database.
     *
     * @param BaseModel $model BaseModel object.
     *
     * @phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
     *
     * @throws Exception Throw exception if invalid entity is passed.
     */
	public function read( BaseModel &$model );

    /**
     * Update a data.
     *
     * @since 4.0.4
     *
     * @param BaseModel $model The model to update.
     *
     * @return void
     * @throw \Exception
     */
    public function update( BaseModel &$model );

    /**
     * Delete a data.
     *
     * @since 4.0.4
     *
     * @param BaseModel $model The model to delete.
     *
     * @return void
     * @throw \Exception
     */
    public function delete( BaseModel &$model );

    /**
     * Get a data.
     *
     * @since 4.0.4
     *
     * @param BaseModel $model The model to get.
     *
     * @return void
     * @throw \Exception
     */
    // public function get( BaseModel &$model );

    /**
     * Query data.
     *
     * @since 4.0.4
     *
     * @param array $args
     *
     * @return array
     */
    // public function query( array $args = [] ): array;

    /**
     * Count data.
     *
     * @since 4.0.4
     *
     * @param array $args
     *
     * @return int
     */
    // public function count( array $args = [] ): int;
}
