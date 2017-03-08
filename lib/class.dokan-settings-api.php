<?php
/**
 * Dokan Settings API wrapper class
 */
if ( !class_exists( 'WeDevs_Settings_API' ) ) {
    require_once DOKAN_LIB_DIR . '/class.settings-api.php';
}

if ( !class_exists( 'Dokan_Settings_API' ) ):
class Dokan_Settings_API extends WeDevs_Settings_API {
    /**
     * Callback function for radio_image type fields
     *
     * @param array $args
     *
     * @since 2.5
     * @return void
     */
    function callback_radio_image( $args ) {
        $value = $this->get_option( $args['id'], $args['section'], $args['std'] );
        $id = $args['section'] . '_' . $args['id'];

        if ( ! empty( $args['options'] ) ) {
            echo '<div class="dokan-settings-radio-image-container">';

            foreach ( $args['options'] as $name => $image ) {
            ?>
                <div class="dokan-settings-radio-image<?php echo ( $name === $value ) ? ' active' : ' not-active'; ?>">
                    <img src="<?php echo $image; ?>">

                    <span class="current-option-indicator"><span class="dashicons dashicons-yes"></span> <?php _e( 'Active', 'dokan-lite' ); ?></span>

                    <span class="active-option">
                        <button class="button button-primary button-hero" type="button" data-template="<?php echo $name; ?>" data-input="<?php echo $id; ?>">
                            <?php _e( 'Select', 'dokan-lite' ); ?>
                        </button>
                    </span>
                </div>
            <?php
            }

            echo '</div>';
        }

        printf( '<input type="hidden" id="%1$s_%2$s" name="%1$s[%2$s]" value="%3$s" />', $args['section'], $args['id'], $value );
    }
}

endif;