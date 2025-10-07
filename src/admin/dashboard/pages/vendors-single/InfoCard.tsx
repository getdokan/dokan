import { PaymentDetails, Vendor } from '@dokan/definitions/dokan-vendors';
import { __ } from "@wordpress/i18n";
import { DateTimeHtml } from '../../../../components';
import { humanTimeDiff } from '@wordpress/date';
import SocialLinks from './SocialLinks';
import { Slot } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { CircleCheck, Clock, Mail, Phone } from "lucide-react";
import { truncate } from "@dokan/utilities";
import { DokanTooltip as Tooltip } from '@dokan/components';

export interface InfoCardProps {
    vendor: Vendor;
}

export const paymentMethods = ( methods: PaymentDetails ) => {
    if ( ! methods ) {
        return [];
    }

    let methodNames = [
        { key: 'paypal', name: __( 'PayPal', 'dokan-lite' ) },
        { key: 'bank', name: __( 'Bank Transfer', 'dokan-lite' ) },
        { key: 'skrill', name: __( 'Skrill', 'dokan-lite' ) },
        { key: 'dokan_custom', name: __( 'Dokan Custom', 'dokan-lite' ) },
        { key: 'dokan_razorpay', name: __( 'Dokan Razorpay', 'dokan-lite' ) },
        { key: 'stripe_express', name: __( 'Stripe Express', 'dokan-lite' ) },
        {
            key: 'dokan-moip-connect',
            name: __( 'Dokan Moip Connect', 'dokan-lite' ),
        },
    ];

    // @ts-ignore
    methodNames = wp.hooks.applyFilters(
        'dokan_admin_dashboard_payment_gateways_names',
        methodNames
    ) as { key: string; name: string }[];

    return methodNames.map( ( method ) => {
        const value = methods[ method.key ];
        let isActive = false;
        let name = method.name;

        switch ( method.key ) {
            case 'paypal':
            case 'skrill':
                isActive = !! ( value && value.email );
                break;
            case 'bank':
                isActive = !! ( value && value.ac_name && value.ac_number );
                break;
            case 'dokan_custom':
                isActive = !! ( value && value.withdraw_method_name );
                if ( isActive && value?.withdraw_method_name ) {
                    name = value.withdraw_method_name;
                }
                break;
            case 'dokan_razorpay':
            case 'stripe_express':
            case 'dokan-moip-connect':
                isActive = !! value;
                break;
            default:
                break;
        }

        let mappedMethod = {
            key: method.key,
            name,
            isActive,
        };
        // @ts-ignore
        mappedMethod = wp.hooks.applyFilters(
            'dokan_admin_dashboard_payment_gateways_value_map',
            mappedMethod,
            method
        ) as { key: string; name: string; isActive: boolean };

        return mappedMethod;
    } );
};

const InfoCard = ( { vendor }: InfoCardProps ) => {
    return (
        <div className="w-full h-fit md:!w-[300px] flex flex-col gap-2 p-6 bg-white rounded shadow-md">
            <PluginArea scope="dokan-admin-dashboard-vendors-single" />
            <Slot
                name={ `dokan-admin-vendor-before-info-contents` }
                fillProps={ { vendor } }
            />

            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Registered Since:', 'dokan-lite' ) }
                </h4>
                <div className="text-neutral-700 text-sm font-normal flex items-center gap-1">
                    <DateTimeHtml.Date date={ vendor.registered } />
                    <Tooltip
                        content={ humanTimeDiff(
                            vendor.registered,
                            new Date()
                        ) }
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.57617 13.1992C10.6828 13.1992 13.2012 10.6808 13.2012 7.57422C13.2012 4.46762 10.6828 1.94922 7.57617 1.94922C4.46957 1.94922 1.95117 4.46762 1.95117 7.57422C1.95117 10.6808 4.46957 13.1992 7.57617 13.1992Z"
                                stroke="#828282"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M7.57617 9.82422V7.57422"
                                stroke="#828282"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M7.57617 5.32422H7.5818"
                                stroke="#828282"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Tooltip>
                </div>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Contact:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-2 mt-1">
                    <Phone size="15" />
                    { vendor?.phone || __( '-', 'dokan-lite' ) }
                </p>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-2 mt-1">
                    <Mail size="15" />
                    <Tooltip
                        content={ vendor?.email }
                        direction="top"
                        contentClass="bg-gray-800 text-white p-2 rounded-md"
                    >
                        <p>
                            { vendor?.email
                                ? truncate( vendor?.email, 40 )
                                : __( '-', 'dokan-lite' ) }
                        </p>
                    </Tooltip>
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Commission Type:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal">
                    { vendor?.admin_commission_type === 'fixed'
                        ? __( 'Fixed', 'dokan-lite' )
                        : __( 'Category Based', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Product Publishing:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-2">
                    { vendor?.trusted ? (
                        <>
                            <CircleCheck size="15" />

                            <span className="">
                                { __( 'Direct Publish', 'dokan-lite' ) }
                            </span>
                        </>
                    ) : (
                        <>
                            <Clock size={15} />
                            <span className="">
                                { __( 'Requires Review', 'dokan-lite' ) }
                            </span>
                        </>
                    ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Subscription:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal">
                    { __( 'No Subscription Added', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Payment Method:', 'dokan-lite' ) }
                </h4>
                { vendor?.payment ? (
                    <p className="text-neutral-700 text-sm font-normal truncate">
                        { paymentMethods( vendor?.payment )
                            .filter( ( method ) => method.isActive )
                            .map( ( method ) => method.name )
                            .join( ', ' ) ||
                            __( 'No Payment Method Added', 'dokan-lite' ) }
                    </p>
                ) : (
                    <p className="text-neutral-700 text-sm font-normal">
                        { __( 'No Payment Method Added', 'dokan-lite' ) }
                    </p>
                ) }
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal mb-2">
                    { __( 'Social Links:', 'dokan-lite' ) }
                </h4>
                { vendor?.social ? (
                    <SocialLinks social={ vendor.social } />
                ) : (
                    <p className="text-neutral-700 text-sm font-normal">
                        { __( 'No Social Links Added', 'dokan-lite' ) }
                    </p>
                ) }
            </div>

            <Slot
                name={ `dokan-admin-vendor-after-info-contents` }
                fillProps={ { vendor } }
            />
        </div>
    );
};

export default InfoCard;
