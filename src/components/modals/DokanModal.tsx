import { __, sprintf } from '@wordpress/i18n';
import { Modal, Slot } from '@wordpress/components';
import { kebabCase } from '../../utilities';
import { debounce } from '@wordpress/compose';
import { useCallback, useState } from '@wordpress/element';
import DialogIcon from './DialogIcon';
import DokanButton, { ButtonVariant } from '../Button';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import './style.scss';

interface DokanModalProps {
    isOpen: boolean;
    namespace: string;
    className?: string;
    modalClassName?: string;
    modalBodyClassName?: string;
    modalFooterClassName?: string;
    onClose: () => void;
    dialogTitle?: string;
    onConfirm: () => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
    confirmationTitle?: string;
    confirmationDescription?: string;
    cancelIcon?: JSX.Element;
    dialogIcon?: JSX.Element;
    dialogHeader?: JSX.Element | false;
    dialogContent?: JSX.Element;
    dialogFooter?: JSX.Element | false;
    dialogFooterContent?: JSX.Element | false;
    loading?: boolean;
    confirmButtonVariant?: ButtonVariant;
    hideCancelButton?: boolean;
    confirmButtonDisabled?: boolean;
    isDismissible?: boolean;
    shouldCloseOnClickOutside?: boolean;
    shouldCloseOnEsc?: boolean;
}

const DokanModal = ( props: DokanModalProps ) => {
    const {
        isOpen,
        onClose,
        className,
        modalClassName,
        modalBodyClassName,
        modalFooterClassName,
        onConfirm,
        namespace,
        dialogTitle,
        cancelButtonText,
        confirmButtonText,
        confirmationTitle,
        confirmationDescription,
        cancelIcon,
        dialogIcon,
        dialogHeader,
        dialogFooter,
        dialogFooterContent,
        dialogContent,
        loading = false,
        confirmButtonVariant = 'primary',
        hideCancelButton = false,
        confirmButtonDisabled = false,
        isDismissible = true,
        shouldCloseOnClickOutside = true,
        shouldCloseOnEsc = true
    } = props;

    if ( ! namespace ) {
        throw new Error(
            'Namespace is required for the Confirmation Modal component'
        );
    }

    const dialogNamespace = kebabCase
        ? kebabCase( namespace || '' )
        : namespace;
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

    if ( ! isOpen ) {
        return null;
    }

    return (
        <Modal
            { ...props }
            onRequestClose={ onClose }
            className={ twMerge(
                `dokan-custom-modal dokan-layout bg-transparent shadow-none`,
                modalClassName
            ) }
            isDismissible={ isDismissible }
            shouldCloseOnClickOutside={ shouldCloseOnClickOutside }
            shouldCloseOnEsc={ shouldCloseOnEsc }
            __experimentalHideHeader={ true }
        >
            <div
                className={ twMerge(
                    'relative text-left bg-white w-full max-w-xl rounded-lg transition-all transform shadow-xl',
                    className
                ) }
            >
                {/* Close Button - Top Right */}
                { isDismissible === false
                    ? null
                    : cancelIcon || (
                        <button
                            onClick={ onClose }
                            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border hover:border-red-600 transition-all duration-200 z-10"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) }

                {/* Modal Header/Title */}
                { dialogHeader === false
                    ? null
                    : dialogHeader || (
                          <div className="px-6 py-4 border-b border-gray-200">
                              <Slot
                                  name={ `dokan-before-dialog-header-${ dialogNamespace }` }
                                  fillProps={ { namespace } }
                              />

                              <h2 className="text-lg font-semibold text-gray-900 leading-6 pr-8">
                                  { dialogTitle ||
                                      __( 'Confirmation Dialog', 'dokan-lite' ) }
                              </h2>

                              <Slot
                                  name={ `dokan-after-dialog-header-${ dialogNamespace }` }
                                  fillProps={ { namespace } }
                              />
                          </div>
                      ) }

                {/* Modal Content/Body */}
                <div className={ twMerge( 'px-6 py-5', modalBodyClassName ) }>
                    <Slot
                        name={ `dokan-before-${ dialogNamespace }-dialog-content` }
                        fillProps={ { namespace } }
                    />

                    { dialogContent || (
                        <div className="flex items-start gap-4">
                            { dialogIcon || (
                                <div className="flex items-center justify-center shrink-0 w-12 h-12 bg-red-50 rounded-full">
                                    <DialogIcon />
                                </div>
                            ) }
                            <div className="flex-1">
                                <h3
                                    className="text-base font-semibold text-gray-900 mb-1"
                                    dangerouslySetInnerHTML={ {
                                        __html:
                                            confirmationTitle ||
                                            __( 'Delete Confirmation', 'dokan-lite' ),
                                    } }
                                ></h3>
                                <p
                                    className="text-sm text-gray-500 leading-relaxed"
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
                                ></p>
                            </div>
                        </div>
                    ) }

                    <Slot
                        name={ `dokan-after-${ dialogNamespace }-dialog-content` }
                        fillProps={ { namespace } }
                    />
                </div>

                {/* Modal Footer */}
                { dialogFooter === false
                    ? null
                    : dialogFooter || (
                          <div
                              className={ twMerge(
                                  'px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3',
                                  modalFooterClassName
                              ) }
                          >
                              { dialogFooterContent || (
                                  <>
                                      { hideCancelButton || (
                                          <DokanButton
                                              onClick={ onClose }
                                              variant={ `secondary` }
                                              disabled={
                                                  isSubmitting || loading
                                              }
                                          >
                                              { cancelButtonText ||
                                                  __( 'Cancel', 'dokan-lite' ) }
                                          </DokanButton>
                                      ) }
                                      <DokanButton
                                          onClick={ handleConfirm }
                                          variant={ confirmButtonVariant }
                                          loading={ isSubmitting || loading }
                                          disabled={
                                              isSubmitting ||
                                              loading ||
                                              confirmButtonDisabled
                                          }
                                      >
                                          { confirmButtonText ||
                                              __( 'Yes, Delete', 'dokan-lite' ) }
                                      </DokanButton>
                                  </>
                              ) }
                          </div>
                      ) }
            </div>
        </Modal>
    );
};

export default DokanModal;