import type { SettingsElement } from '@wedevs/plugin-ui';
import { Info } from 'lucide-react';

// `vendor_note` variant — a quiet inline note (info icon + muted text) for
// disclaimers like the Min-Max limits hint. Presentation lives here so schemas
// only declare the `text`, never raw HTML/SVG.
const VendorNoteField = ( { element }: { element: SettingsElement } ) => {
    const text = String( element.text ?? '' );

    if ( ! text ) {
        return null;
    }

    return (
        <div className="dokan-vendor-note flex items-start gap-2 px-4 pb-3 text-[13px] leading-normal text-gray-500">
            <Info size={ 16 } className="text-dokan-link mt-px shrink-0" />
            <span>{ text }</span>
        </div>
    );
};

export default VendorNoteField;
