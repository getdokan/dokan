import { TimePicker } from '@wordpress/components';
import { useState } from '@wordpress/element';

const DokanTimePicker = () => {
    const [ time, setTime ] = useState< Date >( new Date() );

    return (
        <TimePicker.TimeInput
            currentTime={ time }
            onChange={ ( newTime ) => setTime( newTime ) }
            is12Hour
        />
    );
};

export default DokanTimePicker;
