import { createContext, useContext } from '@wordpress/element';
import type { SavedField } from './metaKeys';
import type { BlockAttributes, EditorData, Setup, View } from './types';

export interface EditorContextValue {
    data: EditorData;
    attributes: BlockAttributes;
    setAttributes: ( attributes: Partial< BlockAttributes > ) => void;
    setup: Setup;
    updateSetup: ( setup: Setup ) => void;
    view: View;
    setView: ( view: View ) => void;
    savedFields: SavedField[];
    savedFieldsLoaded: boolean;
    // Page the form links for Terms & Conditions: the block's own choice, else Dokan's setting.
    termsPageId: number;
    hasTermsPage: boolean;
}

export const EditorContext = createContext< EditorContextValue | null >( null );

export const useEditorContext = (): EditorContextValue => {
    const value = useContext( EditorContext );

    if ( ! value ) {
        throw new Error(
            'Vendor Registration Form: editor context is missing.'
        );
    }

    return value;
};
