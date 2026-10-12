import { registerBlockType } from '@wordpress/blocks';
import SSREdit from '../shared/ssr-edit';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

registerBlockType( metadata.name, {
    /*
     * The tab list comes from dokan_get_store_tabs(), which extensions filter —
     * there is nothing here for a merchant to configure.
     */
    edit: ( {
        attributes,
    }: StoreBlockEditProps< Record< string, never > > ) => (
        <SSREdit name={ metadata.name } attributes={ attributes } />
    ),
    save: () => null,
} );
