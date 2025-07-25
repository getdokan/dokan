import { Card } from '@getdokan/dokan-ui';
import { ImageOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { RawHTML } from '@wordpress/element';

interface MiniCardProps {
    icon: JSX.Element;
    iconType?: 'primary' | 'secondary';
    text: string;
    count?: number;
    redirect?: string;
    countType?: 'primary' | 'secondary' | 'component';
    countComponent?: JSX.Element;
}
function MiniCard( {
    icon,
    text,
    count,
    countComponent,
    redirect = '',
    countType = 'primary',
    iconType = 'primary',
}: MiniCardProps ) {
    const showCount = [ 'primary', 'secondary' ].includes( countType );
    const isClickable = redirect && redirect.trim() !== '';

    const handleClick = () => {
        if ( isClickable ) {
            window.location.href = redirect;
        }
    };

    return (
        <Card
            className={ twMerge(
                'bg-white rounded shadow flex justify-between items-center p-4',
                isClickable &&
                    'group cursor-pointer hover:shadow-md transition-shadow duration-200'
            ) }
            clickable={ isClickable }
            onClick={ handleClick }
        >
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
                                : 'bg-[#F8F6FE]',
                            isClickable && 'transition group-hover:bg-[#502BBF]'
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
