import { SimpleInput } from '@getdokan/dokan-ui';
import { Select } from '@src/components';
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

const AttributeEdit = ( { data, field, onChange }: any ) => {
    const attributes: Attribute[] = data[ field.id ] || [];

    // Using a separate state to manage the "Add new" selection
    const [ selectedAttrAdd, setSelectedAttrAdd ] = useState< any >( null );

    // Available global attributes from field configuration
    const globalAttributeOptions = useMemo( () => {
        return field.elements || [];
    }, [ field.elements ] );

    // Options for the "Add new" dropdown: Custom + Global Attributes
    const addOptions = useMemo( () => {
        return [
            { label: __( 'Custom Attribute', 'dokan-lite' ), value: '' },
            ...globalAttributeOptions,
        ];
    }, [ globalAttributeOptions ] );

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

        onChange( { [ field.id ]: [ ...attributes, newAttribute ] } );
        setSelectedAttrAdd( null );
    };

    const handleRemoveAttribute = ( index: number ) => {
        const newAttributes = [ ...attributes ];
        newAttributes.splice( index, 1 );
        onChange( { [ field.id ]: newAttributes } );
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

    return (
        <CustomField label={ field.label }>
            <div className="flex flex-col gap-4">
                { /* Attribute List */ }
                { attributes.map( ( attr, index ) => (
                    <div
                        key={ index }
                        className="border rounded p-4 bg-white shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold text-gray-700">
                                { attr.is_taxonomy
                                    ? attr.name
                                    : __( 'Attribute', 'dokan-lite' ) }
                            </div>
                            <button
                                type="button"
                                onClick={ () => handleRemoveAttribute( index ) }
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                { __( 'Remove', 'dokan-lite' ) }
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    { __( 'Values', 'dokan-lite' ) }
                                </label>
                                { attr.is_taxonomy ? (
                                    <Select
                                        // @ts-ignore
                                        isMulti
                                        value={
                                            globalAttributeOptions
                                                .find(
                                                    ( opt: any ) =>
                                                        // eslint-disable-next-line eqeqeq
                                                        opt.value == attr.id
                                                )
                                                ?.terms?.filter(
                                                    ( term: any ) =>
                                                        (
                                                            attr.options as any[]
                                                         ).includes(
                                                            term.value
                                                        )
                                                ) || []
                                        }
                                        options={
                                            globalAttributeOptions.find(
                                                ( opt: any ) =>
                                                    opt.value == attr.id
                                            )?.terms || []
                                        }
                                        onChange={ ( selected: any ) => {
                                            const values = selected.map(
                                                ( val: any ) => val.value
                                            );
                                            // Handle both options (IDs) and terms (Objects)
                                            const newAttributes = [
                                                ...attributes,
                                            ];
                                            newAttributes[ index ] = {
                                                ...newAttributes[ index ],
                                                options: values,
                                                terms: selected,
                                            };
                                            onChange( {
                                                [ field.id ]: newAttributes,
                                            } );
                                        } }
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
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
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
                ) ) }

                { /* Add New Section */ }
                <div className="flex gap-2 items-center mt-2">
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
                    <button
                        type="button"
                        onClick={ handleAddAttribute }
                        className="px-4 py-2 bg-gray-100 text-gray-700 border rounded hover:bg-gray-200 text-sm font-medium"
                    >
                        { __( 'Add', 'dokan-lite' ) }
                    </button>
                </div>
            </div>
        </CustomField>
    );
};

export default AttributeEdit;
