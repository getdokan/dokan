import Form from './Form';
import { useDispatch, useSelect } from '@wordpress/data';
import store from '../../../../stores/vendors';
import { useEffect } from '@wordpress/element';
import {
    AsyncSearchableSelect,
    Card,
    SimpleCheckbox,
    SimpleInput,
    ToggleSwitch,
    useToast,
} from '@getdokan/dokan-ui';
import { DokanButton, DokanLink } from '@dokan/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';
import {
    CheckCircle,
    ChevronLeft,
    CircleX,
    Mail,
    Trash,
    Upload,
    Pencil,
} from 'lucide-react';

function Create() {
    const initialData = {
        store_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        show_email: false,
        address: {
            street_1: '',
            street_2: '',
            city: '',
            zip: '',
            country: '',
            state: '',
            location_name: '',
        },
        banner: '',
        banner_id: '',
        gravatar: '',
        gravatar_id: '',
        shop_url: '',
        toc_enabled: false,
        featured: false,
        enabled: false,
        trusted: false,
    };

    const { setCreateOrEditVendor, setCreateOrEditVendorErrors } =
        useDispatch( store );
    const toast = useToast();

    const vendor = useSelect( ( select ) => {
        return select( store ).getCreateOrEditVendor();
    }, [] );

    const requiredFields: Record< string, string > = applyFilters(
        'dokan-create-vendor-required-fields',
        {
            email: __( 'Email is required', 'dokan-lite' ),
            store_name: __( 'Store Name is required', 'dokan-lite' ),
            user_login: __( 'Username is required', 'dokan-lite' ),
            user_pass: __( 'Password is required', 'dokan-lite' ),
        }
    );

    const validateForm = async ( checkVendor ) => {
        const errors: string[] = [];

        Object.keys( requiredFields ).forEach( ( key ) => {
            if ( ! checkVendor[ key ] && requiredFields[ key ] ) {
                errors.push( key );
            }
        } );

        await setCreateOrEditVendorErrors( errors );
        return errors;
    };

    const sendRequest = async () => {
        try {
            const response = await apiFetch( {
                path: '/dokan/v1/stores/',
                method: 'POST',
                data: vendor,
            } );
            // Handle success (e.g., show notification, redirect)
            return response;
        } catch ( error ) {
            // Handle error (e.g., show error message)
            throw error;
        }
    };

    const addVendor = async () => {
        const validatedErrors = await validateForm( vendor );
        const shouldSubmit = applyFilters(
            'dokan-should-submit-vendor-form',
            true,
            validatedErrors,
            sendRequest
        );

        if ( validatedErrors.length > 0 || ! shouldSubmit ) {
            return;
        }

        sendRequest()
            .then( async ( response ) => {
                await setCreateOrEditVendor( initialData );
                await setCreateOrEditVendorErrors( [] );
                toast( {
                    type: 'success',
                    title: __( 'Vendor Added Successfully.', 'dokan-lite' ),
                } );
            } )
            .catch( async ( err ) => {
                if ( err.message ) {
                    toast( {
                        type: 'error',
                        title: err.message,
                    } );
                }
            } );
    };

    useEffect( () => {
        // @ts-ignore
        setCreateOrEditVendor( initialData );
    }, [] );

    return (
        <Card className="bg-white p-6">
            <div>
                { /*Back to vendors list*/ }
                <div>
                    <DokanLink
                        href=""
                        className="flex flex-row w-auto items-center gap-1 !text-neutral-500 hover:!underline"
                    >
                        <ChevronLeft size="15" />
                        <span>{ __( 'Vendors', 'dokan-lite' ) }</span>
                    </DokanLink>
                </div>

                { /*Add new vendor header*/ }
                <div className="flex flex-row">
                    <div className="sm:w-full md:w-1/2">
                        <h1>{ __( 'Add New Vendor', 'dokan-lite' ) }</h1>
                    </div>
                    <div className="sm:w-full md:w-1/2 flex flex-row justify-end gap-3">
                        <DokanButton variant="secondary">
                            { __( 'Cancel', 'dokan-lite' ) }
                        </DokanButton>
                        <DokanButton onClick={ addVendor }>
                            { __( 'Add Vendor', 'dokan-lite' ) }
                        </DokanButton>
                    </div>
                </div>
            </div>

            <Form vendor={ vendor } requiredFields={ requiredFields } />
        </Card>
    );
}

export default Create;
