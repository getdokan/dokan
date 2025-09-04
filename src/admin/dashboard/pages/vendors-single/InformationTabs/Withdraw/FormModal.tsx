import { Modal } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { DokanButton } from '@dokan/components';

interface Props {
    title: string;
    children: JSX.Element | any;
    isOpen: boolean;
    setIsOpen: ( openStatus: boolean ) => void;
    isSaving: boolean;
    onConfirm: () => void;
}
function FormModal( {
    title,
    children,
    isOpen,
    setIsOpen,
    isSaving,
    onConfirm,
}: Props ) {
    return (
        <div>
            <Modal
                className="max-w-xl"
                isOpen={ isOpen }
                onClose={ () => setIsOpen( false ) }
            >
                <Modal.Title className="border-b">{ title ?? '' }</Modal.Title>
                <Modal.Content className="flex flex-col gap-3">
                    { children }
                </Modal.Content>
                <Modal.Footer className="border-t flex justify-end gap-3">
                    <DokanButton
                        variant="secondary"
                        disabled={ isSaving }
                        className={ `dokan-btn` }
                        label={ __( 'Cancel', 'dokan' ) }
                        onClick={ () => setIsOpen( false ) }
                    />
                    <DokanButton
                        variant={ 'primary' }
                        loading={ isSaving }
                        disabled={ isSaving }
                        className={ `dokan-btn` }
                        label={ __( 'Confirm', 'dokan' ) }
                        onClick={ onConfirm }
                    />
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default FormModal;
