import GoogleIcon from '../Icons/GoogleIcon';
import { useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';

interface SocialButtonProps {
    network: 'facebook' | 'google' | 'twitter' | string;
    label?: string | JSX.Element;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

// Figma Google icon asset (replace with local asset if needed)
const GOOGLE_ICON = <GoogleIcon />;

const getNetworkConfig = ( network: string, hovered: boolean ) => {
    switch ( network ) {
        case 'google':
            return {
                icon: GOOGLE_ICON,
                border: hovered ? 'border-[#7047eb]' : 'border-[#e9e9e9]',
                text: 'Sign in with Google',
                textColor: hovered ? 'text-[#7047eb]' : 'text-black',
                bg: 'bg-white',
            };
        // Add other networks here as needed
        default:
            return {
                icon: null,
                border: 'border-[#e9e9e9]',
                text: '',
                textColor: 'text-black',
                bg: 'bg-white',
            };
    }
};

export const SocialButton: React.FC< SocialButtonProps > = ( {
    network = 'google',
    label,
    onClick,
    className = '',
    disabled = false,
} ) => {
    const [ hovered, setHovered ] = useState( false );
    const config = getNetworkConfig( network, hovered );

    return (
        <button
            type="button"
            onClick={ onClick }
            disabled={ disabled }
            className={ twMerge( `flex flex-row min-w-48 max-w-full items-center p-0 rounded-[5px] overflow-hidden font-inter text-[14px] font-normal leading-[1.4] not-italic transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ config.bg } ${ disabled } ${ className }
            ` ) }
            aria-label={ label || config.text }
            onMouseEnter={ () => setHovered( true ) }
            onMouseLeave={ () => setHovered( false ) }
            style={ { minWidth: 180 } }
        >
            { /* Left icon section */ }
            <div
                className={ `h-10 w-[49px] flex items-center justify-center border-r-0 ${ config.border } bg-white relative` }
                style={ {
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5,
                    borderWidth: 1,
                } }
            >
                { config.icon }
                <div
                    className={ `absolute inset-0 pointer-events-none rounded-bl-[5px] rounded-tl-[5px]` }
                />
            </div>
            { /* Right label section */ }
            <div
                className={ `h-10 flex items-center justify-center px-4 py-2.5 border ${ config.border } bg-white relative` }
                style={ {
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                    borderWidth: 1,
                } }
            >
                <span className={ `${ config.textColor } whitespace-nowrap` }>
                    { label || config.text }
                </span>
            </div>
        </button>
    );
};

export default SocialButton;
