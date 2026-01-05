<?php

namespace WeDevs\PluginSettings\Abstracts;

use Exception;

/**
 * Settings Class.
 *
 * Handles settings storage and hydration.
 *
 * @since 1.0.0
 */
abstract class Settings extends SettingsElement {

    const STORAGE_TYPE_OPTIONS   = 'options';
    const STORAGE_TYPE_USER_META = 'user_meta';

    /**
     * Current Setting value storage type.
     *
     * @var string
     */
    protected string $storage_type = self::STORAGE_TYPE_OPTIONS;

    /**
     * Storage Key.
     *
     * @var string
     */
    protected string $storage_key = 'settings_framework_';

    /**
     * Settings constructor.
     *
     * @param string $id          Settings ID.
     * @param string $hook_prefix Hook prefix (optional).
     */
    public function __construct( string $id = '', string $hook_prefix = '' ) {
        if ( empty( $id ) ) {
            $id = $this->id;
        }

        parent::__construct( $id, $hook_prefix );
        $this->set_hook_key( $this->storage_key );

        add_action( 'init', [ $this, 'get_described_settings' ] );
    }

    /**
     * Get storage key.
     *
     * @return string
     */
    public function get_storage_key(): string {
        return $this->storage_key;
    }

    /**
     * Set storage key.
     *
     * @param string $storage_key Storage key.
     *
     * @return static
     */
    public function set_storage_key( string $storage_key ): self {
        $this->storage_key = $storage_key;

        return $this;
    }

    /**
     * Get storage type.
     *
     * @return string
     */
    public function get_storage_type(): string {
        return $this->storage_type;
    }

    /**
     * Set storage type.
     *
     * @param string $storage_type Storage type (options or user_meta).
     *
     * @return static
     */
    public function set_storage_type( string $storage_type ): self {
        $this->storage_type = $storage_type;

        return $this;
    }

    /**
     * Populate settings.
     *
     * @return array
     */
    public function populate(): array {
        $this->hydrate_data();
        return parent::populate();
    }

    /**
     * Populate settings children only.
     *
     * @return array
     */
    public function populate_children_only(): array {
        $this->hydrate_data();
        return parent::populate()['children'];
    }

    /**
     * Get the stored data for these settings.
     *
     * @return static
     */
    public function hydrate_data(): self {
        $data = $this->get_data();
        $this->set_value( $data );

        return $this;
    }

    /**
     * Get data from preferred storage.
     *
     * @return mixed
     */
    protected function get_data() {
        $data = [];

        if ( self::STORAGE_TYPE_OPTIONS === $this->storage_type ) {
            $data = get_option( $this->storage_key, $data );
        } else {
            $data = get_user_meta( get_current_user_id(), $this->storage_key, true );
        }

        // Backward compatibility: if data is wrapped under the element/page ID, unwrap it.
        if ( is_array( $data ) && isset( $data[ $this->id ] ) && is_array( $data[ $this->id ] ) ) {
            $data = $data[ $this->id ];
        }

        return $data;
    }

    /**
     * Get option value by key.
     *
     * @param string $key           Settings key (dot separated).
     * @param mixed  $default_value Default value.
     *
     * @return mixed
     */
    public static function get_option( string $key, $default_value = null ) {
        $self = new static();
        $data = $self->get_data();

        if ( empty( $data ) || empty( $key ) ) {
            return $default_value;
        }

        $keys = explode( '.', trim( $key ) );

        foreach ( $keys as $id ) {
            if ( ! isset( $data[ $id ] ) ) {
                return $default_value;
            }
            $data = $data[ $id ];
        }

        return $data;
    }

    /**
     * Save data for these settings.
     *
     * @param mixed $data Data to be stored.
     *
     * @return bool
     * @throws Exception If data could not be stored.
     */
    public function save( $data ): bool {
        $valid = $this->validate( $data );

        if ( ! $valid ) {
            throw new Exception( esc_html__( 'Settings values must be valid.', 'settings-framework' ) );
        }

        $data = $this->sanitize( $data );

        if ( self::STORAGE_TYPE_OPTIONS === $this->storage_type ) {
            $updated = update_option( $this->storage_key, $data, true );
        } else {
            $updated = update_user_meta( get_current_user_id(), $this->storage_key, $data );
        }

        /**
         * Actions for after save settings.
         *
         * @since 1.0.0
         *
         * @param mixed  $data        Saved data.
         * @param string $storage_key Storage key.
         */
        do_action( $this->hook_prefix . '_settings_after_save_' . $this->storage_key, $data, $this->storage_key );

        return (bool) $updated;
    }

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return is_array( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return array|string
     */
    public function sanitize_element( $data ) {
        return wp_unslash( $data );
    }

    /**
     * Escape data for display.
     *
     * @param array $data Data for display.
     *
     * @return array
     */
    public function escape_element( $data ): array {
        return $data;
    }

    /**
     * Describe the settings options.
     *
     * Called on 'init' hook.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function get_described_settings(): void {
        try {
            $this->describe_settings();
        } catch ( Exception $e ) {
            // Log error if logging function exists.
            if ( function_exists( 'error_log' ) ) {
                error_log( 'Settings Framework Error: ' . $e->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
            }
        }
    }

    /**
     * Describe the settings options.
     *
     * Override this method to define your settings structure.
     *
     * @return void
     */
    abstract public function describe_settings(): void;
}

