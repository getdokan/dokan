// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { Button as DokanUIButton } from '@getdokan/dokan-ui';
import type { ButtonProps } from '@getdokan/dokan-ui/dist/components/Button';

// Base Button component that handles all variants
export const Button = ( { className, children, ...props }: Partial< ButtonProps > ) => {
    return (
        <DokanUIButton
            color="purple"
            className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-btn text-dokan-btn border border-dokan-btn ring-dokan-btn hover:bg-dokan-btn-hover hover:text-dokan-btn-hover ${ className }` }
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
        className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-btn-secondary text-dokan-btn-secondary border border-dokan-btn-secondary ring-dokan-btn-secondary hover:bg-dokan-btn-secondary-hover hover:text-dokan-btn-secondary-hover ${ className }` }
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
        className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-btn-tertiary text-dokan-btn-tertiary border border-dokan-btn-tertiary ring-dokan-btn-tertiary hover:bg-dokan-btn-tertiary-hover hover:text-dokan-btn-tertiary-hover ${ className }` }
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
        className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-info text-dokan-info border border-dokan-info ring-dokan-info hover:bg-blue-600 hover:text-white ${ className }` }
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
        className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-success text-dokan-success border border-dokan-success ring-dokan-success hover:bg-green-600 hover:text-white ${ className }` }
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
        className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-warning text-dokan-warning border border-dokan-warning ring-dokan-warning hover:bg-yellow-600 hover:text-white ${ className }` }
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
        className={ `transition-colors duration-200 ease-in-out ring-1 ring-inset bg-dokan-danger text-dokan-danger border border-dokan-danger ring-dokan-danger hover:bg-red-600 hover:text-white ${ className }` }
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
