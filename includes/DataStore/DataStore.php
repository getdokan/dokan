<?php

namespace WeDevs\Dokan\DataStore;

use Exception;

class DataStore {
    protected $stores = [
        'test' => TestDataStore::class,
    ];
    /**
     * @var DataStoreInterface
     */
    protected DataStoreInterface $instance;
    /**
     * @var string
     */
    protected string $current_class_name;

    /**
     * @throws Exception
     */
    public function __construct( string $object_type ) {
        $this->stores = apply_filters( 'dokan_data_stores', $this->stores );

        // If this object type can't be found, check to see if we can load one
        // level up (so if product-type isn't found, we try product).
        if ( ! array_key_exists( $object_type, $this->stores ) ) {
            $pieces      = explode( '-', $object_type );
            $object_type = $pieces[0];
        }

        if ( array_key_exists( $object_type, $this->stores ) ) {
            $store = apply_filters( 'dokan_' . $object_type . '_data_store', $this->stores[ $object_type ] );
            if ( is_object( $store ) ) {
                if ( ! $store instanceof DataStoreInterface ) {
                    throw new Exception( esc_html__( 'Invalid data store.', 'dokan-lite' ) );
                }
                $this->current_class_name = get_class( $store );
                $this->instance           = $store;
            } else {
                if ( ! class_exists( $store ) ) {
                    throw new Exception( esc_html__( 'Invalid data store.', 'dokan-lite' ) );
                }
                $this->current_class_name = $store;
                $this->instance           = new $store();
            }
        } else {
            throw new Exception( esc_html__( 'Invalid data store.', 'dokan-lite' ) );
        }
    }

    /**
     * @throws Exception
     */
    public static function load( string $object_type ): DataStore {
        return new DataStore( $object_type );
    }

    /**
     * @return DataStoreInterface
     */
    public function get_instance(): DataStoreInterface {
        return $this->instance;
    }
}
