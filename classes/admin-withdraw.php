<?php

/**
*  Dokan Admin withdraw class
*
*  Manupulate all withdraw functionality
*  in admin backend
*
*  @author weDevs <info@wedevs>
*
*  @since 2.4
*
*  @package dokan
*/
class Dokan_Admin_Withdraw extends Dokan_Withdraw {

    /**
     * Initializes the Dokan_Admin_Withdraw class
     *
     * Checks for an existing Dokan_Admin_Withdraw instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Admin_Withdraw();
        }

        return $instance;
    }

    /**
     * Bulk action handler
     *
     * @return void admin
     */
    function bulk_action_handler() {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        if ( ! isset( $_POST['dokan_withdraw_bulk'] ) ) {
            return;
        }

        $bulk_action = $_POST['dokan_withdraw_bulk'];

        if ( ! isset( $_POST['id'] )  ) {
            return;
        }

        //if id empty then empty value return
        if ( ! is_array( $_POST['id'] ) && ! count( $_POST['id'] ) ) {
            return;
        }

        $withdraw_ids = implode( "','", $_POST['id'] );
        $status = $_POST['status_page'];

        switch ( $bulk_action ) {
        case 'paypal':
            $this->generate_csv( $withdraw_ids );
            break;

        case 'delete':

            foreach ( $_POST['id'] as $withdraw_id ) {
                $this->delete_withdraw( $withdraw_id );
            }

            wp_redirect( admin_url( 'admin.php?page=dokan-withdraw&message=trashed&status=' . $status ) );
            die();

            break;

        case 'cancel':

            foreach ( $_POST['id'] as $key => $withdraw_id ) {
                $user_id = $_POST['user_id'][$key];
                $amount  = $_POST['amount'][$key];
                $method  = $_POST['method'][$key];
                $note    = $_POST['note'][$key];

                Dokan_Email::init()->withdraw_request_cancel( $user_id, $amount, $method, $note );
                $this->update_status( $withdraw_id, $user_id, 2 );
            }

            wp_redirect( admin_url( 'admin.php?page=dokan-withdraw&message=cancelled&status=' . $status ) );
            die();

            break;

        case 'approve':

            foreach ( $_POST['id'] as $key => $withdraw_id ) {
                $user_id = $_POST['user_id'][$key];
                $amount  = $_POST['amount'][$key];
                $method  = $_POST['method'][$key];

                Dokan_Email::init()->withdraw_request_approve( $user_id, $amount, $method );
                $this->update_status( $withdraw_id, $user_id, 1 );
            }

            wp_redirect( admin_url( 'admin.php?page=dokan-withdraw&message=approved&status=' . $status ) );

            break;

        case 'pending':

            foreach ( $_POST['id'] as $key => $withdraw_id ) {
                $this->update_status( $withdraw_id, $_POST['user_id'][$key], 0 );
            }

            wp_redirect( admin_url( 'admin.php?page=dokan-withdraw&message=pending&status=' . $status ) );

            break;
        }


    }

    /**
     * Export withdraws as CSV format
     *
     * @param string  $withdraw_ids
     *
     * @return void admin
     */
    function generate_csv( $withdraw_ids ) {
        global $wpdb;

        $result = $wpdb->get_results(
            "SELECT * FROM {$wpdb->dokan_withdraw}
            WHERE id in('$withdraw_ids')"
        );

        if ( ! $result ) {
            return;
        }

        foreach ( $result as $key => $obj ) {

            if ( $obj->method != 'paypal' ) {
                continue;
            }

            $data[] = array(
                'email'    => dokan_get_seller_withdraw_mail( $obj->user_id ),
                'amount'   => $obj->amount,
                'currency' => get_option( 'woocommerce_currency' )
            );

        }

        if ( $data ) {

            header( 'Content-type: html/csv' );
            header( 'Content-Disposition: attachment; filename="withdraw-'.date( 'd-m-y' ).'.csv"' );

            foreach ( $data as $fields ) {
                echo $fields['email']. ',';
                echo $fields['amount']. ',';
                echo $fields['currency'] . "\n";
            }

            die();
        }
    }

    /**
     * Withdraw listing for admin
     *
     * @param  string  $status
     *
     * @return void admin
     */
    function admin_withdraw_list( $status ) {
        $pagenum = isset( $_GET['paged'] ) ? absint( $_GET['paged'] ) : 1;
        $limit   = 20;
        $offset  = ( $pagenum - 1 ) * $limit;
        $result  = $this->get_withdraw_requests( '', $this->get_status_code( $status ), $limit, $offset );
        ?>

        <?php if ( isset( $_GET['message'] ) ) {
            $message = '';

            switch ( $_GET['message'] ) {
            case 'trashed':
                $message = __( 'Requests Deleted!', 'dokan' );
                break;

            case 'cancelled':
                $message = __( 'Requests Cancelled!', 'dokan' );
                break;

            case 'approved':
                $message = __( 'Requests Approved!', 'dokan' );
                break;
            }

            if ( ! empty( $message ) ) {
                ?>
                <div class="updated">
                    <p><strong><?php echo $message; ?></strong></p>
                </div>
                <?php
            }
        } ?>
        <form method="post" action="" id="dokan-admin-withdraw-action">
            <?php wp_nonce_field( 'dokan_withdraw_admin_bulk_action', 'dokan_withdraw_admin_bulk_action_nonce' ); ?>

            <table class="widefat withdraw-table">
                <thead>
                    <tr>
                        <td class="check-column">
                            <input type="checkbox" class="dokan-withdraw-allcheck">
                        </td>
                        <th><?php _e( 'User Name', 'dokan' ); ?></th>
                        <th><?php _e( 'Amount', 'dokan' ); ?></th>
                        <th><?php _e( 'Method', 'dokan' ); ?></th>
                        <th><?php _e( 'Method Details', 'dokan' ); ?></th>
                        <th><?php _e( 'Note', 'dokan' ); ?></th>
                        <th><?php _e( 'IP', 'dokan' ); ?></th>
                        <th><?php _e( 'Date', 'dokan' ); ?></th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <td class="check-column">
                            <input type="checkbox" class="dokan-withdraw-allcheck">
                        </td>
                        <th><?php _e( 'User Name', 'dokan' ); ?></th>
                        <th><?php _e( 'Amount', 'dokan' ); ?></th>
                        <th><?php _e( 'Method', 'dokan' ); ?></th>
                        <th><?php _e( 'Method Details', 'dokan' ); ?></th>
                        <th><?php _e( 'Note', 'dokan' ); ?></th>
                        <th><?php _e( 'IP', 'dokan' ); ?></th>
                        <th><?php _e( 'Date', 'dokan' ); ?></th>
                    </tr>
                </tfoot>

        <?php
        if ( $result ) {
            $count = 0;
            foreach ( $result as $key => $row ) {
                $user_data  = get_userdata( $row->user_id );
                $store_info = dokan_get_store_info( $row->user_id );
                    ?>
                    <tr class="<?php echo ( $count % 2 ) == 0 ? 'alternate': 'odd'; ?>">

                        <th class="check-column">
                            <input type="checkbox" name="id[<?php echo $row->id;?>]" value="<?php echo $row->id;?>">
                            <input type="hidden" name="user_id[<?php echo $row->id;?>]" value="<?php echo $row->user_id; ?>">
                            <input type="hidden" name="method[<?php echo $row->id;?>]" value="<?php echo esc_attr( $row->method ); ?>">
                            <input type="hidden" name="amount[<?php echo $row->id;?>]" value="<?php echo esc_attr( $row->amount ); ?>">
                        </th>
                        <td>
                            <strong><a href="<?php echo admin_url( 'user-edit.php?user_id=' . $user_data->ID ); ?>"><?php echo $user_data->user_login; ?></a></strong>
                            <div class="row-actions">
                                <?php if ( $status == 'pending' ) { ?>

                                    <span class="edit"><a href="#" class="dokan-withdraw-action" data-status="approve" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Approve', 'dokan' ); ?></a> | </span>
                                    <span class="edit"><a href="#" class="dokan-withdraw-action" data-status="cancel" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Cancel', 'dokan' ); ?></a></span>

                                <?php } elseif ( $status == 'completed' ) { ?>

                                    <span class="edit"><a href="#" class="dokan-withdraw-action" data-status="cancel" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Cancel', 'dokan' ); ?></a> | </span>
                                    <span class="edit"><a href="#" class="dokan-withdraw-action" data-status="pending" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Pending', 'dokan' ); ?></a></span>

                                <?php } elseif ( $status == 'cancelled' ) { ?>

                                    <span class="edit"><a href="#" class="dokan-withdraw-action" data-status="approve" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Approve', 'dokan' ); ?></a> | </span>
                                    <span class="edit"><a href="#" class="dokan-withdraw-action" data-status="pending" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Pending', 'dokan' ); ?></a></span>

                                <?php } ?>

                                <?php if ( $result ) { ?>
                                    <span class="trash"> | <a href="#" class="dokan-withdraw-action" data-status="delete" data-withdraw_id = "<?php echo $row->id; ?>"><?php _e( 'Delete', 'dokan' ); ?></a></span>

                                <?php } ?>
                            </div>
                        </td>
                        <td><?php echo wc_price( $row->amount ); ?></td>
                        <td><?php echo dokan_withdraw_get_method_title( $row->method ); ?></td>
                        <td>
                            <?php
                            if ( $row->method != 'bank' ) {
                                if ( isset( $store_info['payment'][$row->method] ) ) {
                                    echo $store_info['payment'][$row->method]['email'];
                                }
                            } elseif ( $row->method == 'bank' ) {
                                echo dokan_get_seller_bank_details( $row->user_id );
                            }
                            ?>
                        </td>
                        <td>
                            <div class="dokan-add-note">
                                <div class="note-display">
                                    <p class="ajax_note"><?php echo $row->note; ?></p>

                                    <div class="row-actions">
                                        <a href="#" class="dokan-note-field"><?php _e( 'Add note', 'dokan' ); ?></a>
                                    </div>
                                </div>

                                <div class="note-form" style="display: none;">
                                    <p><input type="text" class="dokan-note-text" name="note[<?php echo $row->id;?>]" value="<?php echo esc_attr( $row->note ); ?>"></p>
                                    <a class="dokan-note-submit button" data-id=<?php echo $row->id; ?> href="#" ><?php _e( 'Save', 'dokan' ); ?></a>
                                    <a href="#" class="dokan-note-cancel"><?php _e( 'cancel', 'dokan' ); ?></a>
                                </div>
                            </div>

                        </td>
                        <td><?php echo $row->ip; ?></td>
                        <td><?php echo date_i18n( 'M j, Y g:ia', strtotime( $row->date ) ); ?></td>
                    </tr>
                    <?php
                $count++;
            }

        } else {
            ?>
                <tr>
                    <td colspan="8">
                        <?php _e( 'No results found', 'dokan' ) ?>
                    </td>
                </tr>
                <?php
            }
            ?>
            </table>

            <div class="tablenav bottom">

                <div class="alignleft actions bulkactions">
                    <select name="dokan_withdraw_bulk">
                        <option value="-1" selected="selected"><?php _e( 'Bulk Actions', 'dokan' ); ?></option>

                        <?php if ( $status == 'pending' ) { ?>

                            <option value="approve"><?php _e( 'Approve Requests', 'dokan' ); ?></option>
                            <option value="cancel"><?php _e( 'Mark as Cancelled', 'dokan' ); ?></option>

                        <?php } elseif ( $status == 'completed' ) { ?>

                            <option value="cancel"><?php _e( 'Mark as Cancelled', 'dokan' ); ?></option>
                            <option value="pending"><?php _e( 'Mark Pending', 'dokan' ); ?></option>

                        <?php } elseif ( $status == 'cancelled' ) { ?>

                            <option value="approve"><?php _e( 'Approve Requests', 'dokan' ); ?></option>
                            <option value="pending"><?php _e( 'Mark Pending', 'dokan' ); ?></option>

                        <?php } ?>

                        <?php if ( $result ) { ?>
                            <option value="delete"><?php _e( 'Delete', 'dokan' ); ?></option>
                            <option value="paypal"><?php _e( 'Download PayPal mass payment file', 'dokan' ); ?></option>
                        <?php } ?>
                    </select>

                    <input type="hidden" name="status_page" value="<?php echo $status; ?>">
                    <input type="submit" name="" id="doaction2" class="button button-primary" value="<?php esc_attr_e( 'Apply', 'dokan' ); ?>">
                </div>

                <?php if ( $result ) {
                    $counts = dokan_get_withdraw_count();
                    $num_of_pages = ceil( $counts[$status] / $limit );
                    $page_links = paginate_links( array(
                        'base'      => add_query_arg( 'paged', '%#%' ),
                        'format'    => '',
                        'prev_text' => __( '&laquo;', 'aag' ),
                        'next_text' => __( '&raquo;', 'aag' ),
                        'total'     => $num_of_pages,
                        'current'   => $pagenum
                    ) );

                    if ( $page_links ) {
                        echo '<div class="tablenav-pages">' . $page_links . '</div>';
                    }
                } ?>
            </div>

        </form>
        <?php $ajax_url = admin_url('admin-ajax.php'); ?>
        <style type="text/css">
            .withdraw-table {
                margin-top: 10px;
            }

            .withdraw-table td, .withdraw-table th {
                vertical-align: top;
            }

            .custom-spinner {
                background: url('images/spinner-2x.gif') no-repeat;
                background-position: 43% 9px;
                background-size: 20px 20px;
                opacity: .4;
                filter: alpha(opacity=40);
                width: 20px;
                height: 20px;
            }
        </style>
        <script>
            (function($){
                $(document).ready(function(){
                    var url = "<?php echo $ajax_url; ?>";

                    $('#dokan-admin-withdraw-action').on('click', 'a.dokan-withdraw-action', function(e) {
                        e.preventDefault();
                        var self = $(this);

                        self.closest( 'tr' ).addClass('custom-spinner');
                        data = {
                            action: 'dokan_withdraw_form_action',
                            formData : $('#dokan-admin-withdraw-action').serialize(),
                            status: self.data('status') ,
                            withdraw_id : self.data( 'withdraw_id' )
                        }

                        $.post(url, data, function( resp ) {

                            if( resp.success ) {
                                self.closest( 'tr' ).removeClass('custom-spinner');
                                window.location = resp.data.url;
                            } else {
                                self.closest( 'tr' ).removeClass('custom-spinner');
                                alert( 'Something wrong' );
                            }
                        });

                    });
                });
            })(jQuery)
        </script>
        <?php

        $this->add_note_script();
    }

    /**
     * JS codes for adding note on a withdraw requst
     *
     * @return void admin
     */
    function add_note_script() {
        ?>
        <script type="text/javascript">
            jQuery(function($) {
                var dokan_admin = {
                    init: function() {
                        $('div.dokan-add-note').on('click', 'a.dokan-note-field', this.addnote);
                        $('div.dokan-add-note').on('click', 'a.dokan-note-cancel', this.cancel);
                        $('div.dokan-add-note').on('click', 'a.dokan-note-submit', this.updateNote);
                    },

                    updateNote: function(e) {
                        e.preventDefault();

                        var self = $(this),
                            form_wrap = self.closest('.note-form'),
                            row_id = self.data('id'),
                            note = form_wrap.find('input.dokan-note-text').val(),
                            data = {
                                'action': 'note',
                                'row_id': row_id,
                                'note': note,
                            };

                        $.post( '<?php echo admin_url( 'admin-ajax.php' ); ?>', data, function(resp) {
                            if ( resp.success ) {
                                form_wrap.hide();

                                var display = form_wrap.siblings('.note-display');
                                display.find('p.ajax_note').text(resp.data['note']);
                                display.show();
                            }
                        });
                    },

                    cancel: function(e) {
                        e.preventDefault();

                        var display = $(this).closest('.note-form');
                        display.slideUp();
                        display.siblings('.note-display').slideDown();
                    },

                    addnote: function(e) {
                        e.preventDefault();

                        var display = $(this).closest('.note-display');
                        display.slideUp();
                        display.siblings('.note-form').slideDown();
                    }
                };

                dokan_admin.init();
            });
        </script>
        <?php
    }

}