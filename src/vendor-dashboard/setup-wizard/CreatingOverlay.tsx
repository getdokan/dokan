import { __ } from '@wordpress/i18n';
import { LoaderCircle } from 'lucide-react';

// The full-screen "Creating your Store" transition shown while the browser
// navigates from the last input step into the Ready screen.
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
