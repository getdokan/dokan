import { Button } from '@getdokan/dokan-ui';
import BackIcon from '@dokan/admin/onboard/icons/BackIcon';
import { __ } from '@wordpress/i18n';

const BackButton = ( { onBack }: { onBack: () => void } ) => {
    return (
        <Button
            onClick={ onBack }
            className="flex text-[#393939] items-center text-base md:text-sm font-medium border-0 shadow-none p-0 focus:outline-none focus:ring-0 hover:bg-transparent"
        >
            <BackIcon />
            { __( 'Back', 'dokan-lite' ) }
        </Button>
    );
};

export default BackButton;
