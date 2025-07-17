import { useState } from '@wordpress/element';
import InfoIcon from '../Icons/InfoIcon';

interface TooltipProps {
    message: React.ReactNode;
    children?: React.ReactNode;
}

const DokanTooltip = ( { message, children }: TooltipProps ) => {
    const [ show, setShow ] = useState( false );
    return (
        <span
            className="relative inline-block"
            onMouseEnter={ () => setShow( true ) }
            onMouseLeave={ () => setShow( false ) }
        >
            { children ? children : <InfoIcon /> }
            { show && (
                <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#25252d] text-white text-xs rounded shadow-lg whitespace-nowrap">
                    { message }
                </span>
            ) }
        </span>
    );
};

export default DokanTooltip;
