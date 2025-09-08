import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanButton } from './index';
import { Popover } from '@wordpress/components';
import { twMerge } from 'tailwind-merge';
import { SimpleInput } from '@getdokan/dokan-ui';
import { dateI18n, getSettings } from '@wordpress/date';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DateRange } from '@woocommerce/components';
import { useInstanceId } from '@wordpress/compose';

interface Props {
    children?: React.ReactNode | JSX.Element;
    wrapperClassName?: string;
    pickerToggleClassName?: string;
    wpPopoverClassName?: string;
    popoverBodyClassName?: string;
    onClear?: () => void;
    onOk?: () => void;
    inputId?: string;
    inputName?: string;

    [ key: string ]: unknown;
}

const DateRangePicker = ( props: Props ) => {
    const [ popoverAnchor, setPopoverAnchor ] = useState();
    const [ isVisible, setIsVisible ] = useState( false );
    const instanceId = useInstanceId(
        DateRangePicker,
        'dokan-date-range-picker-input'
    );

    return (
        <div className={ props?.wrapperClassName ?? '' }>
            { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
            <div
                className={ props?.pickerToggleClassName ?? '' }
                onClick={ () => {
                    setIsVisible( ! isVisible );
                } }
                onKeyDown={ ( e ) => {
                    if ( e.key === 'Enter' || e.key === ' ' ) {
                        e.preventDefault();
                        setIsVisible( ( v ) => ! v );
                    }
                } }
                role="button"
                tabIndex={ 0 }
                aria-haspopup="dialog"
                aria-expanded={ isVisible }
                // @ts-ignore
                ref={ setPopoverAnchor }
            >
                { props.children ?? (
                    <SimpleInput
                        onChange={ () => {} }
                        value={ ( () => {
                            // Prefer provided formatted texts if available
                            const { after, before, afterText, beforeText } =
                                props as any;
                            const fmt = getSettings().formats.date;
                            const tz = getSettings().timezone.string;

                            const formatPart = ( val?: string ) =>
                                val ? dateI18n( fmt, val, tz ) : '';

                            const left = afterText || formatPart( after );
                            const right = beforeText || formatPart( before );
                            if ( left || right ) {
                                return `${ left }${
                                    left && right ? ' - ' : ''
                                }${ right }`;
                            }
                            return '';
                        } )() }
                        input={ {
                            id: props?.inputId ?? instanceId,
                            name:
                                props?.inputName ??
                                'dokan_date_range_picker_input',
                            type: 'text',
                            autoComplete: 'off',
                            placeholder: __( 'Enter Date', 'dokan-lite' ),
                        } }
                    />
                ) }
            </div>

            { isVisible && (
                <Popover
                    animate
                    anchor={ popoverAnchor }
                    focusOnMount={ true }
                    className={ twMerge(
                        props?.wpPopoverClassName ?? '',
                        'dokan-layout'
                    ) }
                >
                    <div
                        className={ twMerge(
                            'p-4 w-auto text-sm/6',
                            props?.popoverBodyClassName ?? ''
                        ) }
                    >
                        <DateRange { ...props } />
                        <div className="mt-2 flex flex-row gap-2">
                            <DokanButton
                                size="sm"
                                onClick={ () => {
                                    setIsVisible( false );
                                    if ( props?.onClear ) {
                                        props.onClear();
                                    } else if ( ( props as any )?.onUpdate ) {
                                        // Fallback: attempt to clear via onUpdate API used by WooCommerce DateRange
                                        ( props as any ).onUpdate( {
                                            after: '',
                                            before: '',
                                            afterText: '',
                                            beforeText: '',
                                        } );
                                    }
                                } }
                            >
                                { __( 'Clear', 'dokan-lite' ) }
                            </DokanButton>

                            <DokanButton
                                size="sm"
                                onClick={ () => {
                                    setIsVisible( false );
                                    if ( props?.onOk ) {
                                        props.onOk();
                                    }
                                } }
                            >
                                { __( 'Ok', 'dokan-lite' ) }
                            </DokanButton>
                        </div>
                    </div>
                </Popover>
            ) }
        </div>
    );
};

export default DateRangePicker;
