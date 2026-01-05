/**
 * Common prop types for UI components
 */

export interface BaseFieldProps {
    /**
     * Unique identifier for the field
     */
    id?: string;

    /**
     * Current value
     */
    value?: string | number | boolean | string[] | number[];

    /**
     * Default value when value is undefined
     */
    defaultValue?: string | number | boolean | string[] | number[];

    /**
     * Change handler
     */
    onChange?: ( value: unknown ) => void;

    /**
     * Placeholder text
     */
    placeholder?: string;

    /**
     * Whether the field is disabled
     */
    disabled?: boolean;

    /**
     * Whether the field is read-only
     */
    readOnly?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Aria label for accessibility
     */
    ariaLabel?: string;
}

export interface OptionItem {
    /**
     * Display label
     */
    label: string;

    /**
     * Option value
     */
    value: string | number;

    /**
     * Optional description
     */
    description?: string;

    /**
     * Whether option is disabled
     */
    disabled?: boolean;

    /**
     * Optional icon
     */
    icon?: React.ReactNode;
}

export interface FieldLabelProps {
    /**
     * Label text
     */
    title?: string;

    /**
     * Description/helper text below label
     */
    description?: string;

    /**
     * Tooltip text on hover
     */
    tooltip?: string;

    /**
     * Image URL to display
     */
    imageUrl?: string;

    /**
     * HTML for attribute
     */
    htmlFor?: string;

    /**
     * Whether label text is bold
     */
    isBold?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;
}

export interface FileUploadProps extends BaseFieldProps {
    /**
     * Allowed file types (e.g., ['image', 'video'])
     */
    allowedTypes?: string[];

    /**
     * Maximum file size in bytes
     */
    maxSize?: number;

    /**
     * Whether to allow multiple files
     */
    multiple?: boolean;

    /**
     * Button text
     */
    buttonText?: string;

    /**
     * Preview mode ('image' | 'file' | 'none')
     */
    previewMode?: 'image' | 'file' | 'none';
}

export interface RepeaterItem {
    /**
     * Unique identifier
     */
    id: string;

    /**
     * Display order
     */
    order: number;

    /**
     * Item title/label
     */
    title: string;

    /**
     * Whether item is required (cannot be deleted)
     */
    required?: boolean;

    /**
     * Additional item data
     */
    [ key: string ]: unknown;
}

export interface RepeaterProps {
    /**
     * Array of items
     */
    items: RepeaterItem[];

    /**
     * Change handler
     */
    onChange: ( items: RepeaterItem[] ) => void;

    /**
     * Label for add button
     */
    addButtonText?: string;

    /**
     * Whether items are sortable
     */
    sortable?: boolean;

    /**
     * Render function for each item
     */
    renderItem?: ( item: RepeaterItem ) => React.ReactNode;

    /**
     * Maximum number of items
     */
    maxItems?: number;

    /**
     * Minimum number of items
     */
    minItems?: number;
}

export interface ModalProps {
    /**
     * Whether modal is open
     */
    isOpen: boolean;

    /**
     * Close handler
     */
    onClose: () => void;

    /**
     * Confirm handler
     */
    onConfirm?: () => void;

    /**
     * Modal title
     */
    title?: string;

    /**
     * Modal content
     */
    children?: React.ReactNode;

    /**
     * Confirm button text
     */
    confirmText?: string;

    /**
     * Cancel button text
     */
    cancelText?: string;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Whether to show footer buttons
     */
    showFooter?: boolean;
}

export interface TooltipProps {
    /**
     * Tooltip content
     */
    content: React.ReactNode;

    /**
     * Trigger element
     */
    children: React.ReactNode;

    /**
     * Position of tooltip
     */
    position?: 'top' | 'bottom' | 'left' | 'right';

    /**
     * Delay before showing (ms)
     */
    delay?: number;
}

