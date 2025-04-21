import { __, sprintf } from '@wordpress/i18n';
import { Slot } from '@wordpress/components';
import { kebabCase } from '@dokan/utilities';
import { debounce } from '@wordpress/compose';
import { Modal } from '@getdokan/dokan-ui';
import { useCallback, useState } from '@wordpress/element';
import DialogIcon from './DialogIcon';
import { DokanButton } from '../Button';

interface DokanModalProps {
    isOpen: boolean;
    namespace: string;
    className?: string;
    onClose: () => void;
    dialogTitle?: string;
    onConfirm: () => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
    confirmationTitle?: string;
    confirmationDescription?: string;
    dialogIcon?: JSX.Element;
    dialogHeader?: JSX.Element;
    dialogContent?: JSX.Element;
    dialogFooter?: JSX.Element;
    loading?: boolean;
    confirmButtonVariant?: string;
}

const DokanModal = ( {
    isOpen,
    onClose,
    className,
    onConfirm,
    namespace,
    dialogTitle,
    cancelButtonText,
    confirmButtonText,
    confirmationTitle,
    confirmationDescription,
    dialogIcon,
    dialogHeader,
    dialogFooter,
    dialogContent,
    loading = false,
    confirmButtonVariant = 'danger',
}: DokanModalProps ) => {
    if ( ! namespace ) {
        throw new Error(
            'Namespace is required for the Confirmation Modal component'
        );
    }

    const dialogNamespace = kebabCase( namespace );
    const [ isSubmitting, setIsSubmitting ] = useState( false );

    const handleConfirm = useCallback(
        debounce( async () => {
            setIsSubmitting( true );
            try {
                await onConfirm();
                onClose();
            } catch ( error ) {
                console.error( 'Confirmation action failed:', error );
            } finally {
                setIsSubmitting( false );
            }
        }, 300 ),
        [ onConfirm, onClose ]
    );

    return (
        <Modal
            isOpen={ isOpen }
            onClose={ onClose }
            className={ `dokan-layout bg-transparent shadow-none flex justify-center w-fit` }
        >
            <div
                className={ `relative text-left bg-white max-w-xl rounded transition-all transform shadow-xl self-center z-0 ${ className }` }
            >
                <Modal.Title className={ `border-b` }>
                    <Slot
                        name={ `dokan-before-dialog-header-${ dialogNamespace }` }
                        fillProps={ { namespace } }
                    />

                    { dialogHeader || (
                        <div className="text-gray-900">
                            { dialogTitle ||
                                __( 'Confirmation Dialog', 'dokan-lite' ) }
                        </div>
                    ) }

                    <Slot
                        name={ `dokan-after-dialog-header-${ dialogNamespace }` }
                        fillProps={ { namespace } }
                    />
                </Modal.Title>
                <Modal.Content>
                    <Slot
                        name={ `dokan-before-${ dialogNamespace }-dialog-content` }
                        fillProps={ { namespace } }
                    />

                    { dialogContent || (
                        <div className="sm:flex sm:items-start min-h-32">
                            { dialogIcon || (
                                <div
                                    className={ `flex items-center justify-center flex-shrink-0 w-14 h-14 bg-red-50 border border-red-50 rounded-full` }
                                >
                                    <DialogIcon />
                                </div>
                            ) }
                            <div className="mt-3 sm:ml-4 sm:mt-0 sm:text-left">
                                <h3
                                    className="text-base font-semibold text-gray-900"
                                    dangerouslySetInnerHTML={ {
                                        __html:
                                            confirmationTitle ||
                                            __(
                                                'Delete Confirmation',
                                                'dokan-lite'
                                            ),
                                    } }
                                ></h3>
                                <div
                                    className="mt-2"
                                    dangerouslySetInnerHTML={ {
                                        __html:
                                            confirmationDescription ||
                                            sprintf(
                                                /* translators: %1$s: opening strong tag, %2$s: closing strong tag */
                                                __(
                                                    'Are you sure you want to proceed with this %1$sdeletion%2$s?',
                                                    'dokan-lite'
                                                ),
                                                '<strong>',
                                                '</strong>'
                                            ),
                                    } }
                                ></div>
                            </div>
                        </div>
                    ) }

                    <Slot
                        name={ `dokan-after-${ dialogNamespace }-dialog-content` }
                        fillProps={ { namespace } }
                    />
                </Modal.Content>
                <Modal.Footer className="border-t">
                    { dialogFooter || (
                        <div
                            className={ `flex items-center justify-end gap-3` }
                        >
                            <DokanButton
                                onClick={ onClose }
                                variant={ `secondary` }
                                disabled={ isSubmitting || loading }
                            >
                                { cancelButtonText ||
                                    __( 'Cancel', 'dokan-lite' ) }
                            </DokanButton>
                            <DokanButton
                                onClick={ handleConfirm }
                                variant={ confirmButtonVariant }
                                loading={ isSubmitting || loading }
                                disabled={ isSubmitting || loading }
                            >
                                { confirmButtonText ||
                                    __( 'Yes, Delete', 'dokan-lite' ) }
                            </DokanButton>
                        </div>
                    ) }
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default DokanModal;
