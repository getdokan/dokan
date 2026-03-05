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
                <div className="z-50 select-none rounded-[5px] max-w-[285px] bg-black px-3.5 py-1.5 text-xs text-white break-words">
                    { props?.content || children }
                </div>
            }
        >
            { children }
        </Tooltip>
    );
};

export default DokanTooltip;
