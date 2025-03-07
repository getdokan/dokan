import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SimpleInput } from '@getdokan/dokan-ui';
import Logo from '../Logo';
import WarningIcon from '../icons/WarningIcon';
import NextButton from '@dokan/admin/onboard/components/NextButton';
import { applyFilters } from '@wordpress/hooks';

interface BasicInfoScreenProps {
    onNext: () => void;
    storeUrl: string;
    shareDiagnostics: boolean;
    onUpdate: ( storeUrl: string, shareDiagnostics: boolean ) => void;
}

const BasicInfoScreen = ( {
    onNext,
    storeUrl,
    shareDiagnostics,
    onUpdate,
}: BasicInfoScreenProps ) => {
    const [ localStoreUrl, setLocalStoreUrl ] = useState( storeUrl || 'store' );
    const [ localShareDiagnostics, setLocalShareDiagnostics ] = useState(
        shareDiagnostics !== undefined ? shareDiagnostics : true
    );
    const [ error, setError ] = useState( '' );

    const onHandleInputChange = (
        e: React.ChangeEvent< HTMLInputElement >
    ) => {
        const value = e.target.value;
        if ( ! value || value.length === 0 ) {
            setError( __( 'Please enter a valid store URL.', 'dokan' ) );
        } else {
            setError( '' );
        }
        setLocalStoreUrl( value );
    };

    // Update the parent component when values change
    useEffect( () => {
        onUpdate( localStoreUrl, localShareDiagnostics );
    }, [ localStoreUrl, localShareDiagnostics, onUpdate ] );

    const handleNext = () => {
        // Validate store URL
        if ( ! localStoreUrl || localStoreUrl.length === 0 ) {
            setError( __( 'Please enter a valid store URL.', 'dokan' ) );
            return;
        }
        // Ensure values are updated before proceeding
        onUpdate( localStoreUrl, localShareDiagnostics );
        onNext();
    };
    const siteUrl = window?.onboardingData?.site_url;
    // filter hook for max url length

    const maxUrlLength = applyFilters( 'dokan_onboarding_max_url_length', 40 );
    const siteUrlWidth =
        siteUrl?.length > maxUrlLength
            ? siteUrl.slice( 0, maxUrlLength ) + '...'
            : siteUrl;
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 md:p-10  ">
                <div className="mb-8">
                    <Logo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-10">
                    { __( 'Basic Information', 'dokan' ) }
                </h1>

                <div className="space-y-8 md:w-[39rem] w-full">
                    <div>
                        <label
                            className="block text-sm font-medium mb-4"
                            htmlFor="storename"
                        >
                            { __(
                                'Choose how vendor store URLs will appear',
                                'dokan'
                            ) }
                        </label>
                        <SimpleInput
                            required={ true }
                            value={ localStoreUrl }
                            addOnLeft={
                                <span className="md:inline-flex hidden items-center bg-gray-50 px-3 text-xs text-gray-900 sm:text-sm rouned-bl absolute left-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    { siteUrlWidth }
                                </span>
                            }
                            addOnRight={
                                <span className="md:inline-flex hidden items-center bg-gray-50 px-3 text-gray-900 text-xs sm:text-sm rouned-bl absolute right-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    { __( 'vendor-name', 'dokan' ) }
                                </span>
                            }
                            input={ {
                                id: 'storename',
                                name: 'storename',
                                type: 'text',
                                autoComplete: 'off',
                            } }
                            errors={ error && [ error ] }
                            onChange={ onHandleInputChange }
                            className={ `md:w-[80%] md:w-full sm:pl-[12rem] pl-6  mb-2 block focus:ring-0 focus:outline-gray-300 focus:ring-0 ${
                                error
                                    ? 'focus:outline-red-500'
                                    : 'focus:outline-blue-500'
                            } border-gray-300 rounded-md` }
                        />
                        <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
                            <WarningIcon />
                            <span>
                                Vendor Store URL will be (
                                <span className="text-indigo-600">
                                    { siteUrl }/{ localStoreUrl }/
                                    { __( 'vendor-name', 'dokan' ) }
                                </span>
                                )
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 space-y-8">
                        <div className="flex-shrink-0 mb-2">
                            <input
                                type="checkbox"
                                checked={ localShareDiagnostics }
                                aria-describedby="comments-description"
                                className="rounded p-2 w-5 h-5 bg-[#7047EB] text-white cursor-pointer text-sm"
                                onChange={ () =>
                                    setLocalShareDiagnostics(
                                        ! localShareDiagnostics
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-medium">
                                { __(
                                    'Help Us Tailor Your Marketplace',
                                    'dokan'
                                ) }
                            </h3>
                            <p className="text-sm text-gray-500 lg:max-w-[400px]">
                                { __(
                                    'Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information.',
                                    'dokan'
                                ) }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-12">
                    <NextButton handleNext={ handleNext } />
                </div>
            </div>
        </div>
    );
};

export default BasicInfoScreen;
