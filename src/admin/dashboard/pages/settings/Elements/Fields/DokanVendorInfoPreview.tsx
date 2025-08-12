import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanFieldLabel } from '../../../../../../components/fields';
import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

interface VendorPreviewImageProps {
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
}

const VendorPreviewImage: React.FC< VendorPreviewImageProps > = ( {
    showEmail,
    showPhone,
    showAddress,
} ) => {
    return (
        <div className="bg-[#efeaff] rounded p-2 w-[156px] h-[10rem] flex flex-col relative overflow-hidden">
            { /* Store Icon and Name - Centered at top */ }
            <div className="flex flex-col items-center mb-4 mt-1">
                <div className="w-8 h-8 bg-[#7047eb] rounded-full flex items-center justify-center mb-2 relative">
                    { /* Store icon */ }
                    <svg
                        className="w-[14px] h-[14px] text-white"
                        fill="currentColor"
                        viewBox="0 0 17 17"
                    >
                        <path d="M3.20596 8.81043C4.2742 8.81043 5.21502 8.28333 5.79584 7.47615C6.35553 8.28161 7.28421 8.81043 8.33754 8.81043C9.3881 8.81043 10.316 8.28438 10.8763 7.48246C11.4538 8.28572 12.3949 8.81043 13.4575 8.81043C15.4959 8.81043 17.0375 6.83435 16.5395 4.85635L15.5677 0.996631C15.4201 0.410174 14.8943 0.000656366 14.2893 0.000656366H2.33769C1.73278 0.000656366 1.20712 0.410174 1.05943 0.996631L0.0939478 4.83341C-0.181549 5.92756 0.180555 6.881 0.819972 7.74907V15.3162C0.819972 16.0426 1.40633 16.6337 2.13312 16.6337H14.4988C15.2255 16.6337 15.8121 16.0426 15.8121 15.3162V10.4087C15.8121 10.0904 15.5444 9.83231 15.2259 9.83231C14.9074 9.83231 14.6398 10.0903 14.6398 10.4087V15.3162C14.6398 15.4071 14.5896 15.4964 14.4988 15.4964H10.874V10.9947C10.874 10.6764 10.6153 10.4141 10.2968 10.4141H6.33536C6.01685 10.4141 5.75817 10.6764 5.75817 10.9947V15.4964H2.13312C2.04231 15.4964 1.99241 15.407 1.99241 15.3162V8.56839C2.34763 8.72659 2.77742 8.81043 3.20596 8.81043ZM11.4424 1.13792H14.2892C14.3649 1.13792 14.4306 1.1969 14.449 1.27022L15.4206 5.13367C15.7366 6.38879 14.7588 7.65567 13.4621 7.65567C12.3454 7.65567 11.4424 6.74898 11.4424 5.63208V1.13792ZM6.39769 1.13792H10.3055V5.63208C10.3055 6.71715 9.45702 7.65759 8.3494 7.65759C7.2237 7.65759 6.39769 6.70663 6.39769 5.61373V1.13792ZM6.93052 11.5869H9.70164V15.4964H6.93052V11.5869ZM1.21142 5.11464L2.17757 1.27022C2.19612 1.1969 2.26217 1.13801 2.33769 1.13801H5.22525V5.61373C5.22525 6.74028 4.3154 7.65682 3.18923 7.65759C1.87885 7.65682 0.891666 6.38516 1.21142 5.11464Z" />
                    </svg>
                </div>
                <span className="text-xs font-bold text-black opacity-85 leading-[1.3] text-center">
                    {
                        __(
                            'Store Name',
                            'dokan-lite'
                        ) /* Placeholder for store name */
                    }
                </span>
            </div>

            { /* Contact Information */ }
            <div className="space-y-[11px] mb-2 px-[18px] flex-1">
                { showEmail && (
                    <div className="flex items-center gap-[18px]">
                        <svg
                            className="w-4 h-4 text-[#828282] flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 15 13"
                            strokeWidth="1.15"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.3809 3.00713L8.37955 6.82068C8.173 6.95009 7.93418 7.01872 7.69043 7.01872C7.44669 7.01872 7.20787 6.95009 7.00132 6.82068L1 3.00713M2.33809 1H13.0428C13.7818 1 14.3809 1.59908 14.3809 2.33809V10.3666C14.3809 11.1056 13.7818 11.7047 13.0428 11.7047H2.33809C1.59908 11.7047 1 11.1056 1 10.3666V2.33809C1 1.59908 1.59908 1 2.33809 1Z"
                            />
                        </svg>
                        <div className="h-[3px] bg-[#bfacf9] rounded-full w-[67px]"></div>
                    </div>
                ) }
                { showPhone && (
                    <div className="flex items-center gap-[18px]">
                        <svg
                            className="w-4 h-4 text-[#828282] flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 15 15"
                            strokeWidth="1.15"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.306 10.9822V12.9893C14.3068 13.1757 14.2686 13.3601 14.194 13.5308C14.1193 13.7015 14.0098 13.8548 13.8725 13.9808C13.7352 14.1067 13.5731 14.2026 13.3966 14.2623C13.2201 14.322 13.0331 14.3442 12.8475 14.3274C10.7887 14.1037 8.81116 13.4002 7.07366 12.2734C5.45713 11.2462 4.0866 9.87571 3.05939 8.25919C1.9287 6.51379 1.22504 4.52659 1.00543 2.45858C0.988711 2.27357 1.0107 2.0871 1.06999 1.91105C1.12929 1.735 1.22459 1.57323 1.34983 1.43603C1.47507 1.29883 1.62751 1.18921 1.79744 1.11415C1.96737 1.03909 2.15106 1.00024 2.33683 1.00006H4.34396C4.66865 0.996869 4.98342 1.11185 5.22961 1.32357C5.4758 1.53529 5.6366 1.82931 5.68204 2.15082C5.76676 2.79315 5.92387 3.42383 6.15038 4.03083C6.24039 4.2703 6.25987 4.53055 6.20651 4.78075C6.15315 5.03095 6.02919 5.26061 5.84931 5.44251L4.99962 6.2922C5.95204 7.96718 7.3389 9.35404 9.01388 10.3065L9.86357 9.45678C10.0455 9.27689 10.2751 9.15293 10.5253 9.09957C10.7755 9.04621 11.0358 9.06569 11.2752 9.15571C11.8823 9.38221 12.5129 9.53932 13.1553 9.62404C13.4803 9.66989 13.7771 9.83358 13.9892 10.084C14.2014 10.3344 14.3142 10.6541 14.306 10.9822Z"
                            />
                        </svg>
                        <div className="h-[3px] bg-[#bfacf9] rounded-full w-[42px]"></div>
                    </div>
                ) }
                { showAddress && (
                    <div className="flex items-center gap-[18px]">
                        <svg
                            className="w-4 h-4 text-[#828282] flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 13 15"
                            strokeWidth="1.15"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.7047 6.35235C11.7047 9.69288 7.99886 13.1719 6.75444 14.2464C6.63851 14.3336 6.4974 14.3807 6.35235 14.3807C6.2073 14.3807 6.06618 14.3336 5.95025 14.2464C4.70583 13.1719 1 9.69288 1 6.35235C1 4.93282 1.56391 3.57143 2.56767 2.56767C3.57143 1.56391 4.93282 1 6.35235 1C7.77188 1 9.13327 1.56391 10.137 2.56767C11.1408 3.57143 11.7047 4.93282 11.7047 6.35235Z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.35235 8.35948C7.46086 8.35948 8.35948 7.46086 8.35948 6.35235C8.35948 5.24384 7.46086 4.34522 6.35235 4.34522C5.24384 4.34522 4.34522 5.24384 4.34522 6.35235C4.34522 7.46086 5.24384 8.35948 6.35235 8.35948Z"
                            />
                        </svg>
                        <div className="h-[3px] bg-[#bfacf9] rounded-full w-[56px]"></div>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default function DokanVendorInfoPreview( { element } ) {
    const [ checkboxValues, setCheckboxValues ] = useState(
        element?.value ||
            element?.default || {
                store_email: true,
                store_phone: true,
                store_address: true,
            }
    );

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const handleCheckboxChange = ( selectedValues ) => {
        // Convert array of selected values to object format
        const newValues = {
            store_email: selectedValues.includes( 'store_email' ),
            store_phone: selectedValues.includes( 'store_phone' ),
            store_address: selectedValues.includes( 'store_address' ),
        };
        setCheckboxValues( newValues );
        onValueChange( { ...element, value: newValues } );
    };

    const checkboxOptions = [
        {
            value: 'store_email',
            label: __( 'Email Address', 'dokan-lite' ),
        },
        {
            value: 'store_phone',
            label: __( 'Phone Number', 'dokan-lite' ),
        },
        {
            value: 'store_address',
            label: __( 'Store Address', 'dokan-lite' ),
        },
    ];

    // Convert current values to array format for SimpleCheckboxGroup
    const selectedValues = Object.keys( checkboxValues ).filter(
        ( key ) => checkboxValues[ key ]
    );

    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="bg-white  p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1 max-w-lg">
                    { /* Field Header */ }
                    <div className="flex items-center space-x-3 mb-1">
                        <DokanFieldLabel
                            title={ element.title }
                            titleFontWeight="bold"
                            helperText={ element.description }
                            tooltip={ element?.help_text }
                        />
                    </div>

                    { /* Checkboxes using SimpleCheckboxGroup */ }
                    <div className="mt-4">
                        <SimpleCheckboxGroup
                            options={ checkboxOptions }
                            value={ selectedValues }
                            onChange={ handleCheckboxChange }
                            defaultValue={ selectedValues }
                        />
                    </div>
                </div>

                { /* Preview Image */ }
                <div className="ml-8">
                    <VendorPreviewImage
                        showEmail={ checkboxValues.store_email || false }
                        showPhone={ checkboxValues.store_phone || false }
                        showAddress={ checkboxValues.store_address || false }
                    />
                </div>
            </div>
        </div>
    );
}
