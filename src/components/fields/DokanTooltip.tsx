import { Tooltip } from '@getdokan/dokan-ui';
import { Info } from 'lucide-react';

interface TooltipProps {
    message: string;
    children?: React.ReactNode;
}

const DokanTooltip = ( { message, children }: TooltipProps ) => {
    return <Tooltip content={ message }>{ children || <Info /> }</Tooltip>;
};

export default DokanTooltip;
