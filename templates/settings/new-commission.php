<?php
/**
 * Dokan new commission type ui ( Product price / Vendor sale / Product quantity )
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */

$admin_commissions    = get_user_meta( $args->ID, 'dokan_admin_percentage', true );
$currency_symbol      = get_woocommerce_currency_symbol();
$commission_i18n_data = [
    'flat'       => __( 'Flat', 'dokan' ),
    'percentage' => __( 'Percentage', 'dokan' ),
    'combine'    => __( 'Combined', 'dokan' ),
    'from'       => __( 'From', 'dokan' ),
    'to'         => __( 'To', 'dokan' ),
    'type'       => __( 'Type', 'dokan' ),
    'commission' => __( 'Commission', 'dokan' ),
    'currency'   => $currency_symbol,
];
?>


<tr class="new_commission_body dokan-new-commission dokan-hide">
    <th><?php esc_html_e( 'Admin Commission ', 'dokan' ); ?></th>
    <td class="new_commission_fields_body " id="new_commission_fields_body">
        <fieldset class="dokan-new-commission-wraper">
            <div class="dokan-new-commission-header dokan-new-commission-row">
                <div class="dokan-new-commission-col-from"><?php esc_html_e( $commission_i18n_data['from'] ); ?></div>
                <div class="dokan-new-commission-col-to"><?php esc_html_e( $commission_i18n_data['to'] ); ?></div>
                <div class="dokan-new-commission-col-ct"><?php esc_html_e( $commission_i18n_data['type'] ); ?></div>
                <div class="dokan-new-commission-col-commission"><?php esc_html_e( $commission_i18n_data['commission'] ); ?></div>
                <div class="dokan-new-commission-col-action"></div>
            </div>

            <span id="dokan-new-commissions-row-holder">
                <?php foreach( $admin_commissions as $key => $commission ) : ?>
                <div class="dokan-new-commission-content dokan-new-commission-row dokan-new-commission-row-number<?php echo esc_attr($key); ?>" data-row-number="<?php echo esc_attr($key); ?>">
                    <div class="dokan-new-commission-col-from">
                        <input name="dokan_from[]" class="dokan-commission-from-<?php echo esc_attr($key); ?>" readonly type="text" placeholder="0" value="<?php echo esc_attr($commission['from']);?>">
                    </div>
                    <div class="dokan-new-commission-col-to">
                        <input name="dokan_to[]" class="dokan-commission-to dokan-commission-to-<?php echo esc_attr($key); ?>" data-itemno="<?php echo esc_attr($key); ?>" value="<?php echo esc_attr($commission['to']);?>" type="number" placeholder="∞">
                        <span class="dokan-commission-tooltiptext dokan-commission-tooltiptext-to<?php echo esc_attr($key); ?>"></span>
                    </div>
                    <div class="dokan-new-commission-col-ct">
                        <select class="dokan-commission-type-select" data-rownumber="<?php echo esc_attr($key); ?>" name="dokan_commission_type[]">
                            <option <?php selected( $commission['commission_type'], 'flat' ) ?> value="flat"><?php esc_html_e( $commission_i18n_data['flat'] ); ?></option>
                            <option <?php selected( $commission['commission_type'], 'percentage' ) ?> value="percentage"><?php esc_html_e( $commission_i18n_data['percentage'] ); ?></option>
                            <option <?php selected( $commission['commission_type'], 'combine' ) ?> value="combine"><?php esc_html_e( $commission_i18n_data['combine'] ); ?></option>
                        </select>
                    </div>
                    <div class="dokan-new-commission-col-commission">
                        <div class="commission-inner-type commission-inner-type-percentage-<?php echo esc_attr($key); ?>" style="display: <?php echo $commission['commission_type'] === 'percentage' || $commission['commission_type'] === 'combine' ? 'block' : 'none' ?>;">
                            <input value="<?php echo esc_attr($commission['percentage']);?>" name="dokan_percentage[]" class="dokan-commission-percentage-<?php echo esc_attr($key); ?> dokan-commission-value" type="number"/>
                            <span class="commisson-indecator">%</span>
                        </div>
                        <div class="commission-inner-type-middle dokan-commission-middle-<?php echo esc_attr($key); ?>" style="display: <?php echo $commission['commission_type'] === 'combine' ? 'flex' : 'none' ?>;">
                            <span class="commission-inner-type-middle-text">+</span>
                        </div>
                        <div class="commission-inner-type commission-inner-type-flat-<?php echo esc_attr($key); ?>"  style="display: <?php echo $commission['commission_type'] === 'flat' || $commission['commission_type'] === 'combine' ? 'block' : 'none' ?>;">
                            <input value="<?php echo esc_attr($commission['flat']);?>" name="dokan_flat[]" class="dokan-commission-flat-<?php echo esc_attr($key); ?> dokan-commission-value" type="number"/>
                            <span class="commisson-indecator"><?php echo $currency_symbol; ?></span>
                        </div>
                    </div>
                    <div class="dokan-new-commission-col-action">
                        <span style="display: <?php echo ( count( $admin_commissions ) === $key + 1 || 0 === $key ) ? 'none' : 'block' ?>;" data-index="<?php echo esc_attr($key); ?>" class="dashicons dashicons-dismiss dokan-commission-row-delete"></span>
                    </div>
                </div>
                <?php endforeach; ?>
            </span>
        </fieldset>
    </td>
</tr>

<script>
    var dokan_commission_i18n_data = <?php echo json_encode( $commission_i18n_data ); ?>;
</script>

<?php
if ( ! empty( get_current_screen()->id ) && 'user-edit' === get_current_screen()->id ) {
    // Use minified libraries if SCRIPT_DEBUG is turned off
    $suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
    $version = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? time() : DOKAN_PRO_PLUGIN_VERSION;

    wp_enqueue_script(
        'dokan-commission',
        DOKAN_PRO_PLUGIN_ASSEST . '/js/dokan-commission-script' . $suffix . '.js',
        [ 'jquery' ],
        $version,
        true
    );

    wp_enqueue_style(
        'dokan-commission',
        DOKAN_PRO_PLUGIN_ASSEST . '/css/dokan-commission-style.css',
        [],
        $version,
    );
}