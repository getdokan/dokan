import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import { getSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { Popover } from '../../../../../components';

interface MonthPickerProps {
    onChange: ( value: { month: number; year: number } ) => void;
    placeholder?: string;
    value?: { month: string; year: string };
    footerTitle?: string;
    footerSubtitle?: string;
    deselectable?: boolean;
    comparisonPosition?: 'left' | 'right' | 'hide';
    className?: string;
}
function MonthPicker( {
    onChange,
    placeholder = __( 'Choose a month' ),
    value = {
        month: '',
        year: '',
    },
    footerTitle = '',
    footerSubtitle = '',
    deselectable = true,
    comparisonPosition = 'hide',
    className = '',
}: MonthPickerProps ) {
    const [ isOpen, setIsOpen ] = useState< boolean >( false );
    const [ popoverAnchor, setPopoverAnchor ] = useState();

    const [ currentYear, setCurrentYear ] = useState( value?.year );

    const months = getSettings().l10n.monthsShort as string[];

    const handleMonthSelect = ( monthIndex ) => {
        if ( onChange ) {
            // If deselectable is true and the month is already selected, clear the selection.
            if (
                deselectable &&
                value?.month &&
                Number( value?.month ) === monthIndex + 1 &&
                value?.year &&
                Number( value?.year ) === Number( currentYear )
            ) {
                // @ts-ignore
                onChange( { month: '', year: '' } );
                setCurrentYear( '' );
                setIsOpen( ! isOpen );
                return;
            }

            onChange( {
                month: monthIndex + 1,
                year:
                    ! currentYear || isNaN( Number( String( currentYear ) ) )
                        ? new Date().getFullYear()
                        : Number( currentYear ),
            } );
        }

        setIsOpen( ! isOpen );
    };

    const handlePreviousYear = () => {
        setCurrentYear( ( prev ) => {
            const newYear =
                ! prev || isNaN( Number( String( prev ) ) )
                    ? new Date().getFullYear() - 1
                    : Number( prev ) - 1;
            return newYear.toString();
        } );
    };

    const handleNextYear = () => {
        setCurrentYear( ( prev ) => {
            const newYear =
                ! prev || isNaN( Number( String( prev ) ) )
                    ? new Date().getFullYear() + 1
                    : Number( prev ) + 1;
            return newYear.toString();
        } );
    };

    const getDisplayText = () => {
        // Print the month and and year like "Jan-23". If the month is not selected, return the placeholder.
        if ( value?.month && value?.year ) {
            const monthName = months[ Number( value?.month ) - 1 ];
            return `${ monthName }-${ String( value.year ).slice( -2 ) }`;
        }
        return placeholder;
    };

    // Comparison date calculation functions
    const getComparisonDateRanges = () => {
        if ( ! value?.month || ! value?.year ) {
            return { currentPeriod: '', previousPeriod: '' };
        }

        const selectedMonth = parseInt( value.month );
        const selectedYear = parseInt( value.year );
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentMonthNum = currentDate.getMonth() + 1;
        const currentYearNum = currentDate.getFullYear();

        // Determine if we're looking at the current running month
        const isCurrentMonth =
            selectedMonth === currentMonthNum &&
            selectedYear === currentYearNum;

        // Calculate current period range
        const getCurrentPeriodRange = () => {
            const monthName = months[ selectedMonth - 1 ];

            if ( isCurrentMonth ) {
                // For current running month, show from 1st to today
                return `${ monthName } 1 - ${ currentDay }, ${ selectedYear }`;
            }
            // For past months, show full month
            const daysInMonth = new Date(
                selectedYear,
                selectedMonth,
                0
            ).getDate();
            return `${ monthName } 1 - ${ daysInMonth }, ${ selectedYear }`;
        };

        // Calculate previous period range
        const getPreviousPeriodRange = () => {
            // Calculate previous month
            let prevMonth = selectedMonth - 1;
            let prevYear = selectedYear;

            if ( prevMonth === 0 ) {
                prevMonth = 12;
                prevYear = selectedYear - 1;
            }

            const prevMonthName = months[ prevMonth - 1 ];

            if ( isCurrentMonth ) {
                // For current running month, show same day range in previous month
                return `${ prevMonthName } 1 - ${ currentDay }, ${ prevYear }`;
            }
            // For past months, show full previous month
            const daysInPrevMonth = new Date(
                prevYear,
                prevMonth,
                0
            ).getDate();
            return `${ prevMonthName } 1 - ${ daysInPrevMonth }, ${ prevYear }`;
        };

        return {
            currentPeriod: getCurrentPeriodRange(),
            previousPeriod: getPreviousPeriodRange(),
        };
    };

    // Comparison Date Display Component
    const ComparisonDateDisplay = () => {
        if ( comparisonPosition === 'hide' ) {
            return null;
        }

        const { currentPeriod, previousPeriod } = getComparisonDateRanges();

        if ( ! currentPeriod || ! previousPeriod ) {
            return null;
        }

        return (
            <div className="text-sm text-gray-600">
                <div className="flex flex-col text-xs text-right text-[#9A9A9A]">
                    <div className={ `font-semibold` }>
                        <span>{ __( 'Month to Date', 'dokan-lite' ) }</span>{ ' ' }
                        <span>({ currentPeriod })</span>
                    </div>
                    <div className={ `font-normal` }>
                        <span>
                            { __( 'vs Previous Period', 'dokan-lite' ) }
                        </span>{ ' ' }
                        <span>({ previousPeriod })</span>
                    </div>
                </div>
            </div>
        );
    };

    useEffect( () => {
        // If not currentYear is set, set it to the current year.
        if ( ! value?.year || isNaN( Number( String( value?.year ) ) ) ) {
            // @ts-ignore
            setCurrentYear( new Date().getFullYear() );
        }
    }, [] );

    // Render the MonthPicker with comparison date display
    const monthPickerElement = (
        <div className={ className }>
            { /* Anchor wrapper similar to WpDatePicker */ }
            { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
            <div
                className="shadow rounded flex gap-2 items-center justify-between w-full px-3 py-2 text-sm bg-white border cursor-pointer"
                onClick={ () => setIsOpen( ! isOpen ) }
                // @ts-ignore
                ref={ setPopoverAnchor }
            >
                <span>{ getDisplayText() }</span>
                <ChevronDown
                    className={ `w-4 h-4 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }` }
                />
            </div>

            { isOpen && (
                <Popover
                    anchor={ popoverAnchor }
                    focusOnMount={ true }
                    onClose={ () => setIsOpen( false ) }
                    onFocusOutside={ () => setIsOpen( false ) }
                    className={ twMerge( 'dokan-layout' ) }
                >
                    <div className="w-60 flex-auto overflow-hidden bg-white text-sm/6 z-[9999]">
                        { /* Year Navigation */ }
                        <div className="flex items-center justify-between p-4 pb-2.5">
                            <button
                                type="button"
                                onClick={ handlePreviousYear }
                                className="p-1 rounded-md hover:bg-gray-100 focus:outline-none"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <h2 className="text-lg font-semibold">
                                { ! currentYear ||
                                isNaN( Number( currentYear ) )
                                    ? new Date().getFullYear()
                                    : currentYear }
                            </h2>

                            <button
                                type="button"
                                onClick={ handleNextYear }
                                className="p-1 rounded-md hover:bg-gray-100 focus:outline-none"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="pl-4 pr-4">
                            <span className="block w-full h-[1px] bg-gray-100"></span>
                        </div>

                        { /* Month Grid */ }
                        <div className="grid grid-cols-3 gap-2 p-4">
                            { months.map( ( month, index ) => {
                                const isSelected =
                                    // @ts-ignore
                                    value?.month &&
                                    Number( value?.month ) === index + 1 &&
                                    value?.year &&
                                    // @ts-ignore
                                    Number( value?.year ) ===
                                        Number( currentYear );

                                return (
                                    <button
                                        key={ month }
                                        type="button"
                                        onClick={ () =>
                                            handleMonthSelect( index )
                                        }
                                        className={ twMerge(
                                            'px-4 py-4 text-sm font-medium rounded border-gray-100 border transition-colors focus:outline-none',
                                            isSelected
                                                ? 'bg-[#7047EB] text-white'
                                                : 'hover:bg-gray-100 focus:bg-gray-100'
                                        ) }
                                    >
                                        { month }
                                    </button>
                                );
                            } ) }
                        </div>

                        { ( footerTitle || footerSubtitle ) && (
                            <div className="p-4 pt-0">
                                <div className="w-full h-[1px] bg-gray-100 mb-2"></div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-neutral-500 text-xs">
                                        { footerTitle }
                                    </span>
                                    <span className="text-neutral-400 text-xs">
                                        { footerSubtitle }
                                    </span>
                                </div>
                            </div>
                        ) }
                    </div>
                </Popover>
            ) }
        </div>
    );

    // Return based on comparison position
    if ( comparisonPosition === 'left' ) {
        return (
            <div className="flex items-center space-x-4">
                <ComparisonDateDisplay />
                { monthPickerElement }
            </div>
        );
    }

    if ( comparisonPosition === 'right' ) {
        return (
            <div className="flex items-center space-x-4">
                { monthPickerElement }
                <ComparisonDateDisplay />
            </div>
        );
    }

    // Default case (hide) - just return the month picker
    return monthPickerElement;
}

export default MonthPicker;
