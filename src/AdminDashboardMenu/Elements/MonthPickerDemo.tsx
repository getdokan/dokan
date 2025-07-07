import { useState, Fragment } from '@wordpress/element';
import { Popover, Transition, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from 'lucide-react';

const MonthPicker = ( {
    onChange,
    placeholder = 'Select Month',
    value = {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    }
} ) => {
    const [ currentYear, setCurrentYear ] = useState( value?.year );

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const fullMonthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const handleMonthSelect = ( monthIndex, close ) => {
        if ( onChange ) {
            onChange( {
                month: monthIndex,
                year: currentYear,
            } );
        }

        close();
    };

    const handlePreviousYear = () => {
        setCurrentYear( ( prev ) => prev - 1 );
    };

    const handleNextYear = () => {
        setCurrentYear( ( prev ) => prev + 1 );
    };

    const getDisplayText = () => {
        if ( value?.month !== null && value?.month !== undefined ) {
            return `${ fullMonthNames[ value?.month ] } ${ value?.year }`;
        }
        return placeholder;
    };

    return (
        <Popover className="relative">
            { ( { open, close } ) => (
                <>
                    <PopoverButton className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none">
                        <span
                            className={
                                value?.month !== null
                                    ? 'text-gray-900'
                                    : 'text-gray-500'
                            }
                        >
                            { getDisplayText() }
                        </span>
                        <ChevronDownIcon
                            className={ `w-4 h-4 text-gray-400 transition-transform ${
                                open ? 'rotate-180' : ''
                            }` }
                        />
                    </PopoverButton>

                    <Transition
                        as={ Fragment }
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <PopoverPanel className="absolute z-10 w-80 mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                            <div className="p-4">
                                { /* Year Navigation */ }
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        type="button"
                                        onClick={ handlePreviousYear }
                                        className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <h2 className="text-lg font-semibold text-gray-900">
                                        { currentYear }
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={ handleNextYear }
                                        className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                { /* Month Grid */ }
                                <div className="grid grid-cols-3 gap-2">
                                    { months.map( ( month, index ) => {
                                        const isSelected =
                                            value?.month === index &&
                                            value?.year === currentYear;

                                        return (
                                            <button
                                                key={ month }
                                                type="button"
                                                onClick={ () =>
                                                    handleMonthSelect(
                                                        index,
                                                        close
                                                    )
                                                }
                                                className={ `
                          px-4 py-3 text-sm font-medium rounded-md transition-colors
                          ${
                              isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
                          }
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ` }
                                            >
                                                { month }
                                            </button>
                                        );
                                    } ) }
                                </div>
                            </div>
                        </PopoverPanel>
                    </Transition>
                </>
            ) }
        </Popover>
    );
};

// Demo Component
const MonthPickerDemo = () => {
    const [monthData, setMonthData] = useState({
        month: 10,
        year: 2025,
    });
    return (
        <MonthPicker
            value={ monthData }
            onChange={ ( value ) => {setMonthData( value ); } }
            placeholder="Choose a month"
        />
    );
};

export default MonthPickerDemo;
