import type { EditorData } from './types';

declare global {
    interface Window {
        dokanVendorRegistrationEditor?: EditorData;
    }
}

// Data the server passes to the editor (see includes/VendorRegistration/EditorData.php).
export const getEditorData = (): EditorData => {
    const data = window.dokanVendorRegistrationEditor;

    if ( ! data ) {
        throw new Error( 'Vendor Registration Form: editor data is missing.' );
    }

    return data;
};
