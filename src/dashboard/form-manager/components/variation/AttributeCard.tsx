import { SimpleCheckbox, SimpleInput } from '@getdokan/dokan-ui';
import { DokanButton, Select } from '@src/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export interface Attribute {
    id: number; // 0 for custom
    name: string;
    value: string;
    options: string[] | string | number[];
    visible: boolean;
    variation: boolean;
    position: number;
    is_taxonomy?: boolean;
    terms?: { label: string; value: number }[];
}

export type AttributeCardProps = {
    attr: Attribute;
    field: any;
    index: number;
    productType?: string;
    attributeOptions: any[];
    attributes: Attribute[];
    onChange: ( updatedData: any ) => void;
};

const AttributeCard = ( {
    attr,
    index,
    attributeOptions,
    field,
    attributes,
    onChange,
    productType,
}: AttributeCardProps ) => {
    const [ isExpanded, setIsExpanded ] = useState( false );
    const handleRemoveAttribute = ( idx: number ) => {
        const newAttributes = [ ...attributes ];
        newAttributes.splice( idx, 1 );
        onChange( { [ field.id ]: newAttributes } );
    };

    const handleAttributeChange = (
        idx: number,
        key: keyof Attribute,
        value: any
    ) => {
        const newAttributes = [ ...attributes ];
        newAttributes[ idx ] = {
            ...newAttributes[ idx ],
            [ key ]: value,
        };
        onChange( { [ field.id ]: newAttributes } );
    };

    const filteredAttributeOptions = ( attrId: number ) => {
        const globalAttr = attributeOptions.find(
            ( opt: any ) => Number( opt.value ) === Number( attrId )
        );
        return globalAttr ? globalAttr.terms || [] : [];
    };

    const attributeValues = ( attrValue: Attribute ) => {
        return (
            attributeOptions
                .find(
                    ( opt: any ) =>
                        Number( opt.value ) === Number( attrValue.id )
                )
                ?.terms?.filter( ( term: any ) =>
                    ( attr.options as any[] ).includes( term.value )
                ) || []
        );
    };

    const attributeChangeHandler = ( selected: any, idx: number ) => {
        const values = selected.map( ( val: any ) => val.value );
        const newAttributes = [ ...attributes ];
        newAttributes[ idx ] = {
            ...newAttributes[ idx ],
            options: values,
            terms: selected,
        };
        onChange( {
            [ field.id ]: newAttributes,
        } );
    };

    const toggleAccordion = () => {
        setIsExpanded( ! isExpanded );
    };

    const handleSelectAll = () => {
        const allOptions = filteredAttributeOptions( attr.id );
        attributeChangeHandler( allOptions, index );
    };

    const handleSelectNone = () => {
        attributeChangeHandler( [], index );
    };

    return (
        <div className="border rounded bg-white shadow-sm overflow-hidden">
            <div
                role="button"
                className="flex justify-between items-center p-3 bg-gray-50 border-b cursor-pointer select-none"
                onClick={ toggleAccordion }
            >
                <div className="font-semibold text-gray-700 text-sm">
                    { attr.name || __( 'New Attribute', 'dokan-lite' ) }
                </div>
                <div className="flex items-center gap-3">
                    <span
                        role="button"
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            handleRemoveAttribute( index );
                        } }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                        { __( 'Remove', 'dokan-lite' ) }
                    </span>

                    <span
                        className={ `transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                        }` }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </span>
                </div>
            </div>

            { isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-t">
                    { /* Name Field - Editable only for Custom Attributes */ }
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            { __( 'Name', 'dokan-lite' ) }
                        </label>
                        <SimpleInput
                            value={ attr.name }
                            onChange={ ( e ) =>
                                handleAttributeChange(
                                    index,
                                    'name',
                                    e.target.value
                                )
                            }
                            disabled={ !! attr.is_taxonomy }
                            className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-100 disabled:text-gray-500"
                            input={ {
                                placeholder: __(
                                    'e.g. Color or Size',
                                    'dokan-lite'
                                ),
                            } }
                        />
                    </div>

                    { /* Values Field */ }
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            { __( 'Value(s)', 'dokan-lite' ) }
                        </label>
                        { attr.is_taxonomy ? (
                            <>
                                <Select
                                    // @ts-ignore
                                    isMulti
                                    value={ attributeValues( attr ) }
                                    options={ filteredAttributeOptions(
                                        attr.id
                                    ) }
                                    onChange={ ( selected ) =>
                                        attributeChangeHandler(
                                            selected,
                                            index
                                        )
                                    }
                                    placeholder={ __(
                                        'Select terms',
                                        'dokan-lite'
                                    ) }
                                />
                                <div className="flex justify-start gap-2 items-center mt-2">
                                    <DokanButton
                                        type="button"
                                        variant="secondary"
                                        onClick={ handleSelectAll }
                                    >
                                        { __( 'Select all', 'dokan-lite' ) }
                                    </DokanButton>
                                    <DokanButton
                                        type="button"
                                        variant="secondary"
                                        onClick={ handleSelectNone }
                                    >
                                        { __( 'Select none', 'dokan-lite' ) }
                                    </DokanButton>
                                </div>
                            </>
                        ) : (
                            <SimpleInput
                                value={
                                    Array.isArray( attr.options )
                                        ? attr.options.join( ' | ' )
                                        : attr.options
                                }
                                onChange={ ( e ) =>
                                    handleAttributeChange(
                                        index,
                                        'options',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border rounded text-sm"
                                input={ {
                                    placeholder: __(
                                        'Enter values separated by | (pipe)',
                                        'dokan-lite'
                                    ),
                                } }
                            />
                        ) }
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-2 text-sm text-gray-600 flex flex-col md:flex-row gap-4">
                        <label className="inline-flex items-center">
                            <SimpleCheckbox
                                checked={ attr.visible }
                                onChange={ ( e ) =>
                                    handleAttributeChange(
                                        index,
                                        'visible',
                                        e.target.checked
                                    )
                                }
                                input={ {
                                    id: `dokan-attr-visible-${ index }-${ attr.id }`,
                                } }
                            />
                            { __(
                                'Visible on the product page',
                                'dokan-lite'
                            ) }
                        </label>

                        { productType === 'variable' && (
                            <label className="inline-flex items-center">
                                <SimpleCheckbox
                                    checked={ attr.variation }
                                    onChange={ ( e ) =>
                                        handleAttributeChange(
                                            index,
                                            'variation',
                                            e.target.checked
                                        )
                                    }
                                    input={ {
                                        id: `dokan-attr-variation-${ index }-${ attr.id }`,
                                    } }
                                />
                                { __( 'Used for variations', 'dokan-lite' ) }
                            </label>
                        ) }
                    </div>
                </div>
            ) }
        </div>
    );
};

export default AttributeCard;
