<?php

namespace WeDevs\Dokan\Withdraw\Export;


class Manager {

    /**
     * Withdraws to export
     *
     * @var array
     */
    protected $withdraws = [];

    /**
     * Class constructor
     *
     * @since DOKAN_LITE_SINCE
     *
     * @param array $args
     */
    public function __construct( $args ) {
        $this->withdraws = dokan()->withdraw->all( $args );
    }

    /**
     * Export data in CSV
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function csv() {
        $csv = new CSV( $this->withdraws );
        $csv->export();
    }
}
