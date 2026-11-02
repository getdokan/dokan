import { registerBlockType, updateCategory } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import { DokanMark, dokanBlockIcon } from '../icons';
import './style.scss';
import './editor.scss';

// Lite registers the category in PHP; only a script can give it an SVG icon.
updateCategory( 'dokan', { icon: <DokanMark /> } );

registerBlockType( metadata.name, {
    edit: Edit,
    icon: dokanBlockIcon( metadata.icon ),
    // Rendered on the server.
    save: () => null,
} );
