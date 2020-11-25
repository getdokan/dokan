<?php // @codingStandardsIgnoreLine.

namespace WeDevs\Dokan\Customizer;

/**
 * The radio image class.
 */
class RadioImageControl extends \WP_Customize_Control {

    /**
     * Declare the control type.
     *
     * @var string
     */
    public $type = 'dokan-radio-image';

    /**
     * Enqueue scripts and styles for the custom control.
     */
    public function enqueue() {
        wp_enqueue_script( 'jquery-ui-button' );

        add_action( 'customize_controls_print_styles', [ $this, 'print_inline_style' ] );
    }

    /**
     * Print radio image style
     *
     * @return void
     */
    public static function print_inline_style() {
        ?>
        <style type="text/css">
        .customize-control-dokan-radio-image img,
        .customize-control-dokan-radio-image svg {
            height: 50px;
            width: auto;
            margin-right: 5px;
            opacity: 0.6;
            border-radius: 3px;
        }

        .customize-control-dokan-radio-image .ui-state-active img,
        .customize-control-dokan-radio-image .ui-state-active svg {
            opacity: 1;
            border: 2px solid #0285bb;
            background-color: #fff;
        }
        </style>
		<?php
    }

    /**
     * Render the control to be displayed in the Customizer.
     */
    public function render_content() {
        if ( empty( $this->choices ) ) {
            return;
        }

        $name = '_customize-radio-' . $this->id;
        ?>

		<span class="customize-control-title">
			<?php echo esc_attr( $this->label ); ?>
		</span>

		<?php if ( ! empty( $this->description ) ) { ?>
			<span class="description customize-control-description"><?php echo esc_html( $this->description ); ?></span>
		<?php } ?>

		<div id="input_<?php echo esc_attr( $this->id ); ?>" class="image">
			<?php foreach ( $this->choices as $value => $label ) { ?>
				<input class="image-select" type="radio" value="<?php echo esc_attr( $value ); ?>" id="<?php echo esc_attr( $this->id . $value ); ?>" name="<?php echo esc_attr( $name ); ?>"
					<?php
                    $this->link();
                    checked( $this->value(), $value );
                    ?>
				>
                    <label for="<?php echo esc_attr( $this->id ) . esc_attr( $value ); ?>">
                        <?php
                        if ( isset( $label['svg'] ) ) {
                            echo $label['svg'];
                        } else {
                            ?>
                            <img src="<?php echo esc_html( $label['src'] ); ?>" alt="<?php echo esc_attr( $label['label'] ); ?>" title="<?php echo esc_attr( $label['label'] ); ?>">
                            <?php
                        }
                        ?>
					</label>
				</input>
			<?php } ?>
		</div>

		<script>jQuery(document).ready(function($) { $( '[id="input_<?php echo esc_attr( $this->id ); ?>"]' ).buttonset(); });</script>
		<?php
    }
}
