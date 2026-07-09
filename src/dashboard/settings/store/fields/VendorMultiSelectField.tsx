import { useMemo } from '@wordpress/element';
import {
    useSettings,
    SmartMultiSelect,
    type SettingsElement,
} from '@wedevs/plugin-ui';

type Option = { label: string; value: string };

// `vendor_multiselect` variant — a searchable tag picker built on plugin-ui's
// SmartMultiSelect. A generic renderer: it draws its `options`/`value` straight
// from the schema element, so Pro can drive it (e.g. store categories) without
// shipping its own dashboard bundle — the same split Biography uses with the
// built-in rich_text field. `multiple: false` collapses it to a single choice.
const VendorMultiSelectField = ( {
    element,
}: {
    element: SettingsElement;
} ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const isMultiple = false !== element.multiple;

    // Memoized so a new array reference each render doesn't thrash the
    // controlled SmartMultiSelect (its value effect keys on identity).
    const options = useMemo< Option[] >(
        () =>
            ( ( element.options as Option[] ) || [] ).map( ( option ) => ( {
                label: String( option.label ?? '' ),
                value: String( option.value ),
            } ) ),
        [ element.options ]
    );
    const value = useMemo< string[] >(
        () =>
            ( Array.isArray( element.value ) ? element.value : [] ).map(
                String
            ),
        [ element.value ]
    );

    const handleChange = ( next: string[] ) => {
        // Single-choice mode keeps only the most recent selection.
        updateValue( fieldKey, isMultiple ? next : next.slice( -1 ) );
    };

    return (
        <div className="dokan-vendor-multiselect-field flex w-full flex-col gap-2 p-4">
            { element.title && (
                <span className="text-sm font-semibold text-gray-900">
                    { element.title }
                </span>
            ) }
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }
            <SmartMultiSelect
                options={ options }
                value={ value }
                onValueChange={ handleChange }
                hideSelectAll={ ! isMultiple }
                placeholder={
                    element.placeholder
                        ? String( element.placeholder )
                        : undefined
                }
                searchPlaceholder={
                    element.placeholder
                        ? String( element.placeholder )
                        : undefined
                }
                // Roomier control + an on-brand focus ring instead of the raw
                // browser blue the picker showed by default.
                className="min-h-11 bg-white px-3 py-1.5 focus-within:!border-dokan-btn focus-within:!ring-2 focus-within:!ring-dokan-btn/25"
                contentClassName="[&_[data-slot=command-input-wrapper]]:!ring-0 [&_input]:!shadow-none [&_input]:!ring-0 [&_input]:focus-visible:!ring-0 [&_input]:focus-visible:!border-transparent"
            />
        </div>
    );
};

export default VendorMultiSelectField;
