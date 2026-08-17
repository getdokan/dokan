import * as LucideIcons from 'lucide-react';

interface LucideIconProps {
    iconName: string;
    className?: string;
    size?: number;
    fallbackIcon?: keyof typeof LucideIcons;

    [ key: string ]: any; // Allow any other props to be passed through
}

/**
 * A reusable component for rendering Lucide icons dynamically by name.
 *
 * @param iconName.iconName
 * @param iconName              - The name of the Lucide icon to render
 * @param className             - CSS classes to apply to the icon
 * @param size                  - Size of the icon (if provided, overrides width/height in className)
 * @param fallbackIcon          - The fallback icon to use if the requested icon is not found
 * @param props                 - Any additional props to pass to the icon component
 * @param iconName.className
 * @param iconName.size
 * @param iconName.fallbackIcon
 */
const LucideIcon = ( {
    iconName,
    className = 'w-5 h-5 text-[#828282]',
    size,
    fallbackIcon = 'Settings',
    ...props
}: LucideIconProps ) => {
    // Get the icon component by name
    const IconComponent = ( LucideIcons as any )[ iconName ];

    // If the icon is not found, use the fallback icon
    if ( ! IconComponent ) {
        console.warn(
            `Icon "${ iconName }" not found in Lucide React. Using fallback: ${ fallbackIcon }.`
        );
        const FallbackIcon = ( LucideIcons as any )[ fallbackIcon ];

        if ( ! FallbackIcon ) {
            console.error(
                `Fallback icon "${ fallbackIcon }" also not found in Lucide React. Using Settings icon.`
            );
            return (
                <LucideIcons.Settings
                    className={ className }
                    size={ size }
                    { ...props }
                />
            );
        }

        return (
            <FallbackIcon className={ className } size={ size } { ...props } />
        );
    }

    return <IconComponent className={ className } size={ size } { ...props } />;
};

export default LucideIcon;
