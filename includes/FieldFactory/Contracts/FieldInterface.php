<?php
/**
 * Field Interface
 *
 * Contract for field elements aligned with WordPress DataViews Fields API.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api
 *
 * @package WeDevs\Dokan\FieldFactory\Contracts
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Contracts;

/**
 * Interface FieldInterface
 */
interface FieldInterface extends ElementInterface {

    /**
     * Get field type.
     *
     * One of: text, integer, number, datetime, date, media, boolean,
     * email, password, telephone, color, url, array.
     *
     * @return string
     */
    public function get_field_type(): string;

    /**
     * Get field variant/subtype (Edit control type).
     *
     * One of: array, checkbox, color, date, datetime, email, integer,
     * number, password, radio, select, telephone, text, textarea,
     * toggle, toggleGroup, url.
     *
     * @return string
     */
    public function get_variant(): string;

    /**
     * Get field label.
     *
     * @return string
     */
    public function get_label(): string;

    /**
     * Get field value from item.
     *
     * @param array $item The data item.
     *
     * @return mixed
     */
    public function get_value( array $item = [] );

    /**
     * Set field value and return partial item with updates.
     *
     * @param mixed $value The value to set.
     *
     * @return array Partial item object with changes.
     */
    public function set_value( $value ): array;

    /**
     * Get formatted value for display.
     *
     * @param array $item The data item.
     *
     * @return string
     */
    public function get_value_formatted( array $item = [] ): string;

    /**
     * Get default value.
     *
     * @return mixed
     */
    public function get_default();

    /**
     * Get field options/elements.
     *
     * @return array Array of elements with value, label, description.
     */
    public function get_elements(): array;

    /**
     * Get placeholder text.
     *
     * @return string
     */
    public function get_placeholder(): string;

    /**
     * Check if field is required.
     *
     * @return bool
     */
    public function is_required(): bool;

    /**
     * Check if field is read-only.
     *
     * @return bool
     */
    public function is_read_only(): bool;

    /**
     * Check if field should be visible.
     *
     * @param array $item The data item for context.
     *
     * @return bool
     */
    public function is_visible( array $item = [] ): bool;

    /**
     * Validate the field value.
     *
     * @param array $item The data item.
     *
     * @return array Validation result with 'valid' boolean and 'errors' array.
     */
    public function validate( array $item = [] ): array;

    /**
     * Get validation rules.
     *
     * @return array Validation configuration (required, elements, custom).
     */
    public function get_validation_rules(): array;

    /**
     * Check if sorting is enabled.
     *
     * @return bool
     */
    public function is_sorting_enabled(): bool;

    /**
     * Check if hiding is enabled.
     *
     * @return bool
     */
    public function is_hiding_enabled(): bool;

    /**
     * Check if global search is enabled.
     *
     * @return bool
     */
    public function is_global_search_enabled(): bool;

    /**
     * Get filter configuration.
     *
     * @return array|false Filter config or false if filtering disabled.
     */
    public function get_filter_by();

    /**
     * Get format configuration.
     *
     * @return array Format settings for display.
     */
    public function get_format(): array;
}
