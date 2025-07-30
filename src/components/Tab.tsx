import { twMerge } from 'tailwind-merge';
import { IconType, Slot, TabPanel } from '@wordpress/components';
import { snakeCase } from '../utilities/ChangeCase';
import { applyFilters } from '@wordpress/hooks';

export type TabVariant = 'primary' | 'secondary' | 'tertiary';

export interface Tab {
    name: string;
    title: string;
    className?: string;
    icon?: IconType;
    disabled?: boolean;
}

export interface DokanTabProps {
    variant?: TabVariant;
    className?: string;
    children?: ( tab: Tab ) => React.ReactNode;
    tabs: Tab[];
    activeClass?: string;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: ( tabName: string ) => void;
    initialTabName?: string;
    selectOnMove?: boolean;
    namespace: string;
}

const defaultTabClassName =
    'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300';

const defaultActiveClass =
    '!text-dokan-primary !border-dokan-btn !border-b-2 dokan-active-tab';

const variantConfig = {
    primary: {
        className:
            'dokan-tab-panel overflow-auto mb-5 text-gray-500 hover:text-gray-700 [&:not(:last-child)]:*:border-b *:first:border-gray-200 *:first:*:border-transparent *:[&:not(:last-child)]:*:border-b-2 focus:*:[&:not(:last-child)]:*:outline-transparent [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-secondary-50 [&::-webkit-scrollbar-thumb]:bg-secondary-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-secondary-600',
    },
    secondary: {
        className: 'dokan-tab-panel-secondary mb-5',
    },
    tertiary: {
        className: 'dokan-tab-panel-tertiary mb-5',
    },
} as const;

const applyFiltersToTabElements = (
    namespace: string,
    elementName: string,
    element: any,
    props: Partial< DokanTabProps >
) => {
    const snakeCaseNamespace = snakeCase( namespace );
    return applyFilters(
        `dokan_${ snakeCaseNamespace }_tab_${ elementName }`,
        element,
        { ...props }
    );
};

const DokanTab = ( {
    children,
    className = '',
    variant = 'primary',
    tabs,
    activeClass = defaultActiveClass,
    orientation = 'horizontal',
    onSelect,
    initialTabName,
    selectOnMove = true,
    namespace = 'dokan',
    ...props
}: DokanTabProps ) => {
    const config = variantConfig[ variant ];

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
            twMerge( config.className, className ),
            { ...props, tabs }
        ),
    };

    const tabNameSpace = snakeCase( namespace );

    return (
        <div id={ `dokan-tab-${ tabNameSpace }` } className="dokan-tab-wrapper">
            { /* Before tab panel rendered slot */ }
            <Slot
                name={ `dokan-before-tab-${ tabNameSpace }` }
                fillProps={ { ...filteredProps } }
            />

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

            { /* After tab panel rendered slot */ }
            <Slot
                name={ `dokan-after-tab-${ tabNameSpace }` }
                fillProps={ { ...filteredProps } }
            />
        </div>
    );
};

export default DokanTab;
