import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Switch, useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import DokanModal from '../../../../../../components/modals/DokanModal';
import CommissionFieldHeading from './CommissionFieldHeading';

type Props = {
    element: SettingsElement;
};

/**
 * Settings adapter for the commission "inheritance" toggle.
 *
 * Flipping `reset_sub_category_when_edit_all_category` changes how every
 * subcategory rate behaves, so each flip is gated behind a confirmation whose
 * copy reflects the direction — mirroring the legacy settings form and the
 * vendor editor. The switch position only commits once the user confirms.
 *
 * Registered against the generic `switch` filter but scoped by id, so every
 * other switch keeps plugin-ui's default rendering.
 * @param root0
 * @param root0.element
 */
export default function DokanCommissionInheritanceSwitch( { element }: Props ) {
    const { updateValue } = useSettings();
    const [ confirmOpen, setConfirmOpen ] = useState( false );

    const enableValue = element.enable_state?.value ?? 'on';
    const disableValue = element.disable_state?.value ?? 'off';
    const isEnabled = ( element.value ?? element.default ) === enableValue;

    const hasLabel = Boolean( element.label || element.title );

    return (
        <div
            className="grid grid-cols-12 gap-2 items-center w-full p-4"
            id={ element.id }
            data-testid={ `settings-field-${ element.id }` }
        >
            { hasLabel && (
                <div className="sm:col-span-8 col-span-12">
                    <CommissionFieldHeading element={ element } />
                </div>
            ) }
            <div
                className={
                    hasLabel
                        ? 'sm:col-span-4 col-span-12 flex sm:justify-end'
                        : 'col-span-12'
                }
            >
                <Switch
                    checked={ isEnabled }
                    // Defer the write to the confirmation modal; the switch stays put until accepted.
                    onCheckedChange={ () => setConfirmOpen( true ) }
                />
            </div>

            <DokanModal
                isOpen={ confirmOpen }
                namespace="commission-inheritance-confirm"
                onConfirm={ () => {
                    updateValue(
                        element.id,
                        isEnabled ? disableValue : enableValue
                    );
                    setConfirmOpen( false );
                } }
                onClose={ () => setConfirmOpen( false ) }
                confirmationTitle={
                    isEnabled
                        ? __(
                              'Disable Commission Inheritance Setting?',
                              'dokan-lite'
                          )
                        : __(
                              'Enable Commission Inheritance Setting?',
                              'dokan-lite'
                          )
                }
                confirmationDescription={
                    isEnabled
                        ? __(
                              'Subcategories will maintain their independent commission rates when parent category rates are changed.',
                              'dokan-lite'
                          )
                        : __(
                              'Parent category commission changes will automatically update all subcategories. Existing rates will remain unchanged until parent category is modified.',
                              'dokan-lite'
                          )
                }
                confirmButtonText={
                    isEnabled
                        ? __( 'Disable', 'dokan-lite' )
                        : __( 'Enable', 'dokan-lite' )
                }
                cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
            />
        </div>
    );
}
