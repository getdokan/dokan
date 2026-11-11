import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { toast } from '@wedevs/plugin-ui';
import { DokanTooltip } from '@dokan/components';
import { Check, Copy } from 'lucide-react';
import { copyText } from './utils';

// Copies on click and reports it for two seconds; shared by the token button and the in-field icon.
export const useCopy = ( text: string ) => {
    const [ copied, setCopied ] = useState( false );
    const timer = useRef< number >();

    useEffect( () => () => window.clearTimeout( timer.current ), [] );

    const copy = async () => {
        if ( ! ( await copyText( text ) ) ) {
            toast.error(
                __(
                    'Could not copy. Select the text and copy it.',
                    'dokan-lite'
                )
            );
            return;
        }

        setCopied( true );
        window.clearTimeout( timer.current );
        timer.current = window.setTimeout( () => setCopied( false ), 2000 );
    };

    return { copied, copy };
};

// An icon at a field's right end, like the built-in copy and show/hide icons; the reset keeps the theme's button chrome off it.
export const fieldIconClass =
    'inline-flex cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 text-gray-500 shadow-none transition-colors hover:bg-transparent hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400';

const CopyIcon = ( { text, label }: { text: string; label: string } ) => {
    const { copied, copy } = useCopy( text );

    return (
        <DokanTooltip content={ copied ? __( 'Copied', 'dokan-lite' ) : label }>
            <button
                type="button"
                className={ fieldIconClass }
                aria-label={ label }
                onClick={ copy }
            >
                { copied ? (
                    <Check size={ 16 } className="text-green-600" />
                ) : (
                    <Copy size={ 16 } />
                ) }
            </button>
        </DokanTooltip>
    );
};

export default CopyIcon;
