import { Card as DokanCard, Tooltip } from '@getdokan/dokan-ui';
import { CircleAlert, MoveUp, MoveDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
    icon: JSX.Element;
    countDirection?: 'up' | 'down' | 'neutral';
    count?: number | null;
    text: string;
    tooltip?: string;
    content: string | JSX.Element;
}
function Card( {
    icon,
    countDirection = 'up',
    count = null,
    text = '',
    content = '',
    tooltip = '',
}: CardProps ) {
    return (
        <DokanCard className="bg-white rounded shadow flex flex-col p-4 gap-2">
            <div className="flex justify-between">
                <div className="bg-[#F8F6FE] w-10 h-10 rounded flex items-center justify-center text-[#7047EB]">
                    { icon }
                </div>
                { count ? (
                    <div
                        className={ twMerge(
                            'text-sm flex',
                            countDirection === 'up'
                                ? 'text-green-500'
                                : 'text-red-500'
                        ) }
                    >
                        <span className="mt-[2px]">
                            { countDirection === 'up' ? (
                                <MoveUp size="14" />
                            ) : (
                                <MoveDown size="14" />
                            ) }
                        </span>
                        <span>{ count }</span>
                        <span>%</span>
                    </div>
                ) : (
                    <div className={ 'text-sm text-[#7047EB]' }>
                        <span>{ count }</span>
                        { count !== null && <span>%</span> }
                    </div>
                ) }
            </div>
            <div className="flex items-center">
                <span className="text-black font-semibold text-sm">
                    { text }
                </span>
                { tooltip && (
                    <Tooltip content={ tooltip }>
                        <CircleAlert
                            size="18"
                            className="text-[#9EA3A8] ml-2"
                        />
                    </Tooltip>
                ) }
            </div>
            <div className="text-3xl font-bold text-black -mt-1 -mb-1">
                { content }
            </div>
        </DokanCard>
    );
}

export default Card;
