<?php

namespace WeDevs\Dokan\Abstracts;

use Exception;

/**
 * Settings Class.
 */
abstract class Settings extends SettingsElement {
	const STORAGE_TYPE_OPTIONS   = 'options';
	const STORAGE_TYPE_USER_META = 'user_meta';

	/**
	 * Current Setting value storage type.
	 *
	 * @var string $storage_type Storage Type.
	 */
	protected $storage_type = self::STORAGE_TYPE_OPTIONS;

	/**
	 * Storage Kay.
	 *
	 * @var string $storage_key Storage Key.
	 */
	protected $storage_key = 'dokan_settings_';

    /**
     * Settings constructor.
     */
    public function __construct() {
        parent::__construct( $this->id );
        $this->set_hook_key( $this->storage_key );

        add_action( 'init', [ $this, 'get_described_settings' ] );
    }

	/**
	 * Populate settings.
	 *
	 * @return array
	 */
	public function populate(): array {
		$this->hydrate_data();
		return parent::populate()['children'];
	}

	/**
	 * Get the stored data for these settings.
	 *
	 * @return Settings
	 */
	public function hydrate_data(): Settings {
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
		$data = array();
		if ( self::STORAGE_TYPE_OPTIONS === $this->storage_type ) {
			$data = get_option( $this->storage_key, $data );
		} else {
			$data = get_user_meta( get_current_user_id(), $this->storage_key, true );
		}

		return $data;
	}

	/**
	 * Get option.
	 *
	 * @param string $key settings key (.) dot separated.
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
			throw new Exception( esc_html__( 'Settings values must be valid.', 'dokan-lite' ) );
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
         * @since 4.0.0
         *
         * @param string $storeage_key
         * @param mixed  $data
         */
		do_action( 'dokan_settings_after_save_' . $this->storage_key, $data );

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
     * It is used to describe the settings options for the settings page in `init` hook.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function get_described_settings() {
        try {
            $this->describe_settings();
        } catch ( Exception $e ) {
            dokan_log( $e->getMessage() );
        }
    }

	/**
	 * Describe the settings options
	 *
	 * @return void
	 */
	abstract public function describe_settings(): void;
}
