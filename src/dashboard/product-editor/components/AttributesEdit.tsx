import { AsyncSelect, DokanButton, Select } from '@src/components';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useProductEditor } from '../hooks/useProductEditor';
import { Attribute } from '../types';
import CustomField, { getValidationError } from './CustomField';
import AttributeCard from './attributes/AttributeCard';
import { applyFilters } from '@wordpress/hooks';

const AttributesEdit = ( { data, field, onChange, validity }: any ) => {
    const attributes: Attribute[] = useMemo(
        () => data[ field.id ] || [],
        [ data, field.id ]
    );
    const { isLoading, submitHandler, getDefaultValue, handleDefaultChange } =
        useProductEditor( data.id );
    const { type: productType } = data;
    const [ cardExpanded, setCardExpanded ] = useState( false );

    // Drag-and-drop reorder state.
    const dragIndexRef = useRef< number | null >( null );
    const [ dragOverIndex, setDragOverIndex ] = useState< number | null >(
        null
    );

    const handleDragStart = useCallback( ( index: number ) => {
        dragIndexRef.current = index;
    }, [] );

    const handleDragEnter = useCallback( ( index: number ) => {
        setDragOverIndex( index );
    }, [] );

    const handleDragOver = useCallback( ( e: React.DragEvent ) => {
        e.preventDefault();
    }, [] );

    const handleDrop = useCallback( () => {
        const from = dragIndexRef.current;
        const to = dragOverIndex;

        if ( from === null || to === null || from === to ) {
            dragIndexRef.current = null;
            setDragOverIndex( null );
            return;
        }

        const reordered = [ ...attributes ];
        const [ moved ] = reordered.splice( from, 1 );
        reordered.splice( to, 0, moved );

        // Update positions and persist.
        const updated = reordered.map( ( attr, idx ) => ( {
            ...attr,
            position: idx,
        } ) );
        onChange( { [ field.id ]: updated } );

        dragIndexRef.current = null;
        setDragOverIndex( null );
    }, [ attributes, dragOverIndex, onChange, field.id ] );

    const handleDragEnd = useCallback( () => {
        dragIndexRef.current = null;
        setDragOverIndex( null );
    }, [] );

    // Using a separate state to manage the "Add new" selection
    const [ selectedAttrAdd, setSelectedAttrAdd ] = useState< any >( null );

    // Lazily fetch the "Add new" dropdown options: Custom + global attribute
    // taxonomies. Taxonomies are loaded on demand from the REST endpoint instead
    // of being embedded in the form schema.
    const loadAddOptions = useCallback(
        async ( inputValue: string ) => {
            const customOption = {
                label: __( 'Custom Attribute', 'dokan-lite' ),
                value: '',
            };

            let taxonomies: any[] = [];
            try {
                const result: any = await apiFetch( {
                    path: '/dokan/v1/products/attributes',
                } );
                taxonomies = Array.isArray( result ) ? result : [];
            } catch {
                taxonomies = [];
            }

            const search = ( inputValue || '' ).toLowerCase();
            const taxOptions = taxonomies
                .map( ( t: any ) => ( {
                    label: t.name,
                    value: t.id,
                    slug: t.slug,
                } ) )
                // Exclude already-added global attributes.
                .filter(
                    ( opt ) =>
                        ! attributes.some(
                            ( attr ) =>
                                attr.is_taxonomy &&
                                Number( attr.id ) === Number( opt.value )
                        )
                )
                .filter( ( opt ) =>
                    search ? opt.label.toLowerCase().includes( search ) : true
                );

            const includeCustom =
                ! search || customOption.label.toLowerCase().includes( search );

            return includeCustom ? [ customOption, ...taxOptions ] : taxOptions;
        },
        [ attributes ]
    );

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

    const variationAttributes = useMemo(
        () => attributes.filter( ( attr ) => attr.variation ),
        [ attributes ]
    );

    const getDefaultOptions = useCallback( ( attr: Attribute ) => {
        if ( attr.is_taxonomy && attr.terms ) {
            return attr.terms.map( ( t ) => ( {
                label: t.label,
                value: t.label,
            } ) );
        }
        return ( attr.options || [] ).map( ( o: any ) => ( {
            label: String( o ),
            value: String( o ),
        } ) );
    }, [] );

    const placeholder =
        field.placeholder ||
        __( 'Add existing attribute or custom', 'dokan-lite' );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <div className="flex flex-col gap-4">
                { /* Attribute List */ }
                { attributes.map( ( attr, index ) => (
                    <AttributeCard
                        key={ attr.position }
                        attr={ attr }
                        productType={ productType }
                        cardExpanded={ cardExpanded }
                        onUpdate={ ( value: any ) =>
                            handleUpdateAttribute( index, value )
                        }
                        onRemove={ ( e: any ) => {
                            e.stopPropagation();
                            handleRemoveAttribute( index );
                        } }
                        index={ index }
                        isDragOver={ dragOverIndex === index }
                        onDragStart={ handleDragStart }
                        onDragEnter={ handleDragEnter }
                        onDragOver={ handleDragOver }
                        onDrop={ handleDrop }
                        onDragEnd={ handleDragEnd }
                    />
                ) ) }

                { /* Add New Section */ }
                <div className="flex gap-2 items-center">
                    <div className="grow">
                        <AsyncSelect
                            // Remount when the attribute list changes so the
                            // exclusion of already-added attributes refreshes.
                            key={ attributes.length }
                            cacheOptions
                            defaultOptions
                            value={ selectedAttrAdd }
                            loadOptions={ loadAddOptions }
                            onChange={ ( val: any ) =>
                                setSelectedAttrAdd( val )
                            }
                            placeholder={ placeholder }
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
                </div>

                { productType.includes( 'variable' ) &&
                    variationAttributes.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium text-gray-700">
                                { __( 'Default Form Values', 'dokan-lite' ) }
                            </div>
                            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
                                { variationAttributes.map( ( attr ) => (
                                    <Select
                                        key={ attr.name }
                                        options={ getDefaultOptions( attr ) }
                                        placeholder={ `${ __(
                                            'No default',
                                            'dokan-lite'
                                        ) } ${ attr.name }\u2026` }
                                        value={ getDefaultValue( attr ) }
                                        onChange={ ( val: any ) =>
                                            handleDefaultChange( attr, val )
                                        }
                                        isClearable
                                    />
                                ) ) }
                            </div>
                        </div>
                    ) }
                { attributes.length > 0 && (
                    <div>
                        <DokanButton
                            type="button"
                            variant="secondary"
                            onClick={ submitHandler }
                            disabled={ isLoading }
                            loading={ isLoading }
                            label={ __( 'Save Attributes', 'dokan-lite' ) }
                        />
                    </div>
                ) }

                { applyFilters(
                    'dokan_product_editor_after_attributes',
                    null,
                    data,
                    attributes
                ) }
            </div>
        </CustomField>
    );
};
export default AttributesEdit;
