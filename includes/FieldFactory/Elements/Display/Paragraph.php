<?php
/**
 * Paragraph Element
 *
 * Text paragraph display element.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Display
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Display;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractElement;

class Paragraph extends AbstractElement {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'paragraph';

    /**
     * Text content.
     *
     * @var string
     */
    protected string $content = '';

    /**
     * Text variant (default, muted, code, lead, small).
     *
     * @var string
     */
    protected string $text_variant = 'default';

    /**
     * Whether content contains HTML.
     *
     * @var bool
     */
    protected bool $allow_html = true;

    /**
     * Text alignment (left, center, right, justify).
     *
     * @var string
     */
    protected string $text_align = 'left';

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'display';
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'content',
                'text_variant',
                'allow_html',
                'text_align',
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function fill( array $config ): self {
        parent::fill( $config );

        // Use title as content if content not set
        if ( empty( $this->content ) && ! empty( $this->title ) ) {
            $this->content = $this->title;
        }

        return $this;
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
     * Get text variant.
     *
     * @return string
     */
    public function get_text_variant(): string {
        return $this->text_variant;
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
     * Get text alignment.
     *
     * @return string
     */
    public function get_text_align(): string {
        return $this->text_align;
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'content'      => $this->content,
                'text_variant' => $this->text_variant,
                'allow_html'   => $this->allow_html,
                'text_align'   => $this->text_align,
            ]
        );
    }
}
