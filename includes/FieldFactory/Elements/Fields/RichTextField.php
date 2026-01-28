<?php
/**
 * Rich Text Field Element
 *
 * WYSIWYG editor field (WordPress TinyMCE/Block Editor).
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

class RichTextField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'text';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'rich_text';

    /**
     * Editor type (tinymce, quicktags, both).
     *
     * @var string
     */
    protected string $editor_type = 'tinymce';

    /**
     * Editor height.
     *
     * @var int
     */
    protected int $editor_height = 300;

    /**
     * Enable media buttons.
     *
     * @var bool
     */
    protected bool $media_buttons = true;

    /**
     * Toolbar buttons configuration.
     *
     * @var array
     */
    protected array $toolbar = [];

    /**
     * Enable teeny mode (minimal editor).
     *
     * @var bool
     */
    protected bool $teeny = false;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'editor_type',
                'editor_height',
                'media_buttons',
                'toolbar',
                'teeny',
            ]
        );
    }

    /**
     * Get editor type.
     *
     * @return string
     */
    public function get_editor_type(): string {
        return $this->editor_type;
    }

    /**
     * Get editor height.
     *
     * @return int
     */
    public function get_editor_height(): int {
        return $this->editor_height;
    }

    /**
     * Check if media buttons are enabled.
     *
     * @return bool
     */
    public function has_media_buttons(): bool {
        return $this->media_buttons;
    }

    /**
     * Get toolbar configuration.
     *
     * @return array
     */
    public function get_toolbar(): array {
        return $this->toolbar;
    }

    /**
     * Check if teeny mode.
     *
     * @return bool
     */
    public function is_teeny(): bool {
        return $this->teeny;
    }

    /**
     * Get WordPress editor settings array.
     *
     * @return array
     */
    public function get_wp_editor_settings(): array {
        return [
            'media_buttons' => $this->media_buttons,
            'textarea_rows' => (int) ( $this->editor_height / 20 ),
            'teeny'         => $this->teeny,
            'tinymce'       => $this->editor_type === 'quicktags' ? false : true,
            'quicktags'     => $this->editor_type === 'tinymce' ? false : true,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'editor_type'   => $this->editor_type,
                'editor_height' => $this->editor_height,
                'media_buttons' => $this->media_buttons,
                'toolbar'       => $this->toolbar,
                'teeny'         => $this->teeny,
            ]
        );
    }
}
