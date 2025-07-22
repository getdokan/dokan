import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import { getSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import Popover from '../../../../../components/Popover';

interface MonthPickerProps {
    onChange: ( value: { month: number; year: number } ) => void;
    placeholder?: string;
    value?: { month: string; year: string };
    footerTitle?: string;
    footerSubtitle?: string;
    deselectable?: boolean;
    minDate?: { month: string; year: string };
    maxDate?: { month: string; year: string };
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
    minDate = null,
    maxDate = null,
}: MonthPickerProps ) {
    const [ popoverAnchor, setPopoverAnchor ] = useState();
    const [ isOpen, setIsOpen ] = useState< boolean >( false );

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

    useEffect( () => {
        // If not currentYear is set, set it to the current year.
        if ( ! value?.year || isNaN( Number( String( value?.year ) ) ) ) {
            // @ts-ignore
            setCurrentYear( new Date().getFullYear() );
        }
    }, [] );

    return (
        <div>
            <button
                className="shadow rounded flex gap-2 items-center justify-between w-full px-3 py-2 text-sm bg-white border"
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
            </button>

            { isOpen && (
                <Popover
                    className="dokan-layout"
                    animate
                    anchor={ popoverAnchor }
                    focusOnMount={ true }
                    onClose={ () => {
                        setIsOpen( ! isOpen );
                    } }
                    onFocusOutside={ () => {
                        setIsOpen( ! isOpen );
                    } }
                >
                    <div className="w-60 flex-auto overflow-hidden bg-white text-sm/6">
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

                                const monthNum = index + 1;
                                const yearNum = Number( currentYear );

                                const minDisabled =
                                    minDate &&
                                    ( yearNum < Number( minDate.year ) ||
                                        ( yearNum === Number( minDate.year ) &&
                                            monthNum <
                                                Number( minDate.month ) ) );
                                const maxDisabled =
                                    maxDate &&
                                    ( yearNum > Number( maxDate.year ) ||
                                        ( yearNum === Number( maxDate.year ) &&
                                            monthNum >
                                                Number( maxDate.month ) ) );
                                const isDisabled = minDisabled || maxDisabled;

                                return (
                                    <button
                                        key={ month }
                                        type="button"
                                        onClick={ () =>
                                            handleMonthSelect( index )
                                        }
                                        className={ twMerge(
                                            'px-4 py-4 text-sm font-medium rounded border-neutral-100 border transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-[0.5]',
                                            isSelected
                                                ? 'bg-[#7047EB] text-white'
                                                : 'hover:bg-neutral-100 focus:bg-neutral-100'
                                        ) }
                                        disabled={ isDisabled }
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
}

export default MonthPicker;
