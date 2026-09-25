<?php

namespace WeDevs\Dokan\Admin\Settings\Migration\Transformer;

use InvalidArgumentException;

/**
 * Callable-backed transformer adapter.
 *
 * Lets schema authors declare `legacy_transformer` as a pair of callables
 * instead of shipping a dedicated class:
 *
 *     'legacy_transformer' => [
 *         'to_new'    => 'absint',
 *         'to_legacy' => [ MyHelper::class, 'to_string' ],
 *     ],
 *
 * Accepts string callables, `[Class, method]` array callables, closures, and
 * invokable objects. Closures and invokable objects are convenient for inline
 * transforms but cannot be serialized — if the schema is ever cached to a
 * transient or other persistent store, use a string callable, a
 * `[Class, method]` pair, or a dedicated transformer class instead.
 *
 * @since DOKAN_SINCE
 */
final class CallableTransformer implements TransformerInterface {

    /**
     * @var callable
     */
    private $to_new;

    /**
     * @var callable
     */
    private $to_legacy;

    /**
     * @param mixed $to_new    String callable or `[Class, method]` array.
     * @param mixed $to_legacy String callable or `[Class, method]` array.
     *
     * @throws InvalidArgumentException When either argument is not a safe callable.
     */
    public function __construct( $to_new, $to_legacy ) {
        $this->to_new    = self::ensure_safe_callable( $to_new, 'to_new' );
        $this->to_legacy = self::ensure_safe_callable( $to_legacy, 'to_legacy' );
    }

    /**
     * {@inheritDoc}
     */
    public function to_new( $legacy_value ) {
        return ( $this->to_new )( $legacy_value );
    }

    /**
     * {@inheritDoc}
     */
    public function to_legacy( $new_value ) {
        return ( $this->to_legacy )( $new_value );
    }

    /**
     * Validate that a callable is filter-safe (string or `[Class, method]`).
     *
     * @param mixed  $candidate
     * @param string $label
     *
     * @return callable
     *
     * @throws InvalidArgumentException
     */
    private static function ensure_safe_callable( $candidate, string $label ): callable {
        if ( is_string( $candidate ) && '' !== $candidate && is_callable( $candidate ) ) {
            return $candidate;
        }
        if (
            is_array( $candidate )
            && 2 === count( $candidate )
            && isset( $candidate[0], $candidate[1] )
            && is_string( $candidate[1] )
            && is_callable( $candidate )
        ) {
            return $candidate;
        }
        if ( ( $candidate instanceof \Closure ) || ( is_object( $candidate ) && is_callable( $candidate ) ) ) {
            return $candidate;
        }
        throw new InvalidArgumentException(
            // Internal developer-facing exception message; $label is a hard-coded
            // identifier passed from this class itself, not user input.
            esc_html(
                sprintf(
                    'CallableTransformer "%s" must be a string callable, [Class, method] array, closure, or invokable object.',
                    $label
                )
            )
        );
    }
}
