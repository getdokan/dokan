import { DokanButton, Select } from '@src/components';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useProductEditor } from '../hooks/useProductEditor';
import { Attribute } from '../types';
import CustomField, { getValidationError } from './CustomField';
import AttributeCard from './variation/AttributeCard';
import VariationForm from './variation/VariationForm';

const AttributeVariationEditor = ( {
    data,
    field,
    onChange,
    validity,
}: any ) => {
    const attributes: Attribute[] = data[ field.id ] || [];
    const { isLoading, submitHandler } = useProductEditor( data.id );
    const { type: productType } = data;
    const options = field.elements || [];
    const [ cardExpanded, setCardExpanded ] = useState( false );

    // Using a separate state to manage the "Add new" selection
    const [ selectedAttrAdd, setSelectedAttrAdd ] = useState< any >( null );

    // Options for the "Add new" dropdown: Custom + Global Attributes
    const addOptions = useMemo( () => {
        const options = [
            { label: __( 'Custom Attribute', 'dokan-lite' ), value: '' },
            ...field.elements,
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
    }, [ field.elements, attributes ] );

    const handleAddAttribute = () => {
        const newAttribute: Attribute = {
            id: 0,
            name: '',
            options: [],
            visible: true,
            variation: false,
            position: attributes.length,
            is_taxonomy: false,
            value: '',
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
        setSelectedAttrAdd( null );
        setCardExpanded( true );
    };

    const handleUpdateAttribute = ( index: number, updatedAttr: Attribute ) => {
        const newAttributes = [ ...attributes ];
        newAttributes[ index ] = updatedAttr;
        onChange( { [ field.id ]: newAttributes } );
    };

    const handleRemoveAttribute = ( index: number ) => {
        const newAttributes = [ ...attributes ];
        newAttributes.splice( index, 1 );
        onChange( { [ field.id ]: newAttributes } );
    };

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <div className="flex flex-col gap-4">
                { /* Attribute List */ }
                { attributes.map( ( attr, index ) => (
                    <AttributeCard
                        key={ index }
                        attr={ attr }
                        options={ options }
                        productType={ productType }
                        cardExpanded={ cardExpanded }
                        onUpdate={ ( value ) =>
                            handleUpdateAttribute( index, value )
                        }
                        onRemove={ ( e ) => {
                            e.stopPropagation();
                            handleRemoveAttribute( index );
                        } }
                    />
                ) ) }

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
                                'Add existing attribute or custom',
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
                        { __( 'Add New', 'dokan-lite' ) }
                    </DokanButton>
                    { attributes.length > 0 && (
                        <div>
                            <DokanButton
                                type="button"
                                variant="secondary"
                                onClick={ submitHandler }
                                disabled={ isLoading }
                                label={ __( 'Save Attributes', 'dokan-lite' ) }
                            />
                        </div>
                    ) }
                </div>

                { productType === 'variable' && (
                    <VariationForm
                        productId={ data.id }
                        attributes={ attributes }
                    />
                ) }
            </div>
        </CustomField>
    );
};
export default AttributeVariationEditor;
