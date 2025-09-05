import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanButton } from './index';
import {
    Popover,
    DateTimePicker as WpDateTimePicker,
} from '@wordpress/components';
import { twMerge } from 'tailwind-merge';
import { SimpleInput } from '@getdokan/dokan-ui';
import { dateI18n, getSettings } from '@wordpress/date';

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
    // Allow any additional DateTimePicker props to pass through
    [ key: string ]: any;
}

// A lightweight wrapper around WordPress DateTimePicker, using WordPress Popover like WcDateRangePicker
const DateTimePicker = ( props: Props ) => {
    const [ popoverAnchor, setPopoverAnchor ] = useState< any >();
    const [ isVisible, setIsVisible ] = useState( false );

    const updatedProps = {
        ...props,
        onChange: ( value: any ) => {
            setIsVisible( false );
            if ( props?.onChange ) {
                props.onChange( value );
            }
        },
    };

    return (
        <div className={ props?.wrapperClassName ?? '' }>
            { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus */ }
            <div
                className={ props?.pickerToggleClassName ?? '' }
                onClick={ () => setIsVisible( ! isVisible ) }
                // @ts-ignore
                ref={ setPopoverAnchor }
                role="button"
            >
                { props.children ?? (
                    <SimpleInput
                        onChange={ () => {} }
                        value={
                            props?.currentDate
                                ? dateI18n(
                                      getSettings().formats.date,
                                      props?.currentDate,
                                      getSettings().timezone.string
                                  )
                                : ''
                        }
                        input={ {
                            id:
                                props?.inputId ??
                                'dokan-date-time-picker-input',
                            name:
                                props?.inputName ??
                                'dokan_date_time_picker_input',
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
                    onClose={ () => {
                        setIsVisible( ! isVisible );
                    } }
                    onFocusOutside={ () => {
                        setIsVisible( ! isVisible );
                    } }
                >
                    <div
                        className={ twMerge(
                            'p-4 w-auto text-sm/6',
                            props?.popoverBodyClassName ?? ''
                        ) }
                    >
                        <WpDateTimePicker { ...updatedProps } />
                        <div className="mt-2 flex flex-row gap-2">
                            <DokanButton
                                size="sm"
                                onClick={ () => {
                                    setIsVisible( false );
                                    if ( props?.onClear ) {
                                        props.onClear();
                                    } else {
                                        // Fallback to clearing the value if consumer did not handle onClear
                                        updatedProps.onChange( '' );
                                    }
                                } }
                            >
                                { __( 'Clear', 'dokan-lite' ) }
                            </DokanButton>

                            { props?.onOk ? (
                                <DokanButton
                                    size="sm"
                                    onClick={ () => {
                                        setIsVisible( false );
                                        if ( props.onOk ) {
                                            props.onOk();
                                        }
                                    } }
                                >
                                    { __( 'Ok', 'dokan-lite' ) }
                                </DokanButton>
                            ) : null }
                        </div>
                    </div>
                </Popover>
            ) }
        </div>
    );
};

export default DateTimePicker;
