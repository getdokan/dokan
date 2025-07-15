import { useState } from '@wordpress/element';
import { DatePicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DokanButton } from './index';
import Popover from '@dokan/components/Popover';
import { DatePickerProps } from '@wordpress/components/build-types/date-time/types';
import { twMerge } from 'tailwind-merge';

interface Props extends DatePickerProps {
    children?: React.ReactNode | JSX.Element;
    wrapperClassName?: string;
    pickerToggleClassName?: string;
    wpPopoverClassName?: string;
    popoverBodyClassName?: string;
}

const WpDatePicker = ( props: Props ) => {
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
                { props.children ?? '' }
            </div>

            { isVisible && (
                <Popover
                    animate
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
