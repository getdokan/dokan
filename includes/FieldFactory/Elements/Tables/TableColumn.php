<?php
/**
 * Column container for table rows.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Tables
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Tables;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractContainer;
class TableColumn extends AbstractContainer {

    /**
     * Element type.
     *
     * @var string
     */
    protected string $type = 'table-column';

    /**
     * Column span.
     *
     * @var int
     */
    protected int $colspan = 1;

    /**
     * Row span.
     *
     * @var int
     */
    protected int $rowspan = 1;

    /**
     * Column alignment (left, center, right).
     *
     * @var string
     */
    protected string $align = 'left';

    /**
     * Vertical alignment (top, middle, bottom).
     *
     * @var string
     */
    protected string $valign = 'middle';

    /**
     * Column width (CSS value).
     *
     * @var string
     */
    protected string $width = '';

    /**
     * Whether this is a header cell.
     *
     * @var bool
     */
    protected bool $is_header = false;

    /**
     * Cell content (for simple text content).
     *
     * @var string
     */
    protected string $content = '';

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
                'colspan',
                'rowspan',
                'align',
                'valign',
                'width',
                'is_header',
                'content',
            ]
        );
    }

    /**
     * Get colspan.
     *
     * @return int
     */
    public function get_colspan(): int {
        return $this->colspan;
    }

    /**
     * Get rowspan.
     *
     * @return int
     */
    public function get_rowspan(): int {
        return $this->rowspan;
    }

    /**
     * Get alignment.
     *
     * @return string
     */
    public function get_align(): string {
        return $this->align;
    }

    /**
     * Get vertical alignment.
     *
     * @return string
     */
    public function get_valign(): string {
        return $this->valign;
    }

    /**
     * Get width.
     *
     * @return string
     */
    public function get_width(): string {
        return $this->width;
    }

    /**
     * Check if header cell.
     *
     * @return bool
     */
    public function is_header_cell(): bool {
        return $this->is_header;
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
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'colspan'   => $this->colspan,
                'rowspan'   => $this->rowspan,
                'align'     => $this->align,
                'valign'    => $this->valign,
                'width'     => $this->width,
                'is_header' => $this->is_header,
                'content'   => $this->content,
            ]
        );
    }
}
