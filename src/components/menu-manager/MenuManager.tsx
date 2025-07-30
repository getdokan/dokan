import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Button, Notice } from '@wordpress/components';
import { SortableMenuList } from './SortableMenuList';

interface MenuItemData {
    title: string;
    url: string;
    pos: number;
    is_switched_on: boolean;
    menu_manager_position: number;
    menu_manager_title: string;
    previous_title: string;
    static_pos: number;
    is_sortable: boolean;
    editable: boolean;
    switchable: boolean;
}

interface MenuData {
    left_menus: Record< string, MenuItemData >;
    settings_sub_menu: Record< string, MenuItemData >;
}

interface ApiResponse {
    success: boolean;
    data: MenuData;
}

export const MenuManager = () => {
    const [ menuData, setMenuData ] = useState< MenuData >( {
        left_menus: {},
        settings_sub_menu: {},
    } );
    const [ loading, setLoading ] = useState( true );
    const [ saving, setSaving ] = useState( false );
    const [ error, setError ] = useState< string | null >( null );
    const [ success, setSuccess ] = useState< string | null >( null );

    // Load menu data on component mount
    useEffect( () => {
        loadMenuData();
    }, [] );

    const loadMenuData = async () => {
        try {
            setLoading( true );
            setError( null );

            const response = await apiFetch< ApiResponse >( {
                path: '/dokan/v1/admin/menu-manager',
                method: 'GET',
            } );

            if ( response.success ) {
                setMenuData( response.data );
            } else {
                setError( __( 'Failed to load menu data.', 'dokan-lite' ) );
            }
        } catch ( err ) {
            setError( __( 'Error loading menu data.', 'dokan-lite' ) );
            console.error( 'Menu Manager load error:', err );
        } finally {
            setLoading( false );
        }
    };

    const saveMenuData = async ( data: MenuData ) => {
        try {
            setSaving( true );
            setError( null );
            setSuccess( null );

            const response = await apiFetch< ApiResponse >( {
                path: '/dokan/v1/admin/menu-manager',
                method: 'POST',
                data,
            } );

            if ( response.success ) {
                setMenuData( response.data );
                setSuccess(
                    __( 'Menu settings saved successfully.', 'dokan-lite' )
                );

                // Clear success message after 3 seconds
                setTimeout( () => setSuccess( null ), 3000 );
            } else {
                setError( __( 'Failed to save menu settings.', 'dokan-lite' ) );
            }
        } catch ( err ) {
            setError( __( 'Error saving menu settings.', 'dokan-lite' ) );
            console.error( 'Menu Manager save error:', err );
        } finally {
            setSaving( false );
        }
    };

    const resetMenuData = async () => {
        if (
            ! confirm(
                __( 'Are you sure? You want to reset all data!', 'dokan-lite' )
            )
        ) {
            return;
        }

        try {
            setSaving( true );
            setError( null );
            setSuccess( null );

            const response = await apiFetch< ApiResponse >( {
                path: '/dokan/v1/admin/menu-manager/reset',
                method: 'POST',
            } );

            if ( response.success ) {
                setMenuData( response.data );
                setSuccess(
                    __( 'Menu settings reset successfully.', 'dokan-lite' )
                );

                // Clear success message after 3 seconds
                setTimeout( () => setSuccess( null ), 3000 );
            } else {
                setError(
                    __( 'Failed to reset menu settings.', 'dokan-lite' )
                );
            }
        } catch ( err ) {
            setError( __( 'Error resetting menu settings.', 'dokan-lite' ) );
            console.error( 'Menu Manager reset error:', err );
        } finally {
            setSaving( false );
        }
    };

    const handleMenuUpdate = (
        tabKey: 'left_menus' | 'settings_sub_menu',
        updatedMenus: Record< string, MenuItemData >
    ) => {
        const newMenuData = {
            ...menuData,
            [ tabKey ]: updatedMenus,
        };

        setMenuData( newMenuData );
        saveMenuData( newMenuData );
    };

    if ( loading ) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-5 bg-white border border-gray-200 rounded">
                <div className="mb-4">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">
                    { __( 'Loading menu manager…', 'dokan-lite' ) }
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded my-5">
            { /* Header */ }
            <div className="flex justify-between items-start p-5 border-b border-gray-200">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        { __( 'Menu Manager Settings', 'dokan-lite' ) }
                    </h2>
                    <p className="text-sm text-gray-600">
                        { __(
                            'Reorder, Rename, Activate, and Deactivate menus for your vendor dashboard.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>
                <div>
                    <Button
                        variant="secondary"
                        onClick={ resetMenuData }
                        disabled={ saving }
                        className="text-gray-500 border-gray-300 hover:text-gray-700 hover:border-gray-400"
                    >
                        { __( 'Reset All', 'dokan-lite' ) }
                    </Button>
                </div>
            </div>

            { /* Notifications */ }
            { error && (
                <div className="p-5">
                    <Notice
                        status="error"
                        isDismissible
                        onRemove={ () => setError( null ) }
                    >
                        { error }
                    </Notice>
                </div>
            ) }

            { success && (
                <div className="p-5">
                    <Notice
                        status="success"
                        isDismissible
                        onRemove={ () => setSuccess( null ) }
                    >
                        { success }
                    </Notice>
                </div>
            ) }

            { /* Content */ }
            <div className="p-0">
                <SortableMenuList
                    menuItems={ menuData.left_menus }
                    onUpdate={ ( updatedMenus ) =>
                        handleMenuUpdate( 'left_menus', updatedMenus )
                    }
                    namespace="left-menus"
                />
            </div>

            { /* Saving Overlay */ }
            { saving && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="flex items-center text-white text-base">
                        <div className="w-6 h-6 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin mr-3"></div>
                        <span>{ __( 'Saving…', 'dokan-lite' ) }</span>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default MenuManager;
