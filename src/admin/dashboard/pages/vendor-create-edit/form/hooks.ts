import { useCallback, useMemo, useState, useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';
import store from '@dokan/stores/vendors';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import { makePassword, formatStoreUrl, getCountries } from './utils';
import { CommissionType } from './types';
import { __ } from '@wordpress/i18n';

/**
 * Main hook for form state and handlers
 * @param vendor
 * @param requiredFields
 */
export const useVendorForm = (
    vendor: Vendor,
    requiredFields: Record< any, any >
) => {
    const { setCreateOrEditVendor, setCreateOrEditVendorErrors } =
        useDispatch( store );
    const errors: String[] = useSelect( ( select ) => {
        return select( store ).getCreateOrEditVendorErrors();
    }, [] );

    const [ categories, setCategories ] = useState( {} );
    const [ commissionSubCategoryConfirm, setCommissionSubCategoryConfirm ] =
        useState( false );

    // Load categories
    useEffect( () => {
        apiFetch( { path: 'dokan/v2/products/multistep-categories' } ).then(
            ( response: Record< string, unknown > ) => {
                if ( response && typeof response === 'object' ) {
                    setCategories( response );
                }
            }
        );
    }, [] );

    // Clear error for a specific field
    const clearFieldError = useCallback(
        ( fieldKey: string ) => {
            if ( errors && errors.includes( fieldKey ) ) {
                const updatedErrors = errors.filter(
                    ( error ) => error !== fieldKey
                );
                setCreateOrEditVendorErrors( updatedErrors );
            }
        },
        [ errors, setCreateOrEditVendorErrors ]
    );

    // Set vendor data
    const setData = useCallback(
        async ( key: string, value: any, existingVendor?: object ) => {
            // Clear error for this field when value changes
            clearFieldError( key );

            const updatableVendor: Vendor =
                ( existingVendor as Vendor ) ?? vendor;

            // @ts-ignore
            return await setCreateOrEditVendor( {
                ...updatableVendor,
                [ key ]: value,
            } );
        },
        [ vendor, setCreateOrEditVendor, clearFieldError ]
    );

    // Check if field is required
    const isRequired = useCallback(
        ( key: string ): boolean => {
            return !! requiredFields[ key ];
        },
        [ requiredFields ]
    );

    // Get error message for field
    const getError = useCallback(
        ( key: string ) => {
            if ( errors && errors.includes( key ) && isRequired( key ) ) {
                return requiredFields[ key ];
            }
            return '';
        },
        [ errors, isRequired, requiredFields ]
    );

    // Generate password
    const generatePassword = useCallback( () => {
        setData( 'user_pass', makePassword() );
    }, [ setData ] );

    // Check store availability
    const checkStore = useCallback(
        async ( storeName: string, updatedData: any = null ) => {
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
                await setData(
                    'storeSearchText',
                    'not-available',
                    updatedData
                );
            }
        },
        [ setData ]
    );

    // Search username availability
    const searchUsername = useCallback(
        async ( userName: string, updatedVendor: any ) => {
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
                await setData(
                    'userSearchText',
                    'not-available',
                    updatedVendor
                );
            }
        },
        [ setData ]
    );

    // Search email availability
    const searchEmail = useCallback(
        async ( userEmail: string, updatedVendor: any ) => {
            if ( ! userEmail ) {
                return;
            }

            await setData( 'userEmailText', 'searching', updatedVendor );

            const response = await apiFetch( {
                path: addQueryArgs( 'dokan/v1/stores/check', {
                    email: userEmail,
                } ),
            } );

            // @ts-ignore
            await setData(
                'userEmailText',
                response.available ? 'available' : 'not-available',
                updatedVendor
            );
        },
        [ setData ]
    );

    // Handle store name change
    const onChangeStoreName = useCallback(
        ( value: string, createForm: boolean ) => {
            // Clear errors for store_name and store_url when changing
            clearFieldError( 'store_name' );
            if ( createForm ) {
                clearFieldError( 'store_url' );
            }

            const storeUrl = formatStoreUrl( value );
            // @ts-ignore
            setCreateOrEditVendor( {
                ...vendor,
                store_name: value,
                ...( createForm ? { user_nicename: storeUrl } : {} ),
            } ).then( async ( data: any ) => {
                if ( createForm ) {
                    await checkStore( storeUrl, data.vendor );
                }
            } );
        },
        [ vendor, setCreateOrEditVendor, checkStore, clearFieldError ]
    );

    // Handle store URL change
    const onChangeStoreUrl = useCallback(
        async ( storeUrl: string ) => {
            // Clear error for store_url when changing
            clearFieldError( 'store_url' );

            storeUrl = formatStoreUrl( storeUrl );
            const data = await setCreateOrEditVendor( {
                ...vendor,
                // @ts-ignore
                user_nicename: storeUrl,
            } );
            await checkStore( storeUrl, data.vendor );
        },
        [ vendor, setCreateOrEditVendor, checkStore, clearFieldError ]
    );

    // Set logo
    const setLogo = useCallback(
        ( logo: any ) => {
            setCreateOrEditVendor( {
                ...vendor,
                gravatar: logo?.url,
                gravatar_id: logo?.id,
            } );
        },
        [ vendor, setCreateOrEditVendor ]
    );

    // Set banner
    const setBanner = useCallback(
        ( banner: any ) => {
            setCreateOrEditVendor( {
                ...vendor,
                banner: banner?.url,
                banner_id: banner?.id,
            } );
        },
        [ vendor, setCreateOrEditVendor ]
    );

    // Get reset sub category value
    const getResetSubCategory = useCallback( () => {
        return vendor && vendor.hasOwnProperty( 'reset_sub_category' )
            ? vendor?.reset_sub_category
            : true;
    }, [ vendor ] );

    // Commission types
    const commissionTypes: CommissionType[] = useMemo(
        // @ts-ignore
        () =>
            applyFilters( 'dokan_vendor_add_edit_commission_types', [
                {
                    label: __( 'Fixed', 'dokan-lite' ),
                    value: 'fixed',
                },
                {
                    label: __( 'Category Based', 'dokan-lite' ),
                    value: 'category_based',
                },
            ] ),
        []
    );

    // Get commission type by value
    const getCommission = useCallback(
        ( type: string ) => {
            return commissionTypes.find( ( item ) => item.value === type );
        },
        [ commissionTypes ]
    );

    // Get countries
    const countries = useMemo( () => getCountries(), [] );

    return {
        vendor,
        errors,
        categories,
        setCategories,
        commissionSubCategoryConfirm,
        setCommissionSubCategoryConfirm,
        setData,
        clearFieldError,
        isRequired,
        getError,
        generatePassword,
        checkStore,
        searchUsername,
        searchEmail,
        onChangeStoreName,
        onChangeStoreUrl,
        setLogo,
        setBanner,
        getResetSubCategory,
        commissionTypes,
        getCommission,
        countries,
        setCreateOrEditVendor,
    };
};
