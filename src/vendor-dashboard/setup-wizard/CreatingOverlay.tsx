import { __ } from '@wordpress/i18n';
import { LoaderCircle } from 'lucide-react';

// Full-screen transition shown while the final save lands.
export default function CreatingOverlay() {
    return (
        <div className="dokan-vsw-creating-overlay" role="status">
            <LoaderCircle
                size={ 22 }
                aria-hidden="true"
                className="animate-spin fill-none text-[#7047eb]"
            />
            { __( 'Creating your Store', 'dokan-lite' ) }
        </div>
    );
}
