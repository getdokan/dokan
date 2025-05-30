import { Vendor } from '@dokan/definitions/dokan-vendors';
import { __ } from '@wordpress/i18n';

export interface InfoCardProps {
    vendor: Vendor;
}

const InfoCard = ( { vendor }: InfoCardProps ) => {
    return (
        <div className="p-4 bg-white rounded shadow-md">
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Registered Since:', 'dokan-lite' ) }
                </h4>
                <p className="text-base text-gray-800">
                    { vendor.registered || __( 'N/A', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Contact:', 'dokan-lite' ) }
                </h4>
                <p className="text-zinc-500 text-xs font-normal">
                    { __( 'Email:', 'dokan-lite' ) }{ ' ' }
                    { vendor.email || __( 'N/A', 'dokan-lite' ) }
                </p>
                <p className="text-zinc-500 text-xs font-normal">
                    { __( 'Phone:', 'dokan-lite' ) }{ ' ' }
                    { vendor.phone || __( 'N/A', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Commission Type:', 'dokan-lite' ) }
                </h4>
                <p className="text-base text-gray-800">
                    { vendor.admin_commission_type ||
                        __( 'N/A', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Product Publishing:', 'dokan-lite' ) }
                </h4>
                <p className="text-base text-gray-800 flex items-center gap-2">
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

                            <span className="text-green-500">
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
                            <span className="text-red-500">
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
                <p className="text-base text-gray-800">
                    { __( 'No Subscription Added', 'dokan-lite' ) }
                </p>
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Payment Method:', 'dokan-lite' ) }
                </h4>
                { vendor.payment ? (
                    <></>
                ) : (
                    <p className="text-base text-gray-800">
                        { __( 'No Payment Method Added', 'dokan-lite' ) }
                    </p>
                ) }
            </div>
            <div className="mb-4">
                <h4 className="text-zinc-500 text-xs font-normal">
                    { __( 'Social Links:', 'dokan-lite' ) }
                </h4>
                { vendor?.social ? (
                    <></>
                ) : (
                    <p className="text-base text-gray-800">
                        { __( 'No Social Links Added', 'dokan-lite' ) }
                    </p>
                ) }
            </div>
        </div>
    );
};

export default InfoCard;
