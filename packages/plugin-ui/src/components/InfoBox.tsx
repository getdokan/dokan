import type { ReactNode } from 'react';

export interface InfoBoxProps {
    /**
     * Box content
     */
    children?: ReactNode;

    /**
     * Title text
     */
    title?: string;

    /**
     * Message text
     */
    message?: string;

    /**
     * Variant/type
     */
    variant?: 'info' | 'success' | 'warning' | 'error';

    /**
     * Show icon
     */
    showIcon?: boolean;

    /**
     * Link text
     */
    linkText?: string;

    /**
     * Link URL
     */
    linkUrl?: string;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Dismissible
     */
    dismissible?: boolean;

    /**
     * Dismiss callback
     */
    onDismiss?: () => void;
}

const variantStyles = {
    info: {
        bg: 'bg-blue-50',
        border: 'border-l-blue-500',
        text: 'text-blue-800',
        icon: 'text-blue-500',
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-l-green-500',
        text: 'text-green-800',
        icon: 'text-green-500',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-l-yellow-500',
        text: 'text-yellow-800',
        icon: 'text-yellow-500',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-l-red-500',
        text: 'text-red-800',
        icon: 'text-red-500',
    },
};

const icons = {
    info: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ 2 }
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    ),
    success: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ 2 }
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    ),
    warning: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ 2 }
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
    ),
    error: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={ 2 }
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    ),
};

/**
 * InfoBox Component
 *
 * An informational message box.
 */
const InfoBox = ( {
    children,
    title,
    message,
    variant = 'info',
    showIcon = true,
    linkText,
    linkUrl,
    className = '',
    dismissible = false,
    onDismiss,
}: InfoBoxProps ) => {
    const styles = variantStyles[ variant ];

    return (
        <div
            className={ `
                ${ styles.bg } ${ styles.text }
                border-l-4 ${ styles.border }
                p-4 rounded-r-md
                ${ className }
            `.trim() }
            role="alert"
        >
            <div className="flex">
                { showIcon && (
                    <div className="flex-shrink-0">
                        <svg
                            className={ `h-5 w-5 ${ styles.icon }` }
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            { icons[ variant ] }
                        </svg>
                    </div>
                ) }
                <div className={ `${ showIcon ? 'ml-3' : '' } flex-1` }>
                    { title && (
                        <h4 className="text-sm font-semibold">{ title }</h4>
                    ) }
                    { message && (
                        <p className="text-sm mt-1">{ message }</p>
                    ) }
                    { children }
                    { linkText && linkUrl && (
                        <a
                            href={ linkUrl }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline mt-2 inline-block hover:opacity-80"
                        >
                            { linkText }
                        </a>
                    ) }
                </div>
                { dismissible && (
                    <button
                        type="button"
                        onClick={ onDismiss }
                        className="flex-shrink-0 ml-4 text-current opacity-50 hover:opacity-100"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                ) }
            </div>
        </div>
    );
};

export default InfoBox;

