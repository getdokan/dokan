<?php

namespace WeDevs\Dokan\Customizer;

use WP_Customize_Control;

/**
 * The radio image class.
 */
class HeadingControl extends WP_Customize_Control {

    /**
     * Declare the control type.
     *
     * @var string
     */
    public $type = 'dokan-heading';

    /**
     * Render the control's content.
     *
     * @see WP_Customize_Control::render_content()
     */
    protected function render_content() {
        ?>
        <?php if ( ! empty( $this->label ) ) { ?>
            <span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
        <?php } ?>

        <?php if ( ! empty( $this->description ) ) { ?>
            <span class="description customize-control-description"><?php echo $this->description; ?></span>
        <?php } ?>
        <?php
    }
}
