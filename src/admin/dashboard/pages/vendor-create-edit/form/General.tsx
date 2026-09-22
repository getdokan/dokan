import { __ } from '@wordpress/i18n';
import { Mail, Trash, Upload, Pencil } from 'lucide-react';
import { Card, SimpleInput, ToggleSwitch } from '@getdokan/dokan-ui';
import { DokanButton } from '@dokan/components';
import StoreImage from '../StoreImage';
import DebouncedInput from '@src/components/DebouncedInput';
import wpMedia from '../WpMedia';
import { Slot } from '@wordpress/components';
import { Select } from '@src/components';
import { twMerge } from 'tailwind-merge';
import { SectionProps } from './types';
import {
    getCountry,
    getStatesFromCountryCode,
    getStateFromStateCode,
    getStoreSearchText,
    getDefaultStoreUrl,
} from './utils';

interface GeneralProps extends SectionProps {
    onChangeStoreName: ( value: string, createForm: boolean ) => void;
    onChangeStoreUrl: ( value: string ) => void;
    setLogo: ( logo: any ) => void;
    setBanner: ( banner: any ) => void;
    searchEmail: ( email: string, vendor: any ) => void;
    searchUsername: ( username: string, vendor: any ) => void;
    generatePassword: () => void;
    setCreateOrEditVendor: ( vendor: any ) => void;
    countries: Array< { label: string; value: string } >;
}

export const General = ( {
    vendor,
    formKey,
    createForm,
    isRequired,
    getError,
    setData,
    onChangeStoreName,
    onChangeStoreUrl,
    setLogo,
    setBanner,
    searchEmail,
    searchUsername,
    generatePassword,
    setCreateOrEditVendor,
    countries,
}: GeneralProps ) => {
    const defaultUrl = getDefaultStoreUrl();

    const storeUrl = () => {
        // @ts-ignore
        const printableStoreUrl = vendor?.user_nicename
            ? // @ts-ignore
              vendor?.user_nicename
            : vendor?.store_name;

        return defaultUrl + printableStoreUrl;
    };

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
                                { __( 'Make Vendor Featured', 'dokan-lite' ) }
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

            <Slot name={ `${ formKey }-after-permission-information-card` } />

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
                                    onChangeStoreName( value, createForm );
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
                                delay={ 500 }
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
                                        required={ isRequired( 'store_url' ) }
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
                                                ? __( 'Change', 'dokan-lite' )
                                                : __( 'Upload', 'dokan-lite' ) }
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
                                                    banner_id: 0,
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
                                        alt={ __( 'No Image', 'dokan-lite' ) }
                                    />
                                ) : (
                                    <DokanButton
                                        variant="secondary"
                                        size="sm"
                                        className="h-8"
                                        onClick={ () => wpMedia( setBanner ) }
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
                                    label={ __( 'First Name', 'dokan-lite' ) }
                                    value={ vendor?.first_name ?? '' }
                                    onChange={ ( e ) => {
                                        setData( 'first_name', e.target.value );
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
                                    label={ __( 'Last Name', 'dokan-lite' ) }
                                    value={ vendor?.last_name ?? '' }
                                    onChange={ ( e ) => {
                                        setData( 'last_name', e.target.value );
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
                                delay={ 500 }
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
                                        label={ __( 'Username', 'dokan-lite' ) }
                                        value={
                                            // @ts-ignore
                                            vendor?.user_login ?? ''
                                        }
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
                            <Select
                                label={ __( 'Country', 'dokan-lite' ) }
                                placeholder={ __(
                                    'Select country',
                                    'dokan-lite'
                                ) }
                                isMulti={ false }
                                required={ isRequired( 'country' ) }
                                errors={ getError( 'country' ) }
                                options={ countries }
                                value={ getCountry( vendor?.address?.country ) }
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
                                <Select
                                    label={ __( 'State', 'dokan-lite' ) }
                                    placeholder={ __(
                                        'Select state',
                                        'dokan-lite'
                                    ) }
                                    required={ isRequired( 'state' ) }
                                    errors={ getError( 'state' ) }
                                    options={ getStatesFromCountryCode(
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
                                label={ __( 'Address Line 1', 'dokan-lite' ) }
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
                                label={ __( 'Address Line 2', 'dokan-lite' ) }
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
