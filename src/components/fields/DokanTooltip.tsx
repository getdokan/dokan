import { Tooltip } from '@getdokan/dokan-ui';
import { Info } from 'lucide-react';

interface TooltipProps {
    message: string;
    children?: React.ReactNode;
}

const DokanTooltip = ( { message, children }: TooltipProps ) => {
    return (
        <Tooltip content={ message }>
            { children || <Info size={ '1rem' } /> }
        </Tooltip>
    );
};

export default DokanTooltip;
