<?php
/**
 * Text field with copy-to-clipboard functionality.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

class CopyField extends TextField {

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'copy_field';

    /**
     * Button text for copy action.
     *
     * @var string
     */
    protected string $copy_button_text = '';

    /**
     * Success message after copy.
     *
     * @var string
     */
    protected string $copy_success_message = '';

    /**
     * Whether field is always read-only.
     *
     * @var bool
     */
    protected bool $read_only = true;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'copy_button_text',
                'copy_success_message',
            ]
        );
    }

    /**
     * Get copy button text.
     *
     * @return string
     */
    public function get_copy_button_text(): string {
        return ! empty( $this->copy_button_text )
            ? $this->copy_button_text
            : __( 'Copy', 'dokan-lite' );
    }

    /**
     * Get copy success message.
     *
     * @return string
     */
    public function get_copy_success_message(): string {
        return ! empty( $this->copy_success_message )
            ? $this->copy_success_message
            : __( 'Copied to clipboard!', 'dokan-lite' );
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'copy_button_text'     => $this->get_copy_button_text(),
                'copy_success_message' => $this->get_copy_success_message(),
            ]
        );
    }
}
