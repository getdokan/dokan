import { twMerge } from 'tailwind-merge';

interface SquareMinusProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const SquareMinus: React.FC< SquareMinusProps > = ( {
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    className = '',
    onClick,
    disabled = false,
} ) => {
    const handleClick = () => {
        if ( ! disabled && onClick ) {
            onClick();
        }
    };

    return (
        <svg
            width={ size }
            height={ size }
            viewBox="0 0 24 24"
            fill="none"
            stroke={ color }
            strokeWidth={ strokeWidth }
            strokeLinecap="round"
            strokeLinejoin="round"
            className={ twMerge(
                'transition-opacity focus:!outline-none',
                disabled && 'opacity-50 cursor-not-allowed',
                ! disabled && onClick && 'cursor-pointer',
                className
            ) }
            onClick={ handleClick }
            role={ onClick ? 'button' : 'img' }
            aria-label="Remove item"
            tabIndex={ onClick && ! disabled ? 0 : -1 }
            onKeyDown={ ( e ) => {
                if (
                    ( e.key === 'Enter' || e.key === ' ' ) &&
                    onClick &&
                    ! disabled
                ) {
                    e.preventDefault();
                    onClick();
                }
            } }
        >
            <path d="M6 10H14M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z" />
        </svg>
    );
};

export default SquareMinus;
