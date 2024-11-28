import { Tooltip } from '@getdokan/dokan-ui';

export type Direction = 'top' | 'bottom' | 'left' | 'right';
type Props = {
    children: any;
    content: any;
    direction?: Direction;
};
function DokanTooltip( { children, content = '', direction = 'top' }: Props ) {
    return (
        <Tooltip content={ content } direction={ direction }>
            { ( toolTipTriggerProps ) => (
                <div
                    className="block text-sm text-gray-500 mb-1"
                    { ...toolTipTriggerProps }
                >
                    { children }
                </div>
            ) }
        </Tooltip>
    );
}

export default DokanTooltip;
