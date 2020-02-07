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
     * @since 3.0.0
     *
     * @param array $args
     */
    public function __construct( $args ) {
        $this->withdraws = dokan()->withdraw->all( $args );
    }

    /**
     * Export data in CSV
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function csv() {
        $csv = new CSV( $this->withdraws );
        $csv->export();
    }
}
