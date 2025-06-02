import {
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition,
} from '@headlessui/react';
import { useRef } from '@wordpress/element';
import { useOnClickOutside } from 'usehooks-ts';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DateRange } from '@woocommerce/components';
import { applyFilters } from '@wordpress/hooks';
import './style.scss';

interface DateRangePickerProps {
    show: boolean;
    after: string;
    setShow: ( show: boolean ) => void;
    afterText: string;
    before: string;
    beforeText: string;
    onUpdate: ( update: {
        after?: string;
        afterText?: string;
        before?: string;
        beforeText?: string;
        focusedInput?: string;
    } ) => void;
    shortDateFormat?: string;
    focusedInput?: string;
    isInvalidDate?: ( date: Date | string ) => boolean;
    children?: React.ReactNode;
}

/**
 * DateRangePicker component for selecting a date range
 *
 * @since 4.0.0
 *
 * @param {DateRangePickerProps} props Component properties
 * @return {JSX.Element} DateRangePicker component
 */
const DateRangePicker = ( props: DateRangePickerProps ): JSX.Element => {
    const ref = useRef( null );
    useOnClickOutside( ref, () => props.setShow( ! props.show ) );

    const updatedProps: any = applyFilters( 'dokan_date_range_picker_props', {
        ...props,
    } );

    return (
        <Popover className="relative">
            <PopoverButton
                onClick={ () => updatedProps.setShow( ! updatedProps.show ) }
                className="shadow-none w-full focus:!outline-none p-0"
            >
                { props.children ?? '' }
            </PopoverButton>
            <Transition
                show={ updatedProps.show }
                enter="transition duration-200 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-150 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
            >
                <PopoverPanel
                    anchor="bottom"
                    className="dokan-layout absolute flex rounded shadow-xl border"
                >
                    <div
                        className="dokan-date-range-picker w-auto flex-auto overflow-hidden bg-white z-40"
                        ref={ ref }
                    >
                        <DateRange { ...updatedProps } />
                    </div>
                </PopoverPanel>
            </Transition>
        </Popover>
    );
};

export default DateRangePicker;
