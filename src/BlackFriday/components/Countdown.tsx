// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); only the menu entry auto-hides.
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = ( value: number ) => String( value ).padStart( 2, '0' );

// Live DD:HH:MM:SS countdown to the campaign deadline.
const Countdown = ( { endsAt }: { endsAt: string } ) => {
    const deadline = Date.parse( endsAt );
    const [ remaining, setRemaining ] = useState( () =>
        Math.max( 0, deadline - Date.now() )
    );

    useEffect( () => {
        const timer = setInterval( () => {
            const left = Math.max( 0, deadline - Date.now() );
            setRemaining( left );

            // Nothing left to count, so stop re-rendering a 00:00:00:00 clock.
            if ( ! left ) {
                clearInterval( timer );
            }
        }, SECOND );

        return () => clearInterval( timer );
    }, [ deadline ] );

    const units: Array< [ number, string ] > = [
        [ Math.floor( remaining / DAY ), __( 'Days', 'dokan-lite' ) ],
        [ Math.floor( remaining / HOUR ) % 24, __( 'Hours', 'dokan-lite' ) ],
        [ Math.floor( remaining / MINUTE ) % 60, __( 'Mins', 'dokan-lite' ) ],
        [ Math.floor( remaining / SECOND ) % 60, __( 'Secs', 'dokan-lite' ) ],
    ];

    return (
        <div className="flex gap-[7px]" role="timer">
            { units.map( ( [ value, label ] ) => (
                <div
                    key={ label }
                    className="flex w-[51px] flex-col items-center gap-px rounded-[10px] border border-white/15 bg-white/8 py-[7px]"
                >
                    <span className="text-[18px] font-semibold leading-[23px] text-white">
                        { pad( value ) }
                    </span>
                    <span className="text-[8px] font-bold uppercase leading-normal tracking-[0.6px] text-[#a9a3c4]">
                        { label }
                    </span>
                </div>
            ) ) }
        </div>
    );
};

export default Countdown;
