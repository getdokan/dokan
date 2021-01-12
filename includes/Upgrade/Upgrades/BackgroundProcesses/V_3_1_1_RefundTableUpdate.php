<?php

namespace WeDevs\Dokan\Upgrade\Upgrades\BackgroundProcesses;

use WeDevs\Dokan\Abstracts\DokanBackgroundProcesses;

/**
 * Dokan Product attribute author id updater class
 *
 * @since DOKAN_LITE_SINCE
 */
class V_3_1_1_RefundTableUpdate extends DokanBackgroundProcesses {

    /**
     * Action
     *
     * @since 3.1.1
     *
     * @var string
     */
    protected $action = 'dokan_upgrade_bp_3_1_1';

    /**
     * Perform updates
     *
     * @param mixed $item
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return mixed
     */
    public function task( $db_data ) {
        if ( empty( $db_data ) ) {
            return false;
        }

        global $wpdb;

        require_once ABSPATH . 'wp-admin/install-helper.php';

        if ( isset( $db_data['fields'] ) && is_array( $db_data['fields'] ) ) {

            // get required data from input array
            $table_name     = $wpdb->prefix . $db_data['table'];
            $col_type       = $db_data['type'];
            $null           = $db_data['null'];
            $is_null        = $null === 'NULL' ? 'YES' : 'NO';
            $default_value  = $db_data['default'];

            foreach ( $db_data['fields'] as $field ) {
                // Check the column.
                if ( ! check_column( $table_name, $field, $col_type ) ) {
                    $query = "ALTER TABLE $table_name MODIFY COLUMN $field $col_type";

                    // set null
                    if ( ! empty( $null ) ) {
                        $query .= " $null";
                    }

                    // set default
                    if ( ! empty( $default_value ) ) {
                        $query .= " DEFAULT '$default_value'";
                    }

                    // update db field
                    $q     = $wpdb->query( $query );

                    if ( $wpdb->last_error ) {
                        dokan_log( __( 'Upgrading db fields error: ', 'dokan-lite' ) . __FILE__ . ' ' . __LINE__ . ' ' . $wpdb->last_error );
                    }
                }
            }
        }

        return false;
    }
}
