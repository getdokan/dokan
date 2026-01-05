import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { ModalProps } from '../types';

/**
 * Modal Component
 *
 * A dialog/modal window.
 */
const Modal = ( {
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText,
    cancelText,
    className = '',
    showFooter = true,
}: ModalProps ) => {
    // Close on escape key
    useEffect( () => {
        const handleEscape = ( e: KeyboardEvent ) => {
            if ( e.key === 'Escape' && isOpen ) {
                onClose();
            }
        };

        document.addEventListener( 'keydown', handleEscape );
        return () => document.removeEventListener( 'keydown', handleEscape );
    }, [ isOpen, onClose ] );

    // Prevent body scroll when modal is open
    useEffect( () => {
        if ( isOpen ) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [ isOpen ] );

    const handleBackdropClick = useCallback(
        ( e: React.MouseEvent ) => {
            if ( e.target === e.currentTarget ) {
                onClose();
            }
        },
        [ onClose ]
    );

    if ( ! isOpen ) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            { /* Backdrop */ }
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={ handleBackdropClick }
            />

            { /* Modal */ }
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={ `
                        relative transform overflow-hidden rounded-lg bg-white 
                        text-left shadow-xl transition-all 
                        sm:my-8 sm:w-full sm:max-w-lg
                        ${ className }
                    `.trim() }
                >
                    { /* Header */ }
                    { title && (
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3
                                id="modal-title"
                                className="text-lg font-semibold text-gray-900"
                            >
                                { title }
                            </h3>
                            <button
                                type="button"
                                onClick={ onClose }
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                            >
                                <svg
                                    className="h-5 w-5"
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
                        </div>
                    ) }

                    { /* Content */ }
                    <div className="px-6 py-4">{ children }</div>

                    { /* Footer */ }
                    { showFooter && (
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={ onClose }
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                { cancelText || __( 'Cancel', 'wedevs-plugin-ui' ) }
                            </button>
                            { onConfirm && (
                                <button
                                    type="button"
                                    onClick={ onConfirm }
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    { confirmText || __( 'Confirm', 'wedevs-plugin-ui' ) }
                                </button>
                            ) }
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default Modal;

