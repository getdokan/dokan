<?php
/**
 * Dokan new commission type ui ( Product price / Vendor sale / Product quantity )
 *
 * @since DOKAN_LITE_SINCE
 *
 * @package dokan
 */

$admin_commissions    = $args['admin_commissions'];

?>


<tr class="new_commission_body dokan-new-commission dokan-hide">
    <th><?php esc_html_e( 'Admin Commission ', 'dokan' ); ?></th>
    <td class="new_commission_fields_body " id="new_commission_fields_body">
        <fieldset class="dokan-new-commission-wraper">
            <div class="dokan-new-commission-header dokan-new-commission-row">
                <div class="dokan-new-commission-col-from"><?php echo esc_html_e( 'From', 'dokan' ); ?></div>
                <div class="dokan-new-commission-col-to"><?php echo esc_html_e( 'To', 'dokan' ); ?></div>
                <div class="dokan-new-commission-col-ct"><?php echo esc_html_e( 'Type', 'dokan' ); ?></div>
                <div class="dokan-new-commission-col-commission"><?php echo esc_html_e( 'Commission', 'dokan' ); ?></div>
                <div class="dokan-new-commission-col-action"></div>
            </div>

            <span id="dokan-new-commissions-row-holder">
                <?php foreach( $admin_commissions as $key => $commission ) : ?>
                <div class="dokan-new-commission-content dokan-new-commission-row dokan-new-commission-row-number<?php echo esc_attr( $key ); ?>" data-row-number="<?php echo esc_attr( $key ); ?>">
                    <div class="dokan-new-commission-col-from">
                        <input name="dokan_from[]" class="dokan-commission-from-<?php echo esc_attr( $key ); ?>" readonly type="text" placeholder="0" value="<?php echo esc_attr( $commission['from'] );?>">
                    </div>
                    <div class="dokan-new-commission-col-to">
                        <input name="dokan_to[]" class="dokan-validate-number dokan-commission-to dokan-commission-to-<?php echo esc_attr( $key ); ?>" data-itemno="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $commission['to'] );?>" type="text" placeholder="∞">
                        <span class="dokan-commission-tooltiptext dokan-commission-tooltiptext-to<?php echo esc_attr( $key ); ?>"></span>
                    </div>
                    <div class="dokan-new-commission-col-ct">
                        <select class="dokan-commission-type-select" data-rownumber="<?php echo esc_attr( $key ); ?>" name="dokan_commission_type[]">
                            <option <?php selected( $commission['commission_type'], 'flat' ) ?> value="flat"><?php esc_html_e( 'Flat', 'dokan' ); ?></option>
                            <option <?php selected( $commission['commission_type'], 'percentage' ) ?> value="percentage"><?php esc_html_e( 'Percentage', 'dokan' ) ; ?></option>
                            <option <?php selected( $commission['commission_type'], 'combine' ) ?> value="combine"><?php esc_html_e( 'Combined', 'dokan' ); ?></option>
                        </select>
                    </div>
                    <div class="dokan-new-commission-col-commission">
                        <div class="commission-inner-type commission-inner-type-percentage-<?php echo esc_attr( $key ); ?>" style="display: <?php echo $commission['commission_type'] === 'percentage' || $commission['commission_type'] === 'combine' ? 'block' : 'none' ?>;">
                            <input value="<?php echo esc_attr( $commission['percentage'] );?>" name="dokan_percentage[]" class="dokan-validate-number dokan-commission-percentage-<?php echo esc_attr( $key ); ?> dokan-commission-value" type="text"/>
                            <span class="commisson-indecator">%</span>
                        </div>
                        <div class="commission-inner-type-middle dokan-commission-middle-<?php echo esc_attr( $key ); ?>" style="display: <?php echo $commission['commission_type'] === 'combine' ? 'flex' : 'none' ?>;">
                            <span class="commission-inner-type-middle-text">+</span>
                        </div>
                        <div class="commission-inner-type commission-inner-type-flat-<?php echo esc_attr( $key ); ?>"  style="display: <?php echo $commission['commission_type'] === 'flat' || $commission['commission_type'] === 'combine' ? 'block' : 'none' ?>;">
                            <input value="<?php echo esc_attr( $commission['flat'] );?>" name="dokan_flat[]" class="dokan-validate-number dokan-commission-flat-<?php echo esc_attr( $key ); ?> dokan-commission-value" type="text"/>
                            <span class="commisson-indecator"><?php echo get_woocommerce_currency_symbol(); ?></span>
                        </div>
                    </div>
                    <div class="dokan-new-commission-col-action">
                        <span style="display: <?php echo ( count( $admin_commissions ) === $key + 1 || 0 === $key ) ? 'none' : 'block' ?>;" data-index="<?php echo esc_attr( $key ); ?>" class="dashicons dashicons-dismiss dokan-commission-row-delete"></span>
                    </div>
                </div>
                <?php endforeach; ?>
            </span>
        </fieldset>
    </td>
</tr>