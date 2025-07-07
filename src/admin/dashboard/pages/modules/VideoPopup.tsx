import { Modal } from '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';
import { DokanModule } from './index';
import { __ } from '@wordpress/i18n';
import { DokanModal } from '../../../../components';

export interface VideoPopupProps {
    videoId: string;
    module: DokanModule;
}

const VideoPopup = ( { videoId, module }: VideoPopupProps ) => {
    const [ isOpen, setIsOpen ] = useState( false );

    return (
        <>
            <button
                className="text-[#788383] text-sm no-underline flex items-center gap-2 vertical-align-middle"
                rel="noreferrer"
                onClick={ () => setIsOpen( true ) }
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 0C3.58178 0 0 3.58172 0 8C0 12.4183 3.58178 16 8 16C12.4182 16 16 12.4183 16 8C16 3.58172 12.4182 0 8 0ZM10.765 8.42406L6.765 10.9241C6.68406 10.9746 6.59203 11 6.5 11C6.41663 11 6.33313 10.9792 6.25756 10.9373C6.09863 10.8491 6 10.6819 6 10.5V5.5C6 5.31812 6.09863 5.15088 6.25756 5.06275C6.4165 4.97412 6.61084 4.9795 6.765 5.07594L10.765 7.57594C10.9111 7.6675 11 7.82766 11 8C11 8.17234 10.9111 8.33253 10.765 8.42406Z"
                        fill="#B1B1B1"
                    ></path>
                </svg>
                { __( 'Video', 'dokan-lite' ) }
            </button>
            <DokanModal
                namespace="video-popup"
                isOpen={ isOpen }
                onClose={ () => setIsOpen( false ) }
                className="max-w-3xl rounded overflow-hidden bg-transparent w-[800px]"
                dialogHeader={ false }
                dialogContent={
                    <div className="aspect-video object-cover -m-4">
                        <iframe
                            src={ `https://www.youtube.com/embed/${ videoId }` }
                            title={ module.title }
                            className="w-full h-full rounded-xs"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                }
                dialogFooter={ false }
            ></DokanModal>
        </>
    );
};
export default VideoPopup;
