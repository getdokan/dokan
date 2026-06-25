import {
    SimpleCheckbox,
    SimpleInput,
    TaggableSelect,
} from '@getdokan/dokan-ui';
import { AsyncSelect, DokanButton, DokanModal } from '@src/components';
import DebouncedInput from '@src/components/DebouncedInput';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { debounce } from '@wordpress/compose';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { GripVertical } from 'lucide-react';
import { Attribute } from '../../types';

export type AttributeCardProps = {
    attr: Attribute;
    productType?: string;
    cardExpanded?: boolean;
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
    const [ isSelectingAll, setIsSelectingAll ] = useState( false );

    const canAddNewAttribute = Boolean(
        // @ts-ignore
        window.dokanProductEditor?.can_add_new_attribute
    );

    const handleAttributeChange = ( key: keyof Attribute, value: any ) => {
        onUpdate( {
            ...attr,
            [ key ]: value,
        } );
    };

    // Options for custom (non-taxonomy) attributes are stored inline on the attribute.
    const customAttributeOptions = () =>
        ( attr.options || [] ).map( ( optionValue: any ) => ( {
            value: optionValue,
            label: optionValue,
        } ) );

    const termsEndpoint = `/dokan/v1/products/attributes/${ attr.id }/editor-terms`;

    const mapTerm = ( term: any ) => ( {
        value: term.value,
        label: term.label,
    } );

    // Lazily fetch (searchable) terms for a taxonomy attribute. Terms are no
    // longer embedded in the form schema, so stores with very large attribute
    // taxonomies do not exhaust memory while building the editor.
    const loadTerms = useCallback(
        async ( inputValue: string ) => {
            if ( ! attr.is_taxonomy || ! attr.id ) {
                return [];
            }
            try {
                const data: any = await apiFetch( {
                    path: addQueryArgs( termsEndpoint, {
                        search: inputValue || '',
                        per_page: 20,
                    } ),
                } );
                return Array.isArray( data ) ? data.map( mapTerm ) : [];
            } catch {
                return [];
            }
        },
        [ attr.id, attr.is_taxonomy ] // eslint-disable-line react-hooks/exhaustive-deps
    );

    // Debounce term lookups so typing in the AsyncSelect fires a single request
    // after the user pauses, instead of one request per keystroke. react-select's
    // callback form is used because a lodash-style debounce cannot return the
    // pending promise the promise form expects. Rest args satisfy the
    // `(...args: unknown[]) => unknown` constraint of @wordpress/compose's debounce.
    const debouncedLoadTerms = useMemo(
        () =>
            debounce( ( ...args: unknown[] ) => {
                const inputValue = ( args[ 0 ] as string ) || '';
                const callback = args[ 1 ] as (
                    options: ReturnType< typeof mapTerm >[]
                ) => void;
                loadTerms( inputValue ).then( callback );
            }, 300 ),
        [ loadTerms ]
    );

    // Cancel any pending debounced lookup when the card unmounts or the loader changes.
    useEffect(
        () => () => debouncedLoadTerms.cancel(),
        [ debouncedLoadTerms ]
    );

    const attributeChangeHandler = ( selected: any ) => {
        const normalized = Array.isArray( selected ) ? selected : [];
        const values = normalized.map( ( val: any ) => val.value );
        onUpdate( {
            ...attr,
            options: values,
            terms: normalized,
        } );
    };

    const toggleAccordion = () => {
        setIsExpanded( ! isExpanded );
    };

    const handleSelectAll = async () => {
        if ( ! attr.is_taxonomy || ! attr.id ) {
            return;
        }

        setIsSelectingAll( true );
        try {
            const maxTerms = 1000; // Safety cap so a pathologically large taxonomy can't be selected at once.
            const data: any = await apiFetch( {
                path: addQueryArgs( termsEndpoint, { per_page: maxTerms } ),
            } );

            attributeChangeHandler(
                Array.isArray( data ) ? data.map( mapTerm ) : []
            );
        } catch {
            // Selecting all terms failed silently.
        } finally {
            setIsSelectingAll( false );
        }
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
                path: `/dokan/v1/products/attributes/${ attr.id }/editor-terms`,
                method: 'POST',
                data: { name: newTermName.trim() },
            } );

            const newTerm = {
                value: response.id,
                label: response.name,
            };

            const currentValues = attr.terms ?? [];
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
                isDragOver ? 'border-primary border-dashed' : ''
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
                    <button
                        type="button"
                        className="cursor-grab text-gray-400 hover:text-gray-600 bg-transparent border-none"
                        onMouseDown={ ( e ) => {
                            e.stopPropagation();
                            setIsDraggable( true );
                        } }
                        onMouseUp={ () => setIsDraggable( false ) }
                        onClick={ ( e ) => e.stopPropagation() }
                    >
                        <GripVertical size={ 16 } />
                    </button>
                    <span className="font-semibold text-gray-700 text-sm">
                        { attr.name || __( 'New Attribute', 'dokan-lite' ) }
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={ onRemove }
                        className="text-red-500 hover:text-red-700 text-xs font-medium bg-transparent border-none"
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
                        <label
                            className="block text-xs font-medium text-gray-500 mb-1"
                            htmlFor={ `dokan-attr-values-${ attr.id }` }
                        >
                            { __( 'Value(s)', 'dokan-lite' ) }
                        </label>

                        { attr.is_taxonomy ? (
                            <>
                                <AsyncSelect
                                    // @ts-ignore react-select multi generic
                                    isMulti
                                    cacheOptions
                                    defaultOptions
                                    closeMenuOnSelect={ false }
                                    value={ attr.terms ?? [] }
                                    loadOptions={ debouncedLoadTerms }
                                    onChange={ ( selected: any ) =>
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
                                        disabled={ isSelectingAll }
                                        loading={ isSelectingAll }
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
                                                setIsAddTermModalOpen( true )
                                            }
                                        >
                                            { __( 'Add New', 'dokan-lite' ) }
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
                                            setIsAddTermModalOpen( false );
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
                                                    label={ __(
                                                        'Term Name',
                                                        'dokan-lite'
                                                    ) }
                                                    value={ newTermName }
                                                    onChange={ ( e ) =>
                                                        setNewTermName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                    input={ {
                                                        id: `dokan-new-term-${ attr.id }`,
                                                        placeholder: __(
                                                            'Enter term name',
                                                            'dokan-lite'
                                                        ),
                                                        autoFocus: true,
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
                                value={ customAttributeOptions() }
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
                        <label
                            className="inline-flex items-center"
                            htmlFor={ `dokan-attr-visible-${ attr.id }` }
                        >
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
                            <label
                                className="inline-flex items-center"
                                htmlFor={ `dokan-attr-variation-${ attr.id }` }
                            >
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
