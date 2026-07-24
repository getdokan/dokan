import { twMerge } from 'tailwind-merge';
import { getStatusBadgeVariant, getStatusLabel } from '../status';

/**
 * The list badges' own theme classes carry the color combination
 * (background + text) the order list uses; the pill just adds the
 * RFQ-height shape and a 2px border in the text color.
 */
const VARIANT_TO_BADGE_CLASS: Record< string, string > = {
    success: 'dokan-badge-success',
    info: 'dokan-badge-info',
    warning: 'dokan-badge-warning',
    danger: 'dokan-badge-danger',
    secondary: 'dokan-badge-secondary',
};

const StatusPill = ( {
    status,
    label,
    className = '',
}: {
    status: string;
    label?: string;
    className?: string;
} ) => (
    <span
        className={ twMerge(
            'inline-flex items-center rounded-full border border-current px-3 py-1 text-xs font-medium leading-4',
            VARIANT_TO_BADGE_CLASS[ getStatusBadgeVariant( status ) ] ??
                VARIANT_TO_BADGE_CLASS.secondary,
            className
        ) }
    >
        { label ?? getStatusLabel( status ) }
    </span>
);

export default StatusPill;
