import { useToast } from '@getdokan/dokan-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// @ts-ignore
import productVariationsStore from '@dokan/stores/product-variations';
import { VariationType } from '../types';

/**
 * Hook that provides variation state and actions from the Redux store.
 * Drop-in replacement for the old useVariationContext().
 */
export function useVariations( productId: number ) {
    const toast = useToast();

    const { variations, isLoading } = useSelect(
        ( select ) => ( {
            variations: select( productVariationsStore ).getVariations(
                productId
            ),
            isLoading:
                select( productVariationsStore ).isLoading( productId ),
        } ),
        [ productId ]
    );

    const dispatch = useDispatch( productVariationsStore );

    const saveVariation = useCallback(
        async ( variation: VariationType, data: Record< string, any > ) => {
            try {
                await dispatch.saveVariation( variation, data );
                toast( {
                    type: 'success',
                    title: __(
                        'Variation saved successfully',
                        'dokan-lite'
                    ),
                } );
            } catch ( error ) {
                console.error( 'Error saving variation:', error );
                toast( {
                    type: 'error',
                    title: __(
                        'Error saving variation',
                        'dokan-lite'
                    ),
                } );
            }
        },
        [ dispatch, toast ]
    );

    const generateVariations = useCallback( async () => {
        if (
            ! confirm(
                __(
                    'Are you sure you want to generate variations? This will overwrite existing variations.',
                    'dokan-lite'
                )
            )
        ) {
            return;
        }
        try {
            await dispatch.generateVariations( productId );
            toast( {
                type: 'success',
                title: __(
                    'Variations generated successfully',
                    'dokan-lite'
                ),
            } );
        } catch ( error ) {
            console.error( 'Error generating variations:', error );
            toast( {
                type: 'error',
                title: __(
                    'Error generating variations',
                    'dokan-lite'
                ),
            } );
        }
    }, [ productId, dispatch, toast ] );

    const addVariation = useCallback( async () => {
        try {
            await dispatch.addVariation( productId );
            toast( {
                type: 'success',
                title: __(
                    'Variation added successfully',
                    'dokan-lite'
                ),
            } );
        } catch ( error ) {
            console.error( 'Error adding variation:', error );
        }
    }, [ productId, dispatch, toast ] );

    const updateVariation = useCallback(
        ( variation: VariationType ) => {
            dispatch.setVariation( productId, variation );
        },
        [ productId, dispatch ]
    );

    const removeVariation = useCallback(
        async ( variation: VariationType ) => {
            if (
                ! confirm(
                    __(
                        'Are you sure you want to remove this variation?',
                        'dokan-lite'
                    )
                )
            ) {
                return;
            }
            try {
                await dispatch.removeVariation( variation );
                toast( {
                    type: 'success',
                    title: __(
                        'Variation removed successfully',
                        'dokan-lite'
                    ),
                } );
            } catch ( error ) {
                console.error( 'Error removing variation:', error );
            }
        },
        [ dispatch, toast ]
    );

    return {
        variations: variations || [],
        saveVariation,
        generateVariations,
        addVariation,
        updateVariation,
        removeVariation,
        isLoading,
    };
}
