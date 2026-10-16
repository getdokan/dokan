import { TextControl } from '@wordpress/components';

export type TextField = {
    key: string;
    label: string;
    placeholder?: string;
    help?: string;
};

type TextListProps = {
    fields: TextField[];
    attributes: Record< string, unknown >;
    setAttributes: ( attrs: Record< string, unknown > ) => void;
};

/**
 * A run of text overrides. Every field is optional: an empty value keeps the
 * wording the block ships with, which the placeholder shows.
 * @param root0
 * @param root0.fields
 * @param root0.attributes
 * @param root0.setAttributes
 */
const TextList = ( { fields, attributes, setAttributes }: TextListProps ) => (
    <>
        { fields.map( ( field ) => (
            <TextControl
                key={ field.key }
                label={ field.label }
                help={ field.help }
                placeholder={ field.placeholder }
                value={ ( attributes[ field.key ] as string ) ?? '' }
                onChange={ ( value ) =>
                    setAttributes( { [ field.key ]: value } )
                }
                __next40pxDefaultSize
                __nextHasNoMarginBottom
            />
        ) ) }
    </>
);

export default TextList;
