<?php
/**
 * Forbid raw wp_option writes against the `dokan_admin_settings` key.
 *
 * Flags calls to `update_option`, `add_option`, and `delete_option` whose
 * first argument is the literal `'dokan_admin_settings'` (or the equivalent
 * `SettingsRepository::OPTION_KEY` constant when referenced) anywhere
 * outside the repository itself. All internal writes must flow through
 * `SettingsRepository::update()` / `replace()` so that `dokan_admin_settings_pre_save`
 * and `dokan_admin_settings_changed` fire consistently.
 *
 * @since DOKAN_SINCE
 *
 * @package Dokan\PhpcsSniffs\SettingsRepository
 */

namespace DokanSettingsRepository\Sniffs\Repository;

use PHP_CodeSniffer\Sniffs\Sniff;
use PHP_CodeSniffer\Files\File;

class ForbidRawOptionWriteSniff implements Sniff {

    /**
     * Functions that should never write `dokan_admin_settings` outside the
     * repository.
     *
     * @var string[]
     */
    private $forbidden_functions = [
        'update_option',
        'add_option',
        'delete_option',
    ];

    /**
     * Path fragments to exclude. The repository owns the canonical writes;
     * the sniff lives in `tools/` and is auto-skipped already.
     *
     * @var string[]
     */
    private $excluded_path_fragments = [
        '/Admin/Settings/Repository/SettingsRepository.php',
        '\\Admin\\Settings\\Repository\\SettingsRepository.php',
    ];

    /**
     * @inheritDoc
     */
    public function register(): array {
        return [ T_STRING ];
    }

    /**
     * @inheritDoc
     */
    public function process( File $phpcsFile, $stackPtr ) {
        $tokens = $phpcsFile->getTokens();
        $name   = $tokens[ $stackPtr ]['content'];
        if ( ! in_array( $name, $this->forbidden_functions, true ) ) {
            return;
        }

        // Exclude the repository itself.
        $file_path = $phpcsFile->getFilename();
        foreach ( $this->excluded_path_fragments as $fragment ) {
            if ( false !== strpos( $file_path, $fragment ) ) {
                return;
            }
        }

        // Must be a plain function call (not a method like `$x->update_option(...)`
        // or a class-qualified `Foo::update_option(...)`).
        $prev = $phpcsFile->findPrevious( T_WHITESPACE, $stackPtr - 1, null, true );
        if ( false !== $prev ) {
            $prev_code = $tokens[ $prev ]['code'];
            if (
                T_OBJECT_OPERATOR === $prev_code
                || T_NULLSAFE_OBJECT_OPERATOR === $prev_code
                || T_DOUBLE_COLON === $prev_code
                || T_FUNCTION === $prev_code
                || T_NEW === $prev_code
            ) {
                return;
            }
        }

        // Must be followed by `(`.
        $open = $phpcsFile->findNext( T_WHITESPACE, $stackPtr + 1, null, true );
        if ( false === $open || T_OPEN_PARENTHESIS !== $tokens[ $open ]['code'] ) {
            return;
        }

        // First non-whitespace token inside the parens.
        $first_arg = $phpcsFile->findNext( T_WHITESPACE, $open + 1, null, true );
        if ( false === $first_arg ) {
            return;
        }

        $is_forbidden_key = false;
        if ( T_CONSTANT_ENCAPSED_STRING === $tokens[ $first_arg ]['code'] ) {
            $literal          = trim( $tokens[ $first_arg ]['content'], "'\"" );
            $is_forbidden_key = ( 'dokan_admin_settings' === $literal );
        } else {
            // `SettingsRepository::OPTION_KEY` (bare or fully-qualified).
            // Walk forward looking for the triplet within a small window; stop
            // on `,` or `)` at the current paren depth.
            $token_count = count( $tokens );
            $limit       = min( $token_count, $first_arg + 30 );
            for ( $i = $first_arg; $i < $limit; $i++ ) {
                $code = $tokens[ $i ]['code'];
                if ( T_COMMA === $code || T_CLOSE_PARENTHESIS === $code ) {
                    break;
                }
                if ( T_STRING !== $code || 'SettingsRepository' !== $tokens[ $i ]['content'] ) {
                    continue;
                }
                if ( ( $tokens[ $i + 1 ]['code'] ?? null ) === T_DOUBLE_COLON
                    && ( $tokens[ $i + 2 ]['code'] ?? null ) === T_STRING
                    && 'OPTION_KEY' === $tokens[ $i + 2 ]['content']
                ) {
                    $is_forbidden_key = true;
                    break;
                }
            }
        }

        if ( ! $is_forbidden_key ) {
            return;
        }

        $phpcsFile->addError(
            sprintf(
                'Raw %s() call on the dokan_admin_settings key is forbidden outside SettingsRepository. Use $repo->update() / $repo->replace() so dokan_admin_settings_changed fires.',
                $name
            ),
            $stackPtr,
            'RawDokanAdminSettingsWrite'
        );
    }
}
