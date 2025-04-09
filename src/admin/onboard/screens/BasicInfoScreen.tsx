import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { SimpleCheckbox, SimpleInput } from '@getdokan/dokan-ui';
import DokanLogo from '../DokanLogo';
import WarningIcon from '../icons/WarningIcon';
import NextButton from '@dokan/admin/onboard/components/NextButton';
import { applyFilters } from '@wordpress/hooks';
import slugify from 'slugify';
import { debounce } from '@wordpress/compose';

interface BasicInfoScreenProps {
    onNext: () => void;
    onUpdate: ( storeUrl: string, shareDiagnostics: boolean ) => void;
    stateUrl: string;
    shareDiagnostics: boolean;
}

const BasicInfoScreen = ( {
    onNext,
    onUpdate,
    stateUrl,
    shareDiagnostics,
}: BasicInfoScreenProps ) => {
    const [ displayStoreUrl, setDisplayStoreUrl ] = useState(
        stateUrl || 'store'
    );
    const [ localStoreUrl, setLocalStoreUrl ] = useState( stateUrl || 'store' );
    const [ localShareDiagnostics, setLocalShareDiagnostics ] =
        useState( shareDiagnostics );
    const [ error, setError ] = useState( '' );

    // Convert input to slug using the slugify library
    const formatStoreUrl = ( url: string ) => {
        return slugify( url, {
            lower: true, // convert to lower case
            strict: true, // strip special chars
            trim: true, // trim leading and trailing spaces
        } );
    };

    // Handle immediate UI updates
    const onHandleInputChange = ( event ) => {
        const value = event.target.value;
        setDisplayStoreUrl( value );

        if ( ! value ) {
            setError( __( 'Please enter a valid input', 'dokan-lite' ) );
        } else {
            setError( '' );
        }

        // Trigger the debounced function
        updateSlugifiedUrl( value );
    };

    // Create debounced version for processing and API updates
    const updateSlugifiedUrl = debounce( ( value: string ) => {
        const slugified = formatStoreUrl( value );
        setLocalStoreUrl( slugified );
        onUpdate( slugified, localShareDiagnostics );
    }, 300 );

    // Update the parent component when shareDiagnostics changes
    useEffect( () => {
        onUpdate( localStoreUrl, localShareDiagnostics );
    }, [ localShareDiagnostics ] );

    const handleNext = () => {
        // Validate store URL
        if ( ! localStoreUrl || localStoreUrl.length === 0 ) {
            setError( __( 'Please enter a valid store URL', 'dokan-lite' ) );
            return;
        }
        onNext();
    };

    const siteUrl = onboardingData?.site_url;
    const maxUrlLength = 40;
    let siteUrlContent =
        siteUrl?.length > maxUrlLength
            ? siteUrl.slice( 0, maxUrlLength ) + '...'
            : siteUrl;

    siteUrlContent = applyFilters(
        'dokan_onboarding_site_url',
        siteUrlContent,
        maxUrlLength,
        siteUrl
    );

    const onBlurInput = ( event ) => {
        const value = event.target.value;
        const slugified = formatStoreUrl( value );
        setDisplayStoreUrl( slugified );
    };

    return (
        <div className="min-h-screen flex items-center justify-center max-h-[280px]">
            <div className="p-8 md:p-10 sm:w-[50rem] w-full">
                <div className="mb-12">
                    <DokanLogo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-8">
                    { __( 'Basic Information', 'dokan-lite' ) }
                </h1>

                <div className="space-y-8  w-full">
                    <div>
                        <label
                            className="block text-md font-medium mb-4"
                            htmlFor="storename"
                        >
                            { __(
                                'Choose how vendor store URLs will appear',
                                'dokan-lite'
                            ) }
                        </label>
                        <SimpleInput
                            required={ true }
                            value={ displayStoreUrl }
                            addOnLeft={
                                <span className="md:inline-flex hidden items-center bg-gray-50 px-3 text-xs text-gray-900 sm:text-sm rouned-bl absolute left-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    { sprintf(
                                        __( '%s/', 'dokan-lite' ),
                                        siteUrlContent
                                    ) }
                                </span>
                            }
                            addOnRight={
                                <span className="md:inline-flex hidden items-center bg-gray-50 px-3 text-gray-900 text-xs sm:text-sm rouned-bl absolute right-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    { __( '/vendor-name', 'dokan-lite' ) }
                                </span>
                            }
                            input={ {
                                id: 'storename',
                                name: 'storename',
                                type: 'text',
                                autoComplete: 'off',
                                placeHolder: __(
                                    'write-your-store-name',
                                    'dokan-lite'
                                ),
                            } }
                            errors={ error && [ error ] }
                            onChange={ onHandleInputChange }
                            onBlur={ onBlurInput }
                            className={ `sm:pl-[11rem] pl-6  mb-2 block focus:ring-0 focus:outline-gray-300 focus:ring-0 ${
                                error
                                    ? 'focus:outline-red-500'
                                    : 'focus:outline-blue-500'
                            } border-gray-300 rounded-md` }
                        />
                        <div className="flex items-center gap-1 mt-6 text-sm text-gray-500">
                            <WarningIcon />
                            <span
                                dangerouslySetInnerHTML={ {
                                    __html: sprintf(
                                        /* translators: %1$s: site URL, %2$s: store URL, %3$s: vendor name */
                                        __(
                                            'Vendor Store URL will be (<span class="text-indigo-600">%1$s/%2$s/%3$s</span>)',
                                            'dokan-lite'
                                        ),
                                        siteUrl,
                                        localStoreUrl,
                                        __( 'vendor-name', 'dokan-lite' )
                                    ),
                                } }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 space-y-8">
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
                                className={ `w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:outline-none
                                ${
                                    localShareDiagnostics
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : ''
                                }` }
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[#575757] font-medium">
                                { __(
                                    'Help Us Tailor Your Marketplace',
                                    'dokan-lite'
                                ) }
                            </h3>
                            <p className="text-sm text-gray-500 lg:max-w-[400px]">
                                { __(
                                    'Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information.',
                                    'dokan-lite'
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
