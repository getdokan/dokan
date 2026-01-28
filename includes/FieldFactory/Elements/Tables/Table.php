<?php
/**
 * Table container for structured data display.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Tables
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Tables;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;
class Table extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'table';

    /**
     * Table headers.
     *
     * @var array
     */
    protected array $headers = [];

    /**
     * Table data (for static tables).
     *
     * @var array
     */
    protected array $data = [];

    /**
     * Whether table is striped.
     *
     * @var bool
     */
    protected bool $striped = true;

    /**
     * Whether table is bordered.
     *
     * @var bool
     */
    protected bool $bordered = false;

    /**
     * Whether table is hoverable.
     *
     * @var bool
     */
    protected bool $hoverable = true;

    /**
     * Whether table is responsive.
     *
     * @var bool
     */
    protected bool $responsive = true;

    /**
     * Table size (small, medium, large).
     *
     * @var string
     */
    protected string $table_size = 'medium';

    /**
     * Empty state message.
     *
     * @var string
     */
    protected string $empty_message = '';

    /**
     * {@inheritdoc}
     */
    public function get_category(): string {
        return 'table';
    }

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'headers',
                'data',
                'striped',
                'bordered',
                'hoverable',
                'responsive',
                'table_size',
                'empty_message',
            ]
        );
    }

    /**
     * Get headers.
     *
     * @return array
     */
    public function get_headers(): array {
        return $this->headers;
    }

    /**
     * Set headers.
     *
     * @param array $headers Table headers.
     *
     * @return self
     */
    public function set_headers( array $headers ): self {
        $this->headers = $headers;
        return $this;
    }

    /**
     * Get table data.
     *
     * @return array
     */
    public function get_data(): array {
        return $this->data;
    }

    /**
     * Check if striped.
     *
     * @return bool
     */
    public function is_striped(): bool {
        return $this->striped;
    }

    /**
     * Check if bordered.
     *
     * @return bool
     */
    public function is_bordered(): bool {
        return $this->bordered;
    }

    /**
     * Check if hoverable.
     *
     * @return bool
     */
    public function is_hoverable(): bool {
        return $this->hoverable;
    }

    /**
     * Check if responsive.
     *
     * @return bool
     */
    public function is_responsive(): bool {
        return $this->responsive;
    }

    /**
     * Get table size.
     *
     * @return string
     */
    public function get_table_size(): string {
        return $this->table_size;
    }

    /**
     * Get empty message.
     *
     * @return string
     */
    public function get_empty_message(): string {
        return ! empty( $this->empty_message )
            ? $this->empty_message
            : __( 'No data available.', 'dokan-lite' );
    }

    /**
     * Get rows (alias for children).
     *
     * @return array
     */
    public function get_rows(): array {
        return $this->get_children();
    }

    /**
     * Add row.
     *
     * @param TableRow $row Table row.
     *
     * @return self
     */
    public function add_row( ElementInterface $row ): self {
        return $this->add_child( $row );
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'headers'       => $this->headers,
                'data'          => $this->data,
                'striped'       => $this->striped,
                'bordered'      => $this->bordered,
                'hoverable'     => $this->hoverable,
                'responsive'    => $this->responsive,
                'table_size'    => $this->table_size,
                'empty_message' => $this->get_empty_message(),
            ]
        );
    }
}
