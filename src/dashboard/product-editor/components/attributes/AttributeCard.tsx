import {
    SimpleCheckbox,
    SimpleInput,
    TaggableSelect,
} from '@getdokan/dokan-ui';
import { DokanButton, DokanModal, Select } from '@src/components';
import DebouncedInput from '@src/components/DebouncedInput';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { GripVertical } from 'lucide-react';
import { Attribute } from '../../types';

export type AttributeCardProps = {
    attr: Attribute;
    productType?: string;
    cardExpanded?: boolean;
    options: any[];
    onUpdate: ( updatedAttribute: Attribute ) => void;
    onRemove: ( e: React.MouseEvent< HTMLSpanElement, MouseEvent > ) => void;
    index: number;
    isDragOver: boolean;
    onDragStart: ( index: number ) => void;
    onDragEnter: ( index: number ) => void;
    onDragOver: ( e: React.DragEvent ) => void;
    onDrop: () => void;
    onDragEnd: () => void;
};

const AttributeCard = ( {
    attr,
    options,
    onUpdate,
    onRemove,
    productType,
    cardExpanded,
    index,
    isDragOver,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDrop,
    onDragEnd,
}: AttributeCardProps ) => {
    const [ isExpanded, setIsExpanded ] = useState( cardExpanded );
    const [ isDraggable, setIsDraggable ] = useState( false );
    const [ isAddTermModalOpen, setIsAddTermModalOpen ] = useState( false );
    const [ newTermName, setNewTermName ] = useState( '' );
    const [ isAddingTerm, setIsAddingTerm ] = useState( false );

    // @ts-ignore
    const canAddNewAttribute = Boolean( window.dokanProductEditor?.can_add_new_attribute );

    const handleAttributeChange = ( key: keyof Attribute, value: any ) => {
        onUpdate( {
            ...attr,
            [ key ]: value,
        } );
    };

    const attributeOptions = ( attrId: number ) => {
        if ( attr.is_taxonomy ) {
            return (
                options.find(
                    ( option: any ) =>
                        Number( option.value ) === Number( attrId )
                )?.terms || []
            );
        }

        return attr.options.map( ( optionValue: any ) => ( {
            value: optionValue,
            label: optionValue,
        } ) );
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

    const handleAddNewTerm = async () => {
        if ( ! newTermName.trim() || ! attr.is_taxonomy ) {
            return;
        }

        setIsAddingTerm( true );
        try {
            const response: any = await apiFetch( {
                path: `/dokan/v1/products/attributes/${ attr.id }/terms`,
                method: 'POST',
                data: { name: newTermName.trim() },
            } );

            const newTerm = {
                value: response.id,
                label: response.name,
            };

            const currentValues = attributeValues( attr );
            attributeChangeHandler( [ ...currentValues, newTerm ] );

            setNewTermName( '' );
            setIsAddTermModalOpen( false );
        } catch {
            // Term creation failed silently
        } finally {
            setIsAddingTerm( false );
        }
    };

    return (
        <div
            className={ `border rounded bg-white overflow-hidden transition-[border-color,opacity] duration-200 ${
                isDragOver
                    ? 'border-primary border-dashed'
                    : ''
            }` }
            draggable={ isDraggable }
            onDragStart={ () => onDragStart( index ) }
            onDragEnter={ () => onDragEnter( index ) }
            onDragOver={ onDragOver }
            onDrop={ onDrop }
            onDragEnd={ () => {
                setIsDraggable( false );
                onDragEnd();
            } }
        >
            <div
                role="button"
                tabIndex={ 0 }
                className="flex justify-between items-center p-3 bg-gray-50 border-b cursor-pointer select-none"
                onClick={ toggleAccordion }
                onKeyDown={ ( e ) => {
                    if ( e.key === 'Enter' || e.key === ' ' ) {
                        e.preventDefault();
                        toggleAccordion();
                    }
                } }
            >
                <div className="flex items-center gap-2">
                    <span
                        className="cursor-grab text-gray-400 hover:text-gray-600"
                        onMouseDown={ ( e ) => {
                            e.stopPropagation();
                            setIsDraggable( true );
                        } }
                        onMouseUp={ () => setIsDraggable( false ) }
                        onClick={ ( e ) => e.stopPropagation() }
                    >
                        <GripVertical size={ 16 } />
                    </span>
                    <span className="font-semibold text-gray-700 text-sm">
                        { attr.name || __( 'New Attribute', 'dokan-lite' ) }
                    </span>
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
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                    { /* Name Field - Editable only for Custom Attributes */ }
                    <div>
                        <DebouncedInput
                            label={ __( 'Name', 'dokan-lite' ) }
                            value={ attr.name }
                            onChange={ ( value: string ) =>
                                handleAttributeChange( 'name', value )
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
                                    isMulti
                                    value={ attr.terms ?? attributeValues( attr ) }
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
                                    { canAddNewAttribute && (
                                        <DokanButton
                                            type="button"
                                            variant="secondary"
                                            onClick={ () =>
                                                setIsAddTermModalOpen(
                                                    true
                                                )
                                            }
                                        >
                                            { __(
                                                'Add New',
                                                'dokan-lite'
                                            ) }
                                        </DokanButton>
                                    ) }
                                </div>

                                { canAddNewAttribute && (
                                    <DokanModal
                                        isOpen={ isAddTermModalOpen }
                                        namespace="add-attribute-term"
                                        dialogTitle={ __(
                                            'Add New Term',
                                            'dokan-lite'
                                        ) }
                                        onClose={ () => {
                                            setIsAddTermModalOpen(
                                                false
                                            );
                                            setNewTermName( '' );
                                        } }
                                        onConfirm={ handleAddNewTerm }
                                        loading={ isAddingTerm }
                                        confirmButtonDisabled={
                                            ! newTermName.trim()
                                        }
                                        dialogContent={
                                            <div>
                                                <SimpleInput
                                                    label={ __( 'Term Name', 'dokan-lite' ) }
                                                    value={
                                                        newTermName
                                                    }
                                                    onChange={ ( e ) =>
                                                        setNewTermName(
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                    input={ {
                                                        id: `dokan-new-term-${ attr.id }`,
                                                        placeholder:
                                                            __(
                                                                'Enter term name',
                                                                'dokan-lite'
                                                            ),
                                                        autoFocus:
                                                            true,
                                                    } }
                                                />
                                            </div>
                                        }
                                    />
                                ) }
                            </>
                        ) : (
                            <TaggableSelect
                                isMulti
                                value={ attributeOptions( attr.id ) }
                                onChange={ ( selected ) =>
                                    attributeChangeHandler( selected )
                                }
                                placeholder={ __(
                                    'Enter values',
                                    'dokan-lite'
                                ) }
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

                        { productType?.includes( 'variable' ) && (
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
