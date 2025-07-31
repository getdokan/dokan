import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
    X,
    Menu,
    Pencil,
    Check,
} from 'lucide-react';
import { twMerge } from "tailwind-merge";
import { TextField, DokanSwitch } from "../fields";
import SortableList from '@dokan/components/sortable-list';

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
    submenu?: Record<string, any>;
    react_route?: string;
    counts?: string | number;
    previous_title?: string;
    temporary_disable_edit?: boolean;
    id?: string; // Added for sortable list
    menu_key?: string; // Added for sortable list
}

interface SortableMenuListProps {
    menuItems: Record<string, MenuItemData>;
    onUpdate: (updatedMenus: Record<string, MenuItemData>) => void;
    namespace: string;
}

// Individual Menu Item Component (without drag handle)
const MenuManagerItem = (
    {
        item,
        itemKey,
        onUpdate,
        onToggle,
        isDragging = false
    } : {
        item: MenuItemData;
        itemKey: string;
        onUpdate: (key: string, updatedItem: MenuItemData) => void;
        onToggle: (key: string, isVisible: boolean) => void;
        isDragging?: boolean;
    }
) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.menu_manager_title || item.title);
    const [originalValue, setOriginalValue] = useState(item.menu_manager_title || item.title);

    const handleEdit = () => {
        setIsEditing(true);
        setOriginalValue(editValue);
    };

    const handleSave = () => {
        const finalValue = editValue.trim() === '' ? originalValue : editValue.trim();
        const updatedItem = {
            ...item,
            menu_manager_title: finalValue,
            previous_title: originalValue
        };
        onUpdate(itemKey, updatedItem);
        setEditValue(finalValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(originalValue);
        setIsEditing(false);
    };

    const handleToggle = (value: boolean) => {
        // const isVisible = value === 'on';
        onToggle(itemKey, value);
    };

    return (
        <div className={twMerge(
            "menu-item flex items-center justify-between pr-5 bg-white transition-all duration-200",
            isDragging && "opacity-50 transform scale-95"
        )}>
            {/* Left Section - Menu Name / Edit Input (no drag handle here) */}
            <div className="flex items-center flex-1 py-5">
                {/* Menu Name / Edit Input */}
                <div className="flex-1">
                    {isEditing ? (
                        <TextField
                            inputType="text"
                            value={ editValue }
                            containerClassName='w-fit'
                            onChange={ ( val ) => setEditValue( val ) }
                            inputClassName="w-96 bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm border-[#7047eb]"
                        />
                    ) : (
                        <span className="text-sm font-medium text-[#25252D]">
                            {(!isEditing || !item.is_switched_on) ? item.menu_manager_title || item.title : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-5 py-5">
                {/* Edit Actions */}
                {((item.editable !== false) || isEditing) && (
                    <>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="action-icon-wrapper cancel-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                    title={__('Cancel', 'dokan-lite')}
                                >
                                    <X size={16} color="#828282" />
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="action-icon-wrapper check-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                    title={__('Save', 'dokan-lite')}
                                >
                                    <Check size={16} color="#828282" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="action-icon-wrapper edit-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                title={__('Edit', 'dokan-lite')}
                            >
                                <Pencil size={16} color="#828282" />
                            </button>
                        )}
                    </>
                )}

                {/* Toggle Switch using DokanSwitch */}
                <div className={twMerge(
                    'switch-wrapper-placeholder flex items-center relative',
                    item.switchable === false && 'cursor-not-allowed opacity-50'
                )}>
                    <DokanSwitch
                        checked={ item.is_switched_on }
                        onChange={ item.switchable === false ? undefined : ( val)=> handleToggle(val) }
                    />
                    {item.switchable === false && (
                        <div className="absolute inset-0 cursor-not-allowed"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Sortable Menu List Component
export const SortableMenuList = ({
    menuItems,
    onUpdate,
    namespace
}: SortableMenuListProps) => {
    const [localMenuItems, setLocalMenuItems] = useState(menuItems);

    // Update local state when props change
    useEffect(() => {
        setLocalMenuItems(menuItems);
    }, [menuItems]);

    // Convert menu items to array and sort by position
    const getMenuItemsArray = (): MenuItemData[] => {
        return Object.entries(localMenuItems)
            .map(([key, item]) => ({
                ...item,
                id: key,
                menu_key: key
            }))
            .sort((a, b) => (a.menu_manager_position || a.pos || 0) - (b.menu_manager_position || b.pos || 0));
    };

    // Handle menu item updates
    const handleMenuItemUpdate = (key: string, updatedItem: MenuItemData) => {
        const newMenuItems = {
            ...localMenuItems,
            [key]: updatedItem
        };
        setLocalMenuItems(newMenuItems);
        onUpdate(newMenuItems);
    };

    // Handle toggle visibility
    const handleMenuItemToggle = (key: string, isVisible: boolean) => {
        const currentItem = localMenuItems[key];
        const updatedItem = {
            ...currentItem,
            is_switched_on: isVisible,
            temporary_disable_edit: !isVisible
        };

        handleMenuItemUpdate(key, updatedItem);
    };

    // Handle drag and drop reordering
    const handleOrderUpdate = (updatedItems: MenuItemData[]) => {
        const reorderedItems: Record<string, MenuItemData> = {};

        updatedItems.forEach((item, index) => {
            const key = item.menu_key || item.id;
            reorderedItems[key] = {
                ...item,
                menu_manager_position: index
            };
        });

        setLocalMenuItems(reorderedItems);
        onUpdate(reorderedItems);
    };

    // Render individual menu item for SortableList with drag handle as sibling
    const renderMenuItem = (item: MenuItemData) => {
        const key = item.menu_key || item.id || '';

        return (
            <div className="border-b border-gray-200 last:border-b-0 flex items-center">
                {/* Drag Handle - Now as sibling */}
                <div
                    className={twMerge(
                        'relative flex items-center pl-5 pr-3',
                        item.is_sortable === false && 'cursor-not-allowed opacity-50',
                        item.is_sortable !== false && 'cursor-grab active:cursor-grabbing',
                        item.is_sortable !== false && 'drag-handle'
                    )}
                    data-drag-handle="true"
                >
                    <Menu className="cursor-grab" color="#828282" size={16} />
                    {item.is_sortable === false && (
                        <div className="absolute inset-0 cursor-not-allowed"></div>
                    )}
                </div>

                {/* Menu Item Content - Now without drag handle */}
                <div className="flex-1">
                    <MenuManagerItem
                        item={item}
                        itemKey={key}
                        onUpdate={handleMenuItemUpdate}
                        onToggle={handleMenuItemToggle}
                    />
                </div>
            </div>
        );
    };

    const menuArray = getMenuItemsArray();

    return (
        <div className={`tabs-details menu-manager-${namespace} mt-5`}>
            {menuArray.length > 0 ? (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                    <SortableList
                        wrapperElement=""
                        items={menuArray}
                        namespace={`menu-manager-${namespace}`}
                        onChange={handleOrderUpdate}
                        renderItem={renderMenuItem}
                        orderProperty="menu_manager_position"
                        strategy="vertical"
                        className=""
                        dragSelector="drag-handle"
                    />
                </div>
            ) : (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                    <div className="text-center py-8 text-gray-500">
                        <p>{__('No menu items found.', 'dokan-lite')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortableMenuList;
