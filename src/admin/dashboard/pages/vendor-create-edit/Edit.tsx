import Form from './Form';
import { useDispatch, useSelect } from '@wordpress/data';
import store from '../../../../stores/vendors';
import { useEffect, useState } from '@wordpress/element';
import { useToast, Card } from '@getdokan/dokan-ui';
import { DokanButton, DokanLink } from '@dokan/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';
import { ChevronLeft } from 'lucide-react';
import { addQueryArgs } from '@wordpress/url';
import { Vendor } from '@dokan/definitions/dokan-vendors';

function Edit( props ) {
    const { params } = props;
    const { id } = params;
    const { setCreateOrEditVendor, setCreateOrEditVendorErrors } =
        useDispatch( store );
    const toast = useToast();
    const [ saving, setSaving ] = useState( false );

    const vendor = useSelect( ( select ) => {
        return select( store ).getCreateOrEditVendor();
    }, [] );

    const requiredFields: Record< string, string > = applyFilters(
        'dokan-edit-vendor-required-fields',
        {
            email: __( 'Email is required', 'dokan-lite' ),
            store_name: __( 'Store Name is required', 'dokan-lite' ),
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
                path: `/dokan/v1/stores/${ vendor?.id }`,
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

    const updateVendor = async () => {
        const validatedErrors = await validateForm( vendor );
        const shouldSubmit = applyFilters(
            'dokan-should-submit-vendor-edit-form',
            true,
            validatedErrors,
            sendRequest
        );

        if ( validatedErrors.length > 0 || ! shouldSubmit ) {
            return;
        }

        setSaving( true );

        sendRequest()
            .then( async ( response: Vendor ) => {
                await setCreateOrEditVendor( response );
                await setCreateOrEditVendorErrors( [] );
                toast( {
                    type: 'success',
                    title: __( 'Vendor Added Successfully.', 'dokan-lite' ),
                } );

                setSaving( false );
            } )
            .catch( async ( err ) => {
                if ( err.message ) {
                    toast( {
                        type: 'error',
                        title: err.message,
                    } );
                }
                setSaving( false );
            } );
    };

    useEffect( () => {
        setCreateOrEditVendor( {} as Vendor );
        setCreateOrEditVendorErrors( [] );

        apiFetch( {
            path: addQueryArgs( `dokan/v1/stores/${ id }`, {} ),
        } ).then( async ( response: Vendor ) => {
            await setCreateOrEditVendor( response );
        } );
    }, [ id ] );

    return (
        <Card className="bg-white p-6">
            <div>
                { /*Back to vendors list*/ }
                <div>
                    <DokanLink
                        href={ `${ dokanAdminDashboard.urls.adminRoot }admin.php?page=dokan#/vendors` }
                        className="flex flex-row w-auto items-center gap-1 !text-neutral-500 hover:!underline"
                    >
                        <ChevronLeft size="15" />
                        <span>{ __( 'Vendors', 'dokan-lite' ) }</span>
                    </DokanLink>
                </div>

                { /*Add new vendor header*/ }
                <div className="flex flex-row">
                    <div className="sm:w-full md:w-1/2">
                        <h1>{ __( 'Update Vendor', 'dokan-lite' ) }</h1>
                    </div>
                    <div className="sm:w-full md:w-1/2 flex flex-row justify-end gap-3">
                        <DokanButton
                            variant="secondary"
                            onClick={ () =>
                                ( window.location.href = `${ dokanAdminDashboard.urls.adminRoot }admin.php?page=dokan#/vendors` )
                            }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </DokanButton>
                        <DokanButton
                            onClick={ updateVendor }
                            loading={ saving }
                            disabled={ saving }
                            label={ __( 'Update', 'dokan-lite' ) }
                        />
                    </div>
                </div>
            </div>

            <Form
                vendor={ vendor }
                requiredFields={ requiredFields }
                formKey="dokan-edit-vendor"
                createForm={ false }
            />
        </Card>
    );
}

export default Edit;
