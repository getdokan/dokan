import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
    DokanFieldLabel,
    DokanSwitch as BaseDokanSwitch,
} from '../../../../../../components/fields';
import DokanModal from '../../../../../../components/modals/DokanModal';
import settingsStore from '../../../../../../stores/adminSettings';
import { SimpleCheckbox } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

export default function DokanSwitch( { element } ) {
    const [ isModalOpen, setIsModalOpen ] = useState( false );
    const [ isConfirmChecked, setIsConfirmChecked ] = useState( false );

    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );
    const shouldConfirm = element.should_confirm === true;
    const confirmModal = element.confirm_modal || {};
    const isCurrentlyEnabled = element.value === element.enable_state?.value;

    const handleSwitchChange = ( checked: boolean ) => {
        // If should_confirm is true and we're trying to enable the switch
        if ( shouldConfirm && checked && ! isCurrentlyEnabled ) {
            setIsModalOpen( true );
            setIsConfirmChecked( false );
            return;
        }

        onValueChange( {
            ...element,
            value: checked
                ? element.enable_state?.value
                : element.disable_state?.value,
        } );
    };

    const handleConfirm = () => {
        onValueChange( {
            ...element,
            value: element.enable_state?.value,
        } );
        setIsModalOpen( false );
        setIsConfirmChecked( false );
    };

    const handleModalClose = () => {
        setIsModalOpen( false );
        setIsConfirmChecked( false );
    };
    return (
        <>
            <div
                className={ twMerge(
                    'grid-cols-12 grid gap-2 justify-between items-center w-full p-4',
                    element?.switcher_type === 'error' && 'bg-[#FEF3F4]'
                ) }
                id={ element.hook_key }
            >
                { hasTitle && (
                    <div className={ 'sm:col-span-8 col-span-12' }>
                        <DokanFieldLabel
                            title={ element.title }
                            titleFontWeight="bold"
                            helperText={ element.description }
                            tooltip={ element.tooltip }
                            imageUrl={ element?.image_url }
                            wrapperClassNames={ 'w-full items-center' }
                            fieldType={ element.switcher_type }
                            validationError={ element?.validationError }
                        />
                    </div>
                ) }
                <div
                    className={
                        hasTitle
                            ? 'sm:col-span-4 col-span-12 flex justify-end'
                            : 'col-span-12'
                    }
                >
                    <BaseDokanSwitch
                        checked={ isCurrentlyEnabled }
                        onChange={ handleSwitchChange }
                        label={ element.label }
                        disabled={ element.disabled }
                        switcherType={ element.switcher_type }
                    />
                </div>
            </div>

            { shouldConfirm && (
                <DokanModal
                    isOpen={ isModalOpen }
                    onClose={ handleModalClose }
                    onConfirm={ handleConfirm }
                    namespace="dokan-switch-confirm"
                    dialogTitle={
                        confirmModal.title || __( 'Confirmation', 'dokan-lite' )
                    }
                    confirmationTitle={
                        confirmModal.confirmationTitle ||
                        __( 'Are you sure?', 'dokan-lite' )
                    }
                    confirmationDescription={
                        confirmModal.description ||
                        __( 'This action cannot be undone.', 'dokan-lite' )
                    }
                    confirmButtonText={
                        confirmModal.confirmText ||
                        __( 'Yes, Confirm', 'dokan-lite' )
                    }
                    cancelButtonText={
                        confirmModal.cancelText || __( 'Cancel', 'dokan-lite' )
                    }
                    confirmButtonDisabled={
                        confirmModal.checkboxLabel ? ! isConfirmChecked : false
                    }
                    dialogContent={
                        confirmModal.checkboxLabel && (
                            <div className="sm:flex sm:items-start min-h-32">
                                <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-red-50 border border-red-50 rounded-full">
                                    <svg
                                        className="w-6 h-6 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <div className="mt-3 sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        { confirmModal.confirmationTitle ||
                                            __(
                                                'Are you sure?',
                                                'dokan-lite'
                                            ) }
                                    </h3>
                                    <div className="mt-2 text-sm text-gray-500">
                                        { confirmModal.description ||
                                            __(
                                                'This action cannot be undone.',
                                                'dokan-lite'
                                            ) }
                                    </div>
                                    <div className="mt-4">
                                        <label className="items-center cursor-pointer gap-1 inline-flex">
                                            <SimpleCheckbox
                                                input={ {
                                                    type: 'checkbox',
                                                    name: 'confirm-checkbox',
                                                    id: 'confirm-checkbox',
                                                } }
                                                checked={ isConfirmChecked }
                                                onChange={ ( e ) =>
                                                    setIsConfirmChecked(
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 m-0"
                                            />
                                            <span className="text-sm text-gray-600">
                                                { confirmModal.checkboxLabel }
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                />
            ) }
        </>
    );
}
