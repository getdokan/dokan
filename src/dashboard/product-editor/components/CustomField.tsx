import { DokanTooltip } from '@src/components';
import { applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { Info } from 'lucide-react';
import { useCallback, useState, RawHTML } from '@wordpress/element';
import { FormItem } from '../types';

/**
 * Extract the first validation error message from the DataViews validity object.
 * The validity prop is per-field and shaped like:
 *   { required?: { type, message? }, elements?: { type, message? }, custom?: { type, message? } }
 * @param validity
 */
export const getValidationError = ( validity: any ): string | undefined => {
    if ( ! validity ) {
        return undefined;
    }
    if ( validity.custom?.type === 'invalid' ) {
        return (
            validity.custom.message ||
            __( 'This field is invalid.', 'dokan-lite' )
        );
    }
    if ( validity.required?.type === 'invalid' ) {
        return (
            validity.required.message ||
            __( 'Please fill out this field.', 'dokan-lite' )
        );
    }
    if ( validity.elements?.type === 'invalid' ) {
        return (
            validity.elements.message ||
            __( 'Value must be one of the elements.', 'dokan-lite' )
        );
    }
    return undefined;
};

const CustomField = ( {
    label,
    field,
    children,
    error,
    className = '',
}: {
    label?: string | React.ReactNode;
    field: FormItem & { rawLabel?: string };
    children: React.ReactNode;
    error?: string;
    className?: string;
} ) => {
    const [ touched, setTouched ] = useState( false );

    const handleBlur = useCallback( () => {
        if ( ! touched ) {
            setTouched( true );
        }
    }, [ touched ] );

    const fieldKey = `dokan-form-field-${ field.id }`;
    const classes = `flex flex-col gap-1 ${ fieldKey } ${ className }`;
    const showError = touched && error;

    const LabelRender = () => {
        if ( label ) {
            return <span>{ label }</span>;
        }
        if ( typeof field.rawLabel === 'string' ) {
            return (
                <RawHTML className="dokan-form-field-label">
                    { decodeEntities( field.rawLabel ) }
                </RawHTML>
            );
        }
        return field.label;
    };

    return (
        <div id={ fieldKey } className={ classes }>
            <div className={ `${ fieldKey }-label flex gap-1 items-center` }>
                <LabelRender />

                { field.required && (
                    <span className="dokan-form-field-label">
                        { __( '(REQUIRED)', 'dokan-lite' ) }
                    </span>
                ) }
                { field.tooltip && (
                    <DokanTooltip content={ field.tooltip }>
                        <Info size={ 16 } />
                    </DokanTooltip>
                ) }
            </div>
            { /* onBlur bubbles from child inputs to mark the field as touched */ }
            <div onBlur={ handleBlur }>{ children }</div>
            { field.description && (
                <div className="dokan-form-field-description">
                    { typeof field.description === 'string' ? (
                        <RawHTML>{ field.description }</RawHTML>
                    ) : (
                        field.description
                    ) }
                </div>
            ) }
            {
                applyFilters(
                    'dokan_product_editor_after_ui_field',
                    null,
                    field
                ) as React.ReactNode
            }
            { showError && (
                <p className="components-validated-control__indicator is-invalid">
                    <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="components-validated-control__indicator-icon"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.218 5.377a.25.25 0 0 0-.436 0l-7.29 12.96a.25.25 0 0 0 .218.373h14.58a.25.25 0 0 0 .218-.372l-7.29-12.96Zm-1.743-.735c.669-1.19 2.381-1.19 3.05 0l7.29 12.96a1.75 1.75 0 0 1-1.525 2.608H4.71a1.75 1.75 0 0 1-1.525-2.608l7.29-12.96ZM12.75 17.46h-1.5v-1.5h1.5v1.5Zm-1.5-3h1.5v-5h-1.5v5Z"
                        ></path>
                    </svg>
                    { error }
                </p>
            ) }
        </div>
    );
};

export default CustomField;
