import { DokanButton, Select } from '@src/components';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useFormContext } from '../context/FormContext';
import CustomField from './CustomField';
import AttributeCard, { Attribute } from './variation/AttributeCard';
import VariationForm from './variation/VariationForm';

const AttributeVariationEditor = ( { data, field, onChange }: any ) => {
    const attributes: Attribute[] = data[ field.id ] || [];
    const { isLoading, submitHandler } = useFormContext();
    const { product_type: productType } = data;

    // Using a separate state to manage the "Add new" selection
    const [ selectedAttrAdd, setSelectedAttrAdd ] = useState< any >( null );

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
    };

    return (
        <CustomField label={ field.label } error={ field.error }>
            <div className="flex flex-col gap-4">
                { /* Attribute List */ }
                { attributes.map( ( attr, index ) => {
                    return (
                        <AttributeCard
                            key={ index }
                            attr={ attr }
                            field={ field }
                            index={ index }
                            attributes={ attributes }
                            productType={ productType }
                            attributeOptions={ globalAttributeOptions }
                            onChange={ onChange }
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
                    <VariationForm product={ data } attributes={ attributes } />
                ) }
            </div>
        </CustomField>
    );
};
export default AttributeVariationEditor;
