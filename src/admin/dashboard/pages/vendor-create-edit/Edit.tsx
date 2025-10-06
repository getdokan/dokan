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
import {
    requestEditVendor,
    validateForm,
} from '@src/admin/dashboard/pages/vendor-create-edit/Utils';
import { config } from './vendor-config';

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
    ) as Record< string, string >;

    const updateVendor = async () => {
        const validatedErrors = await validateForm( vendor, requiredFields );
        await setCreateOrEditVendorErrors( validatedErrors );
        const shouldSubmit = applyFilters(
            'dokan-should-submit-vendor-edit-form',
            true,
            validatedErrors,
            requestEditVendor
        );

        if ( validatedErrors.length > 0 || ! shouldSubmit ) {
            return;
        }

        if ( ! vendor?.id ) {
            toast( {
                type: 'error',
                title: __(
                    'Vendor not loaded yet. Please wait and try again.',
                    'dokan-lite'
                ),
            } );
            return;
        }

        setSaving( true );

        try {
            const response: Vendor = await requestEditVendor( vendor );
            await setCreateOrEditVendor( response );
            await setCreateOrEditVendorErrors( [] );
            toast( {
                type: 'success',
                title: __( 'Vendor Updated Successfully.', 'dokan-lite' ),
            } );
        } catch ( err: any ) {
            toast( {
                type: 'error',
                title:
                    err?.message ||
                    __( 'Failed to update vendor.', 'dokan-lite' ),
            } );
        } finally {
            setSaving( false );
        }
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
        <Card className="p-6 border-none">
            <div>
                { /*Back to vendors list*/ }
                <div className="flex flex-row justify-start">
                    <DokanLink
                        href={
                            // @ts-ignore
                            `${ dokanAdminDashboard.urls.adminRoot }admin.php?page=dokan#/vendors`
                        }
                        className="flex flex-row w-auto items-center gap-1 !text-neutral-500 hover:!underline"
                    >
                        <ChevronLeft size="15" />
                        <span>{ __( 'Vendors', 'dokan-lite' ) }</span>
                    </DokanLink>
                </div>

                { /*Add new vendor header*/ }
                <div className="gap-4 flex flex-col md:!flex-row md:!justify-between">
                    <div className="">
                        <h1>{ __( 'Update Vendor', 'dokan-lite' ) }</h1>
                    </div>
                    <div className="flex flex-col md:!flex-row gap-3">
                        <DokanButton
                            variant="secondary"
                            onClick={ () =>
                                // @ts-ignore
                                ( window.location.href =
                                    config.dokanVendorsListUrl )
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
