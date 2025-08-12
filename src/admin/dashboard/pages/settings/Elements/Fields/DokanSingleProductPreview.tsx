import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import { dispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

interface ProductPreviewImageProps {
    showVendorInfo: boolean;
    showMoreProductsTab: boolean;
    showShippingTab: boolean;
}

const ProductPreviewImage = ( {
    showVendorInfo,
    showMoreProductsTab,
    showShippingTab,
}: ProductPreviewImageProps ) => {
    return (
        <div className="bg-[#efeaff] rounded-[5.229px] p-3 w-[155.814px] min-h-[163.134px] flex flex-col relative overflow-hidden">
            { /* Main content container */ }
            <div className="flex flex-col gap-4  justify-center h-full w-[125px] ">
                { /* Product Image and Details Section */ }
                <div className="flex gap-2 items-center">
                    <div className="w-[43px] h-[43px] bg-[#ab92f6] rounded p-2 flex items-center justify-center  border border-[#e9e9e9]">
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

                    { /* Product title and price lines */ }
                    <div className="space-y-1.5 w-full">
                        <div className="h-[2.8px] bg-[#bfacf9] rounded-full w-[71.715px] "></div>
                        <div className="h-[2.8px] bg-[#bfacf9] rounded-full w-[51.225px] "></div>
                        <div className="h-[11.19px] bg-[#bfacf9] rounded-full w-[20.805px] "></div>
                    </div>
                </div>

                { /* Vendor Info Section */ }
                { showVendorInfo && (
                    <div className="flex justify-end">
                        <div className="bg-[#efeaff] border border-[#bfacf9] rounded-[3.673px] p-1.5 flex items-center gap-2 w-[72px] h-[21px]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="11"
                                height="10"
                                viewBox="0 0 11 10"
                                fill="none"
                            >
                                <path
                                    d="M10.9556 3.54042L10.3082 0.861271C10.2726 0.711909 10.1424 0.607422 9.99416 0.607422H1.57718C1.42891 0.607422 1.29877 0.711909 1.26316 0.861271L0.615699 3.54042C0.609225 3.56654 0.605988 3.594 0.605988 3.62146C0.605988 4.18274 0.863029 4.67771 1.25345 4.9818V9.64954C1.25345 9.8344 1.39848 9.98443 1.57718 9.98443H4.81448C4.99318 9.98443 5.13821 9.8344 5.13821 9.64954V7.30529H6.43313V9.64954C6.43313 9.8344 6.57816 9.98443 6.75686 9.98443H9.99416C10.1729 9.98443 10.3179 9.8344 10.3179 9.64954V4.9818C10.7083 4.67771 10.9654 4.18274 10.9654 3.62146C10.9654 3.594 10.9621 3.56654 10.9556 3.54042ZM9.67043 9.31465H7.08059V6.97039C7.08059 6.78553 6.93556 6.6355 6.75686 6.6355H4.81448C4.63578 6.6355 4.49075 6.78553 4.49075 6.97039V9.31465H1.90091V5.26914C1.98055 5.2832 2.06083 5.29593 2.14371 5.29593C2.63707 5.29593 3.07605 5.04208 3.35769 4.64824C3.63934 5.04208 4.07832 5.29593 4.57168 5.29593C5.06505 5.29593 5.50402 5.04208 5.78567 4.64824C6.06731 5.04208 6.50629 5.29593 6.99966 5.29593C7.49302 5.29593 7.932 5.04208 8.21364 4.64824C8.49529 5.04208 8.93427 5.29593 9.42763 5.29593C9.51051 5.29593 9.59079 5.2832 9.67043 5.26914V9.31465ZM9.42763 4.62614C8.93686 4.62614 8.53738 4.17537 8.53738 3.62146C8.53738 3.4366 8.39234 3.28657 8.21364 3.28657C8.03495 3.28657 7.88991 3.4366 7.88991 3.62146C7.88991 4.17537 7.49043 4.62614 6.99966 4.62614C6.50888 4.62614 6.1094 4.17537 6.1094 3.62146C6.1094 3.4366 5.96437 3.28657 5.78567 3.28657C5.60697 3.28657 5.46194 3.4366 5.46194 3.62146C5.46194 4.17537 5.06246 4.62614 4.57168 4.62614C4.08091 4.62614 3.68142 4.17537 3.68142 3.62146C3.68142 3.4366 3.53639 3.28657 3.35769 3.28657C3.17899 3.28657 3.03396 3.4366 3.03396 3.62146C3.03396 4.17537 2.63448 4.62614 2.14371 4.62614C1.66458 4.62614 1.27222 4.19614 1.2541 3.66031L1.83033 1.27721H9.74165L10.3179 3.66031C10.2991 4.19614 9.90675 4.62614 9.42763 4.62614Z"
                                    fill="#AB92F6"
                                />
                            </svg>
                            <div className="h-[1.47px] bg-[#bfacf9] rounded-full w-[38px]"></div>
                        </div>
                    </div>
                ) }

                { /* Tabs Section */ }
                <div className="flex flex-col items-center">
                    <div className="flex gap-1.5 mb-3">
                        { /* Default visible tabs */ }
                        <div className="bg-[#e1d7ff] w-5 h-4 rounded-full opacity-1"></div>
                        <div className="bg-[#e1d7ff] w-5 h-4 rounded-full opacity-1"></div>
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
                    <div className="space-y-1.5">
                        <div className="h-[2.47px] bg-[#bfacf9] rounded-full w-[124px]"></div>
                        <div className="h-[3px] bg-[#bfacf9] rounded-full w-[90px]"></div>
                    </div>
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

    if ( ! element.display ) {
        return null;
    }

    // Convert current values to array format for SimpleCheckboxGroup
    const selectedValues = Object.keys( checkboxValues ).filter(
        ( key ) => checkboxValues[ key ]
    );

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
                        />
                    </div>

                    { /* Checkboxes using SimpleCheckboxGroup */ }
                    <div className="mt-4">
                        <SimpleCheckboxGroup
                            options={ checkboxOptions }
                            defaultValue={ selectedValues }
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
