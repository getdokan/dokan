import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { SimpleCheckbox, SimpleInput } from '@getdokan/dokan-ui';
import DokanLogo from '../DokanLogo';
import WarningIcon from '../icons/WarningIcon';
import NextButton from '@src/admin/onboard/components/NextButton';
import { applyFilters } from '@wordpress/hooks';
import slugify from 'slugify';
import { debounce } from '@wordpress/compose';

interface BasicInfoScreenProps {
    onNext: () => void;
    onUpdate: ( storeUrl: string, shareDiagnostics: boolean ) => void;
    storeUrl: string;
    shareDiagnostics: boolean;
}

const BasicInfoScreen = ( {
    onNext,
    onUpdate,
    storeUrl,
    shareDiagnostics,
}: BasicInfoScreenProps ) => {
    const [ displayStoreUrl, setDisplayStoreUrl ] = useState(
        storeUrl || 'store'
    );
    const [ localStoreUrl, setLocalStoreUrl ] = useState( storeUrl || 'store' );
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

    // List of reserved WordPress keywords from backend.
    // @ts-ignore
    const reservedSlugs = wp.hooks.applyFilters(
        'dokan_reserved_url_slugs',
        onboardingData?.reserved_slugs || []
    );

    // Handle immediate UI updates
    const onHandleInputChange = ( event ) => {
        const value = event.target.value;
        setDisplayStoreUrl( value );

        if ( ! value ) {
            setError( __( 'Please enter a valid input', 'dokan-lite' ) );
        } else if ( reservedSlugs.includes( value ) ) {
            setError( sprintf( __( 'The store URL "%s" is reserved by WordPress and cannot be used. Please choose a different value like "store".', 'dokan-lite' ), value ) );
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
    const maxUrlLength = 90;
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
                                <span className="truncate max-w-[20rem] inline-block">
                                    { sprintf(
                                        // eslint-disable-next-line @wordpress/i18n-translator-comments
                                        __( '%s/', 'dokan-lite' ),
                                        siteUrlContent
                                    ) }
                                </span>
                            }
                            addOnRight={
                                <span className="w-24">
                                    { __( '/vendor-name', 'dokan-lite' ) }
                                </span>
                            }
                            input={ {
                                id: 'storename',
                                name: 'storename',
                                type: 'text',
                                autoComplete: 'off',
                                placeholder: __(
                                    'write-your-store-name',
                                    'dokan-lite'
                                ),
                            } }
                            errors={ error && [ error ] }
                            onChange={ onHandleInputChange }
                            onBlur={ onBlurInput }
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
                        <div className="flex-shrink-0 mt-1.5">
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
                            <h3
                                className="text-sm text-[#575757] font-medium cursor-pointer"
                                onClick={ () =>
                                    setLocalShareDiagnostics(
                                        ! localShareDiagnostics
                                    )
                                }
                            >
                                { __(
                                    'Help Us Tailor Your Marketplace',
                                    'dokan-lite'
                                ) }
                            </h3>
                            <p className="text-sm text-gray-500">
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
