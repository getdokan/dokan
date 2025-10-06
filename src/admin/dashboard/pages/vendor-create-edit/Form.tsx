import {
    DokanButton,
    CategoryBasedCommission,
    FixedCommissionInput,
    DokanModal,
} from '@dokan/components';
import { __ } from '@wordpress/i18n';
import {
    CheckCircle,
    CircleX,
    Mail,
    Trash,
    Upload,
    Pencil,
    LoaderCircle,
} from 'lucide-react';
import {
    AsyncSearchableSelect,
    Card,
    SearchableSelect,
    SimpleCheckbox,
    SimpleInput,
    ToggleSwitch,
} from '@getdokan/dokan-ui';
import StoreImage from './StoreImage';
import VendorFormSkeleton from './VendorFormSkeleton';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import { useDispatch, useSelect } from '@wordpress/data';
import store from '@dokan/stores/vendors';
import apiFetch from '@wordpress/api-fetch';
import { twMerge } from 'tailwind-merge';
import DebouncedInput from '@src/components/DebouncedInput';
import { addQueryArgs } from '@wordpress/url';
import wpMedia from './WpMedia';
import { Slot, TabPanel } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { useEffect, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { kebabCase } from '@dokan/utilities';

interface Props {
    vendor: Vendor;
    requiredFields: Record< any, any >;
    formKey?: string;
    createForm?: boolean;
}
export default function Form( {
    vendor,
    requiredFields,
    formKey = 'dokan-create-new-vendor',
    createForm = true,
}: Props ) {
    const { setCreateOrEditVendor } = useDispatch( store );
    const errors: String[] = useSelect( ( select ) => {
        return select( store ).getCreateOrEditVendorErrors();
    }, [] );
    const [ categories, setCategories ] = useState( [] );
    const [ commissionSubCategoryConfirm, setCommissionSubCategoryConfirm ] =
        useState( false );

    const setData = async (
        key: string,
        value: any,
        existingVendor?: object
    ) => {
        const updatableVendor: Vendor = ( existingVendor as Vendor ) ?? vendor;

        // @ts-ignore
        return await setCreateOrEditVendor( {
            ...updatableVendor,
            [ key ]: value,
        } );
    };

    // @ts-ignore
    const commissionTypes: Array< Record< string, string > > = applyFilters(
        'dokan_vendor_add_edit_commission_types',
        [
            {
                label: __( 'Fixed', 'dokan-lite' ),
                value: 'fixed',
            },
            {
                label: __( 'Category Based', 'dokan-lite' ),
                value: 'category_based',
            },
        ]
    );

    const getCommission = ( type ) => {
        return commissionTypes.find( ( item ) => item.value === type );
    };

    const generatePassword = () => {
        setData( 'user_pass', makePassword() );
    };

    const isRequired = ( key ): boolean => {
        return !! requiredFields[ key ];
    };

    const getError = ( key: string ) => {
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
        // @ts-ignore
        dokanAdminDashboard.urls.siteUrl +
        // @ts-ignore
        dokanAdminDashboard.urls.storePrefix +
        '/';

    const formatStoreUrl = ( storeName ) => {
        return kebabCase( storeName );
    };
    const onChangeStoreName = ( value ) => {
        const storeUrl = formatStoreUrl( value );
        // @ts-ignore
        setCreateOrEditVendor( {
            ...vendor,
            store_name: value,
            ...( createForm ? { user_nicename: storeUrl } : {} ),
        } ).then( async ( data ) => {
            if ( createForm ) {
                await checkStore( storeUrl, data.vendor );
            }
        } );
    };

    const onChangeStoreUrl = async ( storeUrl ) => {
        storeUrl = formatStoreUrl( storeUrl );
        const data = await setCreateOrEditVendor( {
            ...vendor,
            // @ts-ignore
            user_nicename: storeUrl,
        } );
        await checkStore( storeUrl, data.vendor );
    };

    const storeUrl = () => {
        // @ts-ignore
        const printableStoreUrl = vendor?.user_nicename
            ? // @ts-ignore
              vendor?.user_nicename
            : vendor?.store_name;

        return defaultUrl + printableStoreUrl;
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

        // @ts-ignore
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

        // @ts-ignore
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

        // @ts-ignore
        await setData(
            'userEmailText',
            response.available ? 'available' : 'not-available',
            upatedVendor
        );
    };

    const getCountries = () => {
        // @ts-ignore
        const dokanCountries = window?.dokanAdminDashboard.countries;
        return Object.keys( dokanCountries ).map( ( key ) => {
            return {
                label: dokanCountries[ key ],
                value: key,
            };
        } );
    };

    const getCountry = ( code ) => {
        const dokanCountries: Record< string, string > =
            // @ts-ignore
            window?.dokanAdminDashboard.countries;

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
        // @ts-ignore
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

        // @ts-ignore
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
                    <LoaderCircle size={ 13 } className="animate-spin" />
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

    const getResetSubCategory = () => {
        return vendor && vendor.hasOwnProperty( 'reset_sub_category' )
            ? vendor?.reset_sub_category
            : true;
    };

    const General = () => {
        return (
            <>
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

                        <Slot
                            name={ `${ formKey }-after-enable-selling-permission` }
                        />

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

                        <Slot
                            name={ `${ formKey }-after-publish-product-directly-permission` }
                        />

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

                        <Slot
                            name={ `${ formKey }-after-make-vendor-featured-permission` }
                        />
                    </Card>
                </div>

                <Slot
                    name={ `${ formKey }-after-permission-information-card` }
                />

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

                            <Slot
                                name={ `${ formKey }-after-store-name-store-information` }
                            />

                            { createForm && (
                                <>
                                    <div>
                                        <DebouncedInput
                                            label={ __(
                                                'Store Url',
                                                'dokan-lite'
                                            ) }
                                            value={
                                                // @ts-ignore
                                                vendor?.user_nicename ?? ''
                                            }
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
                                            required={ isRequired(
                                                'store_url'
                                            ) }
                                            errors={ getError( 'store_url' ) }
                                        />
                                        <div className="flex justify-between mt-2">
                                            <span className="text-neutral-500">
                                                { storeUrl() }
                                            </span>
                                            { getStoreSearchText(
                                                // @ts-ignore
                                                vendor?.storeSearchText ?? ''
                                            ) }
                                        </div>
                                    </div>

                                    <Slot
                                        name={ `${ formKey }-after-store-url-store-information` }
                                    />
                                </>
                            ) }

                            <Slot name={ `${ formKey }-before-store-image` } />

                            <div>
                                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                <label
                                    htmlFor=""
                                    className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                >
                                    { __( 'Logo', 'dokan-lite' ) }
                                </label>
                                <div className="flex flex-row flex-wrap gap-6">
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
                                                        // @ts-ignore
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

                            <Slot
                                name={ `${ formKey }-after-store-logo-store-information` }
                            />

                            <div>
                                <div className="flex flex-row flex-wrap justify-between">
                                    <div className="flex flex-col">
                                        { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
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
                                                        // @ts-ignore
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

                            <Slot
                                name={ `${ formKey }-after-banner-store-information` }
                            />

                            <div className="flex flex-row gap-6">
                                <div className="w-1/2">
                                    <SimpleInput
                                        label={ __(
                                            'First Name',
                                            'dokan-lite'
                                        ) }
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

                            <Slot
                                name={ `${ formKey }-after-first-last-name-store-information` }
                            />

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
                                        // @ts-ignore
                                        vendor?.userEmailText ?? ''
                                    ) }
                                </div>
                            </div>

                            <Slot
                                name={ `${ formKey }-after-email-store-information` }
                            />

                            { createForm && (
                                <>
                                    <div>
                                        <DebouncedInput
                                            label={ __(
                                                'Username',
                                                'dokan-lite'
                                            ) }
                                            value={
                                                // @ts-ignore
                                                vendor?.user_login ?? ''
                                            }
                                            onChange={ ( value ) => {
                                                setData(
                                                    'user_login',
                                                    value
                                                ).then(
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
                                            required={ isRequired(
                                                'user_login'
                                            ) }
                                            errors={ getError( 'user_login' ) }
                                        />
                                        <div className="flex justify-between mt-2">
                                            { getStoreSearchText(
                                                // @ts-ignore
                                                vendor?.userSearchText ?? ''
                                            ) }
                                        </div>
                                    </div>

                                    <Slot
                                        name={ `${ formKey }-after-username-store-information` }
                                    />

                                    <div className="flex flex-row gap-2">
                                        <div className="w-full">
                                            <SimpleInput
                                                label={ __(
                                                    'Password',
                                                    'dokan-lite'
                                                ) }
                                                value={
                                                    // @ts-ignore
                                                    vendor?.user_pass ?? ''
                                                }
                                                onChange={ ( e ) => {
                                                    setData(
                                                        'user_pass',
                                                        e.target.value
                                                    );
                                                } }
                                                onFocus={ () => {
                                                    // @ts-ignore
                                                    // eslint-disable-next-line no-unused-expressions
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
                                                required={ isRequired(
                                                    'user_pass'
                                                ) }
                                                errors={ getError(
                                                    'user_pass'
                                                ) }
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <DokanButton
                                                variant="secondary"
                                                className={ twMerge(
                                                    '!bg-white !h-10',
                                                    getError( 'user_pass' )
                                                        .length
                                                        ? 'mb-[22px]'
                                                        : 'mb-0'
                                                ) }
                                                onClick={ generatePassword }
                                            >
                                                { __(
                                                    'Generate',
                                                    'dokan-lite'
                                                ) }
                                            </DokanButton>
                                        </div>
                                    </div>

                                    <Slot
                                        name={ `${ formKey }-after-password-store-information` }
                                    />
                                </>
                            ) }

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

                            <Slot
                                name={ `${ formKey }-after-phone-store-information` }
                            />
                        </div>
                    </Card>
                </div>

                <Slot name={ `${ formKey }-after-store-information-card` } />

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
                                            // @ts-ignore
                                            country: value.value,
                                            state: '',
                                        } );
                                    } }
                                />
                            </div>

                            <Slot
                                name={ `${ formKey }-after-country-address-information` }
                            />

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
                                                // @ts-ignore
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

                            <Slot
                                name={ `${ formKey }-after-state-address-information` }
                            />

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

                            <Slot
                                name={ `${ formKey }-after-city-address-information` }
                            />

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

                            <Slot
                                name={ `${ formKey }-after-street-1-address-information` }
                            />

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

                            <Slot
                                name={ `${ formKey }-after-street-2-address-information` }
                            />

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

                            <Slot
                                name={ `${ formKey }-after-zip-address-information` }
                            />
                        </div>
                    </Card>
                </div>

                <Slot name={ `${ formKey }-after-address-information-card` } />
            </>
        );
    };
    const Commission = () => {
        return (
            <>
                { /*Commission information section*/ }
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-bold">
                                { __( 'Commission Information', 'dokan-lite' ) }
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <div>
                                <SearchableSelect
                                    label={ __(
                                        'Admin Commission type',
                                        'dokan-lite'
                                    ) }
                                    placeholder={ __(
                                        'Select commission type',
                                        'dokan-lite'
                                    ) }
                                    // @ts-ignore
                                    value={ getCommission(
                                        vendor?.admin_commission_type
                                    ) }
                                    // @ts-ignore
                                    options={ commissionTypes }
                                    onChange={ ( data ) => {
                                        setData(
                                            'admin_commission_type',
                                            // @ts-ignore
                                            data.value
                                        );
                                    } }
                                />
                            </div>
                            { vendor?.admin_commission_type ===
                                'category_based' && (
                                    <>
                                        <div className="mb-3">
                                            <ToggleSwitch
                                                checked={ getResetSubCategory() }
                                                onChange={ () => {
                                                    setCommissionSubCategoryConfirm(
                                                        true
                                                    );
                                                } }
                                                label={ __(
                                                    'Apply Parent Category Commission to All Subcategories',
                                                    'dokan-lite'
                                                ) }
                                                helpText={ __(
                                                    "When enabled, changing a parent category's commission rate will automatically update all its subcategories. Disable this option to maintain independent commission rates for subcategories",
                                                    'dokan-lite'
                                                ) }
                                            />

                                            <DokanModal
                                                isOpen={
                                                    commissionSubCategoryConfirm
                                                }
                                                namespace="commission-sub-category-confirm"
                                                onConfirm={ () => {
                                                    setData(
                                                        'reset_sub_category',
                                                        ! getResetSubCategory()
                                                    ).then( () => {
                                                        setCommissionSubCategoryConfirm(
                                                            false
                                                        );
                                                    } );
                                                } }
                                                onClose={ () =>
                                                    setCommissionSubCategoryConfirm(
                                                        false
                                                    )
                                                }
                                                confirmationTitle={
                                                    getResetSubCategory()
                                                        ? __(
                                                            'Disable Commission Inheritance Setting?',
                                                            'dokan-lite'
                                                        )
                                                        : __(
                                                            'Enable Commission Inheritance Setting?',
                                                            'dokan-lite'
                                                        )
                                                }
                                                confirmationDescription={
                                                    getResetSubCategory()
                                                        ? __(
                                                            'Subcategories will maintain their independent commission rates when parent category rates are changed.',
                                                            'dokan-lite'
                                                        )
                                                        : __(
                                                            'Parent category commission changes will automatically update all subcategories. Existing rates will remain unchanged until parent category is modified.',
                                                            'dokan-lite'
                                                        )
                                                }
                                                confirmButtonText={
                                                    getResetSubCategory()
                                                        ? __(
                                                            'Disable',
                                                            'dokan-lite'
                                                        )
                                                        : __(
                                                            'Enable',
                                                            'dokan-lite'
                                                        )
                                                }
                                                cancelButtonText={ __(
                                                    'Cancel',
                                                    'dokan-lite'
                                                ) }
                                            />
                                        </div>
                                        <div>
                                            { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                            <label
                                                htmlFor=""
                                                className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                            >
                                                { __(
                                                    'Admin Commission',
                                                    'dokan-lite'
                                                ) }
                                            </label>
                                            <CategoryBasedCommission
                                                // @ts-ignore
                                                categories={ categories }
                                                // @ts-ignore
                                                commissionValues={
                                                    vendor?.admin_category_commission ||
                                                    []
                                                }
                                                currency={
                                                    // @ts-ignore
                                                    window?.dokanAdminDashboard
                                                        .currency
                                                }
                                                onCommissionChange={ ( data ) => {
                                                    setData(
                                                        'admin_category_commission',
                                                        data
                                                    );
                                                } }
                                                resetSubCategoryValue={ getResetSubCategory() }
                                            />
                                        </div>
                                    </>
                                ) }

                            { vendor?.admin_commission_type === 'fixed' && (
                                <div>
                                    { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                    <label
                                        htmlFor=""
                                        className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                    >
                                        { __(
                                            'Admin Commission',
                                            'dokan-lite'
                                        ) }
                                    </label>
                                    <div className="-ml-4 -mt-4">
                                        <FixedCommissionInput
                                            values={ {
                                                // @ts-ignore
                                                admin_percentage:
                                                    vendor?.admin_commission ||
                                                    '',
                                                // @ts-ignore
                                                additional_fee:
                                                    vendor?.admin_additional_fee ||
                                                    '',
                                            } }
                                            currency={
                                                // @ts-ignore
                                                window?.dokanAdminDashboard
                                                    .currency
                                            }
                                            onValueChange={ ( data ) => {
                                                setCreateOrEditVendor( {
                                                    ...vendor,
                                                    // @ts-ignore
                                                    admin_commission:
                                                    data?.admin_percentage,
                                                    // @ts-ignore
                                                    admin_additional_fee:
                                                    data?.additional_fee,
                                                } );
                                            } }
                                        />
                                    </div>
                                </div>
                            ) }
                        </div>
                    </Card>
                </div>

                <Slot
                    name={ `${ formKey }-after-commission-information-card` }
                />
            </>
        );
    };
    const SocialOptions = () => {
        return (
            <>
                { /*Social information section*/ }
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-bold">
                                { __( 'Social Information', 'dokan-lite' ) }
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <div>
                                <SimpleInput
                                    label={ __( 'Facebook', 'dokan-lite' ) }
                                    value={ vendor?.social?.fb || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            fb: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'fb',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-fb-social-information" />

                            <div>
                                <SimpleInput
                                    label={ __( 'X', 'dokan-lite' ) }
                                    value={ vendor?.social?.twitter || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            twitter: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'twitter',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-x-social-information" />

                            <div>
                                <SimpleInput
                                    label={ __( 'Pinterest', 'dokan-lite' ) }
                                    value={ vendor?.social?.pinterest || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            pinterest: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'pinterest',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-pinterest-social-information" />

                            <div>
                                <SimpleInput
                                    label={ __( 'Linkedin', 'dokan-lite' ) }
                                    value={ vendor?.social?.linkedin || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            linkedin: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'linkedin',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-pinterest-social-information" />

                            <div>
                                <SimpleInput
                                    label={ __( 'Youtube', 'dokan-lite' ) }
                                    value={ vendor?.social?.youtube || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            youtube: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'youtube',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-youtube-social-information" />

                            <div>
                                <SimpleInput
                                    label={ __( 'Instagram', 'dokan-lite' ) }
                                    value={ vendor?.social?.instagram || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            instagram: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'instagram',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-instagram-social-information" />
                            <div>
                                <SimpleInput
                                    label={ __( 'Flickr', 'dokan-lite' ) }
                                    value={ vendor?.social?.flickr || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            flickr: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'flickr',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-flickr-social-information" />
                            <div>
                                <SimpleInput
                                    label={ __( 'Threads', 'dokan-lite' ) }
                                    value={ vendor?.social?.threads || '' }
                                    onChange={ ( e ) => {
                                        setData( 'social', {
                                            ...vendor?.social,
                                            threads: e.target.value,
                                        } );
                                    } }
                                    input={ {
                                        placeholder: __(
                                            'https://example.com',
                                            'dokan-lite'
                                        ),
                                        id: 'threads',
                                        type: 'text',
                                    } }
                                />
                            </div>

                            <Slot name="dokan-vendor-edit-after-threads-social-information" />
                        </div>
                    </Card>
                </div>
            </>
        );
    };

    const tabsData = applyFilters( `dokan-vendor-form-data-tabs-${ formKey }`, [
        {
            name: 'general',
            title: __( 'General', 'dokan-lite' ),
            className:
                'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300',
            component: General,
        },
        {
            name: 'commission',
            title: __( 'Commission', 'dokan-lite' ),
            className:
                'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300',
            component: Commission,
        },
        {
            name: 'social-options',
            title: __( 'Social Options', 'dokan-lite' ),
            className:
                'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300',
            component: SocialOptions,
        },
    ] );
    const [ tabQueryParam, setTabQueryParam ] = useState( 'general' );

    const onTabChange = ( tabName ) => {
        setTabQueryParam( tabName );
    };

    useEffect( () => {
        apiFetch( { path: 'dokan/v2/products/multistep-categories' } ).then(
            ( response: Record< string, unknown > ) => {
                if ( response && typeof response === 'object' ) {
                    setCategories( Object.values( response ) );
                }
            }
        );
    }, [] );

    if ( ! vendor || Object.keys( vendor ).length === 0 ) {
        return <VendorFormSkeleton />;
    }

    return (
        <>
            <div className="flex flex-col">
                <TabPanel
                    className="dokan-tab-panel text-gray-500 hover:text-gray-700 *:first:border-gray-200 *:first:*:border-transparent *:[&:not(:last-child)]:*:border-b-2 focus:*:[&:not(:last-child)]:*:outline-transparent"
                    activeClass="!text-dokan-primary !border-dokan-btn !border-b-2 dokan-active-tab"
                    tabs={ tabsData }
                    initialTabName={ tabQueryParam }
                    onSelect={ onTabChange }
                >
                    { ( tab ) => <div className="mt-5"><tab.component/></div> }
                </TabPanel>

                { createForm && (
                    <>
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
                                // @ts-ignore
                                errors={ getError( 'show_email' ) }
                            />
                        </div>

                        <Slot name={ `${ formKey }-after-send-email` } />
                    </>
                ) }
            </div>

            <PluginArea
                scope={ `dokan-admin-dashboard-vendor-form-${ formKey }` }
            />
        </>
    );
}
