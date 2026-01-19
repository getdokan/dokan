import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { FormProvider } from '../../context/FormContext';
import { useVariationContext } from '../../context/VariationContext';
import { Section, VariationType } from '../../types';
import VariationInternalForm from './VariationInternalForm';

type VariationCardProps = {
    variation: VariationType;
};

const VariationCard = ( { variation }: VariationCardProps ) => {
    const { saveVariation } = useVariationContext();
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
        await saveVariation( variation, data );
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
