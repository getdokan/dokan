import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Attribute, VariationType } from '../types';

export interface VariationContextType {
    variations: VariationType[];
    saveVariation: (
        variation: VariationType,
        data: Record< string, any >
    ) => Promise< void >;
    generateVariations: () => void;
    addVariation: () => void;
    updateVariation: ( variation: VariationType ) => void;
    removeVariation: ( variation: VariationType ) => void;
    isLoading: boolean;
}

export const VariationContext = createContext< VariationContextType >( {
    variations: [],
    saveVariation: () => Promise.resolve(),
    generateVariations: () => {},
    addVariation: () => {},
    updateVariation: () => {},
    removeVariation: () => {},
    isLoading: false,
} );

export const useVariationContext = () => {
    const context = useContext( VariationContext );
    if ( ! context ) {
        throw new Error(
            'useVariationContext must be used within a VariationProvider'
        );
    }
    return context;
};

interface VariationProviderProps {
    children: React.ReactNode;
    productId: number;
    defaultAttributes: Attribute[];
}

export const VariationProvider = ( {
    children,
    productId,
    defaultAttributes,
}: VariationProviderProps ) => {
    const toast = useToast();
    const [ isLoading, setIsLoading ] = useState( false );
    const [ variations, setVariations ] = useState< VariationType[] >( [] );

    const updateVariation = ( updatedVariation: VariationType ) => {
        const index = variations.findIndex(
            ( v ) => v.id === updatedVariation.id
        );

        if ( index !== -1 ) {
            const newVariations = [ ...variations ];
            newVariations[ index ] = updatedVariation;
            setVariations( newVariations );
        }
    };

    const saveVariation = async (
        variation: VariationType,
        data: Record< string, any >
    ) => {
        setIsLoading( true );

        try {
            const payload: Record< string, any > = { ...data };

            // Map variation attributes to WC REST format.
            if ( variation.attributes?.length ) {
                payload.attributes = variation.attributes
                    .filter( ( attr ) => attr.selected_value )
                    .map( ( attr ) => ( {
                        name: attr.value,
                        option: attr.selected_value?.value || '',
                    } ) );
            }

            await apiFetch( {
                path: `/dokan/v2/products/${ variation.parent_id }/variations/${ variation.id }`,
                method: 'PUT',
                data: payload,
            } );

            toast( {
                type: 'success',
                title: __( 'Variation saved successfully', 'dokan-lite' ),
            } );
        } catch ( error ) {
            console.error( 'Error saving variation:', error );
            toast( {
                type: 'error',
                title: __( 'Error saving variation', 'dokan-lite' ),
            } );
        } finally {
            setIsLoading( false );
        }
    };

    const fetchVariations = async () => {
        try {
            const response: any = await apiFetch( {
                path: `/dokan/v2/products/${ productId }/variations`,
            } );
            setVariations( response || [] );
        } catch ( error ) {
            console.error( 'Error fetching variations:', error );
            toast( {
                type: 'error',
                title: __( 'Error fetching variations', 'dokan-lite' ),
            } );
        }
    };

    useEffect( () => {
        fetchVariations();
    }, [ productId ] );

    const generateVariations = async () => {
        if (
            confirm(
                __(
                    'Are you sure you want to generate variations? This will overwrite existing variations.',
                    'dokan-lite'
                )
            )
        ) {
            try {
                await apiFetch( {
                    path: `/dokan/v2/products/${ productId }/variations/generate`,
                    method: 'POST',
                    data: { delete: true },
                } );
                await fetchVariations();
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
        }
    };

    const addVariation = async () => {
        try {
            await apiFetch( {
                path: `/dokan/v2/products/${ productId }/variations`,
                method: 'POST',
                data: {
                    regular_price: '',
                },
            } );
            await fetchVariations();
            toast( {
                type: 'success',
                title: __( 'Variation added successfully', 'dokan-lite' ),
            } );
        } catch ( error ) {
            console.error( 'Error adding variation:', error );
        }
    };

    const removeVariation = async ( variation: VariationType ) => {
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
            await apiFetch( {
                path: `/dokan/v2/products/${ variation.parent_id }/variations/${ variation.id }`,
                method: 'DELETE',
                data: { force: true },
            } );
            await fetchVariations();
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
    };

    const value = {
        variations,
        saveVariation,
        generateVariations,
        addVariation,
        updateVariation,
        removeVariation,
        isLoading,
    };

    return (
        <VariationContext.Provider value={ value }>
            { children }
        </VariationContext.Provider>
    );
};
