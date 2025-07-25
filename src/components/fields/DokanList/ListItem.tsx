// filepath: /Users/osman/Sites/dokan-test/wp-content/plugins/dokan-lite/src/components/fields/ListItem.tsx
import { twMerge } from 'tailwind-merge';

interface ListItemVariant {
    size: 'sm' | 'md' | 'lg';
    layout: 'default' | 'compact' | 'expanded';
}

export interface ListItemProps {
    /**
     * Primary text content of the list item
     */
    primary: string | React.ReactNode;

    /**
     * Secondary/description text content
     */
    secondary?: string | React.ReactNode;

    /**
     * Icon or image element to display at the start of the list item
     */
    leadingElement?: React.ReactNode;

    /**
     * Elements to display at the end of the list item (actions, icons, etc.)
     */
    trailingElement?: React.ReactNode;

    /**
     * Whether the list item is currently selected
     */
    selected?: boolean;

    /**
     * Whether the list item is disabled
     */
    disabled?: boolean;

    /**
     * Function to call when the list item is clicked
     */
    onClick?: () => void;

    /**
     * Custom class name for the list item container
     */
    className?: string;

    /**
     * Variant configuration for the list item
     */
    variant?: Partial< ListItemVariant >;

    /**
     * Whether the list item should show a hover effect
     */
    showHover?: boolean;

    /**
     * Whether the list item should show a divider at the bottom
     */
    showDivider?: boolean;

    /**
     * Additional props to spread onto the list item element
     */
    [ key: string ]: any;
}

/**
 * Reusable ListItem component that can be used in menus, selection lists, etc.
 * @param root0
 * @param root0.primary
 * @param root0.secondary
 * @param root0.leadingElement
 * @param root0.trailingElement
 * @param root0.selected
 * @param root0.disabled
 * @param root0.onClick
 * @param root0.className
 * @param root0.variant
 * @param root0.showDivider
 */
const ListItem: React.FC< ListItemProps > = ( {
    primary,
    secondary,
    leadingElement,
    trailingElement,
    selected = false,
    disabled = false,
    onClick,
    className = '',
    variant = { size: 'md', layout: 'default' },
    showDivider = true,
    ...restProps
} ) => {
    // Merge variant with defaults
    const { size = 'md', layout = 'default' } = variant;

    // Calculate padding based on size
    const sizePadding = {
        sm: 'py-2 px-3',
        md: 'py-3 px-4',
        lg: 'py-4 px-5',
    }[ size ];

    // Calculate text sizes
    const textSizes = {
        sm: { primary: 'text-sm', secondary: 'text-xs' },
        md: { primary: 'text-base', secondary: 'text-sm' },
        lg: { primary: 'text-lg', secondary: 'text-base' },
    }[ size ];

    // Calculate layout-specific classes
    const layoutClasses = {
        default: '',
        compact: 'items-center',
        expanded: 'items-start',
    }[ layout ];

    // Combine classes for the container
    const containerClasses = twMerge(
        'flex w-full items-start hover:bg-dokan-teal-005 ',
        layoutClasses,
        sizePadding,
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        selected ? 'bg-[#EFEAFF]' : '',
        showDivider ? 'border-b border-gray-100' : '',
        className
    );

    // Handle click event
    const handleClick = () => {
        if ( ! disabled && onClick ) {
            onClick();
        }
    };

    // Handle keyboard events for accessibility
    const handleKeyDown = ( event: React.KeyboardEvent ) => {
        if (
            ! disabled &&
            onClick &&
            ( event.key === 'Enter' || event.key === ' ' )
        ) {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={ containerClasses }
            onClick={ handleClick }
            onKeyDown={ handleKeyDown }
            role={ onClick ? 'button' : undefined }
            tabIndex={ onClick && ! disabled ? 0 : undefined }
            { ...restProps }
        >
            { leadingElement && (
                <div className="flex-shrink-0">{ leadingElement }</div>
            ) }

            <div
                className={ twMerge(
                    'flex-grow',
                    leadingElement ? 'ml-3' : ''
                ) }
            >
                <div
                    className={ twMerge(
                        'text-gray-900 font-medium',
                        textSizes.primary
                    ) }
                >
                    { primary }
                </div>

                { secondary && (
                    <div
                        className={ twMerge(
                            'text-gray-500',
                            textSizes.secondary
                        ) }
                    >
                        { secondary }
                    </div>
                ) }
            </div>

            { trailingElement && (
                <div className="flex-shrink-0 ml-auto">{ trailingElement }</div>
            ) }
        </div>
    );
};

export default ListItem;
