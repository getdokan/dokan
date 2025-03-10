import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SimpleCheckbox, SimpleInput } from '@getdokan/dokan-ui';
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

const BasicInfoScreen = ( { onNext, onUpdate }: BasicInfoScreenProps ) => {
    const [ localStoreUrl, setLocalStoreUrl ] = useState( 'store' );
    const [ localShareDiagnostics, setLocalShareDiagnostics ] =
        useState( true );
    const [ error, setError ] = useState( '' );
    // format the localStoreUrl as slug
    const formatStoreUrl = ( url: string ) => {
        return url
            .toLowerCase()
            .replace( /[^a-z0-9]+/g, '-' )
            .replace( /-+/g, '-' )
            .replace( /^-|-$/g, '' );
    };

    const onHandleInputChange = (
        e: React.ChangeEvent< HTMLInputElement >
    ) => {
        const value = e.target.value;
        if ( formatStoreUrl( value ) !== value ) {
            setError( __( 'Please enter a valid store URL.', 'dokan' ) );
        } else if ( ! value ) {
            setError( __( 'Please enter a store URL.', 'dokan' ) );
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
        <div className="min-h-screen  flex  items-center justify-center max-h-[280px]">
            <div className="p-8 md:p-10  sm:w-[50rem] w-full">
                <div className="mb-8">
                    <Logo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-10">
                    { __( 'Basic Information', 'dokan' ) }
                </h1>

                <div className="space-y-8 md:w-[30rem]  w-full">
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
                            className={ `sm:pl-[11rem] pl-6  mb-2 block focus:ring-0 focus:outline-gray-300 focus:ring-0 ${
                                error
                                    ? 'focus:outline-red-500'
                                    : 'focus:outline-blue-500'
                            } border-gray-300 rounded-md` }
                        />
                        <div className="flex items-center gap-1 mt-6 text-sm text-gray-500">
                            <WarningIcon />
                            <span>
                                Vendor Store URL will be (
                                <span className="text-indigo-600">
                                    { siteUrl }/
                                    { formatStoreUrl( localStoreUrl ) }/
                                    { __( 'vendor-name', 'dokan' ) }
                                </span>
                                )
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 space-y-8">
                        <div className="flex-shrink-0 mb-2">
                            <SimpleCheckbox
                                input={ {
                                    id: 'localShareDiagnostics',
                                    name: 'localShareDiagnostics',
                                    type: 'checkbox',
                                } }
                                checked={ localShareDiagnostics }
                                onChange={ () =>
                                    setLocalShareDiagnostics(
                                        ! localShareDiagnostics
                                    )
                                }
                                className={ `w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                                    localShareDiagnostics
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : ''
                                }` }
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

                <div className="flex justify-end mt-12 w-full">
                    <NextButton
                        disabled={ !! error }
                        handleNext={ handleNext }
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicInfoScreen;
