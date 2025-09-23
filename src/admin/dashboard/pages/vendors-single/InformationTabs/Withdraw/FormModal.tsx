import { __ } from '@wordpress/i18n';
import { DokanButton, DokanModal } from '@dokan/components';

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
            <DokanModal
                isOpen={ isOpen }
                namespace="withdraw-form-modal"
                onClose={ () => setIsOpen( false ) }
                dialogTitle={ title ?? '' }
                dialogContent={
                    <div className="flex flex-col gap-3">{ children }</div>
                }
                dialogFooterContent={
                    <div className="flex justify-end gap-3">
                        <DokanButton
                            variant="secondary"
                            disabled={ isSaving }
                            className={ `dokan-btn` }
                            label={ __( 'Cancel', 'dokan-lite' ) }
                            onClick={ () => setIsOpen( false ) }
                        />
                        <DokanButton
                            variant={ 'primary' }
                            loading={ isSaving }
                            disabled={ isSaving }
                            className={ `dokan-btn` }
                            label={ __( 'Confirm', 'dokan-lite' ) }
                            onClick={ onConfirm }
                        />
                    </div>
                }
            />
        </div>
    );
}

export default FormModal;
