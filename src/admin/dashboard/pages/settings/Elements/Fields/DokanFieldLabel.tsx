import { __ } from '@wordpress/i18n';
import { FileSpreadsheet } from 'lucide-react';
import DokanBaseFieldLabel from '../../../../../../components/fields/DokanFieldLabel';
import { SettingsProps } from '../../types';

const DokanFieldLabel = ( {
    element,
}: {
    element: SettingsProps[ 'element' ];
} ) => {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="p-5 flex justify-between gap-4 items-center">
            <DokanBaseFieldLabel
                imageUrl={ element.image_url }
                title={ element.title }
                helperText={ element.description }
                tooltip={ element.helper_text }
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
