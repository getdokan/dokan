import { Button } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import { useNavigate } from "react-router-dom";

export interface HeaderNavigationProps {
    vendor: Vendor;
}
const HeaderNavigation = ( { vendor }: HeaderNavigationProps ) => {
    let navigate = useNavigate();
    const handleBackToList = () => {
        window.open(
            // @ts-ignore
            `${ window.dokanAdminDashboard.urls.adminRoot }admin.php?page=dokan#/vendors`,
            '_self'
        );
    };

    const visitStore = () => {
        if ( vendor ) {
            // Implement store URL logic here
            window.open( vendor.shop_url, '_blank' );
        }
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            <Button
                className="!ml-0  inline-flex items-center gap-1 !text-gray-600 hover:!text-gray-800"
                link={ true }
                color="gray"
                onClick={ handleBackToList }
            >
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M11.3203 13.7422L6.82031 9.24219L11.3203 4.74219"
                        stroke="currentColor"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                { __( 'Vendors List', 'dokan-lite' ) }
            </Button>
            <div className="flex justify-between w-full">
                <h2 className="text-2xl font-semibold text-[#25252D]">
                    { __( 'Vendor Details', 'dokan-lite' ) }
                </h2>
                <div className="flex gap-2">
                    <Button
                        className="flex items-center gap-1 dokan-btn-secondary"
                        color="primary"
                        onClick={ visitStore }
                        disabled={ ! vendor }
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                                stroke="#828282"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M2 8H14"
                                stroke="#828282"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M7.99961 2C9.50038 3.64301 10.3533 5.77522 10.3996 8C10.3533 10.2248 9.50038 12.357 7.99961 14C6.49884 12.357 5.64596 10.2248 5.59961 8C5.64596 5.77522 6.49884 3.64301 7.99961 2V2Z"
                                stroke="#828282"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        { __( 'Visit Store', 'dokan-lite' ) }
                    </Button>
                    <Button
                        className="dokan-btn-secondary"
                        color="primary"
                        onClick={ () =>
                            navigate( `/vendors/edit/${ vendor.id }` )
                        }
                    >
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 17 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.1482 2.69276C11.3071 2.53381 11.4958 2.40773 11.7035 2.3217C11.9112 2.23568 12.1338 2.19141 12.3586 2.19141C12.5834 2.19141 12.8059 2.23568 13.0136 2.3217C13.2213 2.40773 13.41 2.53381 13.569 2.69276C13.7279 2.85171 13.854 3.04041 13.94 3.24809C14.026 3.45577 14.0703 3.67836 14.0703 3.90315C14.0703 4.12794 14.026 4.35052 13.94 4.5582C13.854 4.76588 13.7279 4.95458 13.569 5.11353L5.39887 13.2836L2.07031 14.1914L2.9781 10.8629L11.1482 2.69276Z"
                                stroke="#828282"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HeaderNavigation;
