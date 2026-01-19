import { SimpleCheckbox, SimpleInput } from '@getdokan/dokan-ui';
import { DokanButton, Select } from '@src/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Attribute } from '../../types';

export type AttributeCardProps = {
    attr: Attribute;
    productType?: string;
    cardExpanded?: boolean;
    options: any[];
    onUpdate: ( updatedAttribute: Attribute ) => void;
    onRemove: ( e: React.MouseEvent< HTMLSpanElement, MouseEvent > ) => void;
};

const AttributeCard = ( {
    attr,
    options,
    onUpdate,
    onRemove,
    productType,
    cardExpanded,
}: AttributeCardProps ) => {
    const [ isExpanded, setIsExpanded ] = useState( cardExpanded );

    const handleAttributeChange = ( key: keyof Attribute, value: any ) => {
        onUpdate( {
            ...attr,
            [ key ]: value,
        } );
    };

    const attributeOptions = ( attrId: number ) => {
        return (
            options.find(
                ( option: any ) => Number( option.value ) === Number( attrId )
            )?.terms || []
        );
    };

    const attributeValues = ( attrValue: Attribute ) => {
        return (
            options
                .find(
                    ( option: any ) =>
                        Number( option.value ) === Number( attrValue.id )
                )
                ?.terms?.filter( ( term: any ) =>
                    ( attr.options as any[] ).includes( term.value )
                ) || []
        );
    };

    const attributeChangeHandler = ( selected: any ) => {
        const values = selected.map( ( val: any ) => val.value );
        onUpdate( {
            ...attr,
            options: values,
            terms: selected,
        } );
    };

    const toggleAccordion = () => {
        setIsExpanded( ! isExpanded );
    };

    const handleSelectAll = () => {
        const allOptions = attributeOptions( attr.id );
        attributeChangeHandler( allOptions );
    };

    const handleSelectNone = () => {
        attributeChangeHandler( [] );
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
                        onClick={ onRemove }
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
                                handleAttributeChange( 'name', e.target.value )
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
                                    options={ attributeOptions( attr.id ) }
                                    onChange={ ( selected ) =>
                                        attributeChangeHandler( selected )
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
                                        'visible',
                                        e.target.checked
                                    )
                                }
                                input={ {
                                    id: `dokan-attr-visible-${ attr.id }`,
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
                                            'variation',
                                            e.target.checked
                                        )
                                    }
                                    input={ {
                                        id: `dokan-attr-variation-${ attr.id }`,
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
