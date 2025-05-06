<?php

namespace WeDevs\Dokan\Abstracts;

use Exception;

abstract class StatusElement {
    protected bool $support_children = false;
    protected string $id = '';
    protected string $title = '';
    protected string $description = '';
    protected string $icon = '';
    protected string $type = '';
    protected string $data = '';
    protected string $hook_key = '';
    protected array $children = [];

    /**
     * StatusElement constructor.
     *
     * @param  string  $id
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * @return bool
     */
    public function is_support_children(): bool {
        return $this->support_children;
    }

    /**
     * @param  bool  $support_children
     *
     * @return StatusElement
     */
    public function set_support_children( bool $support_children ): StatusElement {
        $this->support_children = $support_children;

        return $this;
    }

    /**
     * @return string
     */
    public function get_id(): string {
        return $this->id;
    }

    /**
     * @param  string  $id
     *
     * @return StatusElement
     */
    public function set_id( string $id ): StatusElement {
        $this->id = $id;

        return $this;
    }

    /**
     * @return string
     */
    public function get_hook_key(): string {
        return $this->hook_key;
    }

    /**
     * @param  string  $hook_key
     *
     * @return StatusElement
     */
    public function set_hook_key( string $hook_key ): StatusElement {
        $this->hook_key = $hook_key;

        return $this;
    }

    /**
     * @return string
     */
    public function get_title(): string {
        return $this->title;
    }

    /**
     * @param  string  $title
     *
     * @return StatusElement
     */
    public function set_title( string $title ): StatusElement {
        $this->title = $title;

        return $this;
    }

    /**
     * @return string
     */
    public function get_description(): string {
        return $this->description;
    }

    /**
     * @param  string  $description
     *
     * @return StatusElement
     */
    public function set_description( string $description ): StatusElement {
        $this->description = $description;

        return $this;
    }

    /**
     * @return string
     */
    public function get_icon(): string {
        return $this->icon;
    }

    /**
     * @param  string  $icon
     *
     * @return StatusElement
     */
    public function set_icon( string $icon ): StatusElement {
        $this->icon = $icon;

        return $this;
    }

    /**
     * @return array<self>
     */
    public function get_children(): array {
        $children = array();
        $filtered_children = apply_filters( $this->get_hook_key() . '_children', $this->children, $this ); // phpcs:ignore.

        foreach ( $filtered_children as $child ) {
            $child->set_hook_key( $this->get_hook_key() . '_' . $child->get_id() );
            $children[ $child->get_id() ] = $child;
        }

        return $children;
    }

    /**
     * Set children.
     *
     * @since 4.0.0
     *
     * @param  array  $children
     *
     * @return StatusElement
     * @throws Exception
     */
    public function set_children( array $children ): StatusElement {
        if ( ! $this->is_support_children() ) {
            throw new Exception( esc_html__( 'This element does not support child element.', 'dokan-lite' ) );
        }
        $this->children = $children;

        return $this;
    }

    /**
     * @return string
     */
    public function get_type(): string {
        return $this->type;
    }

    /**
     * @param  string  $type
     *
     * @return StatusElement
     */
    public function set_type( string $type ): StatusElement {
        $this->type = $type;

        return $this;
    }

    /**
     * @return string
     */
    public function get_data(): string {
        return $this->data;
    }

    /**
     * @param  string  $data
     *
     * @return StatusElement
     */
    public function set_data( string $data ): StatusElement {
        $this->data = $data;

        return $this;
    }

    /**
     * @throws Exception
     */
    public function add( StatusElement $child ): StatusElement {
        if ( ! $this->is_support_children() ) {
            throw new Exception( esc_html__( 'This element does not support child element.', 'dokan-lite' ) );
        }
        $this->children[] = $child;

        return $this;
    }

    /**
     * @throws Exception
     */
    public function remove( StatusElement $element ): StatusElement {
        if ( ! $this->is_support_children() ) {
            // translators: %s is Status element type.
            throw new Exception( esc_html( sprintf( esc_html__( 'Status %s Does not support adding any children.', 'dokan-lite' ), $this->get_type() ) ) );
        }

        $children = array_filter(
            $this->get_children(),
            function ( $child ) use ( $element ) {
                return $child !== $element;
            }
        );
        $this->set_children( $children );

        return $this;
    }


    /**
     * @return array
     */
    public function render(): array {
        $children = array();
        if ( $this->is_support_children() ) {
            foreach ( $this->get_children() as $child ) {
                $children[] = $child->render();
            }
        }

        $data = [
            'id'          => $this->get_id(),
            'title'       => $this->get_title(),
            'description' => $this->get_description(),
            'icon'        => $this->get_icon(),
            'type'        => $this->get_type(),
            'data'        => $this->escape_data( $this->get_data() ),
            'hook_key'    => $this->get_hook_key(),
            'children'    => $children,
        ];

        return apply_filters( 'dokan_status_element_render_' . $this->get_hook_key(), $data, $this );
    }

    /**
     * @param  string  $data
     *
     * @return string
     */
    abstract public function escape_data( string $data ): string;
}
