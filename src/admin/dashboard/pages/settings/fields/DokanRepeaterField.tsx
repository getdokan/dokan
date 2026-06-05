import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import Repeater, { type RepeaterRow } from '../../../../../components/Repeater';

type Props = {
    element: SettingsElement;
};

/**
 * Settings adapter for the generic {@link Repeater} component.
 *
 * Registered against plugin-ui's `dokan_settings_repeater_field` filter so any
 * schema field with `variant: 'repeater'` renders an editable, reorderable list.
 * The reusable list UI lives in `components/Repeater`; this only bridges the
 * settings context (value in, `updateValue` out) and the schema's labels.
 * @param root0
 * @param root0.element
 */
export default function DokanRepeaterField( { element }: Props ) {
    const { updateValue } = useSettings();

    const rawRows = ( element.value ?? element.default ?? [] ) as RepeaterRow[];
    // Treat the legacy `must_use` flag as `required` so protected rows (e.g.
    // mandatory shipping statuses) render the badge and lock edit/delete.
    const rows = Array.isArray( rawRows )
        ? rawRows.map( ( row ) => ( {
              ...row,
              required:
                  Boolean( row.required ) ||
                  row.must_use === 'true' ||
                  row.must_use === true,
          } ) )
        : [];
    const addLabel = String(
        element.new_title ?? element.add_button_text ?? 'Add Item'
    );
    const placeholder = element.placeholder
        ? String( element.placeholder )
        : undefined;
    const requiredLabel = element.required_label
        ? String( element.required_label )
        : undefined;
    const hasHeading = Boolean( element.label || element.title );

    return (
        <div
            className="flex flex-col gap-3 w-full p-4"
            id={ element.id }
            data-testid={ `settings-field-${ element.id }` }
        >
            { hasHeading && (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">
                        { element.label || element.title }
                    </span>
                    { element.description && (
                        <span className="text-xs text-muted-foreground leading-relaxed">
                            { element.description }
                        </span>
                    ) }
                </div>
            ) }
            <Repeater
                value={ rows }
                onChange={ ( next ) => updateValue( element.id, next ) }
                addLabel={ addLabel }
                placeholder={ placeholder }
                requiredLabel={ requiredLabel }
                disabled={ Boolean( element.disabled ) }
            />
        </div>
    );
}
