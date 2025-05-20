/* eslint-disable prettier/prettier */
import { twMerge } from 'tailwind-merge';
import { TabPanel, IconType } from '@wordpress/components';

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
    children: (tab: Tab) => React.ReactNode;
    tabs: Tab[];
    activeClass?: string;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (tabName: string) => void;
    initialTabName?: string;
    selectOnMove?: boolean;
}

const defaultTabClassName = 'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300';

const defaultActiveClass = '!text-dokan-primary !border-dokan-btn !border-b-2 dokan-active-tab';

const variantConfig = {
    primary: {
        className: 'dokan-tab-panel mb-5 text-gray-500 hover:text-gray-700 [&:not(:last-child)]:*:border-b *:first:border-gray-200 *:first:*:border-transparent *:[&:not(:last-child)]:*:border-b-2 focus:*:[&:not(:last-child)]:*:outline-transparent',
    },
    secondary: {
        className: 'dokan-tab-panel-secondary mb-5',
    },
    tertiary: {
        className: 'dokan-tab-panel-tertiary mb-5',
    },
} as const;

const DokanTab = ({
    children,
    className = '',
    variant = 'primary',
    tabs,
    activeClass = defaultActiveClass,
    orientation = 'horizontal',
    onSelect,
    initialTabName,
    selectOnMove = true,
    ...props
}: DokanTabProps) => {
    const config = variantConfig[variant];

    // Apply default tab styling if not provided
    const tabsWithDefaultStyle = tabs.map((tab) => ({
        ...tab,
        className: twMerge(defaultTabClassName, tab.className),
    }));

    return (
        <TabPanel
            className={twMerge(config.className, className)}
            activeClass={activeClass}
            tabs={tabsWithDefaultStyle}
            orientation={orientation}
            onSelect={onSelect}
            initialTabName={initialTabName}
            selectOnMove={selectOnMove}
            {...props}
        >
            {children}
        </TabPanel>
    );
};

export default DokanTab;
