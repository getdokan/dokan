import { Fill } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { MessageCircleQuestionMark } from 'lucide-react';
import { DokanButton } from '@src/components';

const SLOT_NAME = 'dokan-admin-header-before-info-section';

/**
 * Default "Get Support" button for Lite.
 * Pro can unregister this plugin and register its own Fill.
 */
const DefaultSupportButton = () => {
    return (
        <Fill name={ SLOT_NAME }>
            { ( fillProps ) => {
                const supportButton = fillProps?.header_info?.support_button;

                if ( ! supportButton ) {
                    return null;
                }

                const handleClick = () => {
                    if ( supportButton?.url ) {
                        window.open(
                            supportButton.url,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    }
                };

                return (
                    <DokanButton
                        variant="secondary"
                        onClick={ handleClick }
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
