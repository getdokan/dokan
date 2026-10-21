import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Button, TextControl } from '@wordpress/components';
import { slugify } from '../metaKeys';
import type { FieldOption } from '../types';

interface Props {
    options: FieldOption[];
    onChange: ( options: FieldOption[] ) => void;
    // A field still being added: every option's value follows its label.
    allFresh?: boolean;
}

// An option's saved value follows its label while the option is new, then never changes, so old answers still match.
const valueFor = ( label: string, taken: string[] ): string => {
    const base = slugify( label ) || label.trim() || 'option';
    let value = base;
    let suffix = 2;

    while ( taken.includes( value ) ) {
        value = base + '_' + suffix++;
    }

    return value;
};

export default function OptionsEditor( {
    options,
    onChange,
    allFresh = false,
}: Props ) {
    // Options added while this editor is open; their values aren't fixed yet.
    const [ fresh, setFresh ] = useState< number[] >(
        allFresh ? options.map( ( _, i ) => i ) : []
    );

    const update = ( index: number, label: string ) => {
        const next = [ ...options ];
        const others = next
            .filter( ( _, i ) => i !== index )
            .map( ( o ) => o.value );
        const isFresh =
            allFresh || fresh.includes( index ) || ! next[ index ].value;

        next[ index ] = {
            label,
            value: isFresh
                ? ( label.trim() && valueFor( label, others ) ) || ''
                : next[ index ].value,
        };
        onChange( next );
    };

    const add = () => {
        setFresh( [ ...fresh, options.length ] );
        onChange( [ ...options, { label: '', value: '' } ] );
    };

    const remove = ( index: number ) => {
        setFresh(
            fresh
                .filter( ( i ) => i !== index )
                .map( ( i ) => ( i > index ? i - 1 : i ) )
        );
        onChange( options.filter( ( _, i ) => i !== index ) );
    };

    return (
        <div className="dokan-vreg-editor__options">
            <p className="dokan-vreg-editor__label">
                { __( 'Options', 'dokan-lite' ) }
            </p>
            { options.map( ( option, index ) => (
                <div className="dokan-vreg-editor__option" key={ index }>
                    <div className="dokan-vreg-editor__option-input">
                        <TextControl
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label={ __( 'Option label', 'dokan-lite' ) }
                            hideLabelFromVision
                            value={ option.label }
                            onChange={ ( value ) => update( index, value ) }
                        />
                        <Button
                            icon="no-alt"
                            size="small"
                            label={ __( 'Remove option', 'dokan-lite' ) }
                            onClick={ () => remove( index ) }
                        />
                    </div>
                    { option.value && (
                        <code className="dokan-vreg-editor__option-value">
                            { option.value }
                        </code>
                    ) }
                </div>
            ) ) }
            <Button variant="link" icon="plus-alt2" onClick={ add }>
                { __( 'Add option', 'dokan-lite' ) }
            </Button>
            <p className="dokan-vreg-editor__help">
                { __(
                    'Rename anytime; vendors’ answers still match. Removed options keep old answers.',
                    'dokan-lite'
                ) }
            </p>
        </div>
    );
}
