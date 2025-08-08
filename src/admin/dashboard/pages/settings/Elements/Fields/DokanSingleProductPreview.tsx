import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanFieldLabel } from '../../../../../../components/fields';
import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

interface ProductPreviewImageProps {
    showVendorInfo: boolean;
    showMoreProductsTab: boolean;
    showShippingTab: boolean;
}

const ProductPreviewImage: React.FC< ProductPreviewImageProps > = ( {
    showVendorInfo,
    showMoreProductsTab,
    showShippingTab,
} ) => {
    return (
        <div className="bg-[#efeaff] rounded-[5px] p-3 w-[156px] h-[162px] flex flex-col relative overflow-hidden">
            { /* Product Image and Details */ }
            <div className="flex flex-col items-center mb-4">
                <div className="w-[43px] h-[43px] bg-[#ab92f6] rounded-[4px] flex items-center justify-center mb-2 border border-[#e9e9e9]">
                    <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 25 25"
                        strokeWidth="2.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M22.9625 15.975L19.3686 12.3811C18.9318 11.9444 18.3395 11.6991 17.7219 11.6991C17.1043 11.6991 16.5119 11.9444 16.0752 12.3811L5.49375 22.9625M4.32917 2H20.6333C21.9197 2 22.9625 3.0428 22.9625 4.32917V20.6333C22.9625 21.9197 21.9197 22.9625 20.6333 22.9625H4.32917C3.0428 22.9625 2 21.9197 2 20.6333V4.32917C2 3.0428 3.0428 2 4.32917 2ZM11.3167 8.9875C11.3167 10.2739 10.2739 11.3167 8.9875 11.3167C7.70114 11.3167 6.65833 10.2739 6.65833 8.9875C6.65833 7.70114 7.70114 6.65833 8.9875 6.65833C10.2739 6.65833 11.3167 7.70114 11.3167 8.9875Z"
                        />
                    </svg>
                </div>
                { /* Product placeholder lines */ }
                <div className="space-y-1 w-full">
                    <div className="h-[3px] bg-[#bfacf9] rounded-full w-[72px] mx-auto"></div>
                    <div className="h-[3px] bg-[#bfacf9] rounded-full w-[51px] mx-auto"></div>
                    <div className="h-[11px] bg-[#bfacf9] rounded-full w-[21px] mx-auto"></div>
                </div>
            </div>

            { /* Vendor Info Section */ }
            { showVendorInfo && (
                <div className="mb-3">
                    <div className="bg-[#efeaff] border border-[#bfacf9] rounded-[4px] p-1 flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#ab92f6] rounded flex items-center justify-center">
                            <svg
                                className="w-2 h-2 text-white"
                                fill="currentColor"
                                viewBox="0 0 11 10"
                            >
                                <path d="M10.3505 2.93314L9.70302 0.253989C9.66741 0.104627 9.53727 0.000140178 9.389 0.000140178H0.972019C0.82375 0.000140178 0.693611 0.104627 0.658 0.253989L0.0105401 2.93314C0.00406549 2.95926 0.000828184 2.98672 0.000828184 3.01418C0.000828184 3.57546 0.25787 4.07043 0.648288 4.37452V9.04226C0.648288 9.22712 0.79332 9.37715 0.972019 9.37715H4.20932C4.38802 9.37715 4.53305 9.22712 4.53305 9.04226V6.69801H5.82797V9.04226C5.82797 9.22712 5.973 9.37715 6.1517 9.37715H9.389C9.5677 9.37715 9.71273 9.22712 9.71273 9.04226V4.37452C10.1032 4.07043 10.3602 3.57546 10.3602 3.01418C10.3602 2.98672 10.357 2.95926 10.3505 2.93314Z" />
                            </svg>
                        </div>
                        <div className="h-[2px] bg-[#bfacf9] rounded-full w-[38px]"></div>
                    </div>
                </div>
            ) }

            { /* Tabs Section */ }
            <div className="flex-1 flex flex-col justify-end">
                <div className="flex gap-1.5 mb-2">
                    { /* Default visible tabs */ }
                    <div className="bg-[#e1d7ff] rounded-full px-1.5 py-0.5 opacity-0">
                        <svg
                            className="w-3.5 h-3.5 text-[#7047eb]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 14 11"
                            strokeWidth="1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 9.16667V2.16667C8 1.85725 7.87708 1.5605 7.65829 1.34171C7.4395 1.12292 7.14275 1 6.83333 1H2.16667C1.85725 1 1.5605 1.12292 1.34171 1.34171C1.12292 1.5605 1 1.85725 1 2.16667V8.58333C1 8.73804 1.06146 8.88642 1.17085 8.99581C1.28025 9.10521 1.42862 9.16667 1.58333 9.16667H2.75M2.75 9.16667C2.75 9.811 3.27233 10.3333 3.91667 10.3333C4.561 10.3333 5.08333 9.811 5.08333 9.16667M2.75 9.16667C2.75 8.52233 3.27233 8 3.91667 8C4.561 8 5.08333 8.52233 5.08333 9.16667M8.58333 9.16667H5.08333M8.58333 9.16667C8.58333 9.811 9.10567 10.3333 9.75 10.3333C10.3943 10.3333 10.9167 9.811 10.9167 9.16667M8.58333 9.16667C8.58333 8.52233 9.10567 8 9.75 8C10.3943 8 10.9167 8.52233 10.9167 9.16667M10.9167 9.16667H12.0833C12.238 9.16667 12.3864 9.10521 12.4958 8.99581C12.6052 8.88642 12.6667 8.73804 12.6667 8.58333V6.45417C12.6664 6.32179 12.6212 6.19342 12.5383 6.09017L10.5083 3.55267C10.4538 3.48435 10.3846 3.42916 10.3058 3.3912C10.227 3.35323 10.1408 3.33346 10.0533 3.33333H8"
                            />
                        </svg>
                    </div>
                    <div className="bg-[#e1d7ff] rounded-full px-1.5 py-0.5 opacity-0">
                        <svg
                            className="w-3.5 h-3.5 text-[#7047eb]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 14 11"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 9.16667V2.16667C8 1.85725 7.87708 1.5605 7.65829 1.34171C7.4395 1.12292 7.14275 1 6.83333 1H2.16667C1.85725 1 1.5605 1.12292 1.34171 1.34171C1.12292 1.5605 1 1.85725 1 2.16667V8.58333C1 8.73804 1.06146 8.88642 1.17085 8.99581C1.28025 9.10521 1.42862 9.16667 1.58333 9.16667H2.75M2.75 9.16667C2.75 9.811 3.27233 10.3333 3.91667 10.3333C4.561 10.3333 5.08333 9.811 5.08333 9.16667M2.75 9.16667C2.75 8.52233 3.27233 8 3.91667 8C4.561 8 5.08333 8.52233 5.08333 9.16667M8.58333 9.16667H5.08333M8.58333 9.16667C8.58333 9.811 9.10567 10.3333 9.75 10.3333C10.3943 10.3333 10.9167 9.811 10.9167 9.16667M8.58333 9.16667C8.58333 8.52233 9.10567 8 9.75 8C10.3943 8 10.9167 8.52233 10.9167 9.16667M10.9167 9.16667H12.0833C12.238 9.16667 12.3864 9.10521 12.4958 8.99581C12.6052 8.88642 12.6667 8.73804 12.6667 8.58333V6.45417C12.6664 6.32179 12.6212 6.19342 12.5383 6.09017L10.5083 3.55267C10.4538 3.48435 10.3846 3.42916 10.3058 3.3912C10.227 3.35323 10.1408 3.33346 10.0533 3.33333H8"
                            />
                        </svg>
                    </div>
                    { showShippingTab && (
                        <div className="bg-[#e1d7ff] rounded-full px-1.5 py-0.5">
                            <svg
                                className="w-3.5 h-3.5 text-[#7047eb]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 14 11"
                                strokeWidth="1"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 9.16667V2.16667C8 1.85725 7.87708 1.5605 7.65829 1.34171C7.4395 1.12292 7.14275 1 6.83333 1H2.16667C1.85725 1 1.5605 1.12292 1.34171 1.34171C1.12292 1.5605 1 1.85725 1 2.16667V8.58333C1 8.73804 1.06146 8.88642 1.17085 8.99581C1.28025 9.10521 1.42862 9.16667 1.58333 9.16667H2.75M2.75 9.16667C2.75 9.811 3.27233 10.3333 3.91667 10.3333C4.561 10.3333 5.08333 9.811 5.08333 9.16667M2.75 9.16667C2.75 8.52233 3.27233 8 3.91667 8C4.561 8 5.08333 8.52233 5.08333 9.16667M8.58333 9.16667H5.08333M8.58333 9.16667C8.58333 9.811 9.10567 10.3333 9.75 10.3333C10.3943 10.3333 10.9167 9.811 10.9167 9.16667M8.58333 9.16667C8.58333 8.52233 9.10567 8 9.75 8C10.3943 8 10.9167 8.52233 10.9167 9.16667M10.9167 9.16667H12.0833C12.238 9.16667 12.3864 9.10521 12.4958 8.99581C12.6052 8.88642 12.6667 8.73804 12.6667 8.58333V6.45417C12.6664 6.32179 12.6212 6.19342 12.5383 6.09017L10.5083 3.55267C10.4538 3.48435 10.3846 3.42916 10.3058 3.3912C10.227 3.35323 10.1408 3.33346 10.0533 3.33333H8"
                                />
                            </svg>
                        </div>
                    ) }
                    { showMoreProductsTab && (
                        <div className="bg-[#e1d7ff] rounded-full px-1.5 py-0.5">
                            <svg
                                className="w-3.5 h-3.5 text-[#7047eb]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 12 14"
                                strokeWidth="1"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M1.175 3.91547L6.25 6.83214M6.25 6.83214L11.325 3.91547M6.25 6.83214V12.6655M11.5 4.4988C11.4998 4.29421 11.4458 4.09328 11.3434 3.91615C11.241 3.73902 11.0938 3.59193 10.9167 3.48964L6.83333 1.1563C6.65598 1.05391 6.45479 1 6.25 1C6.04521 1 5.84402 1.05391 5.66667 1.1563L1.58333 3.48964C1.40615 3.59193 1.25899 3.73902 1.1566 3.91615C1.05422 4.09328 1.00021 4.29421 1 4.4988V9.16547C1.00021 9.37006 1.05422 9.571 1.1566 9.74813C1.25899 9.92525 1.40615 10.0723 1.58333 10.1746L5.66667 12.508C5.84402 12.6104 6.04521 12.6643 6.25 12.6643C6.45479 12.6643 6.65598 12.6104 6.83333 12.508L10.9167 10.1746C11.0938 10.0723 11.241 9.92525 11.3434 9.74813C11.4458 9.571 11.4998 9.37006 11.5 9.16547V4.4988Z"
                                />
                            </svg>
                        </div>
                    ) }
                </div>
                { /* Tab content placeholder lines */ }
                <div className="space-y-1">
                    <div className="h-[2px] bg-[#bfacf9] rounded-full w-[124px]"></div>
                    <div className="h-[2px] bg-[#bfacf9] rounded-full w-[90px]"></div>
                </div>
            </div>
        </div>
    );
};

export default function DokanSingleProductPreview( { element } ) {
    const [ checkboxValues, setCheckboxValues ] = useState(
        element?.value ||
            element?.default || {
                vendor_info: true,
                more_products_tab: true,
                shipping_tab: true,
            }
    );

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const handleCheckboxChange = ( selectedValues ) => {
        // Convert array of selected values to object format
        const newValues = {
            vendor_info: selectedValues.includes( 'vendor_info' ),
            more_products_tab: selectedValues.includes( 'more_products_tab' ),
            shipping_tab: selectedValues.includes( 'shipping_tab' ),
        };
        setCheckboxValues( newValues );
        onValueChange( { ...element, value: newValues } );
    };

    const checkboxOptions = [
        {
            value: 'vendor_info',
            label: __( 'Vendor Info', 'dokan-lite' ),
        },
        {
            value: 'more_products_tab',
            label: __( 'More products tab', 'dokan-lite' ),
        },
        {
            value: 'shipping_tab',
            label: __( 'Shipping tab', 'dokan-lite' ),
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
        <div className="bg-white rounded-md border border-gray-200 p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1 max-w-lg">
                    { /* Field Header */ }
                    <div className="flex items-center space-x-3 mb-1">
                        <DokanFieldLabel
                            title={ element.title }
                            titleFontWeight="bold"
                            helperText={ element.description }
                        />
                        <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    { /* Checkboxes using SimpleCheckboxGroup */ }
                    <div className="mt-4">
                        <SimpleCheckboxGroup
                            options={ checkboxOptions }
                            value={ selectedValues }
                            onChange={ handleCheckboxChange }
                        />
                    </div>
                </div>

                { /* Preview Image */ }
                <div className="ml-8">
                    <ProductPreviewImage
                        showVendorInfo={ checkboxValues.vendor_info || false }
                        showMoreProductsTab={
                            checkboxValues.more_products_tab || false
                        }
                        showShippingTab={ checkboxValues.shipping_tab || false }
                    />
                </div>
            </div>
        </div>
    );
}
