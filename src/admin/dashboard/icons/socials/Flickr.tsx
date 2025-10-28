import { __ } from '@wordpress/i18n';

export interface SocialIconProps {
    className?: string;
    title?: string;
}

const Flickr = ( {
    className = 'w-7 h-7',
    title = __( 'Flickr', 'dokan-lite' ),
}: SocialIconProps ) => (
    <svg
        className={ className }
        aria-label={ title }
        role="img"
        viewBox="0 0 448 512"
    >
        <path
            fill={ '#FB0072' }
            d="M400 32L48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l352 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48zM144.5 192a63.5 63.5 0 1 1 0 127 63.5 63.5 0 1 1 0-127zm159 0a63.5 63.5 0 1 1 0 127 63.5 63.5 0 1 1 0-127z"
        />
    </svg>
);

export default Flickr;
