import {
    useCallback,
    useMemo,
    useState,
    useEffect,
    useRef,
} from '@wordpress/element';
import { useDispatch, useSelect, select as dataSelect } from '@wordpress/data';
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

    // Sequence counters so a slow availability response cannot overwrite a newer one.
    const storeCheckSeq = useRef( 0 );
    const usernameCheckSeq = useRef( 0 );
    const emailCheckSeq = useRef( 0 );

    // A flushed-on-unmount input must not start or finish a check after the form is gone.
    const isMounted = useRef( true );
    useEffect( () => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, [] );

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

    // Always read the live store value, never a render-time snapshot.
    const getLatestVendor = useCallback( (): Vendor => {
        // @ts-ignore
        return dataSelect( store ).getCreateOrEditVendor() ?? {};
    }, [] );

    // Merge a partial update into the latest vendor so concurrent writes never clobber each other.
    const updateVendor = useCallback(
        ( partial: Record< string, any > ) => {
            // @ts-ignore
            return setCreateOrEditVendor( {
                ...getLatestVendor(),
                ...partial,
            } );
        },
        [ getLatestVendor, setCreateOrEditVendor ]
    );

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

    // Set vendor data. existingVendor is deprecated and ignored: snapshots overwrote concurrent edits.
    const setData = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ( key: string, value: any, existingVendor?: object ) => {
            // Clear error for this field when value changes
            clearFieldError( key );

            return await updateVendor( { [ key ]: value } );
        },
        [ updateVendor, clearFieldError ]
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
        async ( storeName: string ) => {
            if ( ! storeName || ! isMounted.current ) {
                return;
            }

            const seq = ++storeCheckSeq.current;
            await updateVendor( { storeSearchText: 'searching' } );

            const response = await apiFetch( {
                path: addQueryArgs( 'dokan/v1/stores/check', {
                    store_slug: storeName,
                } ),
            } );

            if ( ! isMounted.current || seq !== storeCheckSeq.current ) {
                return;
            }

            await updateVendor( {
                // @ts-ignore
                storeSearchText: response.available
                    ? 'available'
                    : 'not-available',
            } );
        },
        [ updateVendor ]
    );

    // Search username availability
    const searchUsername = useCallback(
        async ( userName: string ) => {
            if ( ! userName || ! isMounted.current ) {
                return;
            }

            const seq = ++usernameCheckSeq.current;
            await updateVendor( { userSearchText: 'searching' } );

            const response = await apiFetch( {
                path: addQueryArgs( 'dokan/v1/stores/check', {
                    username: userName,
                } ),
            } );

            if ( ! isMounted.current || seq !== usernameCheckSeq.current ) {
                return;
            }

            await updateVendor( {
                // @ts-ignore
                userSearchText: response.available
                    ? 'available'
                    : 'not-available',
            } );
        },
        [ updateVendor ]
    );

    // Search email availability
    const searchEmail = useCallback(
        async ( userEmail: string ) => {
            if ( ! userEmail || ! isMounted.current ) {
                return;
            }

            const seq = ++emailCheckSeq.current;
            await updateVendor( { userEmailText: 'searching' } );

            const response = await apiFetch( {
                path: addQueryArgs( 'dokan/v1/stores/check', {
                    email: userEmail,
                } ),
            } );

            if ( ! isMounted.current || seq !== emailCheckSeq.current ) {
                return;
            }

            await updateVendor( {
                // @ts-ignore
                userEmailText: response.available
                    ? 'available'
                    : 'not-available',
            } );
        },
        [ updateVendor ]
    );

    // Handle store name change
    const onChangeStoreName = useCallback(
        async ( value: string, createForm: boolean ) => {
            // Clear errors for store_name and store_url when changing
            clearFieldError( 'store_name' );
            if ( createForm ) {
                clearFieldError( 'store_url' );
            }

            const storeUrl = formatStoreUrl( value );
            await updateVendor( {
                store_name: value,
                ...( createForm ? { user_nicename: storeUrl } : {} ),
            } );

            if ( createForm ) {
                await checkStore( storeUrl );
            }
        },
        [ updateVendor, checkStore, clearFieldError ]
    );

    // Handle store URL change
    const onChangeStoreUrl = useCallback(
        async ( storeUrl: string ) => {
            // Clear error for store_url when changing
            clearFieldError( 'store_url' );

            storeUrl = formatStoreUrl( storeUrl );
            await updateVendor( { user_nicename: storeUrl } );
            await checkStore( storeUrl );
        },
        [ updateVendor, checkStore, clearFieldError ]
    );

    // Set logo
    const setLogo = useCallback(
        ( logo: any ) => {
            updateVendor( {
                gravatar: logo?.url,
                gravatar_id: logo?.id,
            } );
        },
        [ updateVendor ]
    );

    // Set banner
    const setBanner = useCallback(
        ( banner: any ) => {
            updateVendor( {
                banner: banner?.url,
                banner_id: banner?.id,
            } );
        },
        [ updateVendor ]
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
