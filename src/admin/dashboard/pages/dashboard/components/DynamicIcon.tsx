import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
    iconName: string;
    size?: number;
    className?: string;
}

const DynamicIcon = ( {
    iconName,
    size = 24,
    className = '',
    ...props
}: DynamicIconProps ) => {
    const IconComponent = ( LucideIcons as any )[ iconName ];
    // If the icon is not found, use a fallback icon
    if ( ! IconComponent ) {
        // eslint-disable-next-line no-console
        console.warn(
            `Icon "${ iconName }" not found in Lucide React. Using fallback.`
        );
        return (
            <LucideIcons.HelpCircle
                size={ size }
                className={ className }
                { ...props }
            />
        );
    }

    return <IconComponent size={ size } className={ className } { ...props } />;
};

export default DynamicIcon;
