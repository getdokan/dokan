import { Card } from '@getdokan/dokan-ui';
import { ImageOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { RawHTML } from '@wordpress/element';

interface MiniCardProps {
    icon: JSX.Element;
    iconType?: 'primary' | 'secondary';
    text: string;
    count?: number;
    countType?: 'primary' | 'secondary' | 'component';
    countComponent?: JSX.Element;
}
function MiniCard( {
    icon,
    text,
    count,
    countComponent,
    countType = 'primary',
    iconType = 'primary',
}: MiniCardProps ) {
    const showCount = [ 'primary', 'secondary' ].includes( countType );
    return (
        <Card className="bg-white rounded shadow flex justify-between items-center p-4">
            <div className="flex items-center">
                <div
                    className={ twMerge(
                        'w-10 h-10 rounded flex items-center justify-center text-[#7047EB] mr-4',
                        iconType === 'primary' ? 'bg-[#F8F6FE] ' : 'bg-white'
                    ) }
                >
                    { icon ?? <ImageOff /> }
                </div>
                <span className="text-black font-semibold text-sm">
                    <RawHTML>{ text }</RawHTML>
                </span>
            </div>
            <div>
                { showCount ? (
                    <div
                        className={ twMerge(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            countType === 'primary'
                                ? 'bg-[#7047EB]'
                                : 'bg-[#F8F6FE]'
                        ) }
                    >
                        <span
                            className={ twMerge(
                                'font-semibold text-sm',
                                countType === 'primary'
                                    ? 'text-white'
                                    : 'text-black'
                            ) }
                        >
                            { count ?? 0 }
                        </span>
                    </div>
                ) : (
                    countComponent
                ) }
            </div>
        </Card>
    );
}

export default MiniCard;
