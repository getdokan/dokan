<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\ReverseWithdrawal\InstallerHelper as ReverseWithdrawalInstallerHelper;

/**
 * @since 3.5.1
 */
class V_3_5_1 extends DokanUpgrader {

    /**
     * Create Reverse Withdrawal Table
     *
     * @since 3.5.1
     *
     * @return void
     */
    public static function install_advertisement_table() {
        ReverseWithdrawalInstallerHelper::create_reverse_withdrawal_table();
    }

    /**
     * This method will create reverse withdrawal base product
     *
     * @since 3.5.1
     *
     * @return void
     */
    public static function create_reverse_withdrawal_base_product() {
        ReverseWithdrawalInstallerHelper::create_reverse_withdrawal_base_product();
    }

    /**
     * Flush rewrite rules
     *
     * @since 3.5.1
     *
     * @return void
     */
    public static function flush_rewrite_rules() {
        dokan()->flush_rewrite_rules();
    }
}
