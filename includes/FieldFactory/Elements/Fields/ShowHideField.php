<?php
/**
 * Show/Hide Field Element
 *
 * Toggle visibility control field (similar to switch but for show/hide).
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

/**
 * Class ShowHideField
 */
class ShowHideField extends SwitchField {

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'show_hide';

    /**
     * Content to show/hide (selector or content ID).
     *
     * @var string
     */
    protected string $target_content = '';

    /**
     * Animation type (fade, slide, none).
     *
     * @var string
     */
    protected string $animation = 'fade';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'target_content',
                'animation',
            ]
        );
    }

    /**
     * Get target content.
     *
     * @return string
     */
    public function get_target_content(): string {
        return $this->target_content;
    }

    /**
     * Get animation type.
     *
     * @return string
     */
    public function get_animation(): string {
        return $this->animation;
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'target_content' => $this->target_content,
                'animation'      => $this->animation,
            ]
        );
    }
}
