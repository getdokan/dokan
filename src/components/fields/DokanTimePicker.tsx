import { TimePicker } from '@wordpress/components';
import { twMerge } from 'tailwind-merge';
import {useState} from "@wordpress/element";

interface DokanTimePickerProps {
    containerClassName?: string;
    value?: { hours: number; minutes: number };
    onChange?: ( value: { hours: number; minutes: number } ) => void;
    is12Hour?: boolean;
    label?: string;
    defaultValue?: { hours: number; minutes: number };
    minutesProps?: any;
    className?: string;
}

const DokanTimePicker = ( {
    containerClassName,
    value,
    onChange,
    is12Hour = true,
    label,
    defaultValue = {
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
    },
  ...props
}: DokanTimePickerProps ) => {
    return (
        <div
            className={ twMerge(
                'inline-flex flex-col items-start gap-2',
                containerClassName
            ) }
        >
            <TimePicker.TimeInput
                value={ value || defaultValue }
                onChange={ onChange }
                is12Hour={ is12Hour }
                label={ label }
                { ...props }
            />
        </div>
    );
};

export default DokanTimePicker;
