import { type SettingsElement } from '@wedevs/plugin-ui';
import { twMerge } from 'tailwind-merge';

type Props = {
    element: SettingsElement;
    className?: string;
};

// Shared title/description block for the commission field wrappers, matching plugin-ui's fields.
export default function CommissionFieldHeading( {
    element,
    className,
}: Props ) {
    const label = element.label || element.title;

    if ( ! label && ! element.description ) {
        return null;
    }

    return (
        <div className={ twMerge( 'flex flex-col gap-1 w-full', className ) }>
            { label && (
                <span className="text-sm font-semibold text-foreground">
                    { label }
                </span>
            ) }
            { element.description && (
                <span className="text-xs text-muted-foreground leading-relaxed">
                    { element.description }
                </span>
            ) }
        </div>
    );
}
