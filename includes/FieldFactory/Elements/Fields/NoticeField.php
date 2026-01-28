<?php
/**
 * Notice Field Element
 *
 * Alert/notice display field.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

class NoticeField extends AbstractField {

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
    protected string $variant = 'notice';

    /**
     * Notice type (info, warning, success, error).
     *
     * @var string
     */
    protected string $notice_type = 'info';

    /**
     * Notice message.
     *
     * @var string
     */
    protected string $message = '';

    /**
     * Dismissible notice.
     *
     * @var bool
     */
    protected bool $dismissible = false;

    /**
     * Notice is read-only by nature.
     *
     * @var bool
     */
    protected bool $read_only = true;

    /**
     * Action button configuration.
     *
     * @var array
     */
    protected array $action_button = [];

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'notice_type',
                'message',
                'dismissible',
                'action_button',
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function fill( array $config ): self {
        parent::fill( $config );

        // Use description as message if message not set
        if ( empty( $this->message ) && ! empty( $this->description ) ) {
            $this->message = $this->description;
        }

        // Use title as message fallback
        if ( empty( $this->message ) && ! empty( $this->title ) ) {
            $this->message = $this->title;
        }

        return $this;
    }

    /**
     * Get notice type.
     *
     * @return string
     */
    public function get_notice_type(): string {
        return $this->notice_type;
    }

    /**
     * Get message.
     *
     * @return string
     */
    public function get_message(): string {
        return $this->message;
    }

    /**
     * Check if dismissible.
     *
     * @return bool
     */
    public function is_dismissible(): bool {
        return $this->dismissible;
    }

    /**
     * Get action button configuration.
     *
     * @return array
     */
    public function get_action_button(): array {
        return $this->action_button;
    }

    /**
     * Check if has action button.
     *
     * @return bool
     */
    public function has_action_button(): bool {
        return ! empty( $this->action_button );
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        // Notice fields don't need validation
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
                'notice_type'   => $this->notice_type,
                'message'       => $this->message,
                'dismissible'   => $this->dismissible,
                'action_button' => $this->action_button,
            ]
        );
    }
}
