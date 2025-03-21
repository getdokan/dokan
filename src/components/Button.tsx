// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Button as DokanUIButton } from '@getdokan/dokan-ui';
import type { ButtonProps } from '@getdokan/dokan-ui/dist/components/Button';

// Base Button component that handles all variants
export const Button = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => {
    return (
        <DokanUIButton
            color="purple"
            className={ twMerge(
                'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn',
                className
            ) }
            { ...props }
        >
            { children }
        </DokanUIButton>
    );
};

// Convenience components for specific variants
export const SecondaryButton = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => (
    <DokanUIButton
        color="blue"
        className={ twMerge(
            'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-secondary',
            className
        ) }
        { ...props }
    >
        { children }
    </DokanUIButton>
);
export const TertiaryButton = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => (
    <DokanUIButton
        color="purple"
        className={ twMerge(
            'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-tertiary',
            className
        ) }
        { ...props }
    >
        { children }
    </DokanUIButton>
);

// Status-specific buttons
export const InfoButton = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => (
    <DokanUIButton
        color="blue"
        className={ twMerge(
            'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-info',
            className
        ) }
        { ...props }
    >
        { children }
    </DokanUIButton>
);
export const SuccessButton = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => (
    <DokanUIButton
        color="green"
        className={ twMerge(
            'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-success',
            className
        ) }
        { ...props }
    >
        { children }
    </DokanUIButton>
);
export const WarningButton = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => (
    <DokanUIButton
        color="yellow"
        className={ twMerge(
            'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-warning',
            className
        ) }
        { ...props }
    >
        { children }
    </DokanUIButton>
);
export const DangerButton = ( {
    className,
    children,
    ...props
}: Partial< ButtonProps > ) => (
    <DokanUIButton
        color="red"
        className={ twMerge(
            'transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-danger',
            className
        ) }
        { ...props }
    >
        { children }
    </DokanUIButton>
);

export default {
    Button,
    SecondaryButton,
    TertiaryButton,
    InfoButton,
    SuccessButton,
    WarningButton,
    DangerButton,
};
