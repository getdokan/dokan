import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import NextIcon from '../../../icons/NextIcon';

const NextButton = ( {
    handleNext,
    disabled,
    className = '',
    children = __( 'Next', 'dokan-lite' ),
}: {
    handleNext: () => void;
    disabled?: boolean;
    className?: string;
    children?: string;
} ) => {
    return (
        <Button
            disabled={ disabled }
            onClick={ handleNext }
            className={ `bg-[#7047EB]  text-white text-base py-2.5 px-5 flex items-center hover:bg-indigo-600 rounded-md ${ className }` }
        >
            { children }
            <NextIcon />
        </Button>
    );
};

export default NextButton;
