/**
 * Webpack loader that makes hardcoded English strings in `@wedevs/plugin-ui` translatable for Dokan.
 *
 * `@wedevs/plugin-ui` is a general UI toolkit, so it must not know about Dokan's text domain.
 * Dokan builds it once into `assets/js/plugin-ui.js`; this loader wraps the user-facing literals
 * that the package ships untranslated in `__( '…', 'dokan-lite' )` while doing so. The calls end up
 * in the compiled bundle, which is where `npm run makepot` extracts strings from and where
 * `wp_set_script_translations()` loads translations for the `dokan-plugin-ui` handle.
 *
 * Each rule must match, otherwise the build fails. That makes a plugin-ui upgrade that renames or
 * starts translating a string show up here instead of silently dropping the translation.
 *
 * @since DOKAN_SINCE
 */
const TEXT_DOMAIN = 'dokan-lite';

// Module-level binding the wrapped calls use; plugin-ui's own i18n binding is minified and not reachable.
const I18N = '__dokanPluginUiI18n';

const t = ( text ) =>
    `(0,${ I18N }.__)(${ JSON.stringify( text ) },${ JSON.stringify(
        TEXT_DOMAIN
    ) })`;

const TITLES = [
    'AI Assist',
    'Bold',
    'Italic',
    'Underline',
    'Strikethrough',
    'Link',
    'Quote',
    'Bullet List',
    'Numbered List',
    'Align Left',
    'Image',
    'Redo',
    'Undo',
    'More',
    'Remove',
    'Select Images',
    'Select',
];

const RULES = [
    // WpMediaUpload: `value ? 'Change' : btnText`
    { find: /\?"Change":/g, replace: () => `?${ t( 'Change' ) }:` },
    // WpMediaUpload / WpMediaUploadMultiple default `btnText` props.
    {
        find: /(btnText:[\w$]+=)"(Upload Image|Add Images)"/g,
        replace: ( match, prefix, text ) => `${ prefix }${ t( text ) }`,
    },
    // Media frame title and the rich text toolbar buttons.
    {
        find: new RegExp( `\\btitle:"(${ TITLES.join( '|' ) })"`, 'g' ),
        replace: ( match, text ) => `title:${ t( text ) }`,
    },
    // Media frame buttons.
    {
        find: /\btext:"(Select|Add)"/g,
        replace: ( match, text ) => `text:${ t( text ) }`,
    },
    // FileView remove button.
    {
        find: /"aria-label":"Remove"/g,
        replace: () => `"aria-label":${ t( 'Remove' ) }`,
    },
    // Rich text editor prompts.
    {
        find: /\bprompt\("(Enter URL:|Enter image URL:)"\)/g,
        replace: ( match, text ) => `prompt(${ t( text ) })`,
    },
];

module.exports = function pluginUiI18nLoader( source ) {
    let output = source;

    for ( const { find, replace } of RULES ) {
        if ( ! find.test( output ) ) {
            throw new Error(
                `plugin-ui-i18n-loader: ${ find } no longer matches @wedevs/plugin-ui. ` +
                    'Update or remove the rule in bin/plugin-ui-i18n-loader.js.'
            );
        }

        find.lastIndex = 0;
        output = output.replace( find, replace );
    }

    return `var ${ I18N }=require("@wordpress/i18n");${ output }`;
};
