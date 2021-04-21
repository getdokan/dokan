<div class="dokan-form-group dokan-product-type-container <?php echo esc_attr( $class ); ?>">
    <?php if ( 'sell_both' === $digital_mode || 'sell_digital' === $digital_mode ) : ?>
        <div class="content-half-part downloadable-checkbox">
            <label>
                <input type="checkbox" <?php checked( $is_downloadable, true ); ?> class="_is_downloadable" name="_downloadable" id="_downloadable"> <?php esc_html_e( 'Downloadable', 'dokan-lite' ); ?> <i class="fa fa-question-circle tips" aria-hidden="true" data-title="<?php esc_attr_e( 'Downloadable products give access to a file upon purchase.', 'dokan-lite' ); ?>"></i>
            </label>
        </div>
    <?php endif; ?>
    <div class="content-half-part virtual-checkbox">
        <label>
            <input type="checkbox" <?php checked( $is_virtual, true ); ?> class="_is_virtual" name="_virtual" id="_virtual"> <?php esc_html_e( 'Virtual', 'dokan-lite' ); ?> <i class="fa fa-question-circle tips" aria-hidden="true" data-title="<?php esc_attr_e( 'Virtual products are intangible and aren\'t shipped.', 'dokan-lite' ); ?>"></i>
        </label>
    </div>
    <div class="dokan-clearfix"></div>
</div>
