import { useMemo } from '@wordpress/element';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import {
    FixedCommissionInput,
    type FixedCommissionInputValues,
} from '../../../../../../components/commission';
import { getDokanCurrency } from '../../../../../../utilities';
import { fixedCommissionError } from './validation';

type Props = {
    element: SettingsElement;
};

/**
 * Settings adapter for the `combine_input` variant (admin "fixed" commission).
 *
 * Reuses the shared {@link FixedCommissionInput} — a percentage + flat-fee pair
 * stored as `{ admin_percentage, additional_fee }` and bridged to the legacy
 * `dokan_selling.admin_percentage` / `additional_fee` slots. The widget owns its
 * own label/validation rendering, so the schema title/description are forwarded.
 * @param root0
 * @param root0.element
 */
export default function DokanCombineInput( { element }: Props ) {
    const { updateValue } = useSettings();

    // Saved value (bridge-hydrated `element.value`) overrides the schema-default sibling attributes.
    const el = element as SettingsElement & {
        admin_percentage?: string;
        additional_fee?: string;
    };
    const stored =
        ( element.value as Partial< FixedCommissionInputValues > ) || {};
    // Stable identity so the masked inputs aren't re-seeded mid-edit on unrelated parent renders.
    const values: FixedCommissionInputValues = useMemo(
        () => ( {
            admin_percentage:
                stored.admin_percentage ?? el.admin_percentage ?? '',
            additional_fee: stored.additional_fee ?? el.additional_fee ?? '',
        } ),
        [
            stored.admin_percentage,
            stored.additional_fee,
            el.admin_percentage,
            el.additional_fee,
        ]
    );

    return (
        <FixedCommissionInput
            values={ values }
            currency={ getDokanCurrency() }
            title={ element.title }
            description={ element.description }
            hookKey={ element.id }
            // plugin-ui can't validate the object value, so flag an empty commission here.
            validationError={
                fixedCommissionError( values ) || element.validationError
            }
            onValueChange={ ( updated ) => updateValue( element.id, updated ) }
        />
    );
}
