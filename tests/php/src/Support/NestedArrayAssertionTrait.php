<?php

namespace WeDevs\Dokan\Test\Support;

trait NestedArrayAssertionTrait {
    /**
     * Recursively checks if a nested key-value pair exists within an array.
     *
     * @param array $expected The expected key-value pair to check for.
     * @param array $source The array to search in.
     * @return bool True if the nested key-value pair exists, false otherwise.
     */
    protected function containsNestedKeyValuePair( array $expected, array $source ): bool {
        foreach ( $expected as $key => $value ) {
            if ( is_array( $value ) ) {
                if ( ! isset( $source[ $key ] ) || ! is_array( $source[ $key ] ) ) {
                    return false;
                }
                if ( ! $this->containsNestedKeyValuePair( $value, $source[ $key ] ) ) {
                    return false;
                }
            } elseif ( ! isset( $source[ $key ] ) || $source[ $key ] !== $value ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Recursively checks if a nested key-value pair exists within an array or any of its sub-arrays.
     *
     * @param array $expected The expected key-value pair to check for.
     * @param array $data The array to search in.
     * @return bool True if the nested key-value pair exists, false otherwise.
     */
    protected function arrayContainsNested( array $expected, array $data ): bool {
        if ( $this->containsNestedKeyValuePair( $expected, $data ) ) {
            return true;
        }

        foreach ( $data as $item ) {
            if ( is_array( $item ) && $this->arrayContainsNested( $expected, $item ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Asserts that a nested key-value pair exists within the array.
     *
     * @param array $expected The expected key-value pair to check for.
     * @param array $data The array to search in.
     * @return void
     */
    public function assertNestedContains( array $expected, array $data ): void {
        $found = $this->arrayContainsNested( $expected, $data );

        $this->assertTrue( $found, 'Failed asserting that an array contains --> ' . print_r( $expected, true ) );
    }
}
