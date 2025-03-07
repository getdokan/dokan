import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import NextIcon from '@dokan/admin/onboard/icons/NextIcon';

const NextButton = ( { handleNext }: { handleNext: () => void } ) => {
    return (
        <Button
            onClick={ handleNext }
            className="bg-[#7047EB] text-white py-3 px-8 flex items-center rounded-md"
        >
            { __( 'Next', 'dokan' ) }
            <NextIcon />
        </Button>
    );
};

export default NextButton;
