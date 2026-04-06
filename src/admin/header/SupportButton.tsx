import { Fill } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { MessageCircleQuestionMark } from 'lucide-react';
import { DokanButton } from '@src/components';

const SLOT_NAME = 'dokan-admin-header-before-info-section';

interface SupportButtonData {
    label: string;
    url: string;
}

interface HeaderFillProps {
    header_info?: {
        support_button?: SupportButtonData;
    };
}

/**
 * Default "Get Support" button for Lite.
 * Pro can unregister this plugin and register its own Fill.
 */
const DefaultSupportButton = () => {
    const handleClick = useCallback( ( url: string ) => {
        window.open( url, '_blank', 'noopener,noreferrer' );
    }, [] );

    return (
        <Fill name={ SLOT_NAME }>
            { ( fillProps: HeaderFillProps ) => {
                const supportButton = fillProps?.header_info?.support_button;

                if ( ! supportButton ) {
                    return null;
                }

                return (
                    <DokanButton
                        data-test-id="dokan-dashboard-header-support-button"
                        variant="secondary"
                        onClick={ () => handleClick( supportButton.url ) }
                        className="flex items-center gap-1 rounded-md h-10 hover:!bg-[#7047EB] hover:!text-white"
                    >
                        <MessageCircleQuestionMark size={ 20 } />
                        <span className="text-xs min-w-20">
                            { supportButton.label ||
                                __( 'Get Support', 'dokan-lite' ) }
                        </span>
                    </DokanButton>
                );
            } }
        </Fill>
    );
};

registerPlugin( 'dokan-admin-header-before-info-section', {
    scope: 'dokan-admin-header',
    render: DefaultSupportButton,
} );
