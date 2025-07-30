import { DokanButton } from '@dokan/components';
import { __ } from '@wordpress/i18n';
import {
    CheckCircle,
    CircleX,
    Mail,
    Trash,
    Upload,
    Pencil,
} from 'lucide-react';
import {
    AsyncSearchableSelect,
    Card,
    SimpleCheckbox,
    SimpleInput,
    ToggleSwitch,
} from '@getdokan/dokan-ui';
import StoreImage from './StoreImage';
import VendorFormSkeleton from '@dokan/admin/dashboard/pages/vendor-create-edit/VendorFormSkeleton';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import { useDispatch, useSelect } from '@wordpress/data';
import store from '@dokan/stores/vendors';
import apiFetch from '@wordpress/api-fetch';
import { twMerge } from 'tailwind-merge';
import DebouncedInput from '@dokan/admin/dashboard/pages/vendor-create-edit/DebouncedInput';
import { addQueryArgs } from '@wordpress/url';
import wpMedia from '@dokan/admin/dashboard/pages/vendor-create-edit/WpMedia';
import { Slot } from "@wordpress/components";
import { PluginArea } from "@wordpress/plugins";
interface Props {
    vendor: Vendor;
    requiredFields: Record< any, any >;
    formKey: string;
}
function Form( { vendor, requiredFields, formKey = 'dokan-create-new-vendor' }: Props ) {
    const { setCreateOrEditVendor } = useDispatch( store );
    const errors: String[] = useSelect( ( select ) => {
        return select( store ).getCreateOrEditVendorErrors();
    } );

    const setData = async (
        key: string,
        value: any,
        existingVendor?: object
    ) => {
        const updatableVendor = existingVendor ?? vendor;
        return await setCreateOrEditVendor( {
            ...updatableVendor,
            [ key ]: value,
        } );
    };

    const generatePassword = () => {
        setData( 'user_pass', makePassword() );
    };

    const isRequired = ( key ): boolean => {
        return !! requiredFields[ key ];
    };

    const getError = ( key: string ): string => {
        if ( errors && errors.includes( key ) && isRequired( key ) ) {
            return requiredFields[ key ];
        }
        return '';
    };

    const makePassword = ( len = 25 ) => {
        const lowerCaseChars = 'abcdefghijklmnopqurstuvwxyz';
        const upperCaseChars = 'ABCDEFGHIJKLMNOPQURSTUVWXYZ';
        const specialChars = '!@#$%^&*()';
        let randomChars = '';

        for ( let i = 0; i <= len; i++ ) {
            const mixUp =
                lowerCaseChars[ Math.floor( Math.random() * len ) ] +
                upperCaseChars[ Math.floor( Math.random() * 10 ) ] +
                specialChars[
                    Math.floor( Math.random() * specialChars.length )
                ];
            randomChars += mixUp;
        }

        return randomChars.slice( -len );
    };

    const setLogo = ( logo ) => {
        setCreateOrEditVendor( {
            ...vendor,
            gravatar: logo?.url,
            gravatar_id: logo?.id,
        } );
    };

    const setBanner = ( logo ) => {
        setCreateOrEditVendor( {
            ...vendor,
            banner: logo?.url,
            banner_id: logo?.id,
        } );
    };

    const defaultUrl =
        dokanAdminDashboard.urls.siteUrl +
        dokanAdminDashboard.urls.storePrefix +
        '/';

    const formatStoreUrl = ( storeName ) => {
        return storeName
            .trim()
            .split( ' ' )
            .join( '-' )
            .toLowerCase()
            .replace( /[^\w\s/-]/g, '' )
            .replace( /-+/g, '-' );
    };
    const onChangeStoreName = ( value ) => {
        const storeUrl = formatStoreUrl( value );
        // @ts-ignore
        setCreateOrEditVendor( {
            ...vendor,
            store_name: value,
            user_nicename: storeUrl,
        } ).then( async ( data ) => {
            await checkStore( storeUrl, data.vendor );
        } );
    };

    const onChangeStoreUrl = async ( storeUrl ) => {
        storeUrl = formatStoreUrl( storeUrl );
        // @ts-ignore
        const data = await setData( 'user_nicename', storeUrl );
        await checkStore( storeUrl, data.vendor );
    };

    const storeUrl = () => {
        const storeUrl = vendor?.user_nicename
            ? vendor?.user_nicename
            : vendor?.store_name;

        return defaultUrl + storeUrl;
    };

    const checkStore = async ( storeName, updatedData = null ) => {
        if ( ! storeName ) {
            return;
        }

        await setData( 'storeSearchText', 'searching', updatedData );

        const response = await apiFetch( {
            path: addQueryArgs( 'dokan/v1/stores/check', {
                store_slug: storeName,
            } ),
        } );

        if ( response.available ) {
            await setData( 'storeSearchText', 'available', updatedData );
        } else {
            await setData( 'storeSearchText', 'not-available', updatedData );
        }
    };

    const searchUsername = async ( userName, updatedVendor ) => {
        if ( ! userName ) {
            return;
        }

        await setData( 'userSearchText', 'searching', updatedVendor );

        const response = await apiFetch( {
            path: addQueryArgs( 'dokan/v1/stores/check', {
                username: userName,
            } ),
        } );

        if ( response.available ) {
            await setData( 'userSearchText', 'available', updatedVendor );
        } else {
            await setData( 'userSearchText', 'not-available', updatedVendor );
        }
    };

    const searchEmail = async ( userEmail, upatedVendor ) => {
        if ( ! userEmail ) {
            return;
        }

        await setData( 'userEmailText', 'searching', upatedVendor );

        const response = await apiFetch( {
            path: addQueryArgs( 'dokan/v1/stores/check', {
                email: userEmail,
            } ),
        } );

        if ( response.available ) {
            await setData( 'userEmailText', 'available', upatedVendor );
        } else {
            await setData( 'userEmailText', 'not-available', upatedVendor );
        }
    };

    const getCountries = () => {
        const dokanCountries = dokanAdminDashboard.countries;
        return Object.keys( dokanCountries ).map( ( key ) => {
            return {
                label: dokanCountries[ key ],
                value: key,
            };
        } );
    };

    const getCountry = ( code ) => {
        const dokanCountries: Record< string, string > =
            dokanAdminDashboard.countries;

        if ( ! dokanCountries[ code ] ) {
            return '';
        }

        return {
            label: dokanCountries[ code ],
            value: code,
        };
    };

    const getStatesFromCountryCode = ( countryCode ) => {
        const states = [];
        const statesObject = dokanAdminDashboard.states;
        if ( '' === countryCode || ! statesObject ) {
            return states;
        }

        for ( const state in statesObject ) {
            if ( state !== countryCode ) {
                continue;
            }

            if ( statesObject[ state ] && statesObject[ state ].length < 1 ) {
                continue;
            }

            for ( const name in statesObject[ state ] ) {
                states.push( {
                    label: statesObject[ state ][ name ],
                    value: name,
                } );
            }
        }

        return states;
    };

    const getStateFromStateCode = ( stateCode, countryCode ) => {
        if ( '' === stateCode ) {
            return;
        }

        const states = dokanAdminDashboard.states[ countryCode ];
        const state = states && states[ stateCode ];

        if ( ! state ) {
            return '';
        }

        return {
            label: state,
            value: stateCode,
        };
    };

    const getStoreSearchText = ( text ) => {
        if ( text === 'searching' ) {
            return (
                <span className="flex flex-row gap-1 items-center text-neutral-500">
                    <span>{ __( 'Searching…', 'dokan-lite' ) }</span>
                </span>
            );
        } else if ( text === 'available' ) {
            return (
                <span className="flex flex-row gap-1 items-center text-green-500">
                    <CheckCircle size={ 13 } />
                    <span>{ __( 'Available', 'dokan-lite' ) }</span>
                </span>
            );
        } else if ( text === 'not-available' ) {
            return (
                <span className="flex flex-row gap-1 items-center text-red-500">
                    <CircleX size={ 13 } />
                    <span>{ __( 'Not Available', 'dokan-lite' ) }</span>
                </span>
            );
        }
        return '';
    };

    if ( ! vendor || Object.keys( vendor ).length === 0 ) {
        return <VendorFormSkeleton />;
    }

    return (
        <>
            <div className="flex flex-col">
                { /*Permission section*/ }
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-bold">
                                { __( 'Permission', 'dokan-lite' ) }
                            </h2>
                        </div>
                        <div className="border-b p-6 flex flex-row justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-md font-semibold">
                                    { __( 'Enable Selling', 'dokan-lite' ) }
                                </h3>
                                <span>
                                    { __(
                                        'Turning this off will stop vendors from being able to sell.',
                                        'dokan-lite'
                                    ) }
                                </span>
                            </div>
                            <div className="flex items-center">
                                <ToggleSwitch
                                    checked={ vendor?.enabled }
                                    onChange={ ( value ) => {
                                        setData( 'enabled', value );
                                    } }
                                />
                            </div>
                        </div>

                        <Slot name={`${formKey}-after-enable-selling-permission`} />

                        <div className="border-b p-6 flex flex-row justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-md font-semibold">
                                    { __(
                                        'Publish Product Directly',
                                        'dokan-lite'
                                    ) }
                                </h3>
                                <span>
                                    { __(
                                        'Disabling this requires vendor products to be reviewed first.',
                                        'dokan-lite'
                                    ) }
                                </span>
                            </div>
                            <div className="flex items-center">
                                <ToggleSwitch
                                    checked={ vendor?.trusted }
                                    onChange={ ( value ) => {
                                        setData( 'trusted', value );
                                    } }
                                />
                            </div>
                        </div>

                        <Slot name={`${formKey}-after-publish-product-directly-permission`} />

                        <div className="p-6 flex flex-row justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-md font-semibold">
                                    { __(
                                        'Make Vendor Featured',
                                        'dokan-lite'
                                    ) }
                                </h3>
                                <span>
                                    { __(
                                        'Enabling this will highlight the vendor as featured.',
                                        'dokan-lite'
                                    ) }
                                </span>
                            </div>
                            <div className="flex items-center">
                                <ToggleSwitch
                                    checked={ vendor?.featured }
                                    onChange={ ( value ) => {
                                        setData( 'featured', value );
                                    } }
                                />
                            </div>
                        </div>

                        <Slot name={`${formKey}-after-make-vendor-featured-permission`} />

                    </Card>
                </div>

                { /*Vendor information section*/ }
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-bold">
                                { __( 'Vendor Information', 'dokan-lite' ) }
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <div className="flex flex-row gap-6">
                                <div className="w-1/2">
                                    <SimpleInput
                                        label={ __( 'First Name' ) }
                                        value={ vendor?.first_name ?? '' }
                                        onChange={ ( e ) => {
                                            setData(
                                                'first_name',
                                                e.target.value
                                            );
                                        } }
                                        input={ {
                                            placeholder: __(
                                                'e.g. - Mr.',
                                                'dokan-lite'
                                            ),
                                            id: 'first-name',
                                            type: 'text',
                                        } }
                                        required={ isRequired( 'first_name' ) }
                                        errors={ getError( 'first_name' ) }
                                    />
                                </div>
                                <div className="w-1/2">
                                    <SimpleInput
                                        label={ __( 'Last Name' ) }
                                        value={ vendor?.last_name ?? '' }
                                        onChange={ ( e ) => {
                                            setData(
                                                'last_name',
                                                e.target.value
                                            );
                                        } }
                                        input={ {
                                            placeholder: __(
                                                'e.g. - John Doe',
                                                'dokan-lite'
                                            ),
                                            id: 'last-name',
                                            type: 'text',
                                        } }
                                        required={ isRequired( 'last_name' ) }
                                        errors={ getError( 'last_name' ) }
                                    />
                                </div>
                            </div>

                            <Slot name={`${formKey}-after-first-last-name-vendor-information`} />

                            <div>
                                <DebouncedInput
                                    label={ __( 'Email', 'dokan-lite' ) }
                                    value={ vendor?.email ?? '' }
                                    onChange={ ( value ) => {
                                        setData( 'email', value ).then(
                                            async ( updatedVendor ) => {
                                                await searchEmail(
                                                    value,
                                                    updatedVendor.vendor
                                                );
                                            }
                                        );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter email address',
                                            'dokan-lite'
                                        ),
                                        id: 'last-name',
                                        type: 'email',
                                        required: true,
                                    } }
                                    required={ isRequired( 'email' ) }
                                    errors={ getError( 'email' ) }
                                    icon={ Mail }
                                />
                                <div className="flex justify-between mt-2">
                                    { getStoreSearchText(
                                        vendor?.userEmailText ?? ''
                                    ) }
                                </div>
                            </div>

                            <Slot name={`${formKey}-after-email-vendor-information`} />

                            <div>
                                <DebouncedInput
                                    label={ __( 'Username', 'dokan-lite' ) }
                                    value={ vendor?.user_login ?? '' }
                                    onChange={ ( value ) => {
                                        setData( 'user_login', value ).then(
                                            async ( updatedVendor ) => {
                                                await searchUsername(
                                                    value,
                                                    updatedVendor.vendor
                                                );
                                            }
                                        );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter username',
                                            'dokan-lite'
                                        ),
                                        id: 'username',
                                        type: 'text',
                                        required: true,
                                    } }
                                    required={ isRequired( 'user_login' ) }
                                    errors={ getError( 'user_login' ) }
                                />
                                <div className="flex justify-between mt-2">
                                    { getStoreSearchText(
                                        vendor?.userSearchText ?? ''
                                    ) }
                                </div>
                            </div>

                            <Slot name={`${formKey}-after-username-vendor-information`} />

                            <div className="flex flex-row gap-2">
                                <div className="w-full">
                                    <SimpleInput
                                        label={ __( 'Password', 'dokan-lite' ) }
                                        value={ vendor?.user_pass ?? '' }
                                        onChange={ ( e ) => {
                                            setData(
                                                'user_pass',
                                                e.target.value
                                            );
                                        } }
                                        onFocus={ () => {
                                            ! vendor?.user_pass
                                                ? generatePassword()
                                                : () => {};
                                        } }
                                        input={ {
                                            placeholder: __(
                                                'Enter password or Generate',
                                                'dokan-lite'
                                            ),
                                            id: 'password',
                                            type: 'text',
                                            required: true,
                                        } }
                                        required={ isRequired( 'user_pass' ) }
                                        errors={ getError( 'user_pass' ) }
                                    />
                                </div>
                                <div className="flex items-end">
                                    <DokanButton
                                        variant="secondary"
                                        className={ twMerge(
                                            '!bg-white !h-10',
                                            getError( 'user_pass' ).length
                                                ? 'mb-[22px]'
                                                : 'mb-0'
                                        ) }
                                        onClick={ generatePassword }
                                    >
                                        { __( 'Generate', 'dokan-lite' ) }
                                    </DokanButton>
                                </div>
                            </div>

                            <Slot name={`${formKey}-after-password-vendor-information`} />

                            <div>
                                <SimpleInput
                                    label={ __( 'Phone', 'dokan-lite' ) }
                                    value={ vendor?.phone ?? '' }
                                    onChange={ ( e ) => {
                                        setData(
                                            'phone',
                                            e.target.value.replace(
                                                /[^0-9\\.\-\_\(\)\+]+/g,
                                                ''
                                            )
                                        );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter phone no.',
                                            'dokan-lite'
                                        ),
                                        id: 'phone',
                                        type: 'text',
                                        required: true,
                                    } }
                                    required={ isRequired( 'phone' ) }
                                    errors={ getError( 'phone' ) }
                                />
                            </div>

                            <Slot name={`${formKey}-after-phone-vendor-information`} />

                        </div>
                    </Card>
                </div>

                { /*Store information section*/ }
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-bold">
                                { __( 'Store Information', 'dokan-lite' ) }
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <div>
                                <DebouncedInput
                                    label={ __( 'Store Name', 'dokan-lite' ) }
                                    value={ vendor?.store_name ?? '' }
                                    onChange={ ( value ) => {
                                        onChangeStoreName( value );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter store name',
                                            'dokan-lite'
                                        ),
                                        id: 'store-name',
                                        type: 'text',
                                        required: true,
                                    } }
                                    required={ isRequired( 'store_name' ) }
                                    errors={ getError( 'store_name' ) }
                                />
                            </div>

                            <Slot name={`${formKey}-after-store-name-store-information`} />

                            <div>
                                <DebouncedInput
                                    label={ __( 'Store Url', 'dokan-lite' ) }
                                    value={ vendor?.user_nicename ?? '' }
                                    onChange={ ( e ) => {
                                        onChangeStoreUrl( e );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter store url',
                                            'dokan-lite'
                                        ),
                                        id: 'store-url',
                                        type: 'text',
                                        required: true,
                                    } }
                                    // helpText={ storeUrl() }
                                    required={ isRequired( 'store_url' ) }
                                    errors={ getError( 'store_url' ) }
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-neutral-500">
                                        { storeUrl() }
                                    </span>
                                    { getStoreSearchText(
                                        vendor?.storeSearchText ?? ''
                                    ) }
                                </div>
                            </div>

                            <Slot
                                name={ `${ formKey }-after-store-url-store-information` }
                            />

                            <div>
                                <label
                                    htmlFor=""
                                    className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                >
                                    { __( 'Logo', 'dokan-lite' ) }
                                </label>
                                <div className="flex flex-row gap-6">
                                    <div>
                                        <StoreImage
                                            image={ vendor?.gravatar ?? '' }
                                        />
                                    </div>
                                    <div className="flex justify-center items-center gap-3">
                                        <DokanButton
                                            variant="secondary"
                                            size="sm"
                                            className="h-8"
                                            onClick={ () =>
                                                wpMedia( setLogo, 150, 150 )
                                            }
                                        >
                                            { vendor?.gravatar ? (
                                                <Pencil size={ 15 } />
                                            ) : (
                                                <Upload size={ 15 } />
                                            ) }
                                            <span>
                                                { vendor?.gravatar
                                                    ? __(
                                                          'Change',
                                                          'dokan-lite'
                                                      )
                                                    : __(
                                                          'Upload',
                                                          'dokan-lite'
                                                      ) }
                                            </span>
                                        </DokanButton>
                                        { vendor?.gravatar && (
                                            <DokanButton
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 p-[10px]"
                                                onClick={ () =>
                                                    setCreateOrEditVendor( {
                                                        ...vendor,
                                                        gravatar: '',
                                                        gravatar_id: '',
                                                    } )
                                                }
                                            >
                                                <Trash size={ 15 } />
                                            </DokanButton>
                                        ) }
                                    </div>
                                </div>
                            </div>

                            <Slot name={`${formKey}-after-store-logo-store-information`} />

                            <div>
                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor=""
                                            className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                        >
                                            { __( 'Banner', 'dokan-lite' ) }
                                        </label>
                                        <span className="text-neutral-400 -mt-1">
                                            { __(
                                                'Size - 600 X 325 px',
                                                'dokan-lite'
                                            ) }
                                        </span>
                                    </div>
                                    { vendor?.banner && (
                                        <div className="flex gap-3">
                                            <DokanButton
                                                variant="secondary"
                                                size="sm"
                                                className="h-8"
                                                onClick={ () =>
                                                    wpMedia( setBanner )
                                                }
                                            >
                                                { vendor?.banner ? (
                                                    <Pencil size={ 15 } />
                                                ) : (
                                                    <Upload size={ 15 } />
                                                ) }
                                                <span>
                                                    { vendor?.banner
                                                        ? __(
                                                              'Change',
                                                              'dokan-lite'
                                                          )
                                                        : __(
                                                              'Upload',
                                                              'dokan-lite'
                                                          ) }
                                                </span>
                                            </DokanButton>

                                            <DokanButton
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 p-[10px]"
                                                onClick={ () =>
                                                    setCreateOrEditVendor( {
                                                        ...vendor,
                                                        banner: '',
                                                        banner_id: '',
                                                    } )
                                                }
                                            >
                                                <Trash size={ 15 } />
                                            </DokanButton>
                                        </div>
                                    ) }
                                </div>
                                <div className="w-full h-[325px] border rounded overflow-hidden flex items-center justify-center mt-3">
                                    { vendor?.banner ? (
                                        <img
                                            className="w-full h-full object-cover"
                                            src={ vendor?.banner }
                                            alt={ __(
                                                'No Image',
                                                'dokan-lite'
                                            ) }
                                        />
                                    ) : (
                                        <DokanButton
                                            variant="secondary"
                                            size="sm"
                                            className="h-8"
                                            onClick={ () =>
                                                wpMedia( setBanner )
                                            }
                                        >
                                            <Upload size={ 15 } />
                                            <span>
                                                { __( 'Upload', 'dokan-lite' ) }
                                            </span>
                                        </DokanButton>
                                    ) }
                                </div>
                            </div>

                            <Slot name={`${formKey}-after-banner-store-information`} />
                        </div>
                    </Card>
                </div>

                { /*Address information section*/ }
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-bold">
                                { __( 'Address Information', 'dokan-lite' ) }
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <div>
                                <AsyncSearchableSelect
                                    label={ __( 'Country', 'dokan-lite' ) }
                                    placeholder={ __(
                                        'Select country',
                                        'dokan-lite'
                                    ) }
                                    isMulti={ false }
                                    required={ isRequired( 'country' ) }
                                    errors={ getError( 'country' ) }
                                    defaultOptions={ getCountries() }
                                    value={ getCountry(
                                        vendor?.address?.country
                                    ) }
                                    onChange={ ( value ) => {
                                        setData( 'address', {
                                            ...vendor?.address,
                                            country: value.value,
                                            state: '',
                                        } );
                                    } }
                                />
                            </div>

                            <Slot name={`${formKey}-after-country-address-information`} />

                            <div>
                                { getStatesFromCountryCode(
                                    vendor?.address?.country
                                ).length < 1 ? (
                                    <SimpleInput
                                        label={ __( 'State', 'dokan-lite' ) }
                                        value={ vendor?.address?.state }
                                        onChange={ ( e ) => {
                                            setData( 'address', {
                                                ...vendor?.address,
                                                state: e.target.value,
                                            } );
                                        } }
                                        input={ {
                                            placeholder: __(
                                                'Enter state',
                                                'dokan-lite'
                                            ),
                                            id: 'state',
                                            type: 'text',
                                        } }
                                        required={ isRequired( 'state' ) }
                                        errors={ getError( 'state' ) }
                                    />
                                ) : (
                                    <AsyncSearchableSelect
                                        label={ __( 'State', 'dokan-lite' ) }
                                        placeholder={ __(
                                            'Select state',
                                            'dokan-lite'
                                        ) }
                                        required={ isRequired( 'state' ) }
                                        errors={ getError( 'state' ) }
                                        defaultOptions={ getStatesFromCountryCode(
                                            vendor?.address?.country
                                        ) }
                                        onChange={ ( value ) => {
                                            setData( 'address', {
                                                ...vendor?.address,
                                                state: value.value,
                                            } );
                                        } }
                                        value={ getStateFromStateCode(
                                            vendor?.address?.state,
                                            vendor?.address?.country
                                        ) }
                                    />
                                ) }
                            </div>

                            <Slot name={`${formKey}-after-state-address-information`} />

                            <div>
                                <SimpleInput
                                    label={ __( 'City', 'dokan-lite' ) }
                                    value={ vendor?.address?.city }
                                    onChange={ ( e ) => {
                                        setData( 'address', {
                                            ...vendor?.address,
                                            city: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter city.',
                                            'dokan-lite'
                                        ),
                                        id: 'city',
                                        type: 'text',
                                    } }
                                    required={ isRequired( 'city' ) }
                                    errors={ getError( 'city' ) }
                                />
                            </div>

                            <Slot name={`${formKey}-after-city-address-information`} />

                            <div>
                                <SimpleInput
                                    label={ __(
                                        'Address Line 1',
                                        'dokan-lite'
                                    ) }
                                    value={ vendor?.address?.street_1 }
                                    onChange={ ( e ) => {
                                        setData( 'address', {
                                            ...vendor?.address,
                                            street_1: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Street address',
                                            'dokan-lite'
                                        ),
                                        id: 'street-address-1',
                                        type: 'text',
                                    } }
                                    required={ isRequired( 'street_1' ) }
                                    errors={ getError( 'street_1' ) }
                                />
                            </div>

                            <Slot name={`${formKey}-after-street-1-address-information`} />

                            <div>
                                <SimpleInput
                                    label={ __(
                                        'Address Line 2',
                                        'dokan-lite'
                                    ) }
                                    value={ vendor?.address?.street_2 }
                                    onChange={ ( e ) => {
                                        setData( 'address', {
                                            ...vendor?.address,
                                            street_2: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Apartment, suite, etc.',
                                            'dokan-lite'
                                        ),
                                        id: 'street-address-2',
                                        type: 'text',
                                    } }
                                    required={ isRequired( 'street_2' ) }
                                    errors={ getError( 'street_2' ) }
                                />
                            </div>

                            <Slot name={`${formKey}-after-street-2-address-information`} />

                            <div>
                                <SimpleInput
                                    label={ __( 'Zip', 'dokan-lite' ) }
                                    value={ vendor?.address?.zip }
                                    onChange={ ( e ) => {
                                        setData( 'address', {
                                            ...vendor?.address,
                                            zip: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'Enter zip',
                                            'dokan-lite'
                                        ),
                                        id: 'zip',
                                        type: 'text',
                                    } }
                                    required={ isRequired( 'zip' ) }
                                    errors={ getError( 'zip' ) }
                                />
                            </div>

                            <Slot name={`${formKey}-after-zip-address-information`} />
                        </div>
                    </Card>
                </div>

                <div className="mt-6">
                    <SimpleCheckbox
                        label={ __(
                            'Send an email to vendor about account',
                            'dokan-lite'
                        ) }
                        input={ {
                            id: 'send_email',
                            name: 'send_email',
                            type: 'checkbox',
                        } }
                        checked={ vendor?.show_email }
                        onChange={ ( e ) => {
                            setData( 'show_email', e.target.checked );
                        } }
                        required={ isRequired( 'show_email' ) }
                        errors={ getError( 'show_email' ) }
                    />
                </div>

                <Slot name={`${formKey}-after-send-email`} />
            </div>

            <PluginArea scope={ `dokan-admin-dashboard-vendor-form-${formKey}` } />
        </>
    );
}

export default Form;
