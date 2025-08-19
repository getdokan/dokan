import { TimePicker } from '@wordpress/components';
import { useState } from '@wordpress/element';

interface DokanTimePickerProps {
    currentTime?: Date;
    onChange?: ( newTime: Date | null ) => void;
    is12Hour?: boolean;
    disabled?: boolean;
    className?: string;
}

const DokanTimePicker = ( {
    currentTime,
    onChange,
    is12Hour = true,
    disabled = false,
    className = '',
}: DokanTimePickerProps ) => {
    // Use internal state if no external currentTime is provided
    const [ internalTime, setInternalTime ] = useState< Date >( new Date() );
    
    // Determine which time value to use
    const timeValue = currentTime !== undefined ? currentTime : internalTime;
    
    // Handle change events
    const handleTimeChange = ( newTime: Date | null ) => {
        if ( onChange ) {
            onChange( newTime );
        } else {
            // If no external onChange is provided, update internal state
            setInternalTime( newTime || new Date() );
        }
    };

    return (
        <div className={ className }>
            <TimePicker.TimeInput
                currentTime={ timeValue }
                onChange={ handleTimeChange }
                is12Hour={ is12Hour }
                disabled={ disabled }
            />
        </div>
    );
};

export default DokanTimePicker;
