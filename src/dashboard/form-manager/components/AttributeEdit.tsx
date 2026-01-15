import { SimpleInput } from '@getdokan/dokan-ui';
import { DokanButton, Select } from '@src/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import CustomField from './CustomField';

// Interface for a single attribute
interface Attribute {
    id: number; // 0 for custom
    name: string;
    options: string[] | string | number[];
    visible: boolean;
    variation: boolean;
    position: number;
    is_taxonomy?: boolean;
    terms?: { label: string; value: number }[];
}

type AttributeCardProps = {
    attr: Attribute;
    index: number;
    isExpanded: boolean;
    attributeOptions: any[];
    field: any;
    attributes: Attribute[];
    onChange: ( updatedData: any ) => void;
    setExpandedIndices: React.Dispatch< React.SetStateAction< number[] > >;
};

const AttributeCard = ( {
    attr,
    index,
    isExpanded,
    attributeOptions,
    field,
    attributes,
    onChange,
    setExpandedIndices,
}: AttributeCardProps ) => {
    const handleRemoveAttribute = ( index: number ) => {
        const newAttributes = [ ...attributes ];
        newAttributes.splice( index, 1 );
        onChange( { [ field.id ]: newAttributes } );

        // Update expanded indices: remove the deleted index and shift larger indices down
        setExpandedIndices( ( prev ) => {
            const newExpanded = prev
                .filter( ( i ) => i !== index )
                .map( ( i ) => ( i > index ? i - 1 : i ) );
            return newExpanded;
        } );
    };

    const handleAttributeChange = (
        index: number,
        key: keyof Attribute,
        value: any
    ) => {
        const newAttributes = [ ...attributes ];
        newAttributes[ index ] = {
            ...newAttributes[ index ],
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

    const attributeValues = ( attr: Attribute ) => {
        return (
            attributeOptions
                .find( ( opt: any ) => opt.value == attr.id )
                ?.terms?.filter( ( term: any ) =>
                    ( attr.options as any[] ).includes( term.value )
                ) || []
        );
    };

    const attributeChangeHandler = ( selected: any, index: number ) => {
        const values = selected.map( ( val: any ) => val.value );
        const newAttributes = [ ...attributes ];
        newAttributes[ index ] = {
            ...newAttributes[ index ],
            options: values,
            terms: selected,
        };
        onChange( {
            [ field.id ]: newAttributes,
        } );
    };

    const toggleAccordion = ( index: number ) => {
        setExpandedIndices( ( prev ) => {
            if ( prev.includes( index ) ) {
                return prev.filter( ( i ) => i !== index );
            } else {
                return [ ...prev, index ];
            }
        } );
    };
    return (
        <div className="border rounded bg-white shadow-sm overflow-hidden">
            <div
                className="flex justify-between items-center p-3 bg-gray-50 border-b cursor-pointer select-none"
                onClick={ () => toggleAccordion( index ) }
            >
                <div className="font-semibold text-gray-700 text-sm">
                    { attr.name || __( 'Attribute', 'dokan-lite' ) }
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            handleRemoveAttribute( index );
                        } }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                        { __( 'Remove', 'dokan-lite' ) }
                    </button>

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
                            <Select
                                // @ts-ignore
                                isMulti
                                value={ attributeValues( attr ) }
                                options={ filteredAttributeOptions( attr.id ) }
                                onChange={ ( selected ) =>
                                    attributeChangeHandler( selected, index )
                                }
                                placeholder={ __(
                                    'Select terms',
                                    'dokan-lite'
                                ) }
                            />
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

                    <div className="col-span-1 md:col-span-2 mt-2 text-sm text-gray-600">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={ attr.visible }
                                onChange={ ( e ) =>
                                    handleAttributeChange(
                                        index,
                                        'visible',
                                        e.target.checked
                                    )
                                }
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            { __(
                                'Visible on the product page',
                                'dokan-lite'
                            ) }
                        </label>
                    </div>
                </div>
            ) }
        </div>
    );
};

const AttributeEdit = ( { data, field, onChange }: any ) => {
    const attributes: Attribute[] = data[ field.id ] || [];

    // Using a separate state to manage the "Add new" selection
    const [ selectedAttrAdd, setSelectedAttrAdd ] = useState< any >( null );

    // State to track expanded attribute cards
    const [ expandedIndices, setExpandedIndices ] = useState< number[] >( [] );

    // Available global attributes from field configuration
    const globalAttributeOptions = useMemo( () => {
        return field.elements || [];
    }, [ field.elements ] );

    // Options for the "Add new" dropdown: Custom + Global Attributes
    const addOptions = useMemo( () => {
        const options = [
            { label: __( 'Custom Attribute', 'dokan-lite' ), value: '' },
            ...globalAttributeOptions,
        ];
        return options.filter( ( opt ) => {
            // Exclude already added attributes
            return ! attributes.some( ( attr ) => {
                if ( attr.is_taxonomy ) {
                    return Number( attr.id ) === Number( opt.value );
                }
                return false;
            } );
        } );
    }, [ globalAttributeOptions, attributes ] );

    const handleAddAttribute = () => {
        const newAttribute: Attribute = {
            id: 0,
            name: '',
            options: '',
            visible: true,
            variation: false,
            position: attributes.length,
            is_taxonomy: false,
        };

        if ( selectedAttrAdd && selectedAttrAdd.value !== '' ) {
            // Adding a global attribute
            newAttribute.id = parseInt( selectedAttrAdd.value, 10 );
            newAttribute.name = selectedAttrAdd.label;
            newAttribute.is_taxonomy = true;
        } else {
            newAttribute.name = __( 'Custom Attribute', 'dokan-lite' );
        }

        const newAttributes = [ ...attributes, newAttribute ];
        onChange( { [ field.id ]: newAttributes } );

        // Expand the new attribute (last index)
        setExpandedIndices( ( prev ) => [ ...prev, attributes.length ] );

        setSelectedAttrAdd( null );
    };

    return (
        <CustomField label={ field.label } error={ field.error }>
            <div className="flex flex-col gap-4">
                { /* Attribute List */ }
                { attributes.map( ( attr, index ) => {
                    const isExpanded = expandedIndices.includes( index );
                    return (
                        <AttributeCard
                            key={ index }
                            attr={ attr }
                            index={ index }
                            isExpanded={ isExpanded }
                            attributeOptions={ globalAttributeOptions }
                            field={ field }
                            attributes={ attributes }
                            onChange={ onChange }
                            setExpandedIndices={ setExpandedIndices }
                        />
                    );
                } ) }

                { /* Add New Section */ }
                <div className="flex gap-2 items-center">
                    <div className="flex-grow">
                        <Select
                            options={ addOptions }
                            value={ selectedAttrAdd }
                            onChange={ ( val: any ) =>
                                setSelectedAttrAdd( val )
                            }
                            placeholder={ __(
                                'Custom Attribute',
                                'dokan-lite'
                            ) }
                            isClearable={ false }
                        />
                    </div>
                    <DokanButton
                        type="button"
                        variant="secondary"
                        onClick={ handleAddAttribute }
                    >
                        { __( 'Add', 'dokan-lite' ) }
                    </DokanButton>
                </div>
            </div>
        </CustomField>
    );
};

export default AttributeEdit;
