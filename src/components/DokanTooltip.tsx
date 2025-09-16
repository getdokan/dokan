import { Tooltip } from '@getdokan/dokan-ui';
import { TooltipProps } from '@getdokan/dokan-ui/dist/components/Tooltip';

const DokanTooltip = ( {
    children,
    ...props
}: TooltipProps & { children: JSX.Element } ) => {
    return (
        <Tooltip
            { ...props }
            contentClass="dokan-layout"
            content={
                <div className="z-50 select-none rounded-[4px] bg-black px-2 py-1.5 text-xs text-white">
                    { props?.content || children }
                </div>
            }
        >
            { children }
        </Tooltip>
    );
};

export default DokanTooltip;
