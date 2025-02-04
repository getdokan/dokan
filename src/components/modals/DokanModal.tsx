import { __ } from  '@wordpress/i18n';
import { Slot } from '@wordpress/components';
import { kebabCase } from '@dokan/utilities';
import { debounce } from '@wordpress/compose';
import { Modal, Button } from '@getdokan/dokan-ui';
import { useCallback, useState } from '@wordpress/element';

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
}

const DokanModal = ({
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
}: DokanModalProps) => {
    if ( ! namespace ) {
        throw new Error( 'Namespace is required for the Confirmation Modal component' );
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
            <div className={ `relative text-left bg-white max-w-xl rounded transition-all transform shadow-xl self-center z-0 ${ className }` }>
                <Modal.Title className={ `border-b` }>
                    <Slot
                        name={ `dokan-before-dialog-header-${ dialogNamespace }` }
                        fillProps={{ namespace }}
                    />

                    { dialogHeader || (
                        <div className='text-gray-900'>
                            { dialogTitle || __( 'Confirmation Dialog', 'dokan-lite' ) }
                        </div>
                    )}

                    <Slot
                        name={ `dokan-after-dialog-header-${ dialogNamespace }` }
                        fillProps={{ namespace }}
                    />
                </Modal.Title>
                <Modal.Content>
                    <Slot
                        name={ `dokan-before-${ dialogNamespace }-dialog-content` }
                        fillProps={{ namespace }}
                    />

                    { dialogContent || (
                        <div className="sm:flex sm:items-start min-h-32">
                            {dialogIcon || (
                                <div
                                    className={`flex items-center justify-center flex-shrink-0 w-14 h-14 bg-red-50 border border-red-50 rounded-full`}>
                                    <svg className={`w-4 h-4 fill-red-500 stroke-red-500`}>
                                        <path
                                            d="M2.674 3.323zm.628.284v.005-.005zm0 .005h0zm1.31 1.486h0c-.14.215-.236.49-.182.766a.71.71 0 0 0 .24.411c.139.116.304.162.461.162h.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001 0 0 .001 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0c.345 0 .631.283.631.64s-.286.64-.631.64H1.67c-.345 0-.631-.283-.631-.64V3.171c0-.357.286-.64.631-.64s.631.283.631.64v.439c0 .087.009.262.121.419a.56.56 0 0 0 .298.212c.126.037.24.023.321 0 .147-.042.256-.131.319-.19a1.8 1.8 0 0 0 .209-.235c1.298-1.714 3.337-2.761 5.524-2.761h0c3.826 0 6.946 3.137 6.946 7s-3.12 7-6.945 7h0c-.434 0-.793-.356-.793-.803s.359-.803.793-.803c2.959 0 5.36-2.423 5.36-5.395s-2.4-5.395-5.36-5.395c-1.821 0-3.502.938-4.482 2.439z"/>
                                    </svg>
                                </div>
                            )}
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-base font-semibold text-gray-900"
                                    dangerouslySetInnerHTML={
                                        {__html: confirmationTitle || __('Delete Confirmation', 'dokan-lite')}
                                    }
                                ></h3>
                                <div className="mt-2"
                                     dangerouslySetInnerHTML={
                                         {
                                             __html: confirmationDescription || sprintf(
                                                 /* translators: %1$s: opening strong tag, %2$s: closing strong tag */
                                                 __('Are you sure you want to proceed with this %1$sdeletion%2$s?', 'dokan-lite'),
                                                 '<strong>',
                                                 '</strong>'
                                             )
                                         }
                                     }
                                ></div>
                            </div>
                        </div>
                    )}

                    <Slot
                        name={ `dokan-after-${ dialogNamespace }-dialog-content` }
                        fillProps={{ namespace }}
                    />
                </Modal.Content>
                <Modal.Footer className="border-t">
                    { dialogFooter || (
                        <div className={ `flex items-center justify-end gap-3` }>
                            <Button
                                onClick={ onClose }
                                disabled={ isSubmitting || loading }
                                className={ `inline-flex justify-center bg-white hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2 px-4 ring-1 ring-inset ring-gray-300 rounded-md` }
                            >
                                { cancelButtonText || __( 'Cancel', 'dokan-lite' ) }
                            </Button>
                            <Button
                                onClick={ handleConfirm }
                                loading={ isSubmitting || loading }
                                disabled={ isSubmitting || loading }
                                className={ `inline-flex justify-center bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2 px-4 ring-1 ring-inset ring-red-500 rounded-md` }
                            >
                                { confirmButtonText || __( 'Yes, Delete', 'dokan-lite' ) }
                            </Button>
                        </div>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default DokanModal;
