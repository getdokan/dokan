import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import NextIcon from '@dokan/admin/onboard/icons/NextIcon';

const NextButton = ( {
    handleNext,
    disabled,
}: {
    handleNext: () => void;
    disabled?: boolean;
} ) => {
    return (
        <Button
            disabled={ disabled }
            onClick={ handleNext }
            className="bg-[#7047EB] text-white py-2 sm:py-3 px-4 sm:px-8 flex items-center rounded-md hover:bg-indigo-600 transition-colors duration-200 ease-in-out"
        >
            { __( 'Next', 'dokan-lite' ) }
            <NextIcon />
        </Button>
    );
};

export default NextButton;
