<?php

namespace WeDevs\Dokan\Upgrade\Upgrades;

use WeDevs\Dokan\Abstracts\DokanUpgrader;
use WeDevs\Dokan\ReverseWithdrawal\InstallerHelper as ReverseWithdrawalInstallerHelper;

/**
 * @since DOKAN_SINCE
 */
class V_3_5_1 extends DokanUpgrader {

    /**
     * Create Reverse Withdrawal Table
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function install_advertisement_table() {
        ReverseWithdrawalInstallerHelper::create_reverse_withdrawal_table();
    }

    /**
     * This method will create reverse withdrawal base product
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function create_reverse_withdrawal_base_product() {
        ReverseWithdrawalInstallerHelper::create_reverse_withdrawal_base_product();
    }

    /**
     * Flush rewrite rules
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public static function flush_rewrite_rules() {
        dokan()->flush_rewrite_rules();
    }
}
