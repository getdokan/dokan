<?php
/**
 * Forbid dot-path dependency keys in admin settings schema.
 *
 * Flags string literals containing `.` when they appear as the key of a
 * `'show_if'` array, the `'key'` element of a `'dependencies'` entry, or
 * the first argument to `->add_dependency()`.
 *
 * The dependency-resolver matches against flat field ids; dot-path keys
 * silently fail to resolve and produce broken visibility behavior in the
 * admin settings UI.
 *
 * Note: this sniff is intentionally narrow. The legacy `SettingsElement`
 * abstract (used by `Admin/OnboardingSetup`) accepts dot-separated keys
 * by design — those usages live outside the flat-schema settings code
 * and are excluded by path.
 *
 * @since DOKAN_SINCE
 *
 * @package Dokan\PhpcsSniffs\FlatShowIf
 */

namespace DokanFlatShowIf\Sniffs\FlatShowIf;

use PHP_CodeSniffer\Sniffs\Sniff;
use PHP_CodeSniffer\Files\File;

class FlatShowIfSniff implements Sniff {
    /**
     * Path fragments to exclude. The legacy onboarding wizard uses the older
     * `SettingsElement::add_dependency()` API which supports dot-paths by
     * design; flagging those calls produces noise without value.
     *
     * @var string[]
     */
    private $excluded_path_fragments = [
        '/Admin/OnboardingSetup/',
        '\\Admin\\OnboardingSetup\\',
    ];

    /**
     * @inheritDoc
     */
    public function register(): array {
        return [ T_CONSTANT_ENCAPSED_STRING ];
    }

    /**
     * @inheritDoc
     */
    public function process( File $phpcsFile, $stackPtr ) {
        $file_path = $phpcsFile->getFilename();
        foreach ( $this->excluded_path_fragments as $fragment ) {
            if ( false !== strpos( $file_path, $fragment ) ) {
                return;
            }
        }

        $tokens  = $phpcsFile->getTokens();
        $literal = trim( $tokens[ $stackPtr ]['content'], "'\"" );

        // Cheap rejection: no dot, not interesting.
        if ( false === strpos( $literal, '.' ) ) {
            return;
        }

        // Skip literals that look like file paths, URLs, classnames, or version strings.
        if ( preg_match( '#^[\\\\/]|^https?://|\\\\|\\.php$|\\.json$|\\.css$|\\.js$|\\.svg$#i', $literal ) ) {
            return;
        }
        if ( preg_match( '/^\d+(\.\d+)+$/', $literal ) ) {
            return; // version number
        }

        // Skip literals that look like English sentences / translation strings.
        // Real dependency keys are snake_case identifiers separated by dots —
        // no spaces, no uppercase, no trailing punctuation.
        if ( preg_match( '/[\s]/', $literal ) ) {
            return;
        }
        if ( ! preg_match( '/^[a-z0-9_]+(\.[a-z0-9_]+)+$/', $literal ) ) {
            return;
        }

        if ( ! $this->is_dependency_key_context( $phpcsFile, $stackPtr ) ) {
            return;
        }

        $phpcsFile->addError(
            sprintf(
                'Dot-path dependency key "%s" is forbidden in flat-schema settings. Use the flat field id (the last segment, e.g. "%s"). See docs/superpowers/plans/2026-05-18-dependency-key-cleanup.md.',
                $literal,
                substr( $literal, strrpos( $literal, '.' ) + 1 )
            ),
            $stackPtr,
            'DotPathDependencyKey'
        );
    }

    /**
     * Determine whether the literal at $stackPtr appears in one of the three
     * dependency-key contexts: a `show_if` array key, the value of a
     * `dependencies[][key]` entry, or the first argument of `->add_dependency()`.
     */
    private function is_dependency_key_context( File $phpcsFile, $stackPtr ): bool {
        return $this->is_add_dependency_first_arg( $phpcsFile, $stackPtr )
            || $this->is_show_if_array_key( $phpcsFile, $stackPtr )
            || $this->is_dependencies_key_value( $phpcsFile, $stackPtr );
    }

    /**
     * Is this literal the first argument of `->add_dependency(...)` or `add_dependency(...)`?
     */
    private function is_add_dependency_first_arg( File $phpcsFile, $stackPtr ): bool {
        $tokens = $phpcsFile->getTokens();

        // Look backwards for the opening parenthesis of the enclosing call.
        $prev = $phpcsFile->findPrevious( T_WHITESPACE, $stackPtr - 1, null, true );
        if ( false === $prev || T_OPEN_PARENTHESIS !== $tokens[ $prev ]['code'] ) {
            return false;
        }
        // Token before the open-paren should be `add_dependency`.
        $name_pos = $phpcsFile->findPrevious( T_WHITESPACE, $prev - 1, null, true );
        if ( false === $name_pos || T_STRING !== $tokens[ $name_pos ]['code'] ) {
            return false;
        }
        return 'add_dependency' === $tokens[ $name_pos ]['content'];
    }

    /**
     * Is this literal an array KEY inside a `show_if` array literal?
     *
     * Pattern matches:
     *
     *     'show_if' => [
     *         'commission_type' => 'fixed',     // <-- literal at $stackPtr
     *     ],
     *
     * The literal qualifies only when:
     *  1. The immediately following non-whitespace token is `=>`, AND
     *  2. Walking out one bracket level lands us at a `'show_if' =>` entry.
     */
    private function is_show_if_array_key( File $phpcsFile, $stackPtr ): bool {
        $tokens = $phpcsFile->getTokens();

        // Must be immediately followed by =>.
        $next = $phpcsFile->findNext( T_WHITESPACE, $stackPtr + 1, null, true );
        if ( false === $next || T_DOUBLE_ARROW !== $tokens[ $next ]['code'] ) {
            return false;
        }

        // Find the array literal that contains us.
        $open_bracket = $this->find_containing_array_open( $phpcsFile, $stackPtr );
        if ( false === $open_bracket ) {
            return false;
        }

        // Just before that bracket should be `=>`, and before that should be `'show_if'`.
        $arrow = $phpcsFile->findPrevious( T_WHITESPACE, $open_bracket - 1, null, true );
        if ( false === $arrow || T_DOUBLE_ARROW !== $tokens[ $arrow ]['code'] ) {
            return false;
        }
        $key_literal_pos = $phpcsFile->findPrevious( T_WHITESPACE, $arrow - 1, null, true );
        if ( false === $key_literal_pos || T_CONSTANT_ENCAPSED_STRING !== $tokens[ $key_literal_pos ]['code'] ) {
            return false;
        }
        return 'show_if' === trim( $tokens[ $key_literal_pos ]['content'], "'\"" );
    }

    /**
     * Is this literal the VALUE of a `'key' => '...'` entry inside a
     * `dependencies` array?
     *
     * Pattern matches:
     *
     *     'dependencies' => [
     *         [ 'key' => 'commission_type', 'value' => 'fixed' ],  // <-- literal at $stackPtr
     *     ],
     */
    private function is_dependencies_key_value( File $phpcsFile, $stackPtr ): bool {
        $tokens = $phpcsFile->getTokens();

        // Immediately preceding non-whitespace must be `=>`.
        $arrow = $phpcsFile->findPrevious( T_WHITESPACE, $stackPtr - 1, null, true );
        if ( false === $arrow || T_DOUBLE_ARROW !== $tokens[ $arrow ]['code'] ) {
            return false;
        }
        // Before the `=>` must be `'key'`.
        $key_pos = $phpcsFile->findPrevious( T_WHITESPACE, $arrow - 1, null, true );
        if ( false === $key_pos || T_CONSTANT_ENCAPSED_STRING !== $tokens[ $key_pos ]['code'] ) {
            return false;
        }
        if ( 'key' !== trim( $tokens[ $key_pos ]['content'], "'\"" ) ) {
            return false;
        }

        // Walk OUT two array levels (current row, then dependencies array)
        // and confirm the outer array is `dependencies => [...]`.
        $row_open = $this->find_containing_array_open( $phpcsFile, $stackPtr );
        if ( false === $row_open ) {
            return false;
        }
        $deps_open = $this->find_containing_array_open( $phpcsFile, $row_open );
        if ( false === $deps_open ) {
            return false;
        }
        $deps_arrow = $phpcsFile->findPrevious( T_WHITESPACE, $deps_open - 1, null, true );
        if ( false === $deps_arrow || T_DOUBLE_ARROW !== $tokens[ $deps_arrow ]['code'] ) {
            return false;
        }
        $deps_label = $phpcsFile->findPrevious( T_WHITESPACE, $deps_arrow - 1, null, true );
        if ( false === $deps_label || T_CONSTANT_ENCAPSED_STRING !== $tokens[ $deps_label ]['code'] ) {
            return false;
        }
        return 'dependencies' === trim( $tokens[ $deps_label ]['content'], "'\"" );
    }

    /**
     * Find the opening token of the innermost short-array `[` or `array(`
     * literal that contains $stackPtr. Returns the open-token position or false.
     */
    private function find_containing_array_open( File $phpcsFile, $stackPtr ) {
        $tokens = $phpcsFile->getTokens();
        $depth  = 0;
        for ( $i = $stackPtr - 1; $i >= 0; $i-- ) {
            $code = $tokens[ $i ]['code'];

            if ( T_CLOSE_SHORT_ARRAY === $code || T_CLOSE_PARENTHESIS === $code ) {
                $depth++;
                continue;
            }
            if ( T_OPEN_SHORT_ARRAY === $code ) {
                if ( 0 === $depth ) {
                    return $i;
                }
                $depth--;
                continue;
            }
            if ( T_OPEN_PARENTHESIS === $code ) {
                if ( 0 === $depth ) {
                    // Check if this open-paren belongs to `array(`.
                    $prev = $phpcsFile->findPrevious( T_WHITESPACE, $i - 1, null, true );
                    if ( false !== $prev && T_ARRAY === $tokens[ $prev ]['code'] ) {
                        return $i;
                    }
                    return false;
                }
                $depth--;
                continue;
            }
            // Don't cross function/class/method boundaries.
            if ( T_OPEN_CURLY_BRACKET === $code || T_SEMICOLON === $code ) {
                if ( 0 === $depth ) {
                    return false;
                }
            }
        }
        return false;
    }
}
