import { Button } from '@getdokan/dokan-ui';
import BackIcon from '../icons/BackIcon';
import { __ } from '@wordpress/i18n';

const BackButton = (
    {
        onBack,
        className = '',
        children = __( 'Back', 'dokan-lite' ),
    }: {
        onBack: () => void
    }
) => {
    return (
        <Button
            onClick={ onBack }
            className={ `flex items-center text-base text-[#393939] font-medium border-0 shadow-none p-0 ${ className }` }
        >
            <BackIcon />
            { children }
        </Button>
    );
};

export default BackButton;
