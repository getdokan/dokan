import { SettingsProps } from '../../types';
import DokanBaseFieldLabel from '../../../../../../components/fields/DokanFieldLabel';

const DokanFieldLabel = ( {
    element,
}: {
    element: SettingsProps[ 'element' ];
} ) => {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="p-5">
            <DokanBaseFieldLabel
                icon={ element.icon || '' }
                title={ element.title }
                helperText={ element.description }
                tooltip={ element?.helper_text }
            />
        </div>
    );
};

export default DokanFieldLabel;
