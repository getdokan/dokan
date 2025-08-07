<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

/**
 * Dokan Refresh Select Field.
 */
class RefreshSelectField extends Select {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'refresh_select';

    /**
     * Refresh callback function.
     *
     * @var callable|null $on_refresh Refresh callback.
     */
    protected $on_refresh = null;

    /**
     * Execute refresh callback if set.
     *
     * @return mixed
     */
    public function execute_refresh() {
        if ( is_callable( $this->on_refresh ) ) {
            return call_user_func( $this->on_refresh );
        }

        return null;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data = parent::populate();


        return $data;
    }

}
