import { useToast } from '@getdokan/dokan-ui';
import { createContext, useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Attribute, VariationType } from '../types';
import { ajaxRequest } from '../utils';

// Declare globals
declare let dokan: any;

interface PrepareVariationPayloadArgs {
    variation: VariationType;
    data: Record< string, any >;
    defaultAttributes?: Attribute[];
    menuOrder?: number;
}

const preparePayload = ( {
    variation,
    data,
    defaultAttributes = [],
    menuOrder = 0,
}: PrepareVariationPayloadArgs ) => {
    const formData = new FormData();
    formData.append( 'action', 'dokan_save_variations' );
    formData.append( 'product_type', 'variable' );
    formData.append( 'product_id', String( variation.parent_id ) );
    formData.append( 'security', dokan.save_variations_nonce );
    formData.append(
        `variation_menu_order[${ menuOrder }]`,
        menuOrder.toString()
    );
    formData.append( `variable_enabled[${ menuOrder }]`, 'yes' );

    // Variation ID
    formData.append(
        `variable_post_id[${ menuOrder }]`,
        String( variation.id )
    );

    // Standard Text/Select Fields
    const fieldMap: Record< string, string > = {
        id: 'variable_post_id',
        date_on_sale_from: 'variable_sale_price_dates_from',
        date_on_sale_to: 'variable_sale_price_dates_to',
        image_id: 'upload_image_id',
        downloadable: 'variable_is_downloadable',
        virtual: 'variable_is_virtual',
        stock_quantity: 'variable_stock',
    };

    // Attributes
    const attributes = variation.attributes;

    if ( attributes.length ) {
        attributes.forEach( ( attr ) => {
            formData.append(
                `attribute_${ attr.value }[${ menuOrder }]`,
                attr.selected_value?.value || ''
            );
        } );
    }
    // default attributes from parent product
    if ( defaultAttributes?.length ) {
        defaultAttributes.forEach( ( attr ) => {
            formData.append(
                `default_attribute_${ attr.value }`,
                '' // Default attribute value can be set here if needed
            );
        } );
    }

    Object.keys( data ).forEach( ( key ) => {
        if ( key === 'attributes' ) {
            return;
        }
        // prefix field names if not in map
        const prefix = key.startsWith( '_' ) ? 'variable' : 'variable_';

        if ( fieldMap[ key ] ) {
            formData.append(
                `${ fieldMap[ key ] }[${ menuOrder }]`,
                data[ key ]
            );
        } else {
            formData.append(
                `${ prefix }${ key }[${ menuOrder }]`,
                data[ key ]
            );
        }
    } );

    return formData;
};

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
}

export const VariationContext = createContext< VariationContextType >( {
    variations: [],
    saveVariation: () => Promise.resolve(),
    generateVariations: () => {},
    addVariation: () => {},
    updateVariation: () => {},
    removeVariation: () => {},
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
    variations?: VariationType[];
    defaultAttributes: Attribute[];
    onUpdateVariations: ( variations: VariationType[] ) => void;
}

export const VariationProvider = ( {
    children,
    productId,
    variations = [],
    defaultAttributes,
    onUpdateVariations,
}: VariationProviderProps ) => {
    const toast = useToast();

    const updateVariation = ( updatedVariation: VariationType ) => {
        if ( ! onUpdateVariations ) {
            return;
        }

        const index = variations.findIndex(
            ( v ) => v.id === updatedVariation.id
        );

        if ( index !== -1 ) {
            const newVariations = [ ...variations ];
            newVariations[ index ] = updatedVariation;
            onUpdateVariations( newVariations );
        }
    };

    const saveVariation = async (
        variation: VariationType,
        data: Record< string, any >
    ) => {
        const formData = preparePayload( {
            data,
            variation,
            defaultAttributes,
            menuOrder: variation.menu_order,
        } );

        try {
            const response: any = await ajaxRequest( formData );
            if ( response.success ) {
                toast( {
                    type: 'success',
                    title: __( 'Variation saved successfully', 'dokan-lite' ),
                } );
            } else {
                toast( {
                    type: 'error',
                    title: __( 'Error saving variation', 'dokan-lite' ),
                } );
            }
        } catch ( error ) {
            console.error( 'Error saving variation:', error );
            toast( {
                type: 'error',
                title: __( 'Error saving variation', 'dokan-lite' ),
            } );
        }
    };

    const fetchVariations = async () => {
        try {
            const response: any = await ajaxRequest( {
                action: 'dokan_get_product_variations',
                product_id: productId,
            } );
            onUpdateVariations( response.data || [] );
        } catch ( error ) {
            console.error( 'Error fetching variations:', error );
            toast( {
                type: 'error',
                title: __( 'Error fetching variations', 'dokan-lite' ),
            } );
        }
    };

    const generateVariations = async () => {
        // specific logic to generate variations
        if (
            confirm(
                __(
                    'Are you sure you want to generate variations? This will overwrite existing variations.',
                    'dokan-lite'
                )
            )
        ) {
            const response: any = await ajaxRequest( {
                action: 'dokan_link_all_variations',
                post_id: productId,
                security: dokan.link_variation_nonce,
            } );
            await fetchVariations();
            toast( {
                type: 'success',
                title: response.data.message,
            } );
        }
    };

    const addVariation = async () => {
        try {
            const response: any = await ajaxRequest( {
                action: 'dokan_add_variation',
                post_id: productId,
                security: dokan.add_variation_nonce,
                loop: 0,
            } );
            await fetchVariations();
            toast( {
                type: 'success',
                title: response.data.message,
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
            const response: any = await ajaxRequest( {
                action: 'dokan_remove_variation',
                'variation_ids[]': variation.id,
                security: dokan.delete_variations_nonce,
            } );
            await fetchVariations();
            toast( {
                type: 'success',
                title: response.data.message,
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
    };

    return (
        <VariationContext.Provider value={ value }>
            { children }
        </VariationContext.Provider>
    );
};
