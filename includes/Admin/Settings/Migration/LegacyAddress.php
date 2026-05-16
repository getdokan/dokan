<?php

namespace WeDevs\Dokan\Admin\Settings\Migration;

/**
 * Legacy Address value object.
 *
 * Describes a single value's location inside a legacy `dokan_<section>`
 * wp_option. Supports dotted-string addresses ("option.field" or
 * "option.path.to.field") and struct form (`['option' => ..., 'field' => ...]`).
 * The first segment is the wp_option name; every segment after that is a
 * path inside the option array.
 *
 * @since DOKAN_SINCE
 */
final class LegacyAddress {

    /**
     * Legacy wp_option name.
     *
     * @var string
     */
    private $option;

    /**
     * Path inside the option array (one or more segments).
     *
     * @var array<int,string>
     */
    private $path;

    /**
     * @param string            $option
     * @param array<int,string> $path
     */
    private function __construct( string $option, array $path ) {
        $this->option = $option;
        $this->path   = $path;
    }

    /**
     * Parse an address from either dotted-string or struct form.
     *
     * Returns null for malformed input (blank option/segment, no separator,
     * etc.). Callers should treat null as a signal to skip the mapping
     * entry, not as a fatal error.
     *
     * @param mixed $input Dotted string ("opt.field" or "opt.a.b") or struct
     *                     `['option' => string, 'field' => string]`.
     *
     * @return self|null
     */
    public static function parse( $input ): ?self {
        if ( is_array( $input ) && isset( $input['option'], $input['field'] ) ) {
            $option = (string) $input['option'];
            $field  = (string) $input['field'];
            if ( '' === $option || '' === $field ) {
                return null;
            }
            return new self( $option, [ $field ] );
        }
        if ( is_string( $input ) && strpos( $input, '.' ) !== false ) {
            $parts = explode( '.', $input );
            if ( count( $parts ) < 2 ) {
                return null;
            }
            $option = array_shift( $parts );
            if ( '' === $option || in_array( '', $parts, true ) ) {
                return null;
            }
            return new self( $option, $parts );
        }
        return null;
    }

    /**
     * @return string Legacy wp_option name.
     */
    public function option(): string {
        return $this->option;
    }

    /**
     * @return array<int,string> Path inside the option array.
     */
    public function path(): array {
        return $this->path;
    }

    /**
     * Walk the path and return the value, or null if any segment is missing.
     *
     * @param array<string,mixed> $legacy Decoded option value.
     *
     * @return mixed
     */
    public function read_from( array $legacy ) {
        $cursor = $legacy;
        foreach ( $this->path as $segment ) {
            if ( ! is_array( $cursor ) || ! array_key_exists( $segment, $cursor ) ) {
                return null;
            }
            $cursor = $cursor[ $segment ];
        }
        return $cursor;
    }

    /**
     * Write a value into the path, auto-creating intermediate arrays.
     *
     * Mutates the passed array in place.
     *
     * @param array<string,mixed> $legacy By-reference legacy option value.
     * @param mixed               $value
     *
     * @return void
     */
    public function write_to( array &$legacy, $value ): void {
        $cursor = &$legacy;
        $last_i = count( $this->path ) - 1;
        foreach ( $this->path as $i => $segment ) {
            if ( $i === $last_i ) {
                $cursor[ $segment ] = $value;
                return;
            }
            if ( ! isset( $cursor[ $segment ] ) || ! is_array( $cursor[ $segment ] ) ) {
                $cursor[ $segment ] = [];
            }
            $cursor = &$cursor[ $segment ];
        }
    }
}
