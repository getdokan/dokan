import { useSelect } from '@wordpress/data';

// Selectors of the `core/editor` store, read by name since @wordpress/editor isn't a dependency.
interface EditorSelectors {
    getCurrentPostId?: () => number | string | null;
}

// ID of the post being edited, as a string; '' where there's no post editor (widgets, Customizer).
export const useCurrentPostId = (): string =>
    useSelect( ( select ) => {
        const editor = select( 'core/editor' ) as EditorSelectors | undefined;
        const id = editor?.getCurrentPostId?.();

        return id ? String( id ) : '';
    }, [] );
