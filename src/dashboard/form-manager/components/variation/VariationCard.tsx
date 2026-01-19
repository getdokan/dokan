import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { FormProvider } from '../../context/FormContext';
import { Section } from '../../types';
import { Attribute } from './AttributeCard';
import VariationInternalForm from './VariationInternalForm';

declare let dokan: any;
declare let jQuery: any;

export type VariationType = {
    id: number;
    parent_id: number;
    menu_order: number;
    attributes: {
        label: string;
        value: string;
        selected_value: {
            label: string;
            value: string;
        };
        options: any;
    }[];
};

interface PrepareVariationPayloadArgs {
    variation: VariationType;
    data: Record< string, any >;
    defaultAttributes?: Attribute[];
    menuOrder?: number;
}

type VariationCardProps = {
    variation: VariationType;
    defaultAttributes?: Attribute[];
};

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

const VariationCard = ( {
    variation,
    defaultAttributes,
}: VariationCardProps ) => {
    const toast = useToast();
    const [ isExpanded, setIsExpanded ] = useState( false );
    const [ sections, setSections ] = useState< Section[] >( [] );
    const [ vendorEarning, setVendorEarning ] = useState< number >( 0 );

    const fetchedVariationData = async () => {
        setIsExpanded( ! isExpanded );

        if ( sections.length > 0 ) {
            return;
        }

        try {
            const response = await apiFetch< {
                sections: Section[];
                vendor_earning: number;
            } >( {
                path: `/dokan/v1/products/${ variation.id }/fields`,
            } );
            setSections( response.sections );
            setVendorEarning( response.vendor_earning );
        } catch ( error ) {
            console.error( 'Error fetching variation data:', error );
        }
    };

    const handleVariationSave = async ( data: Record< string, any > ) => {
        const formData = preparePayload( {
            data,
            variation,
            defaultAttributes,
            menuOrder: variation.menu_order,
        } );

        try {
            const response = await jQuery.ajax( {
                url: dokan.ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
            } );
            console.log( 'Variation saved successfully:', response );
            toast( {
                type: 'success',
                title: response.data.message,
            } );
        } catch ( error ) {
            console.error( 'Error saving variation:', error );
        }
    };

    return (
        <div className="border rounded bg-white shadow-sm overflow-hidden">
            <div
                role="button"
                className="flex justify-between items-center p-3 bg-gray-50 border-b cursor-pointer select-none"
                onClick={ fetchedVariationData }
            >
                <div className="font-semibold text-gray-700 text-sm">
                    # { variation.id }
                </div>
                <div className="flex items-center gap-3">
                    <span
                        role="button"
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
                { sections.length > 0 ? (
                    <FormProvider
                        sections={ sections }
                        productId={ variation.id }
                        vendorEarning={ vendorEarning }
                        onSubmit={ handleVariationSave }
                    >
                        <VariationInternalForm variation={ variation } />
                    </FormProvider>
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
