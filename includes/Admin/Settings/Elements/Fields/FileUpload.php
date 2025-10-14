<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

/**
 * File Upload Field - A field for uploading files and saving the file URL.
 */
class FileUpload extends Text {

    /**
     * Input type for this field.
     *
     * @var string $input_type Input type.
     */
    protected $input_type = 'file_upload';

    /**
     * Allowed file types.
     *
     * @var array $allowed_types Allowed file types.
     */
    protected $allowed_types = array();

    /**
     * Maximum file size in bytes.
     *
     * @var int $max_file_size Maximum file size.
     */
    protected $max_file_size = 0;

    /**
     * Whether to allow multiple file uploads.
     *
     * @var bool $multiple Whether to allow multiple files.
     */
    protected $multiple = false;

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get allowed file types.
     *
     * @return array
     */
    public function get_allowed_types(): array {
        return $this->allowed_types;
    }

    /**
     * Set allowed file types.
     *
     * @param array $allowed_types Allowed file types.
     *
     * @return FileUpload
     */
    public function set_allowed_types( array $allowed_types ): FileUpload {
        $this->allowed_types = $allowed_types;

        return $this;
    }

    /**
     * Get maximum file size.
     *
     * @return int
     */
    public function get_max_file_size(): int {
        return $this->max_file_size;
    }

    /**
     * Set maximum file size.
     *
     * @param int $max_file_size Maximum file size in bytes.
     *
     * @return FileUpload
     */
    public function set_max_file_size( int $max_file_size ): FileUpload {
        $this->max_file_size = $max_file_size;

        return $this;
    }

    /**
     * Check if multiple files are allowed.
     *
     * @return bool
     */
    public function is_multiple(): bool {
        return $this->multiple;
    }

    /**
     * Set whether to allow multiple files.
     *
     * @param bool $multiple Whether to allow multiple files.
     *
     * @return FileUpload
     */
    public function set_multiple( bool $multiple ): FileUpload {
        $this->multiple = $multiple;

        return $this;
    }

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        // If data is empty, it's valid (optional field)
        if ( empty( $data ) ) {
            return true;
        }

        // Check if it's a valid URL
        if ( filter_var( $data, FILTER_VALIDATE_URL ) ) {
            return true;
        }

        // Check if it's a valid file path
        if ( is_string( $data ) && file_exists( $data ) ) {
            return true;
        }

        return false;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                    = parent::populate();
        $data['allowed_types']   = $this->get_allowed_types();
        $data['max_file_size']   = $this->get_max_file_size();
        $data['multiple']        = $this->is_multiple();
        $data['input_type']      = $this->input_type;

        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return string
     */
    public function sanitize_element( $data ) {
        if ( empty( $data ) ) {
            return '';
        }

        // If it's a URL, sanitize it
        if ( filter_var( $data, FILTER_VALIDATE_URL ) ) {
            return esc_url_raw( $data );
        }

        // If it's a file path, sanitize it
        if ( is_string( $data ) ) {
            return sanitize_text_field( $data );
        }

        return '';
    }

    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        return esc_url( $data );
    }

    /**
     * Handle file upload and return the file URL.
     *
     * @param array $file The uploaded file data.
     *
     * @return string|false The file URL on success, false on failure.
     */

}
