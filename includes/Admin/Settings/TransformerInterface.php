<?php

namespace WeDevs\Dokan\Admin\Settings;

interface TransformerInterface {

    /**
     * Get the target type for the transformation.
     *
     * This method should return a string that represents the type of transformation
     * this transformer is responsible for. It could be `element`, and 'legacy'.
     *
     * @return string
     */
    public function get_target(): string;


    /**
     * Transform the data.
     *
     * @param mixed $data Data to transform.
     *
     * @return mixed
     */
    public function transform( $data );

    /**
     * Set the data for settings.
     *
     * @param mixed $data Data to validate.
     *
     * @return mixed
     */
    public function set_settings( $data );
}
