import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
    GripVertical,
    Edit3,
    Check,
    X
} from 'lucide-react';
import { DokanSwitch } from '../fields';

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
}

interface SortableMenuListProps {
    menuItems: Record<string, MenuItemData>;
    onUpdate: (updatedMenus: Record<string, MenuItemData>) => void;
    namespace: string;
}

// Individual Menu Item Component
const MenuManagerItem: React.FC<{
    item: MenuItemData;
    itemKey: string;
    onUpdate: (key: string, updatedItem: MenuItemData) => void;
    onToggle: (key: string, isVisible: boolean) => void;
}> = ({ item, itemKey, onUpdate, onToggle }) => {
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

    const handleToggle = (value: string) => {
        const isVisible = value === 'on';
        onToggle(itemKey, isVisible);
        if (isVisible && isEditing) {
            handleCancel();
        }
    };

    return (
        <div className="menu-item flex items-center justify-between p-4 bg-gray-50 border border-gray-200 mb-1 rounded-sm">
            {/* Left Section */}
            <div className="flex items-center space-x-3">
                {/* Drag Handle */}
                {item.is_sortable !== false && (
                    <div
                        className="drag-handle cursor-grab active:cursor-grabbing"
                        data-drag-handle
                    >
                        <div className="flex space-x-1">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <GripVertical className="w-4 h-4 text-gray-400 -ml-2" />
                        </div>
                    </div>
                )}

                {/* Menu Name / Edit Input */}
                <div className="flex-1">
                    {isEditing && (item.is_switched_on || !item.editable) ? (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={45}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                        />
                    ) : (
                        <span className="text-sm font-medium text-gray-700">
                            {(!isEditing || !item.is_switched_on) ? item.menu_manager_title || item.title : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
                {/* Edit Actions */}
                {((item.editable !== false) || isEditing) && !item.temporary_disable_edit && (
                    <>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="action-icon-wrapper check-icon-wrapper p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                    title={__('Save', 'dokan-lite')}
                                >
                                    <Check className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="action-icon-wrapper cancel-icon-wrapper p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                    title={__('Cancel', 'dokan-lite')}
                                >
                                    <X className="w-3 h-3 text-gray-600" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEdit}
                                className="action-icon-wrapper edit-icon-wrapper p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                                title={__('Edit', 'dokan-lite')}
                            >
                                <Edit3 className="w-3 h-3 text-gray-600" />
                            </button>
                        )}
                    </>
                )}

                {/* Toggle Switch using DokanSwitch */}
                {item.switchable !== false && (
                    <div className="switch-wrapper-placeholder flex items-center">
                        <DokanSwitch
                            element={{
                                value: item.is_switched_on ? 'on' : 'off',
                                enable_state: { title: __('Visible', 'dokan-lite'), value: 'on' },
                                disable_state: { title: __('Hidden', 'dokan-lite'), value: 'off' }
                            }}
                            onValueChange={(updatedElement) => handleToggle(updatedElement.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Sortable Menu List Component
export const SortableMenuList: React.FC<SortableMenuListProps> = ({
                                                                      menuItems,
                                                                      onUpdate,
                                                                      namespace
                                                                  }) => {
    const [localMenuItems, setLocalMenuItems] = useState(menuItems);

    // Update local state when props change
    React.useEffect(() => {
        setLocalMenuItems(menuItems);
    }, [menuItems]);

    // Convert menu items to array and sort by position
    const getMenuItemsArray = () => {
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

    // Handle drag and drop reordering (simplified version)
    const handleReorder = (dragIndex: number, hoverIndex: number) => {
        const menuArray = getMenuItemsArray();
        const draggedItem = menuArray[dragIndex];
        const newArray = [...menuArray];

        // Remove dragged item and insert at new position
        newArray.splice(dragIndex, 1);
        newArray.splice(hoverIndex, 0, draggedItem);

        // Update positions
        const reorderedItems: Record<string, MenuItemData> = {};
        newArray.forEach((item, index) => {
            const key = item.menu_key || item.id;
            reorderedItems[key] = {
                ...item,
                menu_manager_position: index
            };
        });

        setLocalMenuItems(reorderedItems);
        onUpdate(reorderedItems);
    };

    const menuArray = getMenuItemsArray();

    return (
        <div className={`tabs-details menu-manager-${namespace}`}>
            <div className="space-y-1">
                {menuArray.map((item, index) => {
                    const key = item.menu_key || item.id;
                    const className = item.is_sortable ? 'menu-item' : 'menu-item not-sortable';

                    return (
                        <div
                            key={key}
                            className={className}
                            data-menu-key={key}
                            data-position={item.menu_manager_position}
                        >
                            <MenuManagerItem
                                item={item}
                                itemKey={key}
                                onUpdate={handleMenuItemUpdate}
                                onToggle={handleMenuItemToggle}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {menuArray.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>{__('No menu items found.', 'dokan-lite')}</p>
                </div>
            )}
        </div>
    );
};

export default SortableMenuList;