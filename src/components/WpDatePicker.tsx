import { useState } from '@wordpress/element';
import { DatePicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DokanButton, Popover } from './index';
import { SimpleInput } from '@getdokan/dokan-ui';
import { DatePickerProps } from '@wordpress/components/build-types/date-time/types';
import { twMerge } from 'tailwind-merge';
import { dateI18n, getSettings } from '@wordpress/date';
import { useInstanceId } from '@wordpress/compose';

interface Props extends DatePickerProps {
    children?: JSX.Element;
    wrapperClassName?: string;
    pickerToggleClassName?: string;
    wpPopoverClassName?: string;
    popoverBodyClassName?: string;
    inputId?: string;
    inputName?: string;
    ariaLabel?: string;
}

const WpDatePicker = ( props: Props ) => {
    const instanceId = useInstanceId( WpDatePicker, 'dokan-date-picker-input' );
    const [ popoverAnchor, setPopoverAnchor ] = useState();
    const [ isVisible, setIsVisible ] = useState( false );

    const updatedProps = {
        ...props,
        onChange: ( updatedDate ) => {
            setIsVisible( false );

            if ( props.onChange ) {
                props.onChange( updatedDate );
            }
        },
    };

    return (
        <div className={ props?.wrapperClassName ?? '' }>
            { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
            <div
                className={ props?.pickerToggleClassName ?? '' }
                onClick={ () => {
                    setIsVisible( ! isVisible );
                } }
                // @ts-ignore
                ref={ setPopoverAnchor }
            >
                { props.children ?? (
                    <SimpleInput
                        onChange={ () => {} }
                        value={
                            props?.currentDate
                                ? dateI18n(
                                    getSettings().formats.date,
                                    props?.currentDate as string,
                                    getSettings().timezone.string
                                )
                                : ''
                        }
                        input={ {
                            id: props?.inputId ?? instanceId,
                            name: props?.inputName ?? 'dokan_date_picker_input',
                            type: 'text',
                            readOnly: true,
                            autoComplete: 'off',
                            placeholder: __( 'Select date', 'dokan-lite' ),
                            'aria-label':
                                props?.ariaLabel ??
                                __( 'Select date', 'dokan-lite' ),
                        } }
                    />
                ) }
            </div>

            { isVisible && (
                <Popover
                    anchor={ popoverAnchor }
                    focusOnMount={ true }
                    onClose={ () => {
                        setIsVisible( ! isVisible );
                    } }
                    onFocusOutside={ () => {
                        setIsVisible( ! isVisible );
                    } }
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
                        <DatePicker { ...updatedProps } />
                        <DokanButton
                            size="sm"
                            className="mt-2"
                            onClick={ () => updatedProps.onChange( '' ) }
                        >
                            { __( 'Clear', 'dokan-lite' ) }
                        </DokanButton>
                    </div>
                </Popover>
            ) }
        </div>
    );
};

export default WpDatePicker;
