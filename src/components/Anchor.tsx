// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { twMerge } from 'tailwind-merge';

type DokanAnchorProps = React.AnchorHTMLAttributes< HTMLAnchorElement > & {
    children?: React.ReactNode;
    className?: string;
    href: string;
};

// A single Anchor component that handles all variants
export const Anchor = ( {
    children,
    className = '',
    href,
    ...props
}: DokanAnchorProps ) => {
    return (
        <a
            href={ href }
            className={ twMerge( '!dokan-link', className ) }
            { ...props }
        >
            { children }
        </a>
    );
};

export default Anchor;
