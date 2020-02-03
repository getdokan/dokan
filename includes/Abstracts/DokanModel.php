<?php

namespace WeDevs\Dokan\Abstracts;

abstract class DokanModel {

    /**
     * Set model data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $data
     */
    abstract protected function set_data( $data );

    /**
     * Get model data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return array
     */
    public function get_data() {
        return $this->data;
    }

    /**
     * Save model data
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WeDevs\Dokan\Abstracts\Model
     */
    abstract public function save();

    /**
     * Create a model
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WeDevs\Dokan\Abstracts\Model
     */
    abstract protected function create();

    /**
     * Update a model
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WeDevs\Dokan\Abstracts\Model
     */
    abstract protected function update();

    /**
     * Delete a model
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return \WeDevs\Dokan\Abstracts\Model
     */
    abstract public function delete();
}
