import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanButton } from './index';
import { Popover } from '@wordpress/components';
import { DatePickerProps } from '@wordpress/components/build-types/date-time/types';
import { twMerge } from 'tailwind-merge';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DateRange } from '@woocommerce/components';

interface Props extends DatePickerProps {
    children?: React.ReactNode | JSX.Element;
    wrapperClassName?: string;
    pickerToggleClassName?: string;
    wpPopoverClassName?: string;
    popoverBodyClassName?: string;
    onClear?: () => void;
    onOk?: () => void;
}

const WcDateRangePicker = ( props: Props ) => {
    const [ popoverAnchor, setPopoverAnchor ] = useState();
    const [ isVisible, setIsVisible ] = useState( false );

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
                { props.children ?? '' }
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
                                    setIsVisible( ! isVisible );
                                    if ( props?.onClear ) {
                                        props.onClear();
                                    }
                                } }
                            >
                                { __( 'Clear', 'dokan-lite' ) }
                            </DokanButton>

                            <DokanButton
                                size="sm"
                                onClick={ () => {
                                    setIsVisible( ! isVisible );
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

export default WcDateRangePicker;
