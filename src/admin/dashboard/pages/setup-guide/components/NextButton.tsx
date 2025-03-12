import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import NextIcon from '@dokan/admin/onboard/icons/NextIcon';

const NextButton = ( {
    handleNext,
    disabled,
    children = __( 'Next', 'dokan-lite' ),
}: {
    handleNext: () => void;
    disabled?: boolean;
    children?: string;
} ) => {
    return (
        <Button
            disabled={ disabled }
            onClick={ handleNext }
            className="bg-[#7047EB] text-white py-2 sm:py-3 px-4 sm:px-8 flex items-center rounded-md"
        >
            { children }
            <NextIcon />
        </Button>
    );
};

export default NextButton;
