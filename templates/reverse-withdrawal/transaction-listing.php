<?php
/**
 * @since 3.5.1
 *
 * @var $transactions array
 */

use WeDevs\Dokan\ReverseWithdrawal\Helper as ReverseWithdrawalHelper;

?>
<?php if ( is_wp_error( $transactions ) ) : ?>
    <div class="dokan-alert dokan-alert-danger">
        <strong><?php echo wp_kses_post( $transactions->get_error_message() ); ?></strong>
    </div>
<?php else : ?>
    <table class="dokan-table dokan-table-striped">
        <tr>
            <th><?php esc_html_e( 'Transaction ID', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Date', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Transaction Type', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Note', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Debit', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Credit', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Balance', 'dokan-lite' ); ?></th>
        </tr>
        <?php
        // get current balance
        $current_balance = 0;
        // get items to be displayed
        $items[] = $transactions['balance'];
        $items   = ! empty( $transactions['items'] ) ? array_merge( $items, $transactions['items'] ) : $items;

        foreach ( $items as $transaction ) {
            $transaction = ReverseWithdrawalHelper::get_formated_transaction_data( $transaction, $current_balance, 'seller' )
            ?>
            <tr>
                <td>
                    <?php
                    // translators: 1) transaction url 2) transaction id
                    printf( '<a href="%1$s" target="_blank">%2$s</a>', esc_url( $transaction['trn_url'] ), esc_html( $transaction['trn_id'] ) )
                    ?>
                </td>
                <td><?php echo esc_html( $transaction['trn_date'] ); ?></td>
                <td><?php echo esc_html( $transaction['trn_type'] ); ?></td>
                <td><?php echo esc_html( $transaction['note'] ); ?></td>
                <td><?php echo $transaction['debit'] === '' ? '--' : wp_kses_post( wc_price( $transaction['debit'] ) ); ?></td>
                <td><?php echo $transaction['credit'] === '' ? '--' : wp_kses_post( wc_price( $transaction['credit'] ) ); ?></td>
                <td>
                    <?php echo $transaction['balance'] < 0 ? sprintf( '(%1$s)', wp_kses_post( wc_price( abs( $transaction['balance'] ) ) ) ) : wp_kses_post( wc_price( $transaction['balance'] ) ); ?>
                </td>
            </tr>
            <?php
        }
        if ( count( $items ) > 1 ) {
            ?>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><b><?php esc_html_e( 'Balance:', 'dokan-lite' ); ?></b></td>
                <td><b><?php echo wp_kses_post( wc_price( $current_balance ) ); ?></b></td>
            </tr>
            <?php
        } else {
            ?>
            <tr>
                <td colspan="7">
                    <?php esc_html_e( 'No transactions found!', 'dokan-lite' ); ?>
                </td>
            </tr>
            <?php
        }
        ?>
    </table>
<?php endif; ?>
