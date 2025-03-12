import { Button } from '@getdokan/dokan-ui';
import BackIcon from '@dokan/admin/onboard/icons/BackIcon';
import { __ } from '@wordpress/i18n';

const BackButton = ( { onBack }: { onBack: () => void } ) => {
    return (
        <Button
            onClick={ onBack }
            className="flex items-center text-base md:text-lg text-gray-600 font-medium border-0 shadow-none p-0"
        >
            <BackIcon />
            { __( 'Back', 'dokan-lite' ) }
        </Button>
    );
};

export default BackButton;
