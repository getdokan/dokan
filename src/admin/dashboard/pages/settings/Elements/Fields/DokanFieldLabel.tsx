import { SettingsProps } from '../../types';
import DokanBaseFieldLabel from '../../../../../../components/fields/DokanFieldLabel';
import { FileSpreadsheet } from 'lucide-react';
import { __ } from '@wordpress/i18n';

const DokanFieldLabel = ( {
    element,
}: {
    element: SettingsProps[ 'element' ];
} ) => {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="p-5 flex justify-between items-center">
            <DokanBaseFieldLabel
                icon={ element.icon || '' }
                title={ element.title }
                helperText={ element.description }
                tooltip={ element?.helper_text }
            />
            { element?.doc_link && (
                <a
                    href={ element?.doc_link }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!text-[#828282] flex gap-1 items-center  text-sm"
                >
                    <FileSpreadsheet />
                    { __( 'Doc', 'dokan-lite' ) }
                </a>
            ) }
        </div>
    );
};

export default DokanFieldLabel;
