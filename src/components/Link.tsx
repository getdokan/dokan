import { twMerge } from 'tailwind-merge';

type DokanLinkProps = React.AnchorHTMLAttributes< HTMLAnchorElement > & {
    children?: React.ReactNode;
    className?: string;
    href: string;
};

// A single Link component that handles all variants
export const DokanLink = ({
    children,
    className = '',
    href,
    ...props
}: DokanLinkProps ) => {
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

export default DokanLink;
