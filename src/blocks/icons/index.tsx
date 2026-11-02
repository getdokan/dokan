import { SVG, Path } from '@wordpress/primitives';
import type { ReactElement, SVGProps } from 'react';

// A Dashicon slug or an element, as registerBlockType() accepts.
type IconSource = string | ReactElement;

// Colours from the Dokan logo (wedevs.com/brand-assets).
export const CATEGORY_COLOR = '#7047EB';
export const BLOCK_COLOR = '#A287F2';

// The Dokan mark (symbol only), flat, for the "Dokan" block category; takes the size the inserter's Icon passes.
export const DokanMark = ( {
    size = 24,
    ...props
}: SVGProps< SVGSVGElement > & { size?: number } ) => (
    <SVG
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 25 30"
        width={ size }
        height={ size }
        fill={ CATEGORY_COLOR }
        { ...props }
    >
        <Path d="M17.481 14.191c-.02 4.972-2.134 10.106-6.503 12.441C7.906 28.283.645 29.551.645 24.176V4.166C.645 1.187 3.138.2 5.632.341c3.71.201 7.261 1.953 9.416 5.174 1.376 2.053 2.134 4.529 2.374 7.026.02.564.06 1.107.06 1.651z" />
        <Path d="M24.363 12.44c-.419-4.107-2.913-7.549-6.363-9.623-2.294-1.389-5.167-1.731-6.663 1.047 0 .02-10.074 18.702-10.074 18.702-.878 1.631-.678 2.979.12 4.087 1.197 1.651 3.571 2.396 5.506 2.597 1.795.201 3.611 0 5.346-.403 5.246-1.208 9.894-4.811 11.47-10.045.618-2.053.878-4.207.658-6.361z" />
    </SVG>
);

// A block's own symbol in Dokan's lighter brand colour.
export const dokanBlockIcon = ( src: IconSource ) => ( {
    src,
    foreground: BLOCK_COLOR,
} );
