import { PaymentDetails, Vendor } from '@dokan/definitions/dokan-vendors';
import { __ } from '@wordpress/i18n';
import { DateTimeHtml } from '../../../../components';
import { Tooltip } from '@getdokan/dokan-ui';
import { humanTimeDiff } from '@wordpress/date';
import SocialLinks from './SocialLinks';
import SendEmail from './SendEmail';

export interface InfoCardProps {
    vendor: Vendor;
}

export const paymentMethods = ( methods: PaymentDetails ) => {
    if ( ! methods ) {
        return [];
    }

    const methodNames = [
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

        return {
            key: method.key,
            name,
            isActive,
        };
    } );
};

const InfoCard = ( { vendor }: InfoCardProps ) => {
    return (
        <div className="md:w-1/3 lg:w-1/4 flex flex-col gap-2 p-4 bg-white rounded shadow-md">
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Registered Since:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-1">
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
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Contact:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-2">
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clipPath="url(#clip0_10638_7550)">
                            <path
                                d="M2.74349 3.24219H13.4102C14.1435 3.24219 14.7435 3.84219 14.7435 4.57552V12.5755C14.7435 13.3089 14.1435 13.9089 13.4102 13.9089H2.74349C2.01016 13.9089 1.41016 13.3089 1.41016 12.5755V4.57552C1.41016 3.84219 2.01016 3.24219 2.74349 3.24219Z"
                                stroke="#828282"
                                strokeWidth="1.33333"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M14.7435 4.57422L8.07682 9.24089L1.41016 4.57422"
                                stroke="#828282"
                                strokeWidth="1.33333"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_10638_7550">
                                <rect
                                    width="16"
                                    height="16"
                                    fill="white"
                                    transform="translate(0.0761719 0.574219)"
                                />
                            </clipPath>
                        </defs>
                    </svg>

                    { vendor?.email || __( '-', 'dokan-lite' ) }
                </p>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-2 mt-1">
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12.3048 10.1853V11.766C12.3054 11.9127 12.2754 12.058 12.2166 12.1924C12.1578 12.3269 12.0716 12.4476 11.9635 12.5468C11.8553 12.646 11.7277 12.7215 11.5887 12.7685C11.4497 12.8155 11.3024 12.833 11.1562 12.8197C9.53495 12.6436 7.97757 12.0896 6.60926 11.2022C5.33623 10.3933 4.25691 9.31397 3.44797 8.04093C2.55753 6.66641 2.00339 5.10146 1.83045 3.47287C1.81728 3.32717 1.8346 3.18033 1.88129 3.04168C1.92799 2.90304 2.00304 2.77564 2.10167 2.6676C2.2003 2.55955 2.32035 2.47322 2.45417 2.41411C2.58799 2.35501 2.73265 2.32441 2.87894 2.32427H4.45959C4.71529 2.32175 4.96318 2.4123 5.15705 2.57903C5.35093 2.74577 5.47756 2.97731 5.51335 3.23051C5.58006 3.73635 5.70379 4.23302 5.88217 4.71104C5.95305 4.89963 5.9684 5.10458 5.92637 5.30161C5.88435 5.49865 5.78673 5.67951 5.64507 5.82276L4.97593 6.4919C5.72597 7.81097 6.81815 8.90314 8.13722 9.65319L8.80636 8.98405C8.94961 8.84239 9.13047 8.74477 9.32751 8.70274C9.52454 8.66072 9.72949 8.67607 9.91808 8.74695C10.3961 8.92533 10.8928 9.04906 11.3986 9.11577C11.6546 9.15188 11.8883 9.28079 12.0554 9.478C12.2225 9.6752 12.3113 9.92694 12.3048 10.1853Z"
                            stroke="#828282"
                            strokeWidth="1.16664"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    { vendor?.phone || __( '-', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Commission Type:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal">
                    { vendor?.admin_commission_type === 'fixed'
                        ? __( 'Fixed', 'dokan-lite' )
                        : __( 'Category Based', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Product Publishing:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal flex items-center gap-2">
                    { vendor?.trusted ? (
                        <>
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clipPath="url(#clip0_10581_7959)">
                                    <path
                                        d="M8.07682 15.2396C11.7587 15.2396 14.7435 12.2548 14.7435 8.57292C14.7435 4.89102 11.7587 1.90625 8.07682 1.90625C4.39492 1.90625 1.41016 4.89102 1.41016 8.57292C1.41016 12.2548 4.39492 15.2396 8.07682 15.2396Z"
                                        stroke="#828282"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M11.4089 6.57422L6.82552 11.2409L4.74219 9.11967"
                                        stroke="#828282"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_10581_7959">
                                        <rect
                                            width="16"
                                            height="16"
                                            fill="white"
                                            transform="translate(0.0761719 0.574219)"
                                        />
                                    </clipPath>
                                </defs>
                            </svg>

                            <span className="">
                                { __( 'Direct Publish', 'dokan-lite' ) }
                            </span>
                        </>
                    ) : (
                        <>
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M8.07617 14.3633C11.3899 14.3633 14.0762 11.677 14.0762 8.36328C14.0762 5.04957 11.3899 2.36328 8.07617 2.36328C4.76246 2.36328 2.07617 5.04957 2.07617 8.36328C2.07617 11.677 4.76246 14.3633 8.07617 14.3633Z"
                                    stroke="#828282"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M8.07617 4.76562V8.36563L10.4762 9.56563"
                                    stroke="#828282"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="">
                                { __( 'Requires Review', 'dokan-lite' ) }
                            </span>
                        </>
                    ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Subscription:', 'dokan-lite' ) }
                </h4>
                <p className="text-neutral-700 text-sm font-normal">
                    { __( 'No Subscription Added', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
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
                <h4 className="text-zinc-500 text-xs font-normal">
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
            <SendEmail vendor={ vendor } />
        </div>
    );
};

export default InfoCard;
