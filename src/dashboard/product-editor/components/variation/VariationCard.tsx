import { DokanButton, Select } from '@src/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// @ts-ignore
import productEditorStore from '@dokan/stores/product-editor';
import { useProductEditor } from '../../hooks/useProductEditor';
import { useVariations } from '../../hooks/useVariations';
import useVariationLayouts from '../../hooks/useVariationLayouts';
import { VariationType } from '../../types';

type VariationCardProps = {
    variation: VariationType;
};

const VariationCardContent = ( {
    variation,
}: {
    variation: VariationType;
} ) => {
    const { product, formItems, fields, onChange } = useProductEditor(
        variation.id
    );
    const { updateVariation, saveVariation, isLoading } = useVariations(
        variation.parent_id
    );
    const { formLayouts } = useVariationLayouts( formItems, product );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
                { variation.attributes.map( ( attr, idx: number ) => {
                    const placeholder = `${ __( 'Any ', 'dokan-lite' ) }${
                        attr.label
                    }`;
                    return (
                        <div key={ idx }>
                            <Select
                                options={ attr.options }
                                placeholder={ placeholder }
                                value={ attr.selected_value }
                                onChange={ ( value: any ) => {
                                    const newAttributes = [
                                        ...variation.attributes,
                                    ];
                                    newAttributes[ idx ] = {
                                        ...newAttributes[ idx ],
                                        selected_value: value,
                                    };
                                    updateVariation( {
                                        ...variation,
                                        attributes: newAttributes,
                                    } );
                                } }
                            />
                        </div>
                    );
                } ) }
            </div>
            <DataForm
                data={ product }
                fields={ fields }
                form={ formLayouts }
                onChange={ onChange }
            />

            <div className="flex justify-end">
                <DokanButton
                    type="button"
                    variant="primary"
                    disabled={ isLoading }
                    loading={ isLoading }
                    label={ __( 'Save Variation', 'dokan-lite' ) }
                    onClick={ async () => {
                        await saveVariation( variation, product );
                    } }
                />
            </div>
        </div>
    );
};

const VariationCard = ( { variation }: VariationCardProps ) => {
    const { removeVariation } = useVariations( variation.parent_id );
    const { fetchVariationForm } = useDispatch( productEditorStore );
    const [ isExpanded, setIsExpanded ] = useState( false );
    const [ isLoading, setIsLoading ] = useState( false );

    const hasFormData = useSelect(
        ( select ) => {
            return ( select( productEditorStore ) as any ).hasForm(
                variation.id
            );
        },
        [ variation.id ]
    );

    const handleToggle = async () => {
        setIsExpanded( ! isExpanded );

        if ( hasFormData ) {
            return;
        }

        try {
            setIsLoading( true );
            await fetchVariationForm( variation.id );
        } catch ( error ) {
            // eslint-disable-next-line no-console
            console.error( 'Error fetching variation data:', error );
        } finally {
            setIsLoading( false );
        }
    };

    return (
        <div className="border rounded bg-white shadow-sm overflow-hidden">
            <div
                role="button"
                className="flex justify-between items-center p-3 bg-gray-50 border-b cursor-pointer select-none"
                onClick={ handleToggle }
            >
                <div className="font-semibold text-gray-700 text-sm">
                    # { variation.id }
                </div>
                <div className="flex items-center gap-3">
                    <span
                        role="button"
                        onClick={ ( e ) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeVariation( variation );
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

            <div
                className={ `p-4 flex flex-col gap-4 bg-white border-t variation-form ${
                    ! isExpanded && 'hidden'
                }` }
            >
                { ! isLoading && hasFormData ? (
                    <VariationCardContent variation={ variation } />
                ) : (
                    <div className="p-4 text-center text-gray-400">
                        { __( 'Loading...', 'dokan-lite' ) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default VariationCard;
