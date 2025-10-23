import { DokanLink } from '@src/components';
import { twMerge } from 'tailwind-merge';

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
                <span
                    className={ twMerge(
                        'text-[14px] font-[400] text-[#A5A5AA]',
                        isLoading ? loadingClass : ''
                    ) }
                >
                    { subTitle }
                </span>
            </span>
        </div>
    );
}

export default UserCard;
