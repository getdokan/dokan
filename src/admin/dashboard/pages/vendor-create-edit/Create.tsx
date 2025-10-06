import Form from './Form';
import { useDispatch, useSelect } from '@wordpress/data';
import store from '../../../../stores/vendors';
import { useEffect, useState } from '@wordpress/element';
import { useToast, Card } from '@getdokan/dokan-ui';
import { DokanButton, DokanLink } from '@dokan/components';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { ChevronLeft } from 'lucide-react';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import {
    requestCreateVendor,
    validateForm,
} from '@src/admin/dashboard/pages/vendor-create-edit/Utils';
import { config } from './vendor-config';

function Create( props: any ) {
    const [ saving, setSaving ] = useState( false );
    const { navigate } = props;
    const initialData = {
        store_name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        show_email: true,
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
        enabled: true,
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
    ) as Record< string, string >;

    const addVendor = async () => {
        const validatedErrors = await validateForm( vendor, requiredFields );
        await setCreateOrEditVendorErrors( validatedErrors );
        const shouldSubmit = applyFilters(
            'dokan-should-submit-vendor-form',
            true,
            validatedErrors,
            requestCreateVendor
        );

        if ( validatedErrors.length > 0 || ! shouldSubmit ) {
            return;
        }

        setSaving( true );
        requestCreateVendor( vendor )
            .then( async ( response: Vendor ) => {
                await setCreateOrEditVendor( response );
                await setCreateOrEditVendorErrors( [] );
                setSaving( false );
                toast( {
                    type: 'success',
                    title: __( 'Vendor Added Successfully.', 'dokan-lite' ),
                } );

                navigate( `/vendors/edit/${ response?.id }` );
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
        // @ts-ignore
        setCreateOrEditVendor( initialData );
    }, [] );

    return (
        <Card className="p-6 border-none">
            <div>
                { /*Back to vendors list*/ }
                <div>
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
                <div className="flex flex-row">
                    <div className="sm:w-full md:w-1/2">
                        <h1>{ __( 'Add New Vendor', 'dokan-lite' ) }</h1>
                    </div>
                    <div className="sm:w-full md:w-1/2 flex flex-row justify-end gap-3">
                        <DokanButton
                            variant="secondary"
                            onClick={ () =>
                                ( window.location.href = config.dokanVendorsListUrl )
                            }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </DokanButton>
                        <DokanButton
                            onClick={ addVendor }
                            loading={ saving }
                            disabled={ saving }
                            label={ __( 'Add Vendor', 'dokan-lite' ) }
                        />
                    </div>
                </div>
            </div>

            <Form vendor={ vendor } requiredFields={ requiredFields } />
        </Card>
    );
}

export default Create;
