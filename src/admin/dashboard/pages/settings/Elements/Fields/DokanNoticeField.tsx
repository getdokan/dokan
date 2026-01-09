import { twMerge } from 'tailwind-merge';
import { LucideIcon } from '../../../../../../components';
import { RawHTML } from '@wordpress/element';

/* eslint-disable camelcase */
const DokanNoticeField = ( { element }: { element: any } ) => {
    if ( ! element.display ) {
        return null;
    }

    const {
        notice_type = 'info',
        notice_icon = 'Info',
        notice_title,
        notice_description,
        link_title,
        link_url,
        active_tab,
    } = element;

    const noticeStyles = {
        error: 'bg-[#E64E6112] border-[#571B231A] text-[#9F2225]',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-[#DEA10012] border-[#571B231A] text-[#8A610F]',
    };

    const iconColors = {
        error: '#E64B5E',
        info: '#1E3A8A',
        warning: '#DBA941',
    };

    const handleLinkClick = () => {
        if ( active_tab ) {
            if ( typeof localStorage !== 'undefined' ) {
                localStorage.setItem( 'dokan_active_settings_tab', active_tab );
            }
            window.location.reload();
            return;
        }

        if ( link_url ) {
            window.open( link_url, '_self', 'noopener,noreferrer' );
        }
    };

    return (
        <div className="w-full">
            <div
                className={ twMerge(
                    'flex sm:flex-row items-start sm:items-center gap-4 p-5 border rounded-md',
                    noticeStyles[ notice_type as keyof typeof noticeStyles ] ||
                        noticeStyles.info
                ) }
            >
                { notice_icon && (
                    <div className={ 'flex-shrink-0 mt-0.5' }>
                        <LucideIcon
                            iconName={ notice_icon }
                            size={ 24 }
                            color={
                                iconColors[
                                    notice_type as keyof typeof iconColors
                                ] || iconColors.info
                            }
                        />
                    </div>
                ) }

                <div className="space-y-2">
                    <div className="flex-grow">
                        { notice_title && (
                            <h4 className="text-base font-semibold mb-1 leading-none">
                                <RawHTML>{ notice_title }</RawHTML>
                            </h4>
                        ) }
                        { notice_description && (
                            <div className="text-sm">
                                <RawHTML>{ notice_description }</RawHTML>
                            </div>
                        ) }
                    </div>

                    { link_title && (
                        <div className="flex-shrink-0 mt-2 sm:mt-0">
                            <button
                                onClick={ handleLinkClick }
                                className="flex items-center gap-1 text-sm font-medium underline focus:outline-none transition-all"
                            >
                                { link_title }
                            </button>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default DokanNoticeField;
