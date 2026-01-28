<?php
/**
 * File Upload Field Element
 *
 * File/media upload field with WordPress Media Library integration.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class FileUploadField
 */
class FileUploadField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'media';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'file_upload';

    /**
     * Allowed file types (mime types).
     *
     * @var array
     */
    protected array $allowed_types = [];

    /**
     * Maximum file size in bytes.
     *
     * @var int|null
     */
    protected ?int $max_file_size = null;

    /**
     * Allow multiple files.
     *
     * @var bool
     */
    protected bool $multiple = false;

    /**
     * Maximum number of files (when multiple).
     *
     * @var int|null
     */
    protected ?int $max_files = null;

    /**
     * Use WordPress Media Library.
     *
     * @var bool
     */
    protected bool $use_media_library = true;

    /**
     * Button text.
     *
     * @var string
     */
    protected string $button_text = '';

    /**
     * Preview type (image, icon, none).
     *
     * @var string
     */
    protected string $preview_type = 'image';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'allowed_types',
                'max_file_size',
                'multiple',
                'max_files',
                'use_media_library',
                'button_text',
                'preview_type',
            ]
        );
    }

    /**
     * Get allowed types.
     *
     * @return array
     */
    public function get_allowed_types(): array {
        return $this->allowed_types;
    }

    /**
     * Get max file size.
     *
     * @return int|null
     */
    public function get_max_file_size(): ?int {
        return $this->max_file_size;
    }

    /**
     * Check if multiple files allowed.
     *
     * @return bool
     */
    public function is_multiple(): bool {
        return $this->multiple;
    }

    /**
     * Get max files count.
     *
     * @return int|null
     */
    public function get_max_files(): ?int {
        return $this->max_files;
    }

    /**
     * Check if using media library.
     *
     * @return bool
     */
    public function uses_media_library(): bool {
        return $this->use_media_library;
    }

    /**
     * Get button text.
     *
     * @return string
     */
    public function get_button_text(): string {
        return ! empty( $this->button_text )
            ? $this->button_text
            : __( 'Upload File', 'dokan-lite' );
    }

    /**
     * Get preview type.
     *
     * @return string
     */
    public function get_preview_type(): string {
        return $this->preview_type;
    }

    /**
     * Get accept attribute for HTML input.
     *
     * @return string
     */
    public function get_accept_attribute(): string {
        if ( empty( $this->allowed_types ) ) {
            return '';
        }
        return implode( ',', $this->allowed_types );
    }

    /**
     * {@inheritdoc}
     */
    public function get_value( array $item = [] ) {
        $value = parent::get_value( $item );

        if ( $this->multiple ) {
            return is_array( $value ) ? $value : [];
        }

        return $value;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value_formatted( array $item = [] ): string {
        $value = $this->get_value( $item );

        if ( $this->multiple && is_array( $value ) ) {
            return sprintf(
                /* translators: %d: file count */
                _n( '%d file', '%d files', count( $value ), 'dokan-lite' ),
                count( $value )
            );
        }

        if ( is_numeric( $value ) ) {
            $attachment = get_post( $value );
            return $attachment ? $attachment->post_title : '';
        }

        return (string) $value;
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        $result = parent::validate( $item );
        $value  = $this->get_value( $item );

        if ( $this->multiple && is_array( $value ) ) {
            $count = count( $value );

            if ( $this->max_files !== null && $count > $this->max_files ) {
                $this->errors['max_files'] = [
                    'type'    => 'invalid',
                    'message' => sprintf(
                        /* translators: %d: max files */
                        __( 'Maximum %d files allowed.', 'dokan-lite' ),
                        $this->max_files
                    ),
                ];
            }
        }

        return [
            'valid'  => empty( $this->errors ),
            'errors' => $this->errors,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'allowed_types'     => $this->allowed_types,
                'max_file_size'     => $this->max_file_size,
                'multiple'          => $this->multiple,
                'max_files'         => $this->max_files,
                'use_media_library' => $this->use_media_library,
                'button_text'       => $this->get_button_text(),
                'preview_type'      => $this->preview_type,
            ]
        );
    }
}
