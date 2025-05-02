import { twMerge } from 'tailwind-merge';
import { Button as DokanUIButton } from '@getdokan/dokan-ui';
import type { ButtonProps } from '@getdokan/dokan-ui/dist/components/Button';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger';

export interface DokanButtonProps extends Partial< ButtonProps > {
    variant?: ButtonVariant;
    className?: string;
}

const variantConfig = {
    primary: {
        color: 'purple',
        className: 'dokan-btn',
    },
    secondary: {
        color: 'blue',
        className: 'dokan-btn-secondary',
    },
    tertiary: {
        color: 'purple',
        className: 'dokan-btn-tertiary',
    },
    info: {
        color: 'blue',
        className: 'dokan-btn-info',
    },
    success: {
        color: 'green',
        className: 'dokan-btn-success',
    },
    warning: {
        color: 'yellow',
        className: 'dokan-btn-warning',
    },
    danger: {
        color: 'red',
        className: 'dokan-btn-danger',
    },
} as const;

export const DokanButton = ( {
    className = '',
    variant = 'primary',
    ...props
}: DokanButtonProps ) => {
    const config = variantConfig[ variant ];

    return (
        <DokanUIButton
            color={ config.color }
            className={ twMerge( config.className, className ) }
            { ...props }
        />
    );
};

export default DokanButton;
