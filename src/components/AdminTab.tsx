import { twMerge } from 'tailwind-merge';
import { IconType, Slot, TabPanel } from '@wordpress/components';
import { snakeCase } from '@dokan/utilities';
import { applyFilters } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';

export type TabVariant = 'primary' | 'secondary' | 'tertiary';

export interface Tab {
    name: string;
    title: string;
    className?: string;
    icon?: IconType;
    disabled?: boolean;
}

export interface AdminTabProps {
    variant?: TabVariant;
    className?: string | unknown;
    children?: ( tab: Tab ) => React.ReactNode;
    tabs: Tab[];
    activeClass?: string;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: ( tabName: string ) => void;
    initialTabName?: string;
    selectOnMove?: boolean;
    namespace: string;
    additionalComponents?: React.ReactNode[];
}

const defaultTabClassName =
    'border-0 border-b border-solid mr-5 space-x-8 whitespace-nowrap px-1 py-8 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300';

const defaultActiveClass =
    '!text-dokan-primary !border-dokan-btn !border-b-2 dokan-active-tab';

const variantConfig =
    'dokan-tab-panel overflow-auto text-gray-500 hover:text-gray-700 [&:not(:last-child)]:*:border-b-0 *:first:border-gray-200 *:first:*:border-transparent *:[&:not(:last-child)]:*:!border-b-2 focus:*:[&:not(:last-child)]:*:outline-transparent [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-secondary-50 [&::-webkit-scrollbar-thumb]:bg-secondary-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-secondary-600';

const applyFiltersToTabElements = (
    namespace: string,
    elementName: string,
    element: any,
    props: Partial< AdminTabProps >
) => {
    const snakeCaseNamespace = snakeCase( namespace );
    return applyFilters(
        `dokan_admin_${ snakeCaseNamespace }_tab_${ elementName }`,
        element,
        { ...props }
    );
};

const AdminTab = ( {
    children,
    className = '',
    tabs = [],
    activeClass = defaultActiveClass,
    orientation = 'horizontal',
    onSelect,
    initialTabName,
    selectOnMove = true,
    namespace = 'dokan',
    additionalComponents = [],
    ...props
}: AdminTabProps ) => {
    // Apply default tab styling if not provided
    const tabsWithDefaultStyle = tabs.map( ( tab ) => ( {
        ...tab,
        className: twMerge( defaultTabClassName, tab.className ),
    } ) );

    // Apply filters to tab elements
    const filteredProps = {
        ...props,
        tabs: applyFiltersToTabElements(
            namespace,
            'tabs',
            tabsWithDefaultStyle,
            { ...props, tabs }
        ),
        activeClass: applyFiltersToTabElements(
            namespace,
            'active_class',
            activeClass,
            { ...props, tabs }
        ),
        className: applyFiltersToTabElements(
            namespace,
            'panel_class',
            twMerge( variantConfig, className ),
            { ...props, tabs }
        ),
    };

    const tabNameSpace = snakeCase( namespace );

    return (
        <div
            id={ `dokan-admin-tab-${ tabNameSpace }` }
            className="dokan-tab-wrapper flex flex-col gap-4 w-full px-4"
        >
            { /* Before tab panel rendered slot */ }
            <Slot
                name={ `dokan-before-tab-${ tabNameSpace }` }
                fillProps={ { ...filteredProps } }
            />

            <div className="flex justify-between w-full items-center align-middle">
                <TabPanel
                    className={ filteredProps.className }
                    activeClass={ filteredProps.activeClass }
                    tabs={ filteredProps.tabs }
                    orientation={ orientation }
                    onSelect={ onSelect }
                    initialTabName={ initialTabName }
                    selectOnMove={ selectOnMove }
                    { ...props }
                >
                    { children || ( () => null ) }
                </TabPanel>

                <div className="flex items-end gap-2">
                    { additionalComponents?.map( ( node, index ) => (
                        <Fragment key={ index }>{ node }</Fragment>
                    ) ) }
                </div>
            </div>

            { /* After tab panel rendered slot */ }
            <Slot
                name={ `dokan-after-tab-${ tabNameSpace }` }
                fillProps={ { ...filteredProps } }
            />
        </div>
    );
};

export default AdminTab;
