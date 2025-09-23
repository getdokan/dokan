import { __, sprintf } from '@wordpress/i18n';
import { Slot } from '@wordpress/components';
import { kebabCase } from '../../utilities';
import { debounce } from '@wordpress/compose';
import { Modal } from '@getdokan/dokan-ui';
import { ModalProps } from '@getdokan/dokan-ui/dist/components/Modal';
import { useCallback, useEffect, useState } from '@wordpress/element';
import DialogIcon from './DialogIcon';
import DokanButton, { ButtonVariant } from '../Button';
import { twMerge } from 'tailwind-merge';

interface DokanModalProps {
    isOpen: boolean;
    namespace: string;
    className?: string;
    modalProps?: Partial< ModalProps >;
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
    dialogIcon?: JSX.Element;
    dialogHeader?: JSX.Element | false;
    dialogContent?: JSX.Element;
    dialogFooter?: JSX.Element | false;
    dialogFooterContent?: JSX.Element | false;
    loading?: boolean;
    confirmButtonVariant?: ButtonVariant;
    hideCancelButton?: boolean;
}

const DokanModal = ( {
    isOpen,
    onClose,
    className,
    modalProps = {},
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
    dialogIcon,
    dialogHeader,
    dialogFooter,
    dialogFooterContent,
    dialogContent,
    loading = false,
    confirmButtonVariant = 'primary',
    hideCancelButton = false,
}: DokanModalProps ) => {
    if ( ! namespace ) {
        throw new Error(
            'Namespace is required for the Confirmation Modal component'
        );
    }

    useEffect( () => {
        const portalRoot = document.querySelector( '#headlessui-portal-root' );
        if ( portalRoot ) {
            portalRoot.classList.add( 'dokan-layout' );
            portalRoot.style.display = 'block';
        } else {
            const div = document.createElement( 'div' );
            div.id = 'headlessui-portal-root';
            div.classList.add( 'dokan-layout' );
            div.style.display = 'block';
            document.body.appendChild( div );
        }
    }, [ isOpen ] );

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

    return (
        <Modal
            isOpen={ isOpen }
            onClose={ onClose }
            className={ twMerge(
                `dokan-layout bg-transparent shadow-none flex justify-center w-fit`,
                modalClassName
            ) }
            { ...modalProps }
        >
            <div
                className={ twMerge(
                    'relative text-left bg-white w-full max-w-xl rounded transition-all transform shadow-xl self-center z-0',
                    className
                ) }
            >
                { dialogHeader === false
                    ? null
                    : dialogHeader || (
                          <Modal.Title className={ `border-b` }>
                              <Slot
                                  name={ `dokan-before-dialog-header-${ dialogNamespace }` }
                                  fillProps={ { namespace } }
                              />

                              {
                                  <div className="text-gray-900">
                                      { dialogTitle ||
                                          __(
                                              'Confirmation Dialog',
                                              'dokan-lite'
                                          ) }
                                  </div>
                              }

                              <Slot
                                  name={ `dokan-after-dialog-header-${ dialogNamespace }` }
                                  fillProps={ { namespace } }
                              />
                          </Modal.Title>
                      ) }
                <Modal.Content className={ modalBodyClassName }>
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
                { dialogFooter === false
                    ? null
                    : dialogFooter || (
                          <Modal.Footer
                              className={ twMerge(
                                  'border-t flex items-center justify-end gap-3',
                                  modalFooterClassName
                              ) }
                          >
                              { dialogFooterContent || (
                                  <div
                                      className={ `flex items-center justify-end gap-3` }
                                  >
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
                                          disabled={ isSubmitting || loading }
                                      >
                                          { confirmButtonText ||
                                              __(
                                                  'Yes, Delete',
                                                  'dokan-lite'
                                              ) }
                                      </DokanButton>
                                  </div>
                              ) }
                          </Modal.Footer>
                      ) }
            </div>
        </Modal>
    );
};

export default DokanModal;
