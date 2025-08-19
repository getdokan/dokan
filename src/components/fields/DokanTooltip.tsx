import { useState } from '@wordpress/element';
import InfoIcon from '../Icons/InfoIcon';
import { Info } from 'lucide-react';
import { Tooltip } from '@getdokan/dokan-ui';

interface TooltipProps {
    message: string;
    children?: JSX.Element | null;
}

const DokanTooltip = ( { message, children }: TooltipProps ) => {
    return (
        <Tooltip direction="top" content={ message }>
            <span className="help-block">
                { children ? children : <InfoIcon /> }
            </span>
        </Tooltip>
    );
};

export default DokanTooltip;
