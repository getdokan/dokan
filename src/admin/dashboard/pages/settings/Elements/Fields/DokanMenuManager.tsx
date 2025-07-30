import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Notice } from '@wordpress/components';
import { RotateCcw } from 'lucide-react';
import { DokanFieldLabel } from '../../../../../../components/fields';
import { SortableMenuList } from '../../../../../../components/menu-manager/SortableMenuList';
import DokanTab from '../../../../../../components/Tab';
import apiFetch from '@wordpress/api-fetch';

interface MenuItemData {
    title: string;
    icon?: string;
    url: string;
    pos: number | string;
    permission?: string;
    is_switched_on: boolean;
    menu_manager_position: number;
    static_pos: number | string;
    menu_manager_title: string;
    is_sortable: boolean;
    editable: boolean;
    switchable: boolean;
    submenu?: Record< string, any >;
    react_route?: string;
    counts?: string | number;
}

interface MenuData {
    left_menus: Record< string, MenuItemData >;
    settings_sub_menu: Record< string, MenuItemData >;
}

// Hardcoded menu data from API response
const HARDCODED_MENU_DATA: MenuData = {
    left_menus: {
        dashboard: {
            title: 'Dashboard',
            icon: '<i class="fas fa-tachometer-alt"></i>',
            url: 'http://dokanbd.test/dashboard/?path=%2Fanalytics%2FOverview',
            pos: 0,
            permission: 'dokan_view_overview_menu',
            is_switched_on: true,
            menu_manager_position: 0,
            static_pos: 0,
            menu_manager_title: 'Dashboard',
            is_sortable: false,
            editable: true,
            switchable: false,
        },
        products: {
            title: 'Products',
            icon: '<i class="fas fa-briefcase"></i>',
            url: 'http://dokanbd.test/dashboard/products/',
            pos: 1,
            permission: 'dokan_view_product_menu',
            is_switched_on: true,
            menu_manager_position: 1,
            static_pos: 1,
            menu_manager_title: 'Products',
            is_sortable: true,
            editable: true,
            switchable: true,
        },
        orders: {
            title: 'Orders',
            icon: '<i class="fas fa-shopping-cart"></i>',
            url: 'http://dokanbd.test/dashboard/orders/',
            pos: 2,
            permission: 'dokan_view_order_menu',
            is_switched_on: true,
            menu_manager_position: 2,
            static_pos: 2,
            menu_manager_title: 'Orders',
            is_sortable: true,
            editable: true,
            switchable: true,
            submenu: {
                all: {
                    title: 'All Orders',
                    icon: '<i class="fas fa-shopping-cart"></i>',
                    url: 'http://dokanbd.test/dashboard/orders/',
                    pos: 30,
                    permission: 'dokan_view_order_menu',
                    is_switched_on: true,
                    menu_manager_position: 30,
                    static_pos: 30,
                    menu_manager_title: 'All Orders',
                    is_sortable: true,
                    editable: true,
                    switchable: true,
                },
            },
        },
        coupons: {
            title: 'Coupons',
            icon: '<i class="fas fa-gift"></i>',
            url: 'http://dokanbd.test/dashboard/new/#coupons',
            pos: 4,
            permission: 'dokan_view_coupon_menu',
            react_route: 'coupons',
            is_switched_on: true,
            menu_manager_position: 4,
            static_pos: 4,
            menu_manager_title: 'Coupons',
            is_sortable: true,
            editable: true,
            switchable: true,
        },
        reports: {
            title: 'Reports',
            icon: '<i class="fas fa-chart-line"></i>',
            url: 'http://dokanbd.test/dashboard/reports/?path=%2Fanalytics%2Fproducts',
            pos: 5,
            permission: 'dokan_view_report_menu',
            is_switched_on: true,
            menu_manager_position: 5,
            static_pos: 5,
            menu_manager_title: 'Reports',
            is_sortable: true,
            editable: true,
            switchable: true,
        },
    },
    settings_sub_menu: {
        store: {
            title: 'Store',
            icon: '<i class="fas fa-university"></i>',
            url: 'http://dokanbd.test/dashboard/settings/store/',
            pos: 0,
            permission: 'dokan_view_store_settings_menu',
            is_switched_on: true,
            menu_manager_position: 0,
            static_pos: 0,
            menu_manager_title: 'Store',
            is_sortable: false,
            editable: true,
            switchable: false,
        },
        payment: {
            title: 'Payment',
            icon: '<i class="far fa-credit-card"></i>',
            url: 'http://dokanbd.test/dashboard/settings/payment/',
            pos: 1,
            permission: 'dokan_view_store_payment_menu',
            is_switched_on: true,
            menu_manager_position: 1,
            static_pos: 1,
            menu_manager_title: 'Payment',
            is_sortable: true,
            editable: true,
            switchable: true,
        },
        verification: {
            title: 'Verification',
            icon: '<i class="fas fa-check"></i>',
            url: 'http://dokanbd.test/dashboard/new/#settings/verification',
            pos: 2,
            permission: 'dokan_view_store_verification_menu',
            react_route: 'settings/verification',
            is_switched_on: true,
            menu_manager_position: 2,
            static_pos: 2,
            menu_manager_title: 'Verification',
            is_sortable: true,
            editable: true,
            switchable: true,
        },
    },
};

// Main Menu Manager Field Component
export default function DokanMenuManager( {
    element,
    onValueChange,
}: {
    element: any;
    onValueChange: ( element: any ) => void;
} ) {
    const [ menuData, setMenuData ] =
        useState< MenuData >( HARDCODED_MENU_DATA );
    // const [ success, setSuccess ] = useState< string | null >( null );
    const [ showResetConfirm, setShowResetConfirm ] = useState( false );

    const fetchMenuData = async () => {
        try {
            const response = await apiFetch< MenuData >( {
                path: '/dokan/v1/admin/menu-manager',
            } );

            // Based on your API response structure, extract the data
            const menuData = response.data || response;

            if ( menuData ) {
                setMenuData( menuData );
            }
        } catch ( error ) {
            // Handle error if needed
            console.error( 'Failed to fetch menu data:', error );
        }
    };

    useEffect(() => {
        fetchMenuData(); // No need to await here since it handles state internally
    }, []);

    // Handle menu updates (simplified - no API calls)
    const handleMenuUpdate = (
        tabKey: 'left_menus' | 'settings_sub_menu',
        updatedMenus: Record< string, MenuItemData >
    ) => {
        const newMenuData = {
            ...menuData,
            [ tabKey ]: updatedMenus,
        };

        setMenuData( newMenuData );
        // Update element value for WordPress options sync
        onValueChange( { ...element, value: newMenuData } );

        // Show success message
        // setSuccess( __( 'Menu settings updated successfully.', 'dokan-lite' ) );
        // setTimeout( () => setSuccess( null ), 3000 );
    };

    // Show reset confirmation
    const showResetConfirmation = () => {
        setShowResetConfirm( true );
    };

    // Cancel reset
    const cancelReset = () => {
        setShowResetConfirm( false );
    };

    // Confirm and execute reset
    const confirmReset = () => {
        setShowResetConfirm( false );
        setMenuData( HARDCODED_MENU_DATA );
        onValueChange( { ...element, value: HARDCODED_MENU_DATA } );
        // setSuccess( __( 'Menu settings reset successfully.', 'dokan-lite' ) );
        // setTimeout( () => setSuccess( null ), 3000 );
    };

    // Tab configuration
    const tabs = [
        {
            name: 'left_menus',
            title: __( 'Left Menu', 'dokan-lite' ),
            className: 'px-4 text-[#626262] hover:border-[#7047EB]'
        },
        {
            name: 'settings_sub_menu',
            title: __( 'Settings Sub Menu', 'dokan-lite' ),
            className: 'px-4 text-[#626262] hover:border-[#7047EB]',
        },
    ];

    return (
        <div className="dokan-menu-manager-field w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.tooltip }
            />

            { /* Notifications */ }
            {/*{ success && (*/}
            {/*    <div className="p-5">*/}
            {/*        <Notice*/}
            {/*            status="success"*/}
            {/*            isDismissible*/}
            {/*            onRemove={ () => setSuccess( null ) }*/}
            {/*        >*/}
            {/*            { success }*/}
            {/*        </Notice>*/}
            {/*    </div>*/}
            {/*) }*/}

            { /* Tab Content using DokanTab */ }
            <div className="p-4 relative">
                <DokanTab
                    className="dokan-menu-manager-tabs m-0"
                    tabs={ tabs }
                    initialTabName="left_menus"
                    namespace="menu-manager"
                >
                    { ( tab ) => {
                        const tabKey = tab.name as
                            | 'left_menus'
                            | 'settings_sub_menu';
                        return (
                            <SortableMenuList
                                menuItems={ menuData[ tabKey ] }
                                onUpdate={ ( updatedMenus ) =>
                                    handleMenuUpdate(
                                        tabKey,
                                        updatedMenus
                                    )
                                }
                                namespace={ `menu-manager-${ tabKey }` }
                            />
                        );
                    } }
                </DokanTab>

                <div className="absolute top-3 right-0 flex justify-between items-start p-5 border-gray-200">
                    <div className={ 'flex items-center gap-2 text-sm text-[#7047EB] cursor-pointer' }>
                        <RotateCcw size={ 20 } color={ '#7047EB' } />
                        { __( 'Reset All', 'dokan-lite' ) }
                    </div>
                </div>
            </div>

            { /* Reset Confirmation Dialog */ }
            { showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            { __( 'Confirm Reset', 'dokan-lite' ) }
                        </h3>
                        <p className="text-gray-600 mb-6">
                            { __(
                                'Are you sure? You want to reset all data! This action cannot be undone.',
                                'dokan-lite'
                            ) }
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                onClick={ cancelReset }
                            >
                                { __( 'Cancel', 'dokan-lite' ) }
                            </Button>
                            <Button
                                variant="primary"
                                onClick={ confirmReset }
                                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                            >
                                { __( 'Reset All', 'dokan-lite' ) }
                            </Button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}
