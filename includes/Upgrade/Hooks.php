<?php

namespace WeDevs\Dokan\Upgrade;

use WeDevs\Dokan\Commission\Upugrader\Update_Category_Commission;
use WeDevs\Dokan\Commission\Upugrader\Update_Product_Commission;
use WeDevs\Dokan\Commission\Upugrader\Update_Vendor_Commission;

class Hooks {

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @return void
     */
    public function __construct() {
        add_filter( 'dokan_upgrade_is_upgrade_required', [ Upgrades::class, 'is_upgrade_required' ], 1 );
        add_filter( 'dokan_upgrade_upgrades', [ Upgrades::class, 'get_upgrades' ], 1 );
        add_filter( 'dokan_admin_notices', [ AdminNotice::class, 'show_notice' ] );
        add_action( 'wp_ajax_dokan_do_upgrade', [ AdminNotice::class, 'do_upgrade' ] );
        add_action( 'dokan_upgrade_is_not_required', [ Upgrades::class, 'update_db_dokan_version' ] );
        add_action( 'dokan_upgrade_finished', [ Upgrades::class, 'update_db_dokan_version' ] );

        $p_scheduler = new Update_Product_Commission();
        $v_scheduler = new Update_Vendor_Commission();
        $c_scheduler = new Update_Category_Commission();

        $p_scheduler->init_hooks();
        $v_scheduler->init_hooks();
        $c_scheduler->init_hooks();
    }
}
