import { SelectControl, TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export type IconSuggestion = { value: string; label: string };

type IconControlProps = {
    label: string;
    value: string;
    suggestions: IconSuggestion[];
    onChange: ( value: string ) => void;
    help?: string;
    /** Label for the empty value; "Default icon" unless the line has none today. */
    defaultLabel?: string;
    /** Offer "No icon"; off for a line that has no icon by default. */
    allowNone?: boolean;
};

const CUSTOM = '__custom';

/**
 * Icon picker for a store block line: today's icon, none, a few suggestions, or
 * a Font Awesome class typed by hand. The value travels as a plain class list and
 * the server reduces it to class-name characters, so no markup can ride along.
 * @param root0
 * @param root0.label
 * @param root0.value
 * @param root0.suggestions
 * @param root0.onChange
 * @param root0.help
 * @param root0.defaultLabel
 * @param root0.allowNone
 */
const IconControl = ( {
    label,
    value,
    suggestions,
    onChange,
    help,
    defaultLabel,
    allowNone = true,
}: IconControlProps ) => {
    const known = [ '', 'none', ...suggestions.map( ( s ) => s.value ) ];
    const [ custom, setCustom ] = useState( ! known.includes( value ?? '' ) );
    // What was typed, kept as-is so the field never blanks while it matches a suggestion.
    const [ draft, setDraft ] = useState( custom ? value ?? '' : '' );
    const selectValue = custom ? CUSTOM : value ?? '';

    // Follow outside changes such as undo; typing already keeps the two equal.
    useEffect( () => {
        if ( ( value ?? '' ) !== draft ) {
            setCustom( ! known.includes( value ?? '' ) );
            setDraft( value ?? '' );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ value ] );

    return (
        <>
            <SelectControl
                label={ label }
                value={ selectValue }
                help={ help }
                options={ [
                    {
                        value: '',
                        label:
                            defaultLabel ?? __( 'Default icon', 'dokan-lite' ),
                    },
                    ...( allowNone
                        ? [
                              {
                                  value: 'none',
                                  label: __( 'No icon', 'dokan-lite' ),
                              },
                          ]
                        : [] ),
                    ...suggestions,
                    { value: CUSTOM, label: __( 'Custom…', 'dokan-lite' ) },
                ] }
                onChange={ ( next ) => {
                    if ( next === CUSTOM ) {
                        // Start from the saved icon, so the field never shows blank over it.
                        setDraft( 'none' === value ? '' : value ?? '' );
                        setCustom( true );
                        return;
                    }

                    setCustom( false );
                    onChange( next );
                } }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
            { custom && (
                <TextControl
                    label={ __( 'Icon class', 'dokan-lite' ) }
                    help={ __(
                        'A Font Awesome class list, for example "fas fa-phone".',
                        'dokan-lite'
                    ) }
                    value={ draft }
                    placeholder="fas fa-phone"
                    onChange={ ( next ) => {
                        setDraft( next );
                        onChange( next );
                    } }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            ) }
        </>
    );
};

export default IconControl;
