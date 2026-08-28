import { useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';

type SSREditProps = {
    name: string;
    attributes: Record< string, unknown >;
    children?: any;
};

/**
 * Shared editor canvas for Dokan's dynamic store blocks: the server render
 * (with preview-vendor data outside a store context) plus optional
 * InspectorControls passed as children.
 *
 * @since DOKAN_SINCE
 *
 * @param root0
 * @param root0.name
 * @param root0.attributes
 * @param root0.children
 */
const SSREdit = ( { name, attributes, children }: SSREditProps ) => {
    const blockProps = useBlockProps();

    return (
        <div { ...blockProps }>
            { children }
            <ServerSideRender block={ name } attributes={ attributes } />
        </div>
    );
};

export default SSREdit;
