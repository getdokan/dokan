import { Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from '@getdokan/dokan-ui';

interface StatCardProps {
    title: string;
    icon: JSX.Element;
    data: string | number;
    helpText?: string;
    className?: string;
}

const StatCard = ( {
    title,
    icon: Icon,
    data,
    helpText = '',
    className = '',
}: StatCardProps ) => (
    <div
        className={ twMerge(
            'bg-white rounded border border-[#E9E9E9] p-6 space-y-8 shadow',
            className
        ) }
    >
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <Icon size={ 20 } className="text-[#7047EB]" />
                <span className="text-base font-light text-[#828282]">
                    { title }
                </span>
                { helpText && (
                    <Tooltip content={ helpText }>
                        <Info size={ 16 } className="text-[#828282]" />
                    </Tooltip>
                ) }
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{ data }</div>
    </div>
);

export default StatCard;
