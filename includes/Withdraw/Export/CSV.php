<?php

namespace WeDevs\Dokan\Withdraw\Export;

class CSV {

    /**
     * Witdraws to export
     *
     * @var array
     */
    protected $withdraws = [];

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @param array $withdraws
     */
    public function __construct( $withdraws ) {
        $this->withdraws = $withdraws;
    }

    /**
     * Export withdraws
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function export() {
        $date = date( 'Y-m-d-H-i-s', strtotime( current_time( 'mysql' ) ) );

        header( 'Content-type: html/csv' );
        header( 'Content-Disposition: attachment; filename="withdraw-' . $date . '.csv"' );

        $currency = get_option( 'woocommerce_currency' );

        foreach ( $this->withdraws as $withdraw ) {
            $email = dokan_get_seller_withdraw_mail( $withdraw->get_user_id() );

            echo esc_html( $email ) . ',';
            echo esc_html( $withdraw->get_amount() ) . ',';
            echo esc_html( $currency ) . "\n";
        }

        die();
    }
}
