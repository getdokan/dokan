import { DokanLink, DokanTooltip as Tooltip } from '@src/components';
import { twMerge } from 'tailwind-merge';
import { RawHTML } from '@wordpress/element';
import { truncate } from '@src/utilities';

function UserCard( {
    name = '',
    avatar = '',
    isLoading = false,
    loadingClass = '',
    onClick = () => {},
    subTitle = '',
} ) {
    return (
        <div className="flex items-center gap-3">
            { avatar ? (
                <div
                    className={ twMerge(
                        'w-[44px] h-[44px] rounded object-cover',
                        isLoading ? `${ loadingClass }` : ''
                    ) }
                >
                    <img
                        src={ avatar }
                        alt={ name || 'Store avatar' }
                        className={ twMerge(
                            'w-[44px] h-[44px] rounded-[5px] object-cover border-[1px] border-[#E9E9E9] border-solid',
                            isLoading ? 'opacity-0' : 'opacity-100'
                        ) }
                    />
                </div>
            ) : (
                <div
                    className="w-[44px] h-[44px] rounded bg-gray-100"
                    aria-hidden="true"
                ></div>
            ) }
            <span className="flex flex-col gap-[6px] h-[44px]">
                { name.length <= 22 ? (
                    <DokanLink
                        as="div"
                        onClick={ onClick }
                        className="cursor-pointer"
                    >
                        <span
                            className={ twMerge(
                                'text-[14px] font-[600] text-[#7047EB]',
                                isLoading ? loadingClass : ''
                            ) }
                        >
                            { name }
                        </span>
                    </DokanLink>
                ) : (
                    <DokanLink
                        as="div"
                        onClick={ onClick }
                        className="cursor-pointer"
                    >
                        <Tooltip content={ <RawHTML>{ name }</RawHTML> }>
                            <span
                                className={ twMerge(
                                    'text-[14px] font-[600] text-[#7047EB]',
                                    isLoading ? loadingClass : ''
                                ) }
                            >
                                { truncate( name, 22 ) }
                            </span>
                        </Tooltip>
                    </DokanLink>
                ) }
                { subTitle.length <= 22 ? (
                    <span
                        className={ twMerge(
                            'text-[14px] font-[400] text-[#A5A5AA]',
                            isLoading ? loadingClass : ''
                        ) }
                    >
                        { subTitle }
                    </span>
                ) : (
                    <Tooltip content={ <RawHTML>{ subTitle }</RawHTML> }>
                        <span
                            className={ twMerge(
                                'text-[14px] font-[400] text-[#A5A5AA]',
                                isLoading ? loadingClass : ''
                            ) }
                        >
                            { truncate( subTitle, 22 ) }
                        </span>
                    </Tooltip>
                ) }
            </span>
        </div>
    );
}

export default UserCard;
