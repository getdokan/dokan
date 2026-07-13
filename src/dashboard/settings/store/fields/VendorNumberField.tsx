import { useMemo, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, Input, type SettingsElement } from '@wedevs/plugin-ui';

// Optional live cross-field guard declared on the schema (e.g. "max ≥ min").
type CompareRule = {
    field: string;
    comparison: 'gte' | 'lte' | 'gt' | 'lt';
    message: string;
    // Amount limits treat 0/empty as "no limit", so a blank side skips the check.
    ignore_when_empty?: boolean;
};

const toNumber = ( raw: unknown ): number | null => {
    if ( '' === raw || null === raw || undefined === raw ) {
        return null;
    }
    const parsed = Number( raw );
    return Number.isFinite( parsed ) ? parsed : null;
};

// `vendor_number` variant — a number input dressed like the shared text field
// (title, "(Required)" marker, description), with an optional cross-field rule
// that mirrors a server guard client-side so the error shows the instant either
// value changes, not only after Save.
const VendorNumberField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue, values } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const value = String( element.value ?? element.default ?? '' );
    const compare = element.compare as CompareRule | undefined;

    // Re-runs whenever this field or the linked sibling changes, because both
    // live in the `values` map every field in the engine subscribes to.
    const clientError = useMemo( (): string | undefined => {
        if ( ! compare?.field || ! compare.message ) {
            return undefined;
        }
        const self = toNumber( value );
        const other = toNumber( values?.[ compare.field ] );
        if ( null === self || null === other ) {
            return undefined;
        }
        // Both limits must be active before the comparison means anything.
        if (
            false !== compare.ignore_when_empty &&
            ( 0 === self || 0 === other )
        ) {
            return undefined;
        }
        const fails =
            ( 'gte' === compare.comparison && self < other ) ||
            ( 'gt' === compare.comparison && self <= other ) ||
            ( 'lte' === compare.comparison && self > other ) ||
            ( 'lt' === compare.comparison && self >= other );
        return fails ? compare.message : undefined;
    }, [ compare, value, values ] );

    const error =
        clientError || ( element.validationError as string | undefined );

    const inputClass = [
        element.prefix ? 'pl-10' : '',
        error ? 'border-red-500' : '',
    ]
        .filter( Boolean )
        .join( ' ' );

    return (
        <div className="dokan-vendor-number-field flex w-full flex-col gap-2 p-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                { element.title }
                { element.required && (
                    <span className="text-xs font-normal text-red-500">
                        { __( '(Required)', 'dokan-lite' ) }
                    </span>
                ) }
            </span>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }
            <div className="relative flex w-full items-center">
                { element.prefix && (
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                        <RawHTML>{ String( element.prefix ) }</RawHTML>
                    </span>
                ) }
                <Input
                    type="number"
                    value={ value }
                    min={ element.min as number | undefined }
                    onChange={ ( event ) =>
                        updateValue(
                            fieldKey,
                            '' === event.target.value
                                ? ''
                                : Number( event.target.value )
                        )
                    }
                    placeholder={
                        element.placeholder
                            ? String( element.placeholder )
                            : undefined
                    }
                    aria-invalid={ error ? true : undefined }
                    className={ inputClass || undefined }
                />
            </div>
            { error && (
                <div className="text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }
        </div>
    );
};

export default VendorNumberField;
