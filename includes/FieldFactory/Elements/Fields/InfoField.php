<?php
/**
 * Info Field Element
 *
 * Display-only informational field (no input).
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class InfoField
 */
class InfoField extends AbstractField {

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
    protected string $variant = 'info';

    /**
     * Info type (info, warning, success, error).
     *
     * @var string
     */
    protected string $info_type = 'info';

    /**
     * Content/message to display.
     *
     * @var string
     */
    protected string $content = '';

    /**
     * Whether content contains HTML.
     *
     * @var bool
     */
    protected bool $allow_html = false;

    /**
     * Info is read-only by nature.
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
                'info_type',
                'content',
                'allow_html',
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function fill( array $config ): self {
        parent::fill( $config );

        // Use description as content if content not set
        if ( empty( $this->content ) && ! empty( $this->description ) ) {
            $this->content = $this->description;
        }

        return $this;
    }

    /**
     * Get info type.
     *
     * @return string
     */
    public function get_info_type(): string {
        return $this->info_type;
    }

    /**
     * Get content.
     *
     * @return string
     */
    public function get_content(): string {
        return $this->content;
    }

    /**
     * Check if HTML is allowed.
     *
     * @return bool
     */
    public function allows_html(): bool {
        return $this->allow_html;
    }

    /**
     * Get sanitized content.
     *
     * @return string
     */
    public function get_sanitized_content(): string {
        if ( $this->allow_html ) {
            return wp_kses_post( $this->content );
        }
        return esc_html( $this->content );
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        // Info fields don't need validation
        return [
            'valid'  => true,
            'errors' => [],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'info_type'  => $this->info_type,
                'content'    => $this->content,
                'allow_html' => $this->allow_html,
            ]
        );
    }
}
